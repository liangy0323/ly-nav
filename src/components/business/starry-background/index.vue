<template>
  <div class="starry-background" aria-hidden="true">
    <div class="starry-background__solar-system">
      <div class="starry-background__sun"></div>
      <div class="starry-background__orbit starry-background__orbit--mercury"></div>
      <div class="starry-background__orbit starry-background__orbit--venus"></div>
      <div class="starry-background__orbit starry-background__orbit--earth"></div>
      <div class="starry-background__orbit starry-background__orbit--mars"></div>
      <div class="starry-background__orbit starry-background__orbit--jupiter"></div>
      <div class="starry-background__orbit starry-background__orbit--saturn"></div>
      <div class="starry-background__orbit starry-background__orbit--uranus"></div>
      <div class="starry-background__orbit starry-background__orbit--neptune"></div>
      <div class="starry-background__asteroid-belt"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 全屏星空与太阳系装饰背景，通过 CSS 运行动画，不接管页面交互或加载外部资源。
 */
defineOptions({ name: 'StarryBackground' });
</script>

<style lang="scss" src="./index.scss" scoped></style>
