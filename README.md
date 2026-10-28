# 青屿

基于 Rsbuild 2、Vue 3 和 TypeScript 的单前端项目，使用 pnpm 11 管理依赖。

当前仅展示月下水庭背景与右下角透明人物动画，产品方向继续讨论。

## 本地开发

环境要求：Node.js >= 22.22.1，pnpm 11.x。

```bash
pnpm install
pnpm dev
```

默认开发地址：`http://localhost:3000`。

## 当前结构

```text
src/
  App.vue                                  # 背景与人物的场景入口
  main.ts                                  # Vue 启动入口
  assets/
    images/moonlit-courtyard.webp           # 月下水庭背景
    images/character-idle-poster.webp       # 减少动态效果时使用的静态人物
    videos/                                # 项目内的透明待机与离场视频
    styles/                                # tokens、theme 与基础样式
  components/business/character-companion/ # 透明人物组件
  composables/use-character-playback.ts    # 人物播放阶段与媒体生命周期
build/                                     # 开发、生产构建与运行时能力
public/favicon.ico                         # 站点图标
```

背景按比例铺满屏幕，裁切位置靠右下。人物按“待机 → 离场 → 隐藏”切换：打开页面直接循环待机；点击“收起人物”御剑离场，结束后可点击“召回人物”恢复待机。

两段视频均位于 `src/assets/videos` 并通过模块导入，不再使用 OSS 地址。离场由原始 1280×720 MP4 去除绿幕后编码为 VP9 透明 WebM，显示画布最大 960×540，小屏按可用宽高等比缩小，不放大原视频。待机 `character-idle.webm` 原样复制，独立保留原本的右下角定位：桌面高度为 `min(52dvh, 440px)`，600px 以下屏幕为 `min(34dvh, 280px)`。阶段切换保留短过渡，离场仍飞向视口左上方。

开启系统减少动态效果时显示静止待机画面，收起时直接隐藏；媒体失败时提供重新召回，自动播放受限时提供手动播放入口。卸载时暂停视频并移除动态偏好监听。

头部、导航、工具、星空、路由、本地导航数据和自动图标获取功能，以及相关依赖与测试均已移除。本次代码清理不操作浏览器中已有的 IndexedDB 数据。

## 常用命令

```bash
pnpm lint         # ESLint 检查
pnpm format:check # Prettier 检查
pnpm typecheck    # Vue 与 TypeScript 类型检查
pnpm build        # 类型检查与生产构建
pnpm preview      # 本地预览生产产物
pnpm check        # 执行全部检查
```

保留 Husky 与 lint-staged，提交前仅检查暂存文件；提交和推送按用户明确要求执行。

## 基础能力

- 构建配置保留 `build/` 的开发与生产分层、Sass、Vue API 自动导入、基础组件自动扫描、拆包、图片压缩和 gzip 预压缩。
- `auto-imports.d.ts` 和 `components.d.ts` 由构建插件重新生成，不手动编辑。
- 全局样式仅从 `src/main.ts` 引入一次；tokens 保留基础通用变量，theme 在 `:root` 定义单一深色配色，不预留多主题和切换逻辑。
- 环境仅支持 development、production，不依赖 API 地址。
- 生产构建保留版本清单、版本通知、Service Worker 与离线页；实际离线与更新行为需单独验证。

协作规则见 `AGENTS.md` 和 `.rules/`，当前产品状态见 `docs/prod.md`。
