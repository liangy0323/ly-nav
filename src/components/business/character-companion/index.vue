<template>
  <section class="character-companion" aria-label="人物动画">
    <div class="character-companion__stage" aria-hidden="true">
      <video
        ref="idleVideo"
        class="character-companion__video character-companion__video--idle"
        :class="{ 'character-companion__video--visible': phase === 'idle' }"
        :src="idleSource"
        :poster="idlePoster"
        muted
        loop
        playsinline
        preload="auto"
        disablepictureinpicture
        disableremoteplayback
        tabindex="-1"
        @error="handleMediaError('idle')"
      />
      <video
        ref="leaveVideo"
        class="character-companion__video character-companion__video--leave"
        :class="{
          'character-companion__video--visible': phase === 'leaving',
          'character-companion__video--flying': isFlying,
        }"
        :src="leaveSource"
        muted
        playsinline
        preload="auto"
        disablepictureinpicture
        disableremoteplayback
        tabindex="-1"
        @ended="handleEnded('leaving')"
        @timeupdate="handleTimeUpdate('leaving', $event)"
        @error="handleMediaError('leaving')"
      />
    </div>
    <div class="character-companion__controls">
      <p v-if="errorMessage" class="character-companion__error" role="status">{{ errorMessage }}</p>
      <button
        v-if="needsPlayback"
        class="character-companion__button"
        type="button"
        :disabled="isPending"
        @click="handleRetry"
      >
        播放动画
      </button>
      <button
        v-else-if="phase === 'idle'"
        class="character-companion__button"
        type="button"
        :disabled="isPending"
        @click="handleDismiss"
      >
        收起人物
      </button>
      <button
        v-else-if="phase === 'hidden'"
        class="character-companion__button"
        type="button"
        :disabled="isPending"
        @click="handleSummon"
      >
        召回人物
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCharacterPlayback } from '@/composables/use-character-playback';
import idleSource from '@/assets/videos/character-idle.webm';
import leaveSource from '@/assets/videos/character-leave.webm';
import idlePoster from '@/assets/images/character-idle-poster.webp';

/**
 * 使用项目内的透明视频完成循环待机与御剑离场；按钮提供收起和重新召回入口。
 */
defineOptions({ name: 'CharacterCompanion' });

const {
  phase,
  isFlying,
  isPending,
  needsPlayback,
  errorMessage,
  handleSummon,
  handleDismiss,
  handleRetry,
  handleEnded,
  handleTimeUpdate,
  handleMediaError,
} = useCharacterPlayback();
</script>

<style lang="scss" src="./index.scss" scoped></style>
