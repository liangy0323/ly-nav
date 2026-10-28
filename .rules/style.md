# 样式规范

青屿默认使用黑色主题，以修仙角色在深色背景下的展示效果为准。浅色主题仅保留变量定义，当前不提供主题切换界面，也不跟随系统自动切换。所有颜色、背景、边框、阴影、层级等 design token 优先走 CSS 变量，避免把颜色值散落在组件里。

## CSS 变量主题

通过 `data-theme` 属性预留主题切换能力：

具体色值放在 `src/assets/styles/modules/tokens.scss`，主题语义变量放在 `src/assets/styles/modules/theme.scss`。

```scss
:root {
  --palette-teal-400: #65c4d5;
  --palette-teal-700: #117387;
  --palette-gold-500: #cda45e;
}

html[data-theme='dark'] {
  --color-primary: var(--palette-teal-400);
  --color-accent: var(--palette-gold-500);
}
```

规则：

- HTML 初始值固定为 `data-theme='dark'`，未声明主题时由 `:root` 兜底同一套深色语义变量。
- Logo 主色为青蓝 `#117387`，暖金点缀色为 `#CDA45E`；具体色值及深浅变体集中在 `tokens.scss`。深色主题使用更明亮的青蓝变体，保证文字与交互状态对比度。
- 暖金装饰使用 `--color-accent`，金色文字使用 `--color-accent-text`，避免浅色背景下的可读性问题。
- 新增主题只新增变量覆盖，不复制组件样式。
- 组件内禁止直接写业务颜色值，除非是不可主题化的透明度、阴影或状态辅助色。
- TypeScript 中需要切换主题时，只修改根节点 `data-theme`，不要动态改大量 class。
- CSS 变量使用通用语义命名，不使用 `--im-*` 这类项目名前缀。

---

## 样式入口聚合

`src/assets/styles/index.scss` 作为全局样式唯一入口：

```scss
@use './modules/tokens.scss';
@use './modules/theme.scss';
@use './modules/base.scss';
```

规则：

- 全局 reset、变量、动画、字体、UI 库覆盖集中在入口中聚合。
- 组件私有样式放在组件同目录，不通过全局入口引入。
- 当前未选择 UI 框架，不预置任何第三方组件库的主题或覆盖样式。
- 不引入 Tailwind；当前项目统一使用 SCSS + BEM + CSS 变量。
- 不迁移 `common.scss` / `generate.scss` 这类全局原子类；迁移时改为组件 BEM 类 + `mixins.scss`。

---

## Vue 组件样式策略

| 条件         | 方式                                                     |
| ------------ | -------------------------------------------------------- |
| 样式 ≤ 50 行 | 内联 `<style lang="scss" scoped>`                        |
| 样式 > 50 行 | 外部文件 `<style lang="scss" src="./index.scss" scoped>` |
| 多组件共享   | 拆到组件域或 `assets/styles/modules/`                    |

组件目录示例：

业务组件统一放在 `src/components/business/<组件名>/`，子目录使用 kebab-case，
每个组件使用 `index.vue` 和 `index.scss`；该目录始终使用外部样式文件，不受上表行数阈值限制。

```text
src/components/business/character-companion/
├── index.vue
└── index.scss
```

---

## 禁止样式穿透（`:deep`）（强制）

禁止在组件 `<style scoped>` 中使用 `:deep()`，也禁止使用 `::v-deep`、`/deep/`、`>>>` 等等价写法。穿透会绕过 scoped 边界，使第三方组件覆盖和跨组件样式散落在业务文件中，后续很难判断样式来源与影响范围。

需要覆盖子组件或第三方组件内部 DOM 时，必须把规则迁移到对应应用或共享包的全局样式模块，并使用当前组件的 BEM Block 作为最外层作用域：

| 作用域       | 落点                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| 当前 Vue SPA | `src/assets/styles/modules/component-overrides.scss`，出现实际覆盖需求时创建并加入全局入口 |

判断标准：

- 只修改组件自身模板中的元素：保留在组件 scoped 样式中。
- 需要命中子组件根节点内部或第三方组件生成的 DOM：迁入全局覆盖模块。
- 只对一个业务组件生效的覆盖，也必须使用该组件 Block 限定，禁止直接在全局写裸 `.el-*`、`.w-e-*` 或其他第三方选择器。
- 后续选择 UI 框架后，再按实际需要建立组件库全局主题模块，不把第三方覆盖散落到业务组件中。

```scss
// 禁止：组件 scoped 样式穿透第三方组件
.equipment-product-form {
  :deep(.el-select) {
    width: 100%;
  }
}
```

```scss
// 正确：src/assets/styles/modules/component-overrides.scss
.equipment-product-form {
  .el-select {
    width: 100%;
  }
}
```

迁移完成后必须使用以下命令确认目标应用不存在样式穿透：

```bash
rg ":deep\\(|::v-deep|/deep/|>>>" src
```

---

## 命名

- CSS 变量：`--color-primary`、`--color-bg-page`、`--color-text-secondary`
- CSS 类名：严格遵循 BEM 命名规范
- 页面级 Block：优先使用 `.page-<name>`
- 业务组件 Block：优先使用 `.chat-<name>`、`.im-<name>` 等业务前缀
- 基础组件 Block：优先使用 `.base-<name>`
- 项目图片位于 `src/assets/images`，Logo 使用 `@/assets/images/logo.png` 导入；站点图标保留在 `public/favicon.ico`。

---

## SCSS BEM 规范

所有 SCSS 文件必须遵循 BEM（Block Element Modifier）结构，利用 SCSS 的 `&` 嵌套语法实现。

### 命名规则

| 层级               | 格式                                            | 分隔符             | 示例                               |
| ------------------ | ----------------------------------------------- | ------------------ | ---------------------------------- |
| Block（块）        | `prefix-block`                                  | `-` 连接前缀与块名 | `.page-chat`、`.chat-message-item` |
| Element（元素）    | `block__element`                                | `__` 双下划线      | `.chat-message-item__avatar`       |
| Modifier（修饰符） | `block--modifier` 或 `block__element--modifier` | `--` 双连字符      | `.chat-message-item--active`       |

### 核心原则

1. Block 作为唯一顶层类名，一个 Block 对应一个 SCSS 根选择器。
2. Element 只能属于 Block，不能嵌套 Element（`block__el1__el2` 禁止）。
3. Element 多词用 `-` 连接，如 `__message-content`、`__action-button`。
4. Modifier 表示状态或变体，如 `--active`、`--disabled`、`--selected`。
5. 交互伪类（`:hover`、`:focus-visible`）直接嵌套在对应 Element 内部，不额外创建 Modifier。

### SCSS 写法示例

```scss
.chat-message-item {
  display: flex;
  gap: 12px;
  color: var(--color-text-primary);
  background: var(--color-bg-surface);

  &__avatar {
    width: 40px;
    height: 40px;
    flex: none;
  }

  &__content {
    min-width: 0;
    border: 1px solid var(--color-border);
  }

  &__action-button {
    color: var(--color-text-secondary);
    cursor: pointer;

    &:hover {
      color: var(--color-primary);
    }
  }

  &--selected {
    background: var(--color-primary-suppl);
  }
}
```

### 禁止写法

```scss
// 禁止：Element 嵌套 Element
.chat-message-item {
  &__content {
    &__text {
      color: var(--color-text-primary);
    }
  }
}

// 禁止：Block 内部定义无前缀裸类名
.chat-message-item {
  .avatar {
    width: 40px;
  }
}

// 推荐：扁平 Element
.chat-message-item {
  &__content {
    color: var(--color-text-primary);
  }

  &__content-text {
    line-height: 1.6;
  }
}
```

---

## @keyframes 命名

动画关键帧使用 `block-name-action` 格式，kebab-case：

```scss
@keyframes chat-message-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
```
