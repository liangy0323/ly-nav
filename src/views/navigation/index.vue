<template>
  <section class="page-navigation" aria-labelledby="navigation-title">
    <header class="page-navigation__header">
      <div class="page-navigation__heading">
        <h1 id="navigation-title" class="page-navigation__title">导航</h1>
        <span v-if="!isLoading && !loadError" class="page-navigation__count">{{ items.length }} 个网站</span>
      </div>
      <div class="page-navigation__toolbar">
        <button
          class="page-navigation__button"
          :disabled="isLoading || !!loadError || isExporting || isSaving"
          @click="handleExport"
        >
          <download-icon :size="16" aria-hidden="true" />{{ isExporting ? '导出中…' : '导出 JSON' }}
        </button>
        <button
          class="page-navigation__button page-navigation__button--primary"
          :disabled="isLoading || !!loadError || isSaving || isEditorOpen"
          @click="handleEditorOpen()"
        >
          <plus-icon :size="17" aria-hidden="true" />新增导航
        </button>
      </div>
    </header>

    <navigation-editor
      v-if="isEditorOpen"
      :key="editingItem?.id ?? 'new'"
      class="page-navigation__editor"
      :item="editingItem"
      :busy="isSaving"
      :error="actionError"
      @save="handleSave"
      @cancel="
        isEditorOpen = false;
        actionError = '';
      "
    />

    <p v-if="actionError && !isEditorOpen" class="page-navigation__error" role="alert">{{ actionError }}</p>

    <div v-if="isLoading" class="page-navigation__grid" role="status" aria-label="正在初始化导航" aria-busy="true">
      <div v-for="index in 8" :key="index" class="page-navigation__skeleton" aria-hidden="true">
        <span class="page-navigation__skeleton-icon"></span>
        <span class="page-navigation__skeleton-title"></span>
        <span class="page-navigation__skeleton-description"></span>
      </div>
    </div>
    <div v-else-if="loadError" class="page-navigation__state" role="alert">
      <p>{{ loadError }}</p>
      <button class="page-navigation__button" @click="handleRetry">重新加载</button>
    </div>
    <ul v-else-if="items.length" class="page-navigation__grid" aria-label="网站列表">
      <li v-for="item in items" :key="item.id" class="page-navigation__item">
        <resource-card :title="item.title" :description="item.description" :href="item.href" :icon="item.icon" />
        <div v-if="pendingDeleteId === item.id" class="page-navigation__confirmation">
          <span>删除此导航？</span>
          <button
            class="page-navigation__text-button page-navigation__text-button--danger"
            :disabled="isSaving"
            :aria-label="`确认删除${item.title}`"
            @click="handleDelete(item.id)"
          >
            删除
          </button>
          <button class="page-navigation__text-button" :disabled="isSaving" @click="pendingDeleteId = null">
            取消
          </button>
        </div>
        <div v-else class="page-navigation__item-actions">
          <button
            class="page-navigation__icon-button"
            :disabled="isSaving || isEditorOpen"
            :aria-label="`编辑${item.title}`"
            :title="`编辑${item.title}`"
            @click="handleEditorOpen(item.id)"
          >
            <pencil-icon :size="15" aria-hidden="true" />
          </button>
          <button
            class="page-navigation__icon-button"
            :disabled="isSaving || isEditorOpen"
            :aria-label="`删除${item.title}`"
            :title="`删除${item.title}`"
            @click="
              pendingDeleteId = item.id;
              actionError = '';
            "
          >
            <trash-icon :size="15" aria-hidden="true" />
          </button>
        </div>
      </li>
    </ul>
    <div v-else class="page-navigation__state">
      <p>还没有导航，添加一个常用网站吧。</p>
      <button class="page-navigation__button" :disabled="isEditorOpen" @click="handleEditorOpen()">新增导航</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Download as DownloadIcon, Pencil as PencilIcon, Plus as PlusIcon, Trash2 as TrashIcon } from '@lucide/vue';

import NavigationEditor from '@/components/business/navigation-editor/index.vue';
import ResourceCard from '@/components/business/resource-card/index.vue';
import { useNavigation } from '@/composables';

/**
 * 导航页仅展示数据库订阅结果和编辑入口，数据操作与生命周期由 composable 管理。
 */
defineOptions({ name: 'NavigationPage' });

const {
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
} = useNavigation();
</script>

<style lang="scss" src="./index.scss" scoped></style>
