import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

import type { CharacterPhase } from '@/types';

/**
 * 编排人物待机和离场；异步播放用序号隔离，卸载时释放媒体与系统动态偏好监听。
 * 视频保留在 DOM 中预加载，切换播放成功后才交接画面，减少首帧空白。
 */
export const useCharacterPlayback = () => {
  const idleVideo = useTemplateRef<HTMLVideoElement>('idleVideo');
  const leaveVideo = useTemplateRef<HTMLVideoElement>('leaveVideo');
  const phase = ref<CharacterPhase>('idle');
  const isFlying = ref(false);
  const isPending = ref(false);
  const needsPlayback = ref(false);
  const errorMessage = ref('');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let request = 0;
  let disposed = false;

  const getVideo = (next: CharacterPhase) => (next === 'idle' ? idleVideo.value : leaveVideo.value);

  const pauseAll = (): void => {
    idleVideo.value?.pause();
    leaveVideo.value?.pause();
  };

  /**
   * 播放失败时提供重试；自动播放被拦截时保留当前阶段，等待用户点击继续。
   */
  const playPhase = async (next: CharacterPhase): Promise<void> => {
    if (disposed) return;
    const ticket = ++request;
    const target = motionPreference.matches && next === 'leaving' ? 'hidden' : next;
    isPending.value = true;
    needsPlayback.value = false;
    errorMessage.value = '';
    pauseAll();
    if (target === 'leaving') isFlying.value = false;
    if (target === 'hidden') {
      phase.value = target;
      isPending.value = false;
      return;
    }
    const video = getVideo(target);
    if (!video) {
      isPending.value = false;
      return;
    }
    try {
      video.currentTime = 0;
      if (!motionPreference.matches) await video.play();
      if (disposed || ticket !== request) return;
      phase.value = target;
    } catch (error) {
      if (disposed || ticket !== request) return;
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        phase.value = target;
        needsPlayback.value = true;
      } else {
        phase.value = 'hidden';
        errorMessage.value = '人物视频暂时无法播放，请重新召回。';
      }
    } finally {
      if (ticket === request) isPending.value = false;
    }
  };

  const handleSummon = (): void => {
    if (phase.value === 'hidden' && !isPending.value) void playPhase('idle');
  };

  const handleDismiss = (): void => {
    if (phase.value === 'idle' && !isPending.value) void playPhase('leaving');
  };

  const handleRetry = (): void => {
    if (!isPending.value) void playPhase(phase.value === 'hidden' ? 'idle' : phase.value);
  };

  const handleEnded = (clip: CharacterPhase): void => {
    if (phase.value !== clip || isPending.value) return;
    if (clip === 'leaving') void playPhase('hidden');
  };

  /**
   * 离场踏剑后向左上方飞离；媒体时间决定过渡，不使用额外定时器。
   */
  const handleTimeUpdate = (clip: CharacterPhase, event: Event): void => {
    const video = event.currentTarget;
    if (!(video instanceof HTMLVideoElement) || phase.value !== clip) return;
    if (clip === 'leaving') isFlying.value = video.currentTime >= 3;
  };

  const handleMediaError = (clip: CharacterPhase): void => {
    if (phase.value !== clip || isPending.value) return;
    ++request;
    pauseAll();
    phase.value = 'hidden';
    needsPlayback.value = false;
    errorMessage.value = '人物视频加载失败，请重新召回。';
  };

  const handleMotionChange = (): void => {
    if (phase.value !== 'hidden') void playPhase(phase.value);
  };

  onMounted(() => {
    motionPreference.addEventListener('change', handleMotionChange);
    void playPhase('idle');
  });

  onBeforeUnmount(() => {
    disposed = true;
    ++request;
    pauseAll();
    motionPreference.removeEventListener('change', handleMotionChange);
  });

  return {
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
  };
};
