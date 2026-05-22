<template>
  <div class="navbar">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentPath">{{ currentPath }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <div class="right-menu">
      <el-dropdown trigger="click">
        <div class="avatar-wrapper">
          <el-avatar :size="30" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          <span class="user-name">管理员</span>
          <el-icon><CaretBottom /></el-icon>
        </div>
        <template #footer>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CaretBottom } from '@element-plus/icons-vue'

const route = useRoute()
const currentPath = computed(() => route.meta?.title || '')

const handleLogout = () => {
  // 暂时模拟退出
  localStorage.removeItem('token')
  window.location.reload()
}
</script>

<style scoped lang="scss">
.navbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .avatar-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    
    .user-name {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
