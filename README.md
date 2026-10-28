# 青屿 · LY Nav

基于 Rsbuild 2、Vue 3 和 TypeScript 的前端项目，使用 pnpm 11 管理依赖。

## 本地开发

环境要求：Node.js >= 22.22.1，pnpm 11.x。

```bash
pnpm install
pnpm dev
```

默认开发地址：`http://127.0.0.1:3000`。需要更换端口时，可运行 `pnpm dev --port 3001`。

## 常用命令

```bash
pnpm typecheck    # Vue 与 TypeScript 类型检查
pnpm test:storage # 本地导航仓储回归测试
pnpm lint         # ESLint 检查
pnpm lint:fix     # ESLint 检查并自动修复
pnpm build        # 类型检查并生成 dist/ 静态产物
pnpm build:prod   # 生产环境构建
pnpm preview      # 本地预览构建产物
pnpm format       # 格式化
pnpm check        # ESLint、格式检查、仓储测试、类型检查与生产构建
```

## 目录

```text
src/
  App.vue           # 根组件
  main.ts           # Vue 启动入口
  router/index.ts   # 导航默认路由与 /toools 工具路由
  views/            # 导航与工具页面出口
  assets/
    images/logo.png # 无文字透明 Logo
    styles/         # 全局样式入口及 tokens/theme/base 分层
index.html          # HTML 模板与 #root 挂载节点
build/              # 参照 LY Fullstack Admin 的完整构建目录
  rsbuild.base.config.ts
  rsbuild.dev.config.ts
  rsbuild.prod.config.ts
  runtime/          # 环境校验、版本检测及离线缓存
env.d.ts            # 构建与浏览器运行时类型声明
public/favicon.ico  # 站点图标
tsconfig.json       # 严格类型检查与 @/* 路径别名
```

头部提供“导航 / 工具”菜单，导航默认子路由 `path: ''` 对应 `/`，工具路由为 `/toools`。
导航页已接入卡片和 Dexie 本地数据；工具页保留内容出口，暂不接入 UI 框架或 Store。
路由使用 HTML5 History 模式，静态部署时需要将页面路由请求回退到 `index.html`，保证直接访问和刷新 `/toools` 可用。

## 本地导航数据

使用 [Dexie](https://dexie.org/docs/Tutorial/Vue) 操作浏览器 IndexedDB，数据库名为 `qingyu`。
`src/storage` 提供唯一数据库实例、初始化和增删改查仓储，`src/composables/use-navigation.ts` 订阅数据库结果并编排页面操作。

- 首次进入先显示卡片骨架，在同一个事务中写入八个默认导航和初始化标记，再读取数据库显示列表。
- 再次进入不会覆盖修改；删除全部导航后保持空列表。多标签页写入会由 `liveQuery` 更新当前列表。
- 页面支持新增、编辑、确认删除和导出 JSON。导出重新读取数据库，并包含格式标识、版本、导出时间和导航记录；本轮未提供导入功能。
- 导航数据保存在当前浏览器及当前站点来源中，清除站点数据会清除导航。可通过导出保留副本，当前未接入云同步。
- 数据库不可用时显示错误和重试入口，不退回默认数组伪装为已保存的导航。
- 图标留空时，卡片根据网站域名生成 [Favicon.im](https://favicon.im/) 大尺寸图标请求，不需要维护网站图标文件；仅向服务传递域名，不传递网址路径与查询参数。手动填写的图标地址优先，加载失败显示标题首字。此能力依赖第三方服务可用性。
- 旧默认数据通过一次性事务清除上一版写入的已知图标，改为自动获取，并修正 React 地址；自定义图标和修改过的条目保留，删除项不恢复。`src/storage/modules/legacy-navigation-icons.ts` 仅为兼容旧数据，不参与图标展示。

`pnpm test:storage` 使用 Node.js 自带测试能力和内存 IndexedDB，覆盖并发初始化、增删改查、空库保持、事务回滚、链接校验、导出与实时查询；不会清理用户的浏览器数据。

## 样式与品牌

全局样式只从 `src/main.ts` 引入 `src/assets/styles/index.scss`，按 `tokens → theme → base` 加载。

默认黑色主题，页面背景为 `#0D0F11`，不跟随系统自动切换。浅色语义变量仅作预留，当前没有主题切换界面。

Logo 主色为青蓝 `#117387`，点缀色为暖金 `#CDA45E`，集中配置在 `tokens.scss`。深色主题主色使用同色系的明亮变体；组件通过 `theme.scss` 中的语义变量取色，使用 SCSS + BEM，不使用样式穿透。

Logo 从 `@/assets/images/logo.png` 导入，`public/favicon.ico` 继续作为浏览器图标。协作入口见 `AGENTS.md`，样式规范见 `.rules/style.md`。

## 资源卡片

导航链接和开发工具统一使用 `src/components/business/resource-card/index.vue`，样式位于同目录的 `index.scss`。
支持 `title`、`description`、`icon`、`href`、`target`；`icon` 插槽可放置自定义图标。
未指定图标且存在网站地址时自动获取图标；没有网站地址或加载失败时显示标题首字，超长标题和描述会截断并保留悬浮全文。

```vue
<template>
  <resource-card title="Vue 文档" description="Vue 开发指南" :icon="logo" href="https://vuejs.org/" />
  <resource-card title="JSON 工具" description="格式化与校验" @click="handleJsonOpen" />
</template>

<script setup lang="ts">
import ResourceCard from '@/components/business/resource-card/index.vue';
import logo from '@/assets/images/logo.png';

/**
 * 此示例将工具打开意图交给外层页面。
 */
interface Emits {
  /**
   * 通知外层打开 JSON 工具。
   */
  openJson: [];
}

const emits = defineEmits<Emits>();
const handleJsonOpen = (): void => emits('openJson');
</script>
```

提供 `href` 时渲染原生链接，默认新标签页打开并附带 `noopener noreferrer`；`target="_self"` 可在当前标签页打开。
省略 `href` 时渲染 `type="button"` 的原生按钮，通过 `click` 事件交给页面处理工具操作。

## 图标

统一使用 [Lucide Vue](https://lucide.dev/guide/vue/getting-started) 的 `@lucide/vue` 包，按需导入所用图标，不全量注册。
三条横线菜单图标为 `Menu`，可在组件中使用：

```vue
<template>
  <menu-icon :size="24" aria-hidden="true" />
</template>

<script setup lang="ts">
import { Menu as MenuIcon } from '@lucide/vue';
</script>
```

图标颜色默认继承 `currentColor`，由组件语义样式控制；只含图标的按钮需要在按钮上提供可访问名称。

## 提交检查

Husky 通过 `prepare` 脚本在安装依赖时初始化 Git 钩子。提交前使用 lint-staged，仅对暂存文件运行 ESLint 自动修复及 Prettier；不会执行全仓检查或构建。手动完整检查使用 `pnpm check`。

ESLint 使用 Flat Config，覆盖 Vue、TypeScript、Node.js 构建配置和 Service Worker；忽略构建产物及自动生成的声明文件，格式规则与 Prettier 保持兼容。

## 构建能力

保留参考项目的开发/生产配置分层、Sass、Vue/Vue Router/Pinia API 自动导入、基础组件自动扫描、依赖拆包、图片压缩和 gzip 预压缩。自动生成的类型声明位于根目录，由插件维护。

`.env.development` 和 `.env.production` 仅配置 `APP_ENV`，保留参考项目的环境模式校验，不依赖 API 地址。

生产构建会生成 `version.json`、版本 meta、`sw.js` 和 `offline.html`，并注入版本轮询与 Service Worker 注册入口。缓存和版本清单使用独立的 `ly-nav` 应用标识。开发环境不启用这些运行时增强。

当前只迁入构建及通知能力；新版本提示界面尚未接入。Service Worker 安装、实际离线访问和更新行为需另行通过浏览器验证。
