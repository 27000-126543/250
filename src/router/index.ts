import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '运行总览', icon: 'DataAnalysis' }
  },
  {
    path: '/base-info',
    name: 'BaseInfo',
    redirect: '/base-info/heat-source',
    meta: { title: '基础信息管理', icon: 'OfficeBuilding' },
    children: [
      {
        path: 'heat-source',
        name: 'HeatSource',
        component: () => import('@/views/base-info/HeatSource.vue'),
        meta: { title: '热源厂管理' }
      },
      {
        path: 'exchange-station',
        name: 'ExchangeStation',
        component: () => import('@/views/base-info/ExchangeStation.vue'),
        meta: { title: '换热站管理' }
      },
      {
        path: 'pipeline',
        name: 'Pipeline',
        component: () => import('@/views/base-info/Pipeline.vue'),
        meta: { title: '管网管理' }
      }
    ]
  },
  {
    path: '/schedule',
    name: 'Schedule',
    redirect: '/schedule/plan',
    meta: { title: '智能调度', icon: 'Clock' },
    children: [
      {
        path: 'plan',
        name: 'SchedulePlan',
        component: () => import('@/views/schedule/SchedulePlan.vue'),
        meta: { title: '调度方案管理' }
      },
      {
        path: 'generate',
        name: 'GenerateSchedule',
        component: () => import('@/views/schedule/GenerateSchedule.vue'),
        meta: { title: '生成调度方案' }
      },
      {
        path: 'approval',
        name: 'ScheduleApproval',
        component: () => import('@/views/schedule/ScheduleApproval.vue'),
        meta: { title: '调度方案审批' }
      }
    ]
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import('@/views/Monitor.vue'),
    meta: { title: '实时监测', icon: 'Monitor' }
  },
  {
    path: '/alarm',
    name: 'Alarm',
    component: () => import('@/views/Alarm.vue'),
    meta: { title: '报警管理', icon: 'Warning' }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    redirect: '/maintenance/order',
    meta: { title: '设备维保', icon: 'Tools' },
    children: [
      {
        path: 'order',
        name: 'MaintenanceOrder',
        component: () => import('@/views/maintenance/MaintenanceOrder.vue'),
        meta: { title: '维保工单' }
      },
      {
        path: 'spare-parts',
        name: 'SpareParts',
        component: () => import('@/views/maintenance/SpareParts.vue'),
        meta: { title: '备件库存' }
      }
    ]
  },
  {
    path: '/complaint',
    name: 'Complaint',
    component: () => import('@/views/Complaint.vue'),
    meta: { title: '投诉处理', icon: 'ChatDotRound' }
  },
  {
    path: '/billing',
    name: 'Billing',
    component: () => import('@/views/Billing.vue'),
    meta: { title: '收费管理', icon: 'Money' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue'),
    meta: { title: '统计报表', icon: 'PieChart' }
  },
  {
    path: '/topology',
    name: 'Topology',
    component: () => import('@/views/Topology.vue'),
    meta: { title: '热网拓扑图', icon: 'Share' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
