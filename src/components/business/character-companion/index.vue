<template>
  <video
    v-show="!hasError"
    ref="characterVideo"
    class="character-companion"
    src="https://ly-1253695189.cos.ap-shanghai.myqcloud.com/resource/character-idle-v2.webm"
    :autoplay="!motionPreference.matches"
    muted
    loop
    playsinline
    disablepictureinpicture
    disableremoteplayback
    aria-hidden="true"
    tabindex="-1"
    @error="hasError = true"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

/**
 * 右下角的透明角色装饰，不参与页面操作；媒体失败时隐藏，不影响导航功能。
 */
defineOptions({ name: 'CharacterCompanion' });

const characterVideo = useTemplateRef<HTMLVideoElement>('characterVideo');
const hasError = ref(false);
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * 减少动态效果时保留静止画面；恢复播放若被浏览器拦截，继续保留画面即可。
 */
const syncPlayback = (): void => {
  if (motionPreference.matches) {
    characterVideo.value?.pause();
    return;
  }
  void characterVideo.value?.play().catch(() => undefined);
};

onMounted(() => {
  syncPlayback();
  motionPreference.addEventListener('change', syncPlayback);
});

onBeforeUnmount(() => {
  motionPreference.removeEventListener('change', syncPlayback);
  characterVideo.value?.pause();
});
</script>

<style lang="scss" src="./index.scss" scoped></style>
