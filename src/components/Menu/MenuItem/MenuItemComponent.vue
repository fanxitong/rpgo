<script setup lang="ts">
import { computed } from 'vue'

import type { MenuEntry, MenuSelection } from '../Menu'

const props = defineProps<{
  entry: MenuEntry
  selections: MenuSelection
  /** 自定义层名:项 id -> 名称,非空时标签显示为"<原标签> <名称>" */
  layerNames?: Record<string, string>
  /** 行内模式:根元素渲染为 span 并置于水平按钮行容器内,平分宽度、内容居中 */
  inline?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', entry: MenuEntry): void
  (e: 'delete', entry: MenuEntry): void
}>()

/** 是否在行尾显示删除按钮(目前仅层菜单的各层可删除) */
const deletable = computed(() => props.entry.type === 'radio' && props.entry.deletable === true)

/** 单选项/复选项的选中状态 */
const checked = computed(() => {
  if (props.entry.type === 'radio') {
    return props.selections.radio[props.entry.group] === props.entry.id
  }
  if (props.entry.type === 'check') {
    return props.selections.check[props.entry.id] === true
  }
  return false
})

const role = computed(() => {
  if (props.entry.type === 'radio') {
    return 'menuitemradio'
  }
  if (props.entry.type === 'check') {
    return 'menuitemcheckbox'
  }
  return 'menuitem'
})

/** 选中标记字符:默认 ✓;按钮样式的项(层菜单的编辑/新增)用 * */
const mark = computed(() => {
  if (props.entry.type === 'separator') {
    return '✓'
  }
  return props.entry.mark ?? '✓'
})

/** 标签文字,打开对话框的项带"..."后缀;有自定义层名时拼接为"<原标签> <名称>" */
const label = computed(() => {
  if (props.entry.type === 'separator') {
    return ''
  }
  const base =
    props.entry.type === 'action' && props.entry.dialog
      ? `${props.entry.label}...`
      : props.entry.label
  const layerName = props.layerNames?.[props.entry.id]
  return layerName ? `${base} ${layerName}` : base
})

function onClick() {
  if (props.entry.type !== 'separator' && !props.entry.disabled) {
    emit('select', props.entry)
  }
}

/** 点击删除按钮:仅删除,不触发行的选中(模板上已用 @click.stop 阻止冒泡) */
function onDelete() {
  emit('delete', props.entry)
}
</script>

<template>
  <li v-if="entry.type === 'separator'" class="menu-entry-separator" role="separator"></li>
  <component
    v-else
    :is="inline ? 'span' : 'li'"
    class="menu-entry"
    :class="{ 'is-inline': inline, 'is-checked': checked, 'is-disabled': entry.disabled }"
    :role="role"
    :aria-checked="entry.type === 'radio' || entry.type === 'check' ? checked : undefined"
    :aria-disabled="entry.disabled === true"
    @click="onClick"
  >
    <!-- 勾选位:所有子项固定预留一个字符宽,选中打标记(✓ 或 *)、未选留空,保证标签左边缘对齐 -->
    <span class="menu-entry-check" aria-hidden="true">{{ checked ? mark : '\u00A0' }}</span>
    <span class="menu-entry-label">{{ label }}</span>
    <button
      v-if="deletable"
      type="button"
      class="menu-entry-delete"
      :aria-label="'删除 ' + label"
      @click.stop="onDelete"
    >
      ×
    </button>
    <span v-if="entry.shortcut" class="menu-entry-shortcut">{{ entry.shortcut }}</span>
  </component>
</template>

<style scoped>
@import './MenuItemComponent.css';
</style>
