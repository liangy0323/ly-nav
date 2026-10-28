import { Dexie } from 'dexie';

/**
 * 青屿浏览器本地数据库的唯一实例；只声明结构，打开和初始化由导航仓储显式执行。
 * 后续结构变化通过递增版本迁移，不删除用户已有导航。
 */
export const database = new Dexie('qingyu');

database.version(1).stores({
  navigations: '++id, position',
  metadata: 'key',
});
