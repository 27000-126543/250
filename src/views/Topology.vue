<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>热网拓扑图</span>
          <div class="header-actions">
            <el-radio-group v-model="displayMode" size="small">
              <el-radio-button value="status">运行状态</el-radio-button>
              <el-radio-button value="load">热力负荷</el-radio-button>
              <el-radio-button value="temp">温度分布</el-radio-button>
            </el-radio-group>
            <el-button type="primary" size="small" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div class="topology-container">
        <div class="legend">
          <div class="legend-title">图例</div>
          <div class="legend-items">
            <template v-if="displayMode === 'status'">
              <div class="legend-item">
                <span class="legend-dot" style="background: #67c23a"></span>
                <span>正常</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #e6a23c"></span>
                <span>预警</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #f56c6c"></span>
                <span>告警</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #909399"></span>
                <span>离线</span>
              </div>
            </template>
            <template v-else-if="displayMode === 'load'">
              <div class="legend-item">
                <span class="legend-dot" style="background: #409eff"></span>
                <span>低负荷 (&lt;60%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #67c23a"></span>
                <span>中负荷 (60-80%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #e6a23c"></span>
                <span>高负荷 (80-95%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #f56c6c"></span>
                <span>超负荷 (&gt;95%)</span>
              </div>
            </template>
            <template v-else>
              <div class="legend-item">
                <span class="legend-dot" style="background: #409eff"></span>
                <span>低温 (&lt;55℃)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #67c23a"></span>
                <span>正常 (55-65℃)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #e6a23c"></span>
                <span>较高 (65-70℃)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #f56c6c"></span>
                <span>高温 (&gt;70℃)</span>
              </div>
            </template>
          </div>
        </div>

        <svg class="topology-svg" viewBox="0 0 800 500">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <g class="pipelines">
            <line 
              v-for="pipe in dataStore.pipelines" 
              :key="pipe.id"
              :x1="getPipeStart(pipe).x"
              :y1="getPipeStart(pipe).y"
              :x2="getPipeEnd(pipe).x"
              :y2="getPipeEnd(pipe).y"
              stroke="#409eff"
              stroke-width="4"
              stroke-opacity="0.6"
            />
          </g>

          <g class="heat-sources">
            <g 
              v-for="source in dataStore.heatSources" 
              :key="source.id"
              :transform="`translate(${source.position.x}, ${source.position.y})`"
            >
              <rect 
                x="-25" y="-25" 
                width="50" height="50" 
                rx="8"
                :fill="source.status === 'running' ? '#67c23a' : '#909399'"
                filter="url(#glow)"
              />
              <text x="0" y="5" text-anchor="middle" fill="white" font-size="12" font-weight="bold">热源</text>
              <text x="0" y="45" text-anchor="middle" fill="#303133" font-size="11">{{ source.name }}</text>
            </g>
          </g>

          <g class="stations">
            <g 
              v-for="station in dataStore.heatExchangeStations" 
              :key="station.id"
              :transform="`translate(${station.position.x}, ${station.position.y})`"
              class="station-node"
              @click="selectStation(station)"
            >
              <circle 
                cx="0" cy="0" 
                :r="22"
                :fill="getStationColor(station)"
                filter="url(#glow)"
                :class="{ 'pulse-animation': station.status === 'alarm' }"
              />
              <text x="0" y="5" text-anchor="middle" fill="white" font-size="11" font-weight="bold">
                {{ getStationValue(station) }}
              </text>
              <text x="0" y="40" text-anchor="middle" fill="#303133" font-size="11">
                {{ station.name.replace('换热站', '') }}
              </text>
            </g>
          </g>
        </svg>

        <div v-if="selectedStation" class="station-info">
          <div class="info-header">
            <span class="info-title">{{ selectedStation.name }}</span>
            <el-button type="text" size="small" @click="selectedStation = null">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="所属区域">{{ selectedStation.area }}</el-descriptions-item>
            <el-descriptions-item label="所属热源厂">{{ selectedStation.heatSourceName }}</el-descriptions-item>
            <el-descriptions-item label="供热面积">{{ selectedStation.heatingArea.toLocaleString() }} ㎡</el-descriptions-item>
            <el-descriptions-item label="运行状态">
              <el-tag :type="stationTagType(selectedStation.status)" size="small">
                {{ getStatusText(selectedStation.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="供水温度">{{ selectedStation.secondarySupplyTemp }}℃</el-descriptions-item>
            <el-descriptions-item label="回水温度">{{ selectedStation.secondaryReturnTemp }}℃</el-descriptions-item>
            <el-descriptions-item label="一次网流量">{{ selectedStation.primaryFlow }} t/h</el-descriptions-item>
            <el-descriptions-item label="负荷率">
              <el-progress 
                :percentage="Math.round(selectedStation.primaryFlow / 200 * 100)" 
                :color="getStationColor(selectedStation)"
              />
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/data'
import type { HeatExchangeStation, Pipeline } from '@/types'
import { getStatusText } from '@/utils'
import { Refresh, Close } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const displayMode = ref<'status' | 'load' | 'temp'>('status')
const selectedStation = ref<HeatExchangeStation | null>(null)

const sourcePositions: Record<string, { x: number; y: number }> = {
  'hs001': { x: 100, y: 100 },
  'hs002': { x: 100, y: 300 },
  'hs003': { x: 700, y: 150 }
}

const getPipeStart = (pipe: Pipeline) => {
  const station = dataStore.heatExchangeStations.find(s => s.name.includes(pipe.startPoint))
  if (station) return station.position
  const source = dataStore.heatSources.find(s => s.name.includes(pipe.startPoint))
  if (source) return sourcePositions[source.id] || { x: 100, y: 100 }
  return { x: 50, y: 50 }
}

const getPipeEnd = (pipe: Pipeline) => {
  const station = dataStore.heatExchangeStations.find(s => s.name.includes(pipe.endPoint))
  if (station) return station.position
  const source = dataStore.heatSources.find(s => s.name.includes(pipe.endPoint))
  if (source) return sourcePositions[source.id] || { x: 100, y: 100 }
  return { x: 200, y: 200 }
}

const getStationColor = (station: HeatExchangeStation) => {
  if (displayMode.value === 'status') {
    const colors: Record<string, string> = {
      normal: '#67c23a',
      warning: '#e6a23c',
      alarm: '#f56c6c',
      offline: '#909399'
    }
    return colors[station.status] || '#909399'
  } else if (displayMode.value === 'load') {
    const loadRate = station.primaryFlow / 200
    if (loadRate < 0.6) return '#409eff'
    if (loadRate < 0.8) return '#67c23a'
    if (loadRate < 0.95) return '#e6a23c'
    return '#f56c6c'
  } else {
    const temp = station.secondarySupplyTemp
    if (temp < 55) return '#409eff'
    if (temp < 65) return '#67c23a'
    if (temp < 70) return '#e6a23c'
    return '#f56c6c'
  }
}

const getStationValue = (station: HeatExchangeStation) => {
  if (displayMode.value === 'status') {
    return station.status === 'normal' ? '正常' : station.status === 'warning' ? '预警' : station.status === 'alarm' ? '告警' : '离线'
  } else if (displayMode.value === 'load') {
    return `${Math.round(station.primaryFlow / 200 * 100)}%`
  } else {
    return `${station.secondarySupplyTemp}℃`
  }
}

const stationTagType = (status: string) => {
  const map: Record<string, any> = { normal: 'success', warning: 'warning', alarm: 'danger', offline: 'info' }
  return map[status] || 'info'
}

const selectStation = (station: HeatExchangeStation) => {
  selectedStation.value = station
}

const refreshData = () => {
  dataStore.heatExchangeStations.forEach(station => {
    if (station.status !== 'offline') {
      station.secondarySupplyTemp = Math.round((60 + Math.random() * 15) * 10) / 10
      station.primaryFlow = Math.round(80 + Math.random() * 80)
    }
  })
}
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.topology-container {
  position: relative;
  height: 600px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 8px;
  overflow: hidden;
}

.legend {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.legend-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.topology-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.topology-svg:active {
  cursor: grabbing;
}

.station-node {
  cursor: pointer;
  transition: transform 0.2s;
}

.station-node:hover {
  transform: scale(1.1);
}

.pulse-animation {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.station-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #ebeef5;
}

.info-title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}
</style>
