import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台' }
      },
      // 1. 系统管理
      {
        path: 'system/user-group',
        component: () => import('@/views/system/user-group/index.vue'),
        meta: { title: '用户组列表' }
      },
      {
        path: 'system/user',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户列表' }
      },
      // 2. 基础数据管理
      {
        path: 'base/product-type',
        component: () => import('@/views/base/product-type/index.vue'),
        meta: { title: '产品类型列表' }
      },
      {
        path: 'base/platform',
        component: () => import('@/views/base/platform/index.vue'),
        meta: { title: '平台列表' }
      },
      {
        path: 'base/brand',
        component: () => import('@/views/base/brand/index.vue'),
        meta: { title: '品牌列表' }
      },
      {
        path: 'base/department',
        component: () => import('@/views/base/department/index.vue'),
        meta: { title: '部门列表' }
      },
      {
        path: 'base/audience',
        component: () => import('@/views/base/audience/index.vue'),
        meta: { title: '新品爆款预测人群列表' }
      },
      // 3. 产品管理
      {
        path: 'product/list',
        component: () => import('@/views/product/list/index.vue'),
        meta: { title: '产品列表' }
      },
      {
        path: 'product/burst/predict',
        component: () => import('@/views/product/burst/predict/index.vue'),
        meta: { title: '新品爆款预测' }
      },
      {
        path: 'product/burst/history',
        component: () => import('@/views/product/burst/history/index.vue'),
        meta: { title: '历史爆款' }
      },
      {
        path: 'product/competitor/list',
        component: () => import('@/views/product/competitor/list/index.vue'),
        meta: { title: '竞品列表' }
      },
      {
        path: 'product/competitor/report',
        component: () => import('@/views/product/competitor/report/index.vue'),
        meta: { title: '竞品 AI 分析报告列表' }
      },
      // 4. 分销商管理
      {
        path: 'distributor/list',
        component: () => import('@/views/distributor/list/index.vue'),
        meta: { title: '分销商列表' }
      },
      {
        path: 'distributor/portrait',
        component: () => import('@/views/distributor/portrait/index.vue'),
        meta: { title: '分销商画像分析' }
      },
      {
        path: 'distributor/price',
        component: () => import('@/views/distributor/price/index.vue'),
        meta: { title: '产品价格监控' }
      },
      {
        path: 'distributor/stock',
        component: () => import('@/views/distributor/stock/index.vue'),
        meta: { title: '产品动态库存预测' }
      },
      {
        path: 'distributor/risk',
        component: () => import('@/views/distributor/risk/index.vue'),
        meta: { title: '产品客诉风险识别' }
      },
      // 5. 达人管理
      {
        path: 'influencer/manage',
        component: () => import('@/views/influencer/manage/index.vue'),
        meta: { title: '全网达人管理' }
      },
      {
        path: 'influencer/selection',
        component: () => import('@/views/influencer/selection/index.vue'),
        meta: { title: 'KOL/KOC 智能筛选' }
      },
      {
        path: 'influencer/resource',
        component: () => import('@/views/influencer/resource/index.vue'),
        meta: { title: '预备合作达人资源库' }
      },
      {
        path: 'influencer/project',
        component: () => import('@/views/influencer/project/index.vue'),
        meta: { title: '合作项目列表' }
      },
      {
        path: 'influencer/strategy',
        component: () => import('@/views/influencer/strategy/index.vue'),
        meta: { title: '达人筛选策略列表' }
      },
      // 6. AI 数据分析
      {
        path: 'ai-analysis',
        component: () => import('@/views/ai-analysis/index.vue'),
        meta: { title: 'AI 数据分析' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from) => {
  document.title = `${to.meta.title} - AI 营销系统`
})

export default router
