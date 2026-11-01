<script setup lang="ts">
import { computed } from 'vue'

import MenuItem from '../MenuItem'
import type { MenuEntry, MenuGroup, MenuSelection, MenuSeparatorItem } from '../Menu'

/** 可水平放置的项(分隔线除外) */
type MenuRowEntry = Exclude<MenuEntry, MenuSeparatorItem>

const props = defineProps<{
  group: MenuGroup
  selections: MenuSelection
  open: boolean
  /** 自定义层名:项 id -> 名称,透传给菜单项拼接标签 */
  layerNames?: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'hover'): void
  (e: 'select', entry: MenuEntry): void
  (e: 'delete', entry: MenuEntry): void
}>()

/**
 * 面板行:row 值相同的连续项合并为一个数组(水平按钮行),其余为单项
 * 例:层菜单的编辑/新增设了同一 row,合并为一行内的两个按钮
 */
const rows = computed<(MenuEntry | MenuRowEntry[])[]>(() => {
  const result: (MenuEntry | MenuRowEntry[])[] = []
  for (const entry of props.group.items) {
    if (entry.type === 'separator' || !entry.row) {
      result.push(entry)
      continue
    }
    // 至此 entry 已窄化为非分隔线项
    const last = result[result.length - 1]
    if (Array.isArray(last) && last[0]?.row === entry.row) {
      last.push(entry)
    } else {
      result.push([entry])
    }
  }
  return result
})
</script>

<template>
  <div class="menu-dropdown" @mouseenter="emit('hover')">
    <button
      type="button"
      class="menu-dropdown-title"
      :class="{ 'is-open': open }"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="emit('toggle')"
    >
      {{ group.label }}
    </button>
    <ul v-show="open" class="menu-dropdown-panel" role="menu" :aria-label="group.label">
      <template v-for="(row, index) in rows" :key="index">
        <MenuItem
          v-if="!Array.isArray(row)"
          :entry="row"
          :selections="selections"
          :layer-names="layerNames"
          @select="emit('select', $event)"
          @delete="emit('delete', $event)"
        />
        <li
          v-else
          class="menu-entry-row"
          role="group"
          :aria-label="row.map((entry) => entry.label).join(' ')"
        >
          <MenuItem
            v-for="(entry, entryIndex) in row"
            :key="entryIndex"
            inline
            :entry="entry"
            :selections="selections"
            :layer-names="layerNames"
            @select="emit('select', $event)"
            @delete="emit('delete', $event)"
          />
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>
@import './MenuDropdownComponent.css';
</style>
