import type { NavigationDraft } from '@/types';

/**
 * 仅用于首次初始化的八个内置导航；组件不得直接用此数组渲染列表。
 * 图标留空，由卡片根据网站域名自动获取，用户仍可自行指定图标地址。
 */
export const DEFAULT_NAVIGATIONS: readonly NavigationDraft[] = [
  {
    title: 'DeepSeek',
    href: 'https://www.deepseek.com/',
    description: 'AI 助手与产品入口',
    icon: '',
  },
  {
    title: '腾讯元宝',
    href: 'https://yuanbao.tencent.com/',
    description: '腾讯 AI 助手',
    icon: '',
  },
  {
    title: 'GitHub',
    href: 'https://github.com/',
    description: '代码托管与开源项目',
    icon: '',
  },
  {
    title: 'Vue 官方文档',
    href: 'https://cn.vuejs.org/',
    description: 'Vue 开发指南与 API',
    icon: '',
  },
  {
    title: 'React 官方文档',
    href: 'https://react.dev/',
    description: 'React 学习与 API 参考',
    icon: '',
  },
  { title: '掘金', href: 'https://juejin.cn/', description: '开发者技术社区', icon: '' },
  { title: '有道', href: 'https://m.youdao.com/', description: '查词与翻译', icon: '' },
  {
    title: '微信公众平台',
    href: 'https://mp.weixin.qq.com/',
    description: '公众号管理与内容发布',
    icon: '',
  },
];
