<template>
  <form class="navigation-editor" aria-label="导航编辑" @submit.prevent="emits('save', { ...draft })">
    <h2 class="navigation-editor__title">{{ props.item ? '编辑导航' : '新增导航' }}</h2>
    <fieldset class="navigation-editor__fields" :disabled="props.busy">
      <label class="navigation-editor__field">
        <span>名称</span>
        <input
          ref="titleInput"
          v-model="draft.title"
          class="navigation-editor__input"
          required
          maxlength="60"
          placeholder="例如：Vue 官方文档"
        />
      </label>
      <label class="navigation-editor__field">
        <span>网站地址</span>
        <input
          v-model="draft.href"
          class="navigation-editor__input"
          type="url"
          required
          maxlength="2048"
          placeholder="https://"
        />
      </label>
      <label class="navigation-editor__field">
        <span>描述 <span class="navigation-editor__optional">可选</span></span>
        <input
          v-model="draft.description"
          class="navigation-editor__input"
          maxlength="160"
          placeholder="一句话说明用途"
        />
      </label>
      <label class="navigation-editor__field">
        <span>图标地址 <span class="navigation-editor__optional">可选</span></span>
        <input
          v-model="draft.icon"
          class="navigation-editor__input"
          type="url"
          maxlength="2048"
          placeholder="留空自动获取网站图标"
        />
      </label>
    </fieldset>
    <p v-if="props.error" class="navigation-editor__error" role="alert">{{ props.error }}</p>
    <div class="navigation-editor__actions">
      <button class="navigation-editor__button" type="button" :disabled="props.busy" @click="emits('cancel')">
        取消
      </button>
      <button class="navigation-editor__button navigation-editor__button--primary" type="submit" :disabled="props.busy">
        {{ props.busy ? '保存中…' : '保存导航' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { onMounted, reactive, useTemplateRef } from 'vue';

import type { NavigationDraft, NavigationItem } from '@/types';

/**
 * 页面内编辑表单，保存前持有独立草稿，取消不会修改数据库中的原记录。
 */
defineOptions({ name: 'NavigationEditor' });

/**
 * 表单初始记录、提交状态与仓储返回的错误由页面传入。
 */
interface Props {
  /**
   * 编辑的持久化记录；省略时创建新记录。
   */
  item?: NavigationItem;
  /**
   * 保存期间禁止重复提交和修改输入。
   */
  busy: boolean;
  /**
   * 保存失败时的可读错误。
   */
  error: string;
}
const props = defineProps<Props>();

/**
 * 提交可编辑字段或取消，表单不直接访问数据库。
 */
interface Emits {
  /**
   * 请求保存本次草稿。
   */
  save: [draft: NavigationDraft];
  /**
   * 放弃本次编辑。
   */
  cancel: [];
}
const emits = defineEmits<Emits>();
const draft = reactive<NavigationDraft>({
  title: props.item?.title ?? '',
  href: props.item?.href ?? '',
  description: props.item?.description ?? '',
  icon: props.item?.icon ?? '',
});
const titleInput = useTemplateRef<HTMLInputElement>('titleInput');

onMounted(() => titleInput.value?.focus());
</script>

<style lang="scss" src="./index.scss" scoped></style>
