<template>
  <main class="app">
    <starry-background />
    <app-header />
    <div class="app__content"><router-view /></div>
    <character-companion />
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

import CharacterCompanion from '@/components/business/character-companion/index.vue';
import AppHeader from '@/components/business/app-header/index.vue';
import StarryBackground from '@/components/business/starry-background/index.vue';
</script>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  isolation: isolate;

  &__content {
    position: relative;
    z-index: var(--z-index-content);
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}
</style>
