<template>
  <main class="app">
    <img class="app__background" :src="moonlitCourtyard" alt="" aria-hidden="true" decoding="async" />
    <character-companion />
  </main>
</template>

<script setup lang="ts">
import CharacterCompanion from '@/components/business/character-companion/index.vue';
import moonlitCourtyard from '@/assets/images/moonlit-courtyard.webp';
</script>

<style lang="scss" scoped>
.app {
  height: 100%;
  isolation: isolate;

  &__background {
    position: fixed;
    z-index: var(--z-index-background);
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: right bottom;
    pointer-events: none;
  }
}
</style>
