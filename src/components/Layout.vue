<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="sidebar">
      <div class="logo">
        <el-icon :size="28" color="#409eff"><HotWater /></el-icon>
        <span class="logo-text">智慧供热系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="false"
        router
        class="sidebar-menu"
        background-color="#001529"
        text-color="#b9c2cc"
        active-text-color="#409eff"
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-sub-menu v-if="item.children" :index="item.path">
            <template #title>
              <el-icon><component :is="iconMap[item.icon]" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="iconMap[item.icon]" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta.title">{{ currentRoute.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="dataStore.pendingAlarms" :hidden="dataStore.pendingAlarms === 0" type="danger">
            <el-button type="primary" link @click="goToAlarm">
              <el-icon :size="20"><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" style="background-color: #409eff">
                {{ dataStore.currentUser?.name.charAt(0) }}
              </el-avatar>
              <span class="username">{{ dataStore.currentUser?.name }}</span>
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import {
  DataAnalysis,
  OfficeBuilding,
  Clock,
  Monitor,
  Warning,
  Tools,
  ChatDotRound,
  Money,
  PieChart,
  Share,
  Bell,
  User,
  CaretBottom,
  HotWater,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()

const currentRoute = computed(() => route)
const activeMenu = computed(() => route.path)

const iconMap: Record<string, any> = {
  DataAnalysis,
  OfficeBuilding,
  Clock,
  Monitor,
  Warning,
  Tools,
  ChatDotRound,
  Money,
  PieChart,
  Share
}

const menuItems = [
  { path: '/dashboard', title: '运行总览', icon: 'DataAnalysis' },
  {
    path: '/base-info',
    title: '基础信息管理',
    icon: 'OfficeBuilding',
    children: [
      { path: '/base-info/heat-source', title: '热源厂管理' },
      { path: '/base-info/exchange-station', title: '换热站管理' },
      { path: '/base-info/pipeline', title: '管网管理' }
    ]
  },
  {
    path: '/schedule',
    title: '智能调度',
    icon: 'Clock',
    children: [
      { path: '/schedule/plan', title: '调度方案管理' },
      { path: '/schedule/generate', title: '生成调度方案' },
      { path: '/schedule/approval', title: '调度方案审批' }
    ]
  },
  { path: '/monitor', title: '实时监测', icon: 'Monitor' },
  { path: '/alarm', title: '报警管理', icon: 'Warning' },
  {
    path: '/maintenance',
    title: '设备维保',
    icon: 'Tools',
    children: [
      { path: '/maintenance/order', title: '维保工单' },
      { path: '/maintenance/spare-parts', title: '备件库存' }
    ]
  },
  { path: '/complaint', title: '投诉处理', icon: 'ChatDotRound' },
  { path: '/billing', title: '收费管理', icon: 'Money' },
  { path: '/statistics', title: '统计报表', icon: 'PieChart' },
  { path: '/topology', title: '热网拓扑图', icon: 'Share' }
]

const goToAlarm = () => {
  router.push('/alarm')
}
</script>

<style scoped>
.layout-container {
  height: 100%;
}

.sidebar {
  background-color: #001529;
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid #1f2d3d;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
}

.sidebar-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.username {
  font-size: 14px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
