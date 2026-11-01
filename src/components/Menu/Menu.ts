/**
 * @description 菜单栏数据
 */

import menusData from './MenuGroup.json'

/** 普通菜单项 */
export interface MenuActionItem {
  type: 'action'
  /** 项 id,全局唯一 */
  id: string
  /** 标签文字 */
  label: string
  /** 快捷键展示文本,如 Ctrl+N */
  shortcut?: string
  /** 点击后打开对话框的项 */
  dialog?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 选中标记字符,默认 ✓;层菜单的[编辑/新增]为按钮样式,选中时用 * */
  mark?: string
  /** 水平放置分组:row 值相同的连续项渲染为同一行按钮,如层菜单的编辑/新增 */
  row?: string
  /** 点击后是否保持下拉面板展开(默认收起);层菜单的编辑/新增需连续操作,设为 true */
  keepOpen?: boolean
}

/** 菜单分隔线 */
export interface MenuSeparatorItem {
  type: 'separator'
}

/** 单选项,同一 group 内互斥 */
export interface MenuRadioItem {
  type: 'radio'
  id: string
  label: string
  shortcut?: string
  /** 所属单选组 */
  group: string
  /** 是否支持自定义名称:点击后弹窗输入,标签显示为"<原标签> <名称>",如层菜单的各层 */
  renamable?: boolean
  /** 是否在行尾显示删除按钮,点击后从菜单移除,如层菜单的各层 */
  deletable?: boolean
  disabled?: boolean
  /** 选中标记字符,默认 ✓ */
  mark?: string
  /** 水平放置分组:row 值相同的连续项渲染为同一行按钮 */
  row?: string
  /** 点击后是否保持下拉面板展开(默认收起) */
  keepOpen?: boolean
}

/** 复选项,可反复切换 */
export interface MenuCheckItem {
  type: 'check'
  id: string
  label: string
  shortcut?: string
  disabled?: boolean
  /** 选中标记字符,默认 ✓;层菜单的[编辑/新增]为按钮样式,选中时用 * */
  mark?: string
  /** 水平放置分组:row 值相同的连续项渲染为同一行按钮 */
  row?: string
  /** 点击后是否保持下拉面板展开(默认收起) */
  keepOpen?: boolean
}

/** 菜单项 */
export type MenuEntry = MenuActionItem | MenuSeparatorItem | MenuRadioItem | MenuCheckItem

/** 顶层菜单 */
export interface MenuGroup {
  id: string
  label: string
  items: MenuEntry[]
}

/** 菜单选中状态 */
export interface MenuSelection {
  /** 单选项:组名 -> 选中的项 id */
  radio: Record<string, string>
  /** 复选项:项 id -> 是否选中 */
  check: Record<string, boolean>
}

/**
 * @description 顶层菜单数据(数据内容存放于同目录 MenuGroup.json)
 *
 * JSON 模块经 `as MenuGroup[]` 断言标注类型:兼容未对 JSON 导入做字面量推断的 TS 版本
 * (部分 IDE 内置 TS 服务),避免"类型不兼容"报错。
 *
 * 数据说明:
 * - 层菜单的[编辑/新增]为水平放置的按钮(同一 row);二者为按钮样式,选中标记用 * 而非 ✓;
 *   keepOpen 使点击后面板保持展开,便于连续切换备注模式/新增层。
 * - 层菜单的各层条目由 MenuComponent 依据 initialLayerNumbers 动态生成(运行时可新增/删除),
 *   故 JSON 中 layer.items 在分隔线处结束。
 */
export const menus = menusData as MenuGroup[]

/**
 * @description 层菜单的初始层编号(编号从 1 开始)
 *
 * 各层条目在 MenuComponent 中动态生成:id 为 `layer.<编号>`、标签为 `<编号>层`,
 * 运行时可经"新增"/删除按钮增删,编号取当前最大编号 + 1(删除后不复用)。
 */
export const initialLayerNumbers = [1, 2, 3, 4]
