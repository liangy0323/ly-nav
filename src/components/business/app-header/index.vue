<template>
  <header class="app-header">
    <nav class="app-header__navigation" aria-label="主导航">
      <router-link class="app-header__link" :to="{ name: 'navigation' }" exact-active-class="app-header__link--active">
        导航
      </router-link>
      <router-link class="app-header__link" :to="{ name: 'tools' }" exact-active-class="app-header__link--active">
        工具
      </router-link>
    </nav>
    <button class="app-header__settings" type="button" aria-label="设置">
      <menu-icon :size="25" :stroke-width="1.8" aria-hidden="true" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { Menu as MenuIcon } from '@lucide/vue';
import { RouterLink } from 'vue-router';

/**
 * 头部提供导航与工具页面的路由入口；设置按钮交互将在选定 UI 框架后接入。
 */
defineOptions({ name: 'AppHeader' });
</script>

<style lang="scss" src="./index.scss" scoped></style>
