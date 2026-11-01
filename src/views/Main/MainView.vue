<script setup lang="ts">
import Menu from '@/components/Menu'
import Edit from '@/components/Edit'
</script>

<template>
  <!-- 纵向 flex:菜单栏固定高度(26px,由 MenuComponent 自身样式决定),编辑区填满剩余空间 -->
  <div class="flex h-full flex-col overflow-hidden">
    <!-- 菜单栏:不伸缩、不收缩 -->
    <div class="flex-none">
      <Menu />
    </div>
    <!-- 编辑区:占满剩余高度;min-h-0 允许在矮窗口下收缩,避免撑出滚动条 -->
    <div class="min-h-0 flex-1">
      <Edit />
    </div>
  </div>
</template>
