import { liveQuery } from 'dexie';
import { onMounted, onScopeDispose, ref, shallowRef } from 'vue';

import {
  deleteNavigation,
  exportNavigations,
  getNavigation,
  initializeNavigations,
  listNavigations,
  saveNavigation,
} from '@/storage';

import type { NavigationDraft, NavigationItem } from '@/types';
import type { Subscription } from 'dexie';

/**
 * 编排导航的初始化、数据库订阅、编辑、删除与导出；组件仅绑定状态与交互。
 * 列表永远由 IndexedDB 查询提供，不在写操作后拼接内存中的临时数据。
 */
export const useNavigation = () => {
  const items = shallowRef<NavigationItem[]>([]);
  const isLoading = ref(true);
  const loadError = ref('');
  const actionError = ref('');
  const isSaving = ref(false);
  const isExporting = ref(false);
  const isEditorOpen = ref(false);
  const editingItem = shallowRef<NavigationItem>();
  const pendingDeleteId = ref<number | null>(null);
  let subscription: Subscription | undefined;
  let disposed = false;

  /**
   * 重试先释放旧订阅，初始化失败保留可见错误；卸载后不再订阅或更新加载状态。
   */
  const handleRetry = async (): Promise<void> => {
    subscription?.unsubscribe();
    isLoading.value = true;
    loadError.value = '';
    try {
      await initializeNavigations();
      if (disposed) return;
      subscription = liveQuery(listNavigations).subscribe({
        next: (records) => {
          items.value = records;
          isLoading.value = false;
        },
        error: () => {
          loadError.value = '本地导航读取失败，请检查浏览器存储权限后重试。';
          isLoading.value = false;
        },
      });
    } catch {
      if (disposed) return;
      loadError.value = '无法打开本地数据库，请检查浏览器存储权限后重试。';
      isLoading.value = false;
    }
  };

  /**
   * 编辑前重新读取数据库，避免使用已被其他标签页删除的卡片快照。
   */
  const handleEditorOpen = async (id?: number): Promise<void> => {
    if (isSaving.value) return;
    actionError.value = '';
    try {
      const record = id === undefined ? undefined : await getNavigation(id);
      if (disposed) return;
      if (id !== undefined && !record) throw new Error('该导航已被删除');
      editingItem.value = record;
      pendingDeleteId.value = null;
      isEditorOpen.value = true;
    } catch {
      actionError.value = '无法读取待编辑的导航，请重试。';
    }
  };

  /**
   * 持久化成功后关闭编辑区，列表由数据库订阅更新；失败时保留输入供用户修正或重试。
   */
  const handleSave = async (draft: NavigationDraft): Promise<void> => {
    if (isSaving.value) return;
    isSaving.value = true;
    actionError.value = '';
    try {
      await saveNavigation(draft, editingItem.value?.id);
      isEditorOpen.value = false;
    } catch (error) {
      actionError.value = error instanceof Error ? error.message : '保存失败，请重试。';
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * 卡片内二次确认后执行删除；失败时保留确认状态，成功结果仍由订阅查询呈现。
   */
  const handleDelete = async (id: number): Promise<void> => {
    if (isSaving.value) return;
    isSaving.value = true;
    actionError.value = '';
    try {
      await deleteNavigation(id);
      pendingDeleteId.value = null;
    } catch {
      actionError.value = '删除失败，请重试。';
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * 生成 JSON 文件并触发浏览器下载；下载任务接收链接后释放临时对象地址。
   */
  const handleExport = async (): Promise<void> => {
    if (isExporting.value) return;
    isExporting.value = true;
    actionError.value = '';
    try {
      const content = await exportNavigations();
      if (disposed) return;
      const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));
      try {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `qingyu-navigation-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.hidden = true;
        document.body.append(anchor);
        try {
          anchor.click();
        } finally {
          anchor.remove();
        }
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      actionError.value = '导出失败，请重试。';
    } finally {
      isExporting.value = false;
    }
  };

  onMounted(handleRetry);
  onScopeDispose(() => {
    disposed = true;
    subscription?.unsubscribe();
  });

  return {
    items,
    isLoading,
    loadError,
    actionError,
    isSaving,
    isExporting,
    isEditorOpen,
    editingItem,
    pendingDeleteId,
    handleRetry,
    handleEditorOpen,
    handleSave,
    handleDelete,
    handleExport,
  };
};
