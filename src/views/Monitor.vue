<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>实时监测</span>
          <div class="header-right">
            <el-tag :type="onlineCount > 0 ? 'success' : 'info'">
              在线: {{ onlineCount }}/{{ dataStore.heatExchangeStations.length }}
            </el-tag>
            <el-button type="primary" size="small" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" class="station-cards">
        <el-col :span="6" v-for="station in dataStore.heatExchangeStations" :key="station.id">
          <el-card class="station-card" :class="`status-${station.status}`" shadow="hover">
            <div class="station-header">
              <span class="station-name">{{ station.name }}</span>
              <el-tag :type="stationTagType(station.status)" size="small">
                {{ getStatusText(station.status) }}
              </el-tag>
            </div>
            <div class="station-data">
              <div class="data-item">
                <span class="label">供水温度</span>
                <span class="value" :class="{ 'value-alarm': station.secondarySupplyTemp > 75 }">
                  {{ station.secondarySupplyTemp }}℃
                </span>
              </div>
              <div class="data-item">
                <span class="label">回水温度</span>
                <span class="value">{{ station.secondaryReturnTemp }}℃</span>
              </div>
              <div class="data-item">
                <span class="label">供水压力</span>
                <span class="value">{{ station.supplyPressure }} MPa</span>
              </div>
              <div class="data-item">
                <span class="label">回水压力</span>
                <span class="value">{{ station.returnPressure }} MPa</span>
              </div>
              <div class="data-item">
                <span class="label">一次网流量</span>
                <span class="value">{{ station.primaryFlow }} t/h</span>
              </div>
              <div class="data-item">
                <span class="label">供回温差</span>
                <span class="value">{{ (station.secondarySupplyTemp - station.secondaryReturnTemp).toFixed(1) }}℃</span>
              </div>
            </div>
            <div class="station-footer">
              <el-progress 
                :percentage="Math.round(station.primaryFlow / 200 * 100)" 
                :color="station.status === 'alarm' ? '#f56c6c' : station.status === 'warning' ? '#e6a23c' : '#67c23a'"
              />
              <span class="flow-text">负荷率</span>
            </div>
            <div class="station-actions">
              <el-button type="primary" link size="small" @click="viewTrend(station)">趋势分析</el-button>
              <el-button type="primary" link size="small" @click="controlValve(station)">阀门调节</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="trendVisible" title="参数趋势分析" width="1000px">
      <div class="chart-container" ref="trendChartRef" style="height: 400px"></div>
    </el-dialog>

    <el-dialog v-model="controlVisible" title="阀门远程调节" width="500px">
      <div v-if="currentStation">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="换热站">{{ currentStation.name }}</el-descriptions-item>
          <el-descriptions-item label="当前阀门开度">
            <el-tag type="primary">{{ currentValveOpening }}%</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin: 30px 0">
          <el-slider v-model="targetOpening" :min="0" :max="100" show-input :step="5" />
        </div>
        <el-alert
          title="调节确认"
          description="阀门调节将影响供热质量，请确认操作正确"
          type="warning"
          :closable="false"
        />
      </div>
      <template #footer>
        <el-button @click="controlVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmControl">确认调节</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { useDataStore } from '@/stores/data'
import type { HeatExchangeStation } from '@/types'
import { getStatusText } from '@/utils'
import { Refresh } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const trendVisible = ref(false)
const controlVisible = ref(false)
const trendChartRef = ref<HTMLElement>()
const currentStation = ref<HeatExchangeStation | null>(null)
const currentValveOpening = ref(75)
const targetOpening = ref(75)

let timer: number | null = null

const onlineCount = computed(() => 
  dataStore.heatExchangeStations.filter(s => s.status !== 'offline').length
)

const stationTagType = (status: string) => {
  const map: Record<string, any> = { normal: 'success', warning: 'warning', alarm: 'danger', offline: 'info' }
  return map[status] || 'info'
}

const refreshData = () => {
  dataStore.heatExchangeStations.forEach(station => {
    if (station.status !== 'offline') {
      station.secondarySupplyTemp = Math.round((60 + Math.random() * 15) * 10) / 10
      station.secondaryReturnTemp = Math.round((40 + Math.random() * 10) * 10) / 10
      station.supplyPressure = Math.round((0.5 + Math.random() * 0.2) * 100) / 100
      station.returnPressure = Math.round((0.3 + Math.random() * 0.15) * 100) / 100
      station.primaryFlow = Math.round(80 + Math.random() * 60)
    }
  })
  ElMessage.success('数据已刷新')
}

const viewTrend = (station: HeatExchangeStation) => {
  currentStation.value = station
  trendVisible.value = true
  setTimeout(() => {
    initTrendChart(station)
  }, 100)
}

const controlValve = (station: HeatExchangeStation) => {
  currentStation.value = station
  currentValveOpening.value = Math.round(70 + Math.random() * 20)
  targetOpening.value = currentValveOpening.value
  controlVisible.value = true
}

const confirmControl = () => {
  ElMessage.success(`已下发指令，将阀门开度调整为 ${targetOpening.value}%`)
  controlVisible.value = false
}

const initTrendChart = (station: HeatExchangeStation) => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  
  const times = []
  const supplyTemps = []
  const returnTemps = []
  const flows = []
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date()
    hour.setHours(hour.getHours() - i)
    times.push(`${hour.getHours()}:00`)
    supplyTemps.push(Math.round((station.secondarySupplyTemp + (Math.random() - 0.5) * 6) * 10) / 10)
    returnTemps.push(Math.round((station.secondaryReturnTemp + (Math.random() - 0.5) * 4) * 10) / 10)
    flows.push(Math.round(station.primaryFlow + (Math.random() - 0.5) * 20))
  }

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['供水温度', '回水温度', '一次网流量'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: times },
    yAxis: [
      { type: 'value', name: '温度(℃)', position: 'left' },
      { type: 'value', name: '流量(t/h)', position: 'right' }
    ],
    series: [
      {
        name: '供水温度',
        type: 'line',
        smooth: true,
        data: supplyTemps,
        color: '#f56c6c'
      },
      {
        name: '回水温度',
        type: 'line',
        smooth: true,
        data: returnTemps,
        color: '#409eff'
      },
      {
        name: '一次网流量',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: flows,
        color: '#67c23a'
      }
    ]
  })
}

onMounted(() => {
  timer = window.setInterval(() => {
    dataStore.heatExchangeStations.forEach(station => {
      if (station.status !== 'offline') {
        station.secondarySupplyTemp = Math.round((station.secondarySupplyTemp + (Math.random() - 0.5) * 0.5) * 10) / 10
        station.secondaryReturnTemp = Math.round((station.secondaryReturnTemp + (Math.random() - 0.5) * 0.3) * 10) / 10
      }
    })
  }, 5000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.page-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.station-cards {
  margin-bottom: 10px;
}

.station-card {
  margin-bottom: 20px;
  border-left: 4px solid #67c23a;
}

.station-card.status-warning {
  border-left-color: #e6a23c;
}

.station-card.status-alarm {
  border-left-color: #f56c6c;
  animation: blink 1s infinite;
}

.station-card.status-offline {
  border-left-color: #909399;
  opacity: 0.7;
}

@keyframes blink {
  0%, 100% { box-shadow: 0 2px 12px 0 rgba(245, 108, 108, 0.3); }
  50% { box-shadow: 0 2px 12px 0 rgba(245, 108, 108, 0.6); }
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.station-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.station-data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item .label {
  font-size: 12px;
  color: #909399;
}

.data-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.data-item .value-alarm {
  color: #f56c6c;
}

.station-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.flow-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.station-actions {
  display: flex;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.chart-container {
  height: 400px;
  width: 100%;
}
</style>
