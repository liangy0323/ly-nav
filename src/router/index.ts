import { createRouter, createWebHistory } from 'vue-router';

/**
 * 导航与工具共享根页面外壳，默认子路由使用空 path，工具保留约定的 /toools 路径。
 * 页面按路由加载，头部、星空和角色由 App.vue 持续挂载。
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      children: [
        {
          path: '',
          name: 'navigation',
          component: () => import('@/views/navigation/index.vue'),
        },
        {
          path: '/toools',
          name: 'tools',
          component: () => import('@/views/tools/index.vue'),
        },
      ],
    },
  ],
});

export default router;
