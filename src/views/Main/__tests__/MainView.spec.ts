import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MainView from '../MainView.vue'
import Menu from '@/components/Menu'
import Edit from '@/components/Edit'

describe('MainView 布局', () => {
  it('渲染菜单栏与编辑区两大区域', () => {
    const wrapper = mount(MainView)
    expect(wrapper.findComponent(Menu).exists()).toBe(true)
    expect(wrapper.findComponent(Edit).exists()).toBe(true)
  })

  it('菜单栏位于编辑区上方(纵向排列)', () => {
    const wrapper = mount(MainView)
    const menu = wrapper.findComponent(Menu).element
    const edit = wrapper.findComponent(Edit).element
    // menu 在文档流中先于 edit,且垂直位置在上方
    expect(menu.compareDocumentPosition(edit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
