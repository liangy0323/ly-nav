import 'fake-indexeddb/auto';

import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { URL } from 'node:url';
import { liveQuery } from 'dexie';

import { database } from '../src/storage/modules/database.ts';
import { LEGACY_NAVIGATION_ICONS } from '../src/storage/modules/legacy-navigation-icons.ts';
import { getWebsiteIcon } from '../src/utils/modules/website-icon.ts';
import {
  deleteNavigation,
  exportNavigations,
  getNavigation,
  initializeNavigations,
  listNavigations,
  saveNavigation,
} from '../src/storage/modules/navigation.ts';

/**
 * 使用独立于浏览器的内存 IndexedDB 验证真实仓储，测试不会触碰用户浏览器中的导航。
 */
beforeEach(async () => database.delete());
after(async () => database.delete());

test('并发初始化只产生一组八条默认导航，重复进入不改写已有记录', async () => {
  await Promise.all([initializeNavigations(), initializeNavigations(), initializeNavigations()]);
  const initial = await listNavigations();
  assert.equal(initial.length, 8);
  assert.equal(new Set(initial.map((item) => item.href)).size, 8);
  assert.deepEqual(
    initial.map((item) => item.title),
    ['DeepSeek', '腾讯元宝', 'GitHub', 'Vue 官方文档', 'React 官方文档', '掘金', '有道', '微信公众平台'],
  );
  await saveNavigation({ ...initial[0], title: '我的 DeepSeek' }, initial[0].id);
  await initializeNavigations();
  assert.equal((await getNavigation(initial[0].id)).title, '我的 DeepSeek');
  assert.equal((await listNavigations()).length, 8);
});

test('新增与编辑持久化，取消草稿不修改原记录，删除后不能再编辑不存在的记录', async () => {
  await initializeNavigations();
  const id = await saveNavigation({
    title: ' 测试导航 ',
    href: ' https://example.com/?q=中文&x=1 ',
    description: ' 描述 ',
    icon: '',
  });
  const stored = await getNavigation(id);
  assert.equal(stored.title, '测试导航');
  assert.equal(stored.href, 'https://example.com/?q=中文&x=1');
  assert.equal(stored.position, 8);
  stored.title = '未保存的草稿';
  assert.equal((await getNavigation(id)).title, '测试导航');
  await saveNavigation({ ...stored, title: '修改后' }, id);
  const updated = await getNavigation(id);
  assert.equal(updated.title, '修改后');
  assert.equal(updated.createdAt, stored.createdAt);
  assert.equal(updated.position, stored.position);
  await deleteNavigation(id);
  assert.equal(await getNavigation(id), undefined);
  await assert.rejects(saveNavigation(updated, id), /已被删除/);
});

test('删除全部导航后，重新初始化和重新打开数据库都保持空列表', async () => {
  await initializeNavigations();
  for (const item of await listNavigations()) await deleteNavigation(item.id);
  await initializeNavigations();
  assert.deepEqual(await listNavigations(), []);
  database.close();
  await database.open();
  await initializeNavigations();
  assert.deepEqual(await listNavigations(), []);
});

test('默认写入失败会回滚数据与初始化标记，修复后可以完整重试', async () => {
  const table = database.table('navigations');
  const failSeed = (_key, value) => {
    if (value.title === 'GitHub') throw new Error('模拟写入失败');
  };
  table.hook('creating', failSeed);
  try {
    await assert.rejects(initializeNavigations(), /模拟写入失败/);
  } finally {
    table.hook('creating').unsubscribe(failSeed);
  }
  assert.equal(await table.count(), 0);
  assert.equal(await database.table('metadata').count(), 0);
  await initializeNavigations();
  assert.equal((await listNavigations()).length, 8);
});

test('无初始化标记但已有数据时保留已有记录，非法链接不会进入数据库', async () => {
  await database.open();
  await saveNavigation({ title: '已有导航', href: 'https://example.com/', description: '', icon: '' });
  await initializeNavigations();
  assert.equal((await listNavigations()).length, 1);
  for (const href of ['javascript:alert(1)', 'data:text/html,test', 'not a url']) {
    await assert.rejects(saveNavigation({ title: '非法', href, description: '', icon: '' }));
  }
  await assert.rejects(
    saveNavigation({ title: '非法图标', href: 'https://example.com/', description: '', icon: 'javascript:alert(1)' }),
  );
  assert.equal((await listNavigations()).length, 1);
});

test('并发新增不会分配相同位置，导出读取数据库的最新内容', async () => {
  await initializeNavigations();
  await Promise.all(
    ['测试一', '测试二'].map((title) =>
      saveNavigation({ title, href: 'https://example.com/', description: '', icon: '' }),
    ),
  );
  const records = await listNavigations();
  assert.equal(new Set(records.map((item) => item.position)).size, 10);
  await deleteNavigation(records[0].id);
  const exported = JSON.parse(await exportNavigations());
  assert.equal(exported.format, 'qingyu-navigation');
  assert.equal(exported.version, 1);
  assert.equal(exported.navigations.length, 9);
  assert.equal(
    exported.navigations.some((item) => item.id === records[0].id),
    false,
  );
});

test('数据库写入能触发 liveQuery 更新列表', { timeout: 3000 }, async () => {
  await initializeNavigations();
  let subscription;
  const observed = new Promise((resolve, reject) => {
    subscription = liveQuery(listNavigations).subscribe({
      next: (items) => {
        if (items.some((item) => item.title === '实时导航')) resolve();
      },
      error: reject,
    });
  });
  try {
    await saveNavigation({ title: '实时导航', href: 'https://example.com/', description: '', icon: '' });
    await observed;
  } finally {
    subscription?.unsubscribe();
  }
});

test('默认导航图标留空启用自动获取，React 使用 react.dev', async () => {
  await initializeNavigations();
  const records = await listNavigations();
  assert.ok(records.every((item) => item.icon === ''));
  assert.equal(records.find((item) => item.title === 'React 官方文档').href, 'https://react.dev/');
});

test('旧默认数据切换自动图标并修正 React 地址，保留自定义内容和已删除条目', async () => {
  await initializeNavigations();
  const table = database.table('navigations');
  const records = await listNavigations();
  await table.toCollection().modify({ icon: '' });
  await table.update(records[4].id, { icon: LEGACY_NAVIGATION_ICONS.react });
  await table.update(records[5].id, { icon: LEGACY_NAVIGATION_ICONS.juejin });
  await table.update(records[4].id, { href: 'https://zh-hans.react.dev/' });
  await table.update(records[0].id, { title: '我的 DeepSeek' });
  await table.update(records[1].id, { icon: 'https://example.com/custom.png' });
  await table.update(records[2].id, { href: 'https://example.com/my-github' });
  await table.delete(records[3].id);
  await database.table('metadata').put({ key: 'default-navigation-assets-v1', initializedAt: Date.now() });
  await database.table('metadata').delete('default-navigation-auto-icons-v1');

  await Promise.all([initializeNavigations(), initializeNavigations()]);
  const updated = await listNavigations();
  assert.equal(updated.length, 7);
  assert.equal(await getNavigation(records[3].id), undefined);
  assert.equal((await getNavigation(records[0].id)).title, '我的 DeepSeek');
  assert.equal((await getNavigation(records[0].id)).icon, '');
  assert.equal((await getNavigation(records[1].id)).icon, 'https://example.com/custom.png');
  assert.equal((await getNavigation(records[2].id)).href, 'https://example.com/my-github');
  assert.equal((await getNavigation(records[4].id)).href, 'https://react.dev/');
  assert.equal((await getNavigation(records[4].id)).icon, '');
  assert.equal((await getNavigation(records[5].id)).icon, '');

  await saveNavigation(
    {
      ...(await getNavigation(records[4].id)),
      icon: LEGACY_NAVIGATION_ICONS.react,
      href: 'https://zh-hans.react.dev/',
    },
    records[4].id,
  );
  await initializeNavigations();
  assert.equal((await getNavigation(records[4].id)).icon, LEGACY_NAVIGATION_ICONS.react);
  assert.equal((await getNavigation(records[4].id)).href, 'https://zh-hans.react.dev/');
});

test('任意网站按域名自动获取图标，不传递路径、凭据和查询参数，非法地址保持空值', () => {
  const source = new URL(getWebsiteIcon('https://user:password@example.com:8443/private?q=secret#hash'));
  assert.equal(source.origin, 'https://a.favicon.im');
  assert.equal(source.pathname, '/example.com');
  assert.equal(source.searchParams.get('larger'), 'true');
  assert.equal(source.searchParams.get('throw-error-on-404'), 'true');
  assert.equal(source.searchParams.size, 2);
  assert.equal(getWebsiteIcon('https://example.com/other'), getWebsiteIcon('https://example.com/'));
  assert.equal(new URL(getWebsiteIcon('https://developer.mozilla.org/zh-CN/')).pathname, '/developer.mozilla.org');
  for (const href of ['', 'invalid', 'javascript:alert(1)', 'file:///test', 'data:text/html,test']) {
    assert.equal(getWebsiteIcon(href), '');
  }
});
