<template>
  <div class="sidebar">
    <div class="logo">
      <img src="https://img.icons8.com/clouds/100/null/brain.png" alt="logo" />
      <span>AI 营销大脑</span>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      background-color="#ffffff"
      text-color="#303133"
      active-text-color="#409eff"
      unique-opened
      router
      class="side-menu"
    >
      <!-- 工作台 -->
      <el-menu-item index="/dashboard">
        <el-icon><Monitor /></el-icon>
        <span>工作台</span>
      </el-menu-item>
      
      <!-- 1. 系统管理 -->
      <el-sub-menu index="system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/system/user-group">用户组列表</el-menu-item>
        <el-menu-item index="/system/user">用户列表</el-menu-item>
      </el-sub-menu>

      <!-- 2. 基础数据管理 -->
      <el-sub-menu index="base">
        <template #title>
          <el-icon><DataLine /></el-icon>
          <span>基础数据管理</span>
        </template>
        <el-menu-item index="/base/product-type">产品类型列表</el-menu-item>
        <el-menu-item index="/base/platform">平台列表</el-menu-item>
        <el-menu-item index="/base/brand">品牌列表</el-menu-item>
        <el-menu-item index="/base/department">部门列表</el-menu-item>
        <el-menu-item index="/base/audience">新品爆款预测人群列表</el-menu-item>
      </el-sub-menu>

      <!-- 3. 产品管理 -->
      <el-sub-menu index="product">
        <template #title>
          <el-icon><Box /></el-icon>
          <span>产品管理</span>
        </template>
        <el-menu-item index="/product/list">产品列表</el-menu-item>
        
        <!-- 二级联动：爆款产品管理 -->
        <el-sub-menu index="product-burst">
          <template #title>爆款产品管理</template>
          <el-menu-item index="/product/burst/predict">新品爆款预测</el-menu-item>
          <el-menu-item index="/product/burst/history">历史爆款</el-menu-item>
        </el-sub-menu>

        <!-- 二级联动：竞品管理 -->
        <el-sub-menu index="product-competitor">
          <template #title>竞品管理</template>
          <el-menu-item index="/product/competitor/list">竞品列表</el-menu-item>
          <el-menu-item index="/product/competitor/report">竞品 AI 分析报告列表</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>

      <!-- 4. 分销商管理 -->
      <el-sub-menu index="distributor">
        <template #title>
          <el-icon><Connection /></el-icon>
          <span>分销商管理</span>
        </template>
        <el-menu-item index="/distributor/list">分销商列表</el-menu-item>
        <el-menu-item index="/distributor/portrait">分销商画像分析</el-menu-item>
        <el-menu-item index="/distributor/price">产品价格监控</el-menu-item>
        <el-menu-item index="/distributor/stock">产品动态库存预测</el-menu-item>
        <el-menu-item index="/distributor/risk">产品客诉风险识别</el-menu-item>
      </el-sub-menu>

      <!-- 5. 达人管理 -->
      <el-sub-menu index="influencer">
        <template #title>
          <el-icon><User /></el-icon>
          <span>达人管理</span>
        </template>
        <el-menu-item index="/influencer/selection">kol/koc 智能筛选</el-menu-item>
        <el-menu-item index="/influencer/resource">预备合作达人资源库</el-menu-item>
        <el-menu-item index="/influencer/project">合作项目列表</el-menu-item>
        <el-menu-item index="/influencer/strategy">达人筛选策略列表</el-menu-item>
      </el-sub-menu>

      <!-- 6. AI 数据分析 -->
      <el-menu-item index="/ai-analysis">
        <el-icon><PieChart /></el-icon>
        <span>AI 数据分析</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Monitor,
  Setting,
  DataLine,
  Box,
  Connection,
  PieChart,
  User
} from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e6e6e6;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background: #fff;
    color: #409eff;
    font-weight: bold;
    gap: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    img {
      width: 30px;
      height: 30px;
    }
    
    span {
      font-size: 16px;
      letter-spacing: 1px;
    }
  }

  .side-menu {
    border-right: none;
    
    :deep(.el-sub-menu__title) {
      font-weight: 500;
      height: 50px;
      line-height: 50px;
    }
    
    :deep(.el-menu-item) {
      height: 48px;
      line-height: 48px;
      
      &.is-active {
        background-color: #ecf5ff !important;
        border-right: 3px solid #409eff;
      }
    }
    
    /* 针对嵌套子菜单的缩进优化 */
    :deep(.el-sub-menu .el-menu-item) {
      padding-left: 50px !important;
    }
    
    :deep(.el-sub-menu .el-sub-menu__title) {
      padding-left: 50px !important;
    }

    :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
      padding-left: 70px !important;
    }
  }
}
</style>
