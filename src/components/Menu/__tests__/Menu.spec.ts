import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'

import { mount } from '@vue/test-utils'
import Menu from '../MenuComponent.vue'
import type { MenuEntry } from '../Menu'

type MenuWrapper = ReturnType<typeof mount>

function findTitle(wrapper: MenuWrapper, label: string) {
  return wrapper.findAll('.menu-dropdown-title').find((title) => title.text() === label)
}

function findDropdown(wrapper: MenuWrapper, label: string) {
  return wrapper
    .findAll('.menu-dropdown')
    .find((dropdown) => dropdown.find('.menu-dropdown-title').text() === label)
}

function findPanel(wrapper: MenuWrapper, label: string) {
  return wrapper
    .findAll('.menu-dropdown-panel')
    .find((panel) => panel.attributes('aria-label') === label)
}

function findEntry(wrapper: MenuWrapper, panelLabel: string, entryLabel: string) {
  return findPanel(wrapper, panelLabel)
    ?.findAll('.menu-entry')
    .find((entry) => entry.text().includes(entryLabel))
}

/** 通过标题的 aria-expanded 判断面板是否展开(jsdom 下 v-show 的 isVisible 不可靠) */
function isOpen(wrapper: MenuWrapper, label: string) {
  return findTitle(wrapper, label)?.attributes('aria-expanded') === 'true'
}

/** 点击层名称对话框的确定/取消按钮 */
function clickDialogButton(wrapper: MenuWrapper, text: '确定' | '取消') {
  return wrapper
    .findAll('.layer-name-dialog-button')
    .find((button) => button.text() === text)
    ?.trigger('click')
}

describe('Menu', () => {
  it('渲染 MZ 菜单栏的全部 9 个顶层菜单', () => {
    const wrapper = mount(Menu)
    const titles = wrapper.findAll('.menu-dropdown-title')
    expect(titles.map((title) => title.text())).toEqual([
      '文件',
      '编辑',
      '模式',
      '绘图',
      '层',
      '缩放',
      '工具',
      '游戏',
      '帮助',
    ])
  })

  it('默认不展开下拉面板', () => {
    const wrapper = mount(Menu)
    expect(isOpen(wrapper, '文件')).toBe(false)
    expect(findTitle(wrapper, '文件')?.attributes('aria-haspopup')).toBe('true')
  })

  it('点击标题展开/收起面板', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '文件')?.trigger('click')
    expect(isOpen(wrapper, '文件')).toBe(true)
    await findTitle(wrapper, '文件')?.trigger('click')
    expect(isOpen(wrapper, '文件')).toBe(false)
  })

  it('同时只有一个面板展开', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '文件')?.trigger('click')
    await findTitle(wrapper, '编辑')?.trigger('click')
    expect(isOpen(wrapper, '文件')).toBe(false)
    expect(isOpen(wrapper, '编辑')).toBe(true)
  })

  it('已有菜单展开时悬停其他标题直接切换', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '编辑')?.trigger('click')
    await findDropdown(wrapper, '工具')?.trigger('mouseenter')
    expect(isOpen(wrapper, '编辑')).toBe(false)
    expect(isOpen(wrapper, '工具')).toBe(true)
  })

  it('未展开时悬停标题不打开面板', async () => {
    const wrapper = mount(Menu)
    await findDropdown(wrapper, '工具')?.trigger('mouseenter')
    expect(isOpen(wrapper, '工具')).toBe(false)
  })

  it('按 Escape 收起面板', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '文件')?.trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(isOpen(wrapper, '文件')).toBe(false)
  })

  it('点击菜单栏外部收起面板', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '文件')?.trigger('click')
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    await nextTick()
    expect(isOpen(wrapper, '文件')).toBe(false)
  })

  it('初始选中状态与 MZ 一致(事件/铅笔),层菜单无默认选中', () => {
    const wrapper = mount(Menu)
    expect(findEntry(wrapper, '模式', '事件')?.classes()).toContain('is-checked')
    expect(findEntry(wrapper, '绘图', '铅笔')?.classes()).toContain('is-checked')
    expect(findEntry(wrapper, '层', '编辑')?.classes()).not.toContain('is-checked')
    for (const label of ['1层', '2层', '3层', '4层']) {
      expect(findEntry(wrapper, '层', label)?.classes()).not.toContain('is-checked')
    }
  })

  it('所有子项预留勾选位:选中打✓、未选留空,标签对齐', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '模式')?.trigger('click')
    const entries = findPanel(wrapper, '模式')?.findAll('.menu-entry') ?? []
    // 每个子项都有且只有一个勾选位,且位于标签之前
    for (const entry of entries) {
      expect(entry.findAll('.menu-entry-check')).toHaveLength(1)
      expect(entry.element.children[0]?.className).toContain('menu-entry-check')
    }
    // 选中项打✓,未选中项为一个空白字符(text() 会 trim 掉 \u00A0,故用 textContent 断言)
    expect(findEntry(wrapper, '模式', '事件')?.find('.menu-entry-check').text()).toBe('✓')
    expect(findEntry(wrapper, '模式', '地图')?.find('.menu-entry-check').element.textContent).toBe(
      '\u00A0',
    )
    // 无勾选概念的普通项同样预留空白字符位
    await findTitle(wrapper, '文件')?.trigger('click')
    expect(
      findEntry(wrapper, '文件', '保存项目')?.find('.menu-entry-check').element.textContent,
    ).toBe('\u00A0')
  })

  it('选择单选项后勾选移动并收起面板', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '模式')?.trigger('click')
    await findEntry(wrapper, '模式', '地图')?.trigger('click')
    expect(findEntry(wrapper, '模式', '地图')?.classes()).toContain('is-checked')
    expect(findEntry(wrapper, '模式', '事件')?.classes()).not.toContain('is-checked')
    expect(isOpen(wrapper, '模式')).toBe(false)
  })

  it('复选项可反复切换', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '模式')?.trigger('click')
    await findEntry(wrapper, '模式', '显示通行性')?.trigger('click')
    await findTitle(wrapper, '模式')?.trigger('click')
    expect(findEntry(wrapper, '模式', '显示通行性')?.classes()).toContain('is-checked')
    await findEntry(wrapper, '模式', '显示通行性')?.trigger('click')
    await findTitle(wrapper, '模式')?.trigger('click')
    expect(findEntry(wrapper, '模式', '显示通行性')?.classes()).not.toContain('is-checked')
  })

  it('禁用项点击无效果且不触发 select', async () => {
    const onSelect = vi.fn<(entry: MenuEntry) => void>()
    const wrapper = mount(Menu, { props: { onSelect } })
    await findTitle(wrapper, '缩放')?.trigger('click')
    await findEntry(wrapper, '缩放', '原始大小')?.trigger('click')
    expect(onSelect).not.toHaveBeenCalled()
    expect(isOpen(wrapper, '缩放')).toBe(true)
  })

  it('点击普通项触发 select 并收起面板', async () => {
    const onSelect = vi.fn<(entry: MenuEntry) => void>()
    const wrapper = mount(Menu, { props: { onSelect } })
    await findTitle(wrapper, '文件')?.trigger('click')
    await findEntry(wrapper, '文件', '保存项目')?.trigger('click')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: 'file.save', label: '保存项目' })
    expect(isOpen(wrapper, '文件')).toBe(false)
  })

  it('打开对话框的项标签带"..."后缀', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '文件')?.trigger('click')
    expect(findEntry(wrapper, '文件', '新建项目')?.text()).toContain('新建项目...')
    expect(findEntry(wrapper, '文件', '退出')?.text()).not.toContain('...')
  })

  it('渲染分隔线', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '文件')?.trigger('click')
    // 文件菜单在"保存项目"与"部署"之间有 1 条分隔线(与 MZ 一致)
    expect(findPanel(wrapper, '文件')?.findAll('[role="separator"]')).toHaveLength(1)
  })
})

describe('Menu 层菜单:备注编辑/新增/删除', () => {
  /** 确保备注编辑模式已开启(幂等),再打开指定层的备注对话框 */
  async function openLayerRemark(wrapper: MenuWrapper, entryLabel: string) {
    if (!findEntry(wrapper, '层', '编辑')?.classes().includes('is-checked')) {
      await findTitle(wrapper, '层')?.trigger('click')
      await findEntry(wrapper, '层', '编辑')?.trigger('click')
    }
    // 编辑为 keepOpen 按钮,点击后面板仍展开;仅在当时已收起时才补一次打开
    if (!isOpen(wrapper, '层')) {
      await findTitle(wrapper, '层')?.trigger('click')
    }
    await findEntry(wrapper, '层', entryLabel)?.trigger('click')
  }

  /** 查找指定层条目行尾的删除按钮 */
  function findDeleteButton(wrapper: MenuWrapper, entryLabel: string) {
    return findEntry(wrapper, '层', entryLabel)?.find('.menu-entry-delete')
  }

  it('层菜单渲染"编辑/新增"与 4 个层,每个层带删除按钮', () => {
    const wrapper = mount(Menu)
    const entries = findPanel(wrapper, '层')?.findAll('.menu-entry') ?? []
    expect(entries.map((entry) => entry.find('.menu-entry-label').text())).toEqual([
      '编辑',
      '新增',
      '1层',
      '2层',
      '3层',
      '4层',
    ])
    for (const label of ['1层', '2层', '3层', '4层']) {
      expect(findDeleteButton(wrapper, label)?.exists()).toBe(true)
    }
    expect(findEntry(wrapper, '层', '编辑')?.find('.menu-entry-delete').exists()).toBe(false)
    expect(findEntry(wrapper, '层', '新增')?.find('.menu-entry-delete').exists()).toBe(false)
  })

  it('编辑/新增水平放置在同一按钮行内', () => {
    const wrapper = mount(Menu)
    const row = findPanel(wrapper, '层')?.find('.menu-entry-row')
    expect(row?.exists()).toBe(true)
    expect(row?.attributes('role')).toBe('group')
    expect(row?.attributes('aria-label')).toBe('编辑 新增')
    // 行内仅含编辑/新增两个按钮,层条目在行外
    expect(
      row?.findAll('.menu-entry').map((entry) => entry.find('.menu-entry-label').text()),
    ).toEqual(['编辑', '新增'])
    // 行内项根元素为 span(避免 li 嵌套 li),并带 is-inline
    for (const entry of row?.findAll('.menu-entry') ?? []) {
      expect(entry.element.tagName).toBe('SPAN')
      expect(entry.classes()).toContain('is-inline')
    }
  })

  it('其他菜单没有水平按钮行', () => {
    const wrapper = mount(Menu)
    for (const label of ['文件', '编辑', '模式', '绘图', '缩放', '工具', '游戏', '帮助']) {
      expect(findPanel(wrapper, label)?.find('.menu-entry-row').exists()).toBe(false)
    }
  })

  it('编辑选中时前面显示 * 而不是 ✓,普通复选项仍为 ✓', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '编辑')?.trigger('click')
    // 按钮样式的编辑:选中打 *(点击后面板保持展开,无需重新打开)
    expect(findEntry(wrapper, '层', '编辑')?.find('.menu-entry-check').text()).toBe('*')
    // 新增为一次性动作,无持续选中态,勾选位始终为空(仅保留对齐)
    expect(findEntry(wrapper, '层', '新增')?.find('.menu-entry-check').element.textContent).toBe(
      '\u00A0',
    )
    // 对照组:模式菜单的复选项选中后仍打 ✓
    await findTitle(wrapper, '模式')?.trigger('click')
    await findEntry(wrapper, '模式', '显示通行性')?.trigger('click')
    await findTitle(wrapper, '模式')?.trigger('click')
    expect(findEntry(wrapper, '模式', '显示通行性')?.find('.menu-entry-check').text()).toBe('✓')
  })

  it('取消勾选编辑后 * 消失,恢复为空白占位', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '编辑')?.trigger('click')
    await findEntry(wrapper, '层', '编辑')?.trigger('click')
    expect(findEntry(wrapper, '层', '编辑')?.classes()).not.toContain('is-checked')
    expect(findEntry(wrapper, '层', '编辑')?.find('.menu-entry-check').element.textContent).toBe(
      '\u00A0',
    )
  })

  it('默认(非编辑模式)点击层项直接选中,不弹窗', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '1层')?.trigger('click')
    expect(wrapper.find('.layer-name-dialog').exists()).toBe(false)
    expect(findEntry(wrapper, '层', '1层')?.classes()).toContain('is-checked')
    expect(isOpen(wrapper, '层')).toBe(false)
  })

  it('点击"编辑"开启备注编辑模式,可反复开关且面板不收起', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '编辑')?.trigger('click')
    expect(findEntry(wrapper, '层', '编辑')?.classes()).toContain('is-checked')
    expect(isOpen(wrapper, '层')).toBe(true)
    await findEntry(wrapper, '层', '编辑')?.trigger('click')
    expect(findEntry(wrapper, '层', '编辑')?.classes()).not.toContain('is-checked')
    expect(isOpen(wrapper, '层')).toBe(true)
  })

  it('备注编辑模式下点击层项弹窗且不触发 select,菜单收起', async () => {
    const onSelect = vi.fn<(entry: MenuEntry) => void>()
    const wrapper = mount(Menu, { props: { onSelect } })
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '编辑')?.trigger('click')
    await findEntry(wrapper, '层', '1层')?.trigger('click')
    expect(isOpen(wrapper, '层')).toBe(false)
    // 仅"编辑"的切换触发过一次 select,层项点击不触发
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: 'layer.edit' })
    const dialog = wrapper.find('.layer-name-dialog')
    expect(dialog.exists()).toBe(true)
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.text()).toContain('1层 名称')
    expect(wrapper.find('.layer-name-dialog-input').attributes('maxlength')).toBe('8')
  })

  it('备注编辑模式下确认备注仅改名称,不切换选中层', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '1层')?.trigger('click')
    await openLayerRemark(wrapper, '2层')
    await wrapper.find('.layer-name-dialog-input').setValue('地面')
    await clickDialogButton(wrapper, '确定')
    expect(findEntry(wrapper, '层', '2层')?.find('.menu-entry-label').text()).toBe('2层 地面')
    expect(findEntry(wrapper, '层', '1层')?.classes()).toContain('is-checked')
    expect(findEntry(wrapper, '层', '2层')?.classes()).not.toContain('is-checked')
  })

  it('退出备注编辑模式后点击层项恢复直接选中', async () => {
    const wrapper = mount(Menu)
    await openLayerRemark(wrapper, '1层')
    await clickDialogButton(wrapper, '取消')
    // 关闭编辑模式(编辑为 keepOpen,面板不收起)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '编辑')?.trigger('click')
    await findEntry(wrapper, '层', '3层')?.trigger('click')
    expect(wrapper.find('.layer-name-dialog').exists()).toBe(false)
    expect(findEntry(wrapper, '层', '3层')?.classes()).toContain('is-checked')
  })

  it('确认层名称:标签显示"1层 <名称>"', async () => {
    const wrapper = mount(Menu)
    await openLayerRemark(wrapper, '1层')
    await wrapper.find('.layer-name-dialog-input').setValue('地面')
    await clickDialogButton(wrapper, '确定')
    expect(findEntry(wrapper, '层', '1层')?.find('.menu-entry-label').text()).toBe('1层 地面')
  })

  it('确认空名称:标签保持原样', async () => {
    const wrapper = mount(Menu)
    await openLayerRemark(wrapper, '1层')
    await wrapper.find('.layer-name-dialog-input').setValue('   ')
    await clickDialogButton(wrapper, '确定')
    expect(findEntry(wrapper, '层', '1层')?.find('.menu-entry-label').text()).toBe('1层')
  })

  it('取消重命名:不改动名称', async () => {
    const wrapper = mount(Menu)
    await openLayerRemark(wrapper, '1层')
    await wrapper.find('.layer-name-dialog-input').setValue('测试')
    await clickDialogButton(wrapper, '取消')
    expect(wrapper.find('.layer-name-dialog').exists()).toBe(false)
    expect(findEntry(wrapper, '层', '1层')?.find('.menu-entry-label').text()).toBe('1层')
  })

  it('名称超过 8 个字符时确认后截断为 8 个', async () => {
    const wrapper = mount(Menu)
    await openLayerRemark(wrapper, '1层')
    await wrapper.find('.layer-name-dialog-input').setValue('abcdefghij')
    await clickDialogButton(wrapper, '确定')
    expect(findEntry(wrapper, '层', '1层')?.find('.menu-entry-label').text()).toBe('1层 abcdefgh')
  })

  it('对话框内回车确认、Escape 取消', async () => {
    const wrapper = mount(Menu)
    await openLayerRemark(wrapper, '1层')
    const input = wrapper.find('.layer-name-dialog-input')
    await input.setValue('屋顶')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.layer-name-dialog').exists()).toBe(false)
    expect(findEntry(wrapper, '层', '1层')?.find('.menu-entry-label').text()).toBe('1层 屋顶')
    // 再次打开后按 Escape 取消
    await openLayerRemark(wrapper, '1层')
    await wrapper.find('.layer-name-dialog-input').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.layer-name-dialog').exists()).toBe(false)
    expect(findEntry(wrapper, '层', '1层')?.find('.menu-entry-label').text()).toBe('1层 屋顶')
  })

  it('再次打开对话框回显当前名称,可改为空', async () => {
    const wrapper = mount(Menu)
    await openLayerRemark(wrapper, '1层')
    await wrapper.find('.layer-name-dialog-input').setValue('地面')
    await clickDialogButton(wrapper, '确定')
    await openLayerRemark(wrapper, '1层')
    const input = wrapper.find('.layer-name-dialog-input').element as HTMLInputElement
    expect(input.value).toBe('地面')
    await wrapper.find('.layer-name-dialog-input').setValue('')
    await clickDialogButton(wrapper, '确定')
    expect(findEntry(wrapper, '层', '1层')?.find('.menu-entry-label').text()).toBe('1层')
  })

  it('点击遮罩取消重命名', async () => {
    const wrapper = mount(Menu)
    await openLayerRemark(wrapper, '1层')
    await wrapper.find('.layer-name-dialog-mask').trigger('click')
    expect(wrapper.find('.layer-name-dialog').exists()).toBe(false)
    expect(findEntry(wrapper, '层', '1层')?.find('.menu-entry-label').text()).toBe('1层')
  })

  it('点击"新增"追加新层且不改变当前选中层(✓ 保持在原层)', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '3层')?.trigger('click') // 选中 3层,面板收起
    await findTitle(wrapper, '层')?.trigger('click') // 重新展开
    await findEntry(wrapper, '层', '新增')?.trigger('click')
    // 新增的 5层不带 ✓,✓ 仍保持在 3层
    expect(findEntry(wrapper, '层', '5层')?.exists()).toBe(true)
    expect(findEntry(wrapper, '层', '5层')?.classes()).not.toContain('is-checked')
    expect(findEntry(wrapper, '层', '3层')?.classes()).toContain('is-checked')
    // 面板保持展开,可连续新增;再次新增仍不改变选中态
    await findEntry(wrapper, '层', '新增')?.trigger('click')
    expect(findEntry(wrapper, '层', '6层')?.classes()).not.toContain('is-checked')
    expect(findEntry(wrapper, '层', '3层')?.classes()).toContain('is-checked')
    expect(isOpen(wrapper, '层')).toBe(true)
  })

  it('无选中层时点击"新增",新层同样不被选中', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '新增')?.trigger('click')
    expect(findEntry(wrapper, '层', '5层')?.classes()).not.toContain('is-checked')
  })

  it('点击编辑/新增后面板保持展开,点击层条目仍收起', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    // 编辑:切换备注模式后面板保持展开
    await findEntry(wrapper, '层', '编辑')?.trigger('click')
    expect(isOpen(wrapper, '层')).toBe(true)
    await findEntry(wrapper, '层', '编辑')?.trigger('click')
    expect(isOpen(wrapper, '层')).toBe(true)
    // 新增:连续点击均不收起(且不改变选中态,此前未选中任何层)
    await findEntry(wrapper, '层', '新增')?.trigger('click')
    expect(isOpen(wrapper, '层')).toBe(true)
    await findEntry(wrapper, '层', '新增')?.trigger('click')
    expect(isOpen(wrapper, '层')).toBe(true)
    expect(findEntry(wrapper, '层', '6层')?.classes()).not.toContain('is-checked')
    // 层条目(非 keepOpen)点击后仍收起面板
    await findEntry(wrapper, '层', '1层')?.trigger('click')
    expect(isOpen(wrapper, '层')).toBe(false)
    expect(findEntry(wrapper, '层', '1层')?.classes()).toContain('is-checked')
  })

  it('其他菜单的项点击后仍收起面板(keepOpen 仅作用于层菜单按钮)', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '模式')?.trigger('click')
    await findEntry(wrapper, '模式', '显示通行性')?.trigger('click')
    expect(isOpen(wrapper, '模式')).toBe(false)
  })

  it('新增的层同样带删除按钮', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '新增')?.trigger('click')
    expect(findDeleteButton(wrapper, '5层')?.exists()).toBe(true)
  })

  it('点击删除按钮移除该层,不影响其他层与选中态,面板保持打开', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '1层')?.trigger('click')
    await findTitle(wrapper, '层')?.trigger('click')
    await findDeleteButton(wrapper, '2层')?.trigger('click')
    expect(findEntry(wrapper, '层', '2层')).toBeUndefined()
    expect(findEntry(wrapper, '层', '1层')?.classes()).toContain('is-checked')
    expect(findEntry(wrapper, '层', '3层')?.exists()).toBe(true)
    // 删除后面板保持打开,可连续删除
    expect(isOpen(wrapper, '层')).toBe(true)
  })

  it('删除选中层后取消选中', async () => {
    const wrapper = mount(Menu)
    await findTitle(wrapper, '层')?.trigger('click')
    await findEntry(wrapper, '层', '1层')?.trigger('click')
    await findTitle(wrapper, '层')?.trigger('click')
    await findDeleteButton(wrapper, '1层')?.trigger('click')
    expect(findEntry(wrapper, '层', '1层')).toBeUndefined()
    expect(findEntry(wrapper, '层', '3层')?.classes()).not.toContain('is-checked')
  })

  it('删除层同时清理其备注,新增层编号不复用', async () => {
    const wrapper = mount(Menu)
    await openLayerRemark(wrapper, '1层')
    await wrapper.find('.layer-name-dialog-input').setValue('地面')
    await clickDialogButton(wrapper, '确定')
    // 删除 1层(备注一并清理)
    await findTitle(wrapper, '层')?.trigger('click')
    await findDeleteButton(wrapper, '1层')?.trigger('click')
    expect(findEntry(wrapper, '层', '1层')).toBeUndefined()
    // 新增 -> 5层,无备注残留
    await findEntry(wrapper, '层', '新增')?.trigger('click')
    expect(findEntry(wrapper, '层', '5层')?.find('.menu-entry-label').text()).toBe('5层')
  })
})
