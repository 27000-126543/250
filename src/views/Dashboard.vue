<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon :size="32"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dataStore.heatExchangeStations.length }}</div>
              <div class="stat-label">换热站总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dataStore.stationStatusCount.normal }}</div>
              <div class="stat-label">正常运行</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon :size="32"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dataStore.stationStatusCount.warning + dataStore.stationStatusCount.alarm }}</div>
              <div class="stat-label">异常告警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon :size="32"><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dataStore.pendingAlarms }}</div>
              <div class="stat-label">待处理报警</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热负荷趋势</span>
              <el-radio-group v-model="chartRange" size="small">
                <el-radio-button value="today">今日</el-radio-button>
                <el-radio-button value="week">近7天</el-radio-button>
                <el-radio-button value="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="loadChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>换热站状态分布</span>
          </template>
          <div ref="stationChartRef" class="chart-container" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新报警</span>
              <el-button type="primary" link size="small" @click="$router.push('/alarm')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentAlarms" size="small">
            <el-table-column prop="stationName" label="换热站" width="140" />
            <el-table-column prop="message" label="报警内容" />
            <el-table-column prop="level" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="alarmTagType(row.level)" size="small">
                  {{ getAlarmLevelText(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'pending' ? 'danger' : 'success'" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待处理事项</span>
            </div>
          </template>
          <div class="todo-list">
            <div class="todo-item">
              <el-icon color="#f56c6c"><Document /></el-icon>
              <span>{{ dataStore.pendingSchedules }} 个调度方案待审批</span>
              <el-button type="primary" link size="small" @click="$router.push('/schedule/approval')">去处理</el-button>
            </div>
            <div class="todo-item">
              <el-icon color="#e6a23c"><Tools /></el-icon>
              <span>{{ dataStore.pendingMaintenance }} 个维保工单待分配</span>
              <el-button type="primary" link size="small" @click="$router.push('/maintenance/order')">去处理</el-button>
            </div>
            <div class="todo-item">
              <el-icon color="#409eff"><ChatDotRound /></el-icon>
              <span>{{ dataStore.pendingComplaints }} 个用户投诉待处理</span>
              <el-button type="primary" link size="small" @click="$router.push('/complaint')">去处理</el-button>
            </div>
            <div class="todo-item">
              <el-icon color="#67c23a"><Money /></el-icon>
              <span>{{ unpaidCount }} 个用户欠费需催缴</span>
              <el-button type="primary" link size="small" @click="$router.push('/billing')">去处理</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>各换热站实时运行数据</span>
            </div>
          </template>
          <el-table :data="dataStore.heatExchangeStations" size="small">
            <el-table-column prop="name" label="换热站名称" width="160" />
            <el-table-column prop="area" label="所属区域" width="100" />
            <el-table-column prop="heatingArea" label="供热面积(万㎡)" width="120">
              <template #default="{ row }">
                {{ (row.heatingArea / 10000).toFixed(1) }}
              </template>
            </el-table-column>
            <el-table-column prop="secondarySupplyTemp" label="供水温度(℃)" width="110" />
            <el-table-column prop="secondaryReturnTemp" label="回水温度(℃)" width="110" />
            <el-table-column prop="supplyPressure" label="供水压力(MPa)" width="120" />
            <el-table-column prop="returnPressure" label="回水压力(MPa)" width="120" />
            <el-table-column prop="primaryFlow" label="一次网流量(t/h)" width="130" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="stationTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useDataStore } from '@/stores/data'
import { generateHistoryLoadData, getStatusText, getAlarmLevelText } from '@/utils'
import {
  OfficeBuilding,
  CircleCheck,
  Warning,
  Bell,
  Document,
  Tools,
  ChatDotRound,
  Money
} from '@element-plus/icons-vue'

const dataStore = useDataStore()
const loadChartRef = ref<HTMLElement>()
const stationChartRef = ref<HTMLElement>()
const chartRange = ref('today')

const recentAlarms = computed(() => dataStore.alarmRecords.slice(0, 5))

const unpaidCount = computed(() => {
  return dataStore.billingRecords.filter(b => b.status === 'unpaid' || b.status === 'partial').length
})

const alarmTagType = (level: string) => {
  const map: Record<string, any> = { warning: 'warning', alarm: 'danger', critical: 'danger' }
  return map[level] || 'info'
}

const stationTagType = (status: string) => {
  const map: Record<string, any> = { normal: 'success', warning: 'warning', alarm: 'danger', offline: 'info' }
  return map[status] || 'info'
}

const initLoadChart = () => {
  if (!loadChartRef.value) return
  const chart = echarts.init(loadChartRef.value)
  const data = generateHistoryLoadData(chartRange.value === 'today' ? 1 : chartRange.value === 'week' ? 7 : 30)
  
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['热负荷(MW)', '室外温度(℃)'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: data.map(d => d.time) },
    yAxis: [
      { type: 'value', name: '热负荷(MW)' },
      { type: 'value', name: '温度(℃)' }
    ],
    series: [
      {
        name: '热负荷(MW)',
        type: 'line',
        smooth: true,
        areaStyle: {},
        data: data.map(d => d.heatLoad),
        color: '#409eff'
      },
      {
        name: '室外温度(℃)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: data.map(d => d.temperature),
        color: '#f56c6c'
      }
    ]
  })
}

const initStationChart = () => {
  if (!stationChartRef.value) return
  const chart = echarts.init(stationChartRef.value)
  
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value: dataStore.stationStatusCount.normal, name: '正常', itemStyle: { color: '#67c23a' } },
          { value: dataStore.stationStatusCount.warning, name: '预警', itemStyle: { color: '#e6a23c' } },
          { value: dataStore.stationStatusCount.alarm, name: '告警', itemStyle: { color: '#f56c6c' } },
          { value: dataStore.stationStatusCount.offline, name: '离线', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  })
}

watch(chartRange, () => {
  initLoadChart()
})

onMounted(() => {
  setTimeout(() => {
    initLoadChart()
    initStationChart()
  }, 100)
})
</script>

<style scoped>
.stat-cards {
  margin-bottom: 10px;
}

.stat-card {
  border: none;
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.todo-item span {
  flex: 1;
  font-size: 14px;
  color: #606266;
}
</style>
