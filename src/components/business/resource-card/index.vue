<template>
  <component
    :is="props.href ? 'a' : 'button'"
    class="resource-card"
    :href="props.href || undefined"
    :target="props.href ? props.target : undefined"
    :rel="props.href && props.target === '_blank' ? 'noopener noreferrer' : undefined"
    :type="props.href ? undefined : 'button'"
    @click="emits('click', $event)"
  >
    <span class="resource-card__icon" aria-hidden="true">
      <slot name="icon">
        <img
          v-if="iconSource && failedIcon !== iconSource"
          :key="iconSource"
          class="resource-card__image"
          :src="iconSource"
          width="48"
          height="48"
          alt=""
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          @error="failedIcon = iconSource"
        />
        <span v-else class="resource-card__fallback">{{ fallbackText }}</span>
      </slot>
    </span>
    <span class="resource-card__title" :title="props.title">{{ props.title }}</span>
    <span v-if="props.description" class="resource-card__description" :title="props.description">
      {{ props.description }}
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { getWebsiteIcon } from '@/utils';

/**
 * 导航和开发工具共用的展示入口；链接保留浏览器原生行为，工具功能由调用方响应点击。
 */
defineOptions({ name: 'ResourceCard' });

/**
 * 卡片仅接收展示内容和跳转目标，不读取站点配置或执行具体工具逻辑。
 */
interface Props {
  /**
   * 资源名称，同时作为卡片的主要可访问名称。
   */
  title: string;
  /**
   * 一行用途说明；省略时不预留描述文本。
   */
  description?: string;
  /**
   * 自定义图片地址；留空时按网站域名自动获取，加载失败显示名称首字，也可使用插槽替换。
   */
  icon?: string;
  /**
   * 导航地址；未提供时渲染原生按钮，通过 click 事件打开工具。
   */
  href?: string;
  /**
   * 链接默认在新标签页打开；内部页面可显式指定 _self。
   */
  target?: '_blank' | '_self';
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  icon: '',
  href: '',
  target: '_blank',
});

/**
 * 链接与按钮均透传原始点击事件；调用方可处理工具操作或主动阻止默认跳转。
 */
interface Emits {
  /**
   * 用户通过鼠标或键盘激活卡片。
   */
  click: [event: MouseEvent];
}

const emits = defineEmits<Emits>();
const failedIcon = ref('');
const iconSource = computed(() => props.icon || getWebsiteIcon(props.href));
const fallbackText = computed(() => Array.from(props.title.trim())[0] ?? '↗');
</script>

<style lang="scss" src="./index.scss" scoped></style>
