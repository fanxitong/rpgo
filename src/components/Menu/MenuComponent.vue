<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import LayerNameDialog from './LayerNameDialog'
import MenuDropdown from './MenuDropdown'
import type { MenuEntry, MenuGroup, MenuRadioItem, MenuSelection } from './Menu'
import { initialLayerNumbers, menus } from './Menu'

const emit = defineEmits<{
  (e: 'select', entry: MenuEntry): void
}>()

/** 当前展开的顶层菜单 id,同时只有一个菜单展开 */
const activeMenuId = ref<string | null>(null)

/** 菜单选中状态:单选项按组名、复选项按项 id */
const selection = ref<MenuSelection>({
  radio: { mode: 'mode.event', draw: 'draw.pencil' },
  check: {},
})

/** 层自定义名称:项 id -> 名称,空表示未命名 */
const layerNames = ref<Record<string, string>>({})

/** 层列表:编号从 1 开始,可新增/删除;id 为 `layer.<编号>`、标签为 `<编号>层` */
const layers = ref<{ number: number }[]>(initialLayerNumbers.map((number) => ({ number })))

/** 正在重命名的层,非空时显示层名称对话框 */
const renaming = ref<{ entry: MenuRadioItem; name: string } | null>(null)

const root = ref<HTMLDivElement | null>(null)

/** 备注编辑模式:层菜单"编辑"勾选时开启,点击层项改为编辑备注而非切换选中层 */
const remarkEdit = computed(() => selection.value.check['layer.edit'] === true)

/** 层菜单:静态头部(编辑/新增/分隔线)+ 动态层列表 */
const layerGroup = computed<MenuGroup>(() => {
  const base = menus.find((group) => group.id === 'layer')
  return {
    id: 'layer',
    label: '层',
    items: [
      ...(base?.items ?? []),
      ...layers.value.map((layer) => ({
        type: 'radio' as const,
        id: `layer.${layer.number}`,
        label: `${layer.number}层`,
        group: 'layer',
        renamable: true,
        deletable: true,
      })),
    ],
  }
})

/** 全部顶层菜单:层菜单替换为含动态层列表的版本 */
const menuGroups = computed<MenuGroup[]>(() =>
  menus.map((group) => (group.id === 'layer' ? layerGroup.value : group)),
)

/** 点击标题:展开/收起 */
function onToggle(menuId: string) {
  activeMenuId.value = activeMenuId.value === menuId ? null : menuId
}

/** 悬停标题:已有菜单展开时直接切换*/
function onHover(menuId: string) {
  if (activeMenuId.value !== null && activeMenuId.value !== menuId) {
    activeMenuId.value = menuId
  }
}

/** 选中菜单项:更新选中状态;除 keepOpen 项外收起面板 */
function onSelect(entry: MenuEntry) {
  // 新增层:仅追加一个编号递增的新层,不改变当前选中层(✓ 保持在原层)
  if (entry.type === 'action' && entry.id === 'layer.add') {
    addLayer()
    closePanelUnlessKeepOpen(entry)
    return
  }
  // 备注编辑模式下点击层项:弹窗编辑备注,不切换选中层
  if (entry.type === 'radio' && entry.renamable && remarkEdit.value) {
    renaming.value = { entry, name: layerNames.value[entry.id] ?? '' }
    activeMenuId.value = null
    return
  }
  if (entry.type === 'radio') {
    selection.value.radio[entry.group] = entry.id
  } else if (entry.type === 'check') {
    selection.value.check[entry.id] = !selection.value.check[entry.id]
  }
  closePanelUnlessKeepOpen(entry)
  emit('select', entry)
}

/** keepOpen 的项(层菜单的编辑/新增按钮)点击后保持面板展开,便于连续操作;其余项收起 */
function closePanelUnlessKeepOpen(entry: MenuEntry) {
  if (entry.type !== 'separator' && entry.keepOpen) {
    return
  }
  activeMenuId.value = null
}

/** 新增层:编号取当前最大编号 + 1(删除后不复用);仅追加层,不改变当前选中层 */
function addLayer() {
  const number = layers.value.reduce((max, layer) => Math.max(max, layer.number), 0) + 1
  layers.value.push({ number })
}

/** 确认层备注:仅更新名称(备注编辑模式下不切换选中层) */
function onRenameConfirm(name: string) {
  const target = renaming.value
  if (!target) {
    return
  }
  const trimmed = name.trim()
  if (trimmed) {
    layerNames.value[target.entry.id] = trimmed
  } else {
    delete layerNames.value[target.entry.id]
  }
  renaming.value = null
}

/** 取消重命名:仅关闭对话框,不改动名称 */
function onRenameCancel() {
  renaming.value = null
}

/** 删除层:移出列表并清理备注;若为选中层则取消选中(面板保持打开,可连续删除) */
function onDelete(entry: MenuEntry) {
  if (entry.type !== 'radio') {
    return
  }
  layers.value = layers.value.filter((layer) => `layer.${layer.number}` !== entry.id)
  delete layerNames.value[entry.id]
  if (selection.value.radio.layer === entry.id) {
    selection.value.radio.layer = ''
  }
}

/** 点击菜单栏外部时收起 */
function onPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) {
    activeMenuId.value = null
  }
}

/** 按 Escape 收起 */
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    activeMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div ref="root" class="menu-component">
    <MenuDropdown
      v-for="group in menuGroups"
      :key="group.id"
      :group="group"
      :selections="selection"
      :layer-names="layerNames"
      :open="activeMenuId === group.id"
      @toggle="onToggle(group.id)"
      @hover="onHover(group.id)"
      @select="onSelect"
      @delete="onDelete"
    />
    <LayerNameDialog
      v-if="renaming"
      :layer-label="renaming.entry.label"
      :name="renaming.name"
      @confirm="onRenameConfirm"
      @cancel="onRenameCancel"
    />
  </div>
</template>

<style scoped>
@import './MenuComponent.css';
</style>
