import { DEFAULT_NAVIGATIONS } from '../../constants/modules/default-navigations.ts';
import { database } from './database.ts';
import { LEGACY_NAVIGATION_ICONS } from './legacy-navigation-icons.ts';

import type { NavigationDraft, NavigationInitialization, NavigationItem } from '@/types';

const navigations = database.table<NavigationItem, number, Omit<NavigationItem, 'id'>>('navigations');
const metadata = database.table<NavigationInitialization, string>('metadata');
const initializationKey = 'default-navigations-v1';
const assetMigrationKey = 'default-navigation-auto-icons-v1';

/**
 * 为旧版默认导航一次性启用自动图标并修正 React 地址，只匹配原位置、名称、描述和默认链接。
 * 仅清除上一版写入的已知图标，自定义图标保留；修改或删除的条目不重建，更新与标记同事务提交。
 */
const migrateDefaultAssets = async (now: number): Promise<void> => {
  if (await metadata.get(assetMigrationKey)) return;
  const records = await navigations.toArray();
  for (const [position, defaults] of DEFAULT_NAVIGATIONS.entries()) {
    const legacyHref = defaults.href === 'https://react.dev/' ? 'https://zh-hans.react.dev/' : defaults.href;
    const record = records.find(
      (item) =>
        item.position === position &&
        item.title === defaults.title &&
        item.description === defaults.description &&
        (item.href === defaults.href || item.href === legacyHref),
    );
    if (!record) continue;
    const icon = Object.values(LEGACY_NAVIGATION_ICONS).includes(record.icon) ? '' : record.icon;
    if (icon !== record.icon || record.href !== defaults.href) {
      await navigations.update(record.id, { icon, href: defaults.href, updatedAt: now });
    }
  }
  await metadata.put({ key: assetMigrationKey, initializedAt: now });
};

/**
 * 首次无导航数据时写入默认值，标记和数据使用同一读写事务，避免多标签页重复初始化。
 * 初始化完成后即使用户删除全部导航，也保留空列表，不自动恢复默认记录。
 */
export const initializeNavigations = async (): Promise<void> => {
  await database.open();
  await database.transaction('rw', navigations, metadata, async () => {
    const now = Date.now();
    if (!(await metadata.get(initializationKey))) {
      if ((await navigations.count()) === 0) {
        await navigations.bulkAdd(
          DEFAULT_NAVIGATIONS.map((item, position) => ({ ...item, position, createdAt: now, updatedAt: now })),
        );
      }
      await metadata.put({ key: initializationKey, initializedAt: now });
    }
    await migrateDefaultAssets(now);
  });
};

/**
 * 按展示顺序读取持久化导航，可由 liveQuery 订阅数据库变化。
 */
export const listNavigations = (): Promise<NavigationItem[]> => navigations.orderBy('position').toArray();

/**
 * 按主键读取最新记录；记录不存在时返回 undefined，供编辑等调用方处理已删除场景。
 */
export const getNavigation = (id: number): Promise<NavigationItem | undefined> => navigations.get(id);

/**
 * 校验网站与图标地址的协议，防止可执行链接进入持久化数据；返回去除首尾空白后的地址。
 */
const normalizeUrl = (value: string, label: string): string => {
  const trimmed = value.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`${label}需要填写完整的 http:// 或 https:// 地址`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${label}仅支持 HTTP 或 HTTPS`);
  }
  return trimmed;
};

/**
 * 新建或编辑导航；编辑不覆盖排序与创建时间，新建位置在事务内分配，避免并发追加冲突。
 * 保存失败会抛出可展示的校验错误或数据库错误，不向页面返回未持久化的临时记录。
 */
export const saveNavigation = async (draft: NavigationDraft, id?: number): Promise<number> => {
  const title = draft.title.trim();
  if (!title || title.length > 60) throw new Error('名称需要填写 1–60 个字符');
  if (draft.description.trim().length > 160) throw new Error('描述不能超过 160 个字符');
  if (draft.href.length > 2048 || draft.icon.length > 2048) throw new Error('地址不能超过 2048 个字符');
  const values = {
    title,
    href: normalizeUrl(draft.href, '网站地址'),
    description: draft.description.trim(),
    icon: draft.icon.trim() ? normalizeUrl(draft.icon, '图标地址') : '',
    updatedAt: Date.now(),
  };
  return database.transaction('rw', navigations, async () => {
    if (id !== undefined) {
      if (!(await navigations.update(id, values))) throw new Error('该导航已被删除，请关闭编辑后重试');
      return id;
    }
    const last = await navigations.orderBy('position').last();
    return navigations.add({ ...values, position: (last?.position ?? -1) + 1, createdAt: values.updatedAt });
  });
};

/**
 * 按主键删除导航；初始化标记保留，空列表可由用户主动维持。
 */
export const deleteNavigation = (id: number): Promise<void> => navigations.delete(id);

/**
 * 从数据库重新读取导出快照，不使用页面可能尚未更新的订阅缓存。
 */
export const exportNavigations = async (): Promise<string> =>
  JSON.stringify(
    {
      format: 'qingyu-navigation',
      version: 1,
      exportedAt: new Date().toISOString(),
      navigations: await listNavigations(),
    },
    null,
    2,
  );
