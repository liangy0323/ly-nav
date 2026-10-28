import { createApp } from 'vue';

import App from '@/App.vue';
import router from '@/router';

/**
 * 全局色板、主题和基础样式仅在启动入口加载一次，避免组件重复引入全局规则。
 */
import '@/assets/styles/index.scss';

createApp(App).use(router).mount('#root');
