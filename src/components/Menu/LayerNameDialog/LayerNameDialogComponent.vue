<script setup lang="ts">
import { nextTick, onMounted, ref, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 层标签,如"1层" */
    layerLabel: string
    /** 当前自定义名称,空表示未命名 */
    name: string
    /** 名称最大字符数 */
    maxLength?: number
  }>(),
  {
    maxLength: 8,
  },
)

const emit = defineEmits<{
  (e: 'confirm', name: string): void
  (e: 'cancel'): void
}>()

/** 输入草稿,打开时初始化为当前名称 */
const draft = ref(props.name)
const input = ref<HTMLInputElement | null>(null)

const titleId = useId()
const inputId = useId()

onMounted(async () => {
  await nextTick()
  input.value?.focus()
  input.value?.select()
})

/** 确认:防御性裁剪到最大长度后交给父组件(输入框 maxlength 之外的双保险) */
function onConfirm() {
  emit('confirm', draft.value.slice(0, props.maxLength))
}

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="layer-name-dialog-mask" @click.self="onCancel">
    <div
      class="layer-name-dialog"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @keydown.esc="onCancel"
    >
      <div :id="titleId" class="layer-name-dialog-title">层名称</div>
      <div class="layer-name-dialog-body">
        <label class="layer-name-dialog-label" :for="inputId">{{ layerLabel }} 名称</label>
        <input
          :id="inputId"
          ref="input"
          v-model="draft"
          class="layer-name-dialog-input"
          type="text"
          :maxlength="maxLength"
          @keydown.enter.prevent="onConfirm"
        />
        <p class="layer-name-dialog-hint">最多 {{ maxLength }} 个字符,留空则不命名</p>
      </div>
      <div class="layer-name-dialog-buttons">
        <button type="button" class="layer-name-dialog-button" @click="onConfirm">确定</button>
        <button type="button" class="layer-name-dialog-button" @click="onCancel">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './LayerNameDialogComponent.css';
</style>
