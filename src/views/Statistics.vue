<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>统计报表</span>
          <div class="header-actions">
            <el-select v-model="timeRange" size="small" style="width: 150px; margin-right: 10px">
              <el-option label="本月" value="month" />
              <el-option label="本季度" value="quarter" />
              <el-option label="本年度" value="year" />
            </el-select>
            <el-button type="primary" size="small" @click="exportPDF">
              <el-icon><Download /></el-icon>
              导出PDF报告
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon blue">
                <el-icon :size="28"><Flame /></el-icon>
              </div>
              <div>
                <div class="stat-value">156,840</div>
                <div class="stat-label">总供热量 (GJ)</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon green">
                <el-icon :size="28"><HomeFilled /></el-icon>
              </div>
              <div>
                <div class="stat-value">0.42</div>
                <div class="stat-label">单位面积能耗 (GJ/㎡)</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon orange">
                <el-icon :size="28"><Tools /></el-icon>
              </div>
              <div>
                <div class="stat-value">3.2%</div>
                <div class="stat-label">设备故障率</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon red">
                <el-icon :size="28"><ChatDotRound /></el-icon>
              </div>
              <div>
                <div class="stat-value">0.8%</div>
                <div class="stat-label">用户投诉率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>各区域供热量统计</template>
            <div ref="areaChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>月度热负荷趋势</template>
            <div ref="monthlyChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>设备故障类型分布</template>
            <div ref="faultChartRef" class="chart-container" style="height: 300px"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>用户投诉类型统计</template>
            <div ref="complaintChartRef" class="chart-container" style="height: 300px"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-card>
        <template #header>各换热站运行数据统计</template>
        <el-table :data="stationStats" border>
          <el-table-column prop="name" label="换热站名称" width="160" />
          <el-table-column prop="area" label="区域" width="100" />
          <el-table-column prop="heatingArea" label="供热面积(万㎡)" width="130" />
          <el-table-column prop="heatSupply" label="供热量(GJ)" width="120" />
          <el-table-column prop="unitConsumption" label="单位能耗(GJ/㎡)" width="150" />
          <el-table-column prop="avgSupplyTemp" label="平均供水温度(℃)" width="160" />
          <el-table-column prop="faultCount" label="故障次数" width="100" />
          <el-table-column prop="complaintCount" label="投诉次数" width="100" />
          <el-table-column prop="runHours" label="运行时长(h)" width="120" />
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useDataStore } from '@/stores/data'
import { Download, Flame, HomeFilled, Tools, ChatDotRound } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const timeRange = ref('month')
const areaChartRef = ref<HTMLElement>()
const monthlyChartRef = ref<HTMLElement>()
const faultChartRef = ref<HTMLElement>()
const complaintChartRef = ref<HTMLElement>()

const stationStats = dataStore.heatExchangeStations.map(s => ({
  name: s.name,
  area: s.area,
  heatingArea: (s.heatingArea / 10000).toFixed(1),
  heatSupply: Math.round(s.heatingArea * 0.0008),
  unitConsumption: (0.35 + Math.random() * 0.15).toFixed(2),
  avgSupplyTemp: s.secondarySupplyTemp,
  faultCount: Math.floor(Math.random() * 5),
  complaintCount: Math.floor(Math.random() * 8),
  runHours: s.operatingHours
}))

const exportPDF = async () => {
  ElMessage.info('正在生成PDF报告，请稍候...')
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    pdf.setFontSize(20)
    pdf.text('城市智慧供热管网月度运行报告', 105, 20, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.text(`报告期间：2026年1月`, 20, 35)
    pdf.text(`生成时间：${new Date().toLocaleString()}`, 20, 42)
    
    pdf.setFontSize(14)
    pdf.text('一、运行概况', 20, 55)
    pdf.setFontSize(11)
    pdf.text(`1. 总供热量：156,840 GJ`, 25, 65)
    pdf.text(`2. 单位面积能耗：0.42 GJ/㎡`, 25, 72)
    pdf.text(`3. 设备故障率：3.2%`, 25, 79)
    pdf.text(`4. 用户投诉率：0.8%`, 25, 86)
    pdf.text(`5. 换热站在线率：${Math.round((dataStore.heatExchangeStations.length - dataStore.stationStatusCount.offline) / dataStore.heatExchangeStations.length * 100)}%`, 25, 93)
    
    pdf.setFontSize(14)
    pdf.text('二、换热站统计', 20, 110)
    
    let y = 120
    stationStats.slice(0, 5).forEach((s, i) => {
      pdf.setFontSize(10)
      pdf.text(`${i + 1}. ${s.name}：供热量 ${s.heatSupply}GJ，故障 ${s.faultCount} 次`, 25, y)
      y += 8
    })
    
    pdf.setFontSize(10)
    pdf.text('报告生成系统：城市智慧供热管网调度与设备运维系统', 105, 280, { align: 'center' })
    
    pdf.save('供热系统月度运行报告.pdf')
    ElMessage.success('PDF报告已导出')
  } catch (error) {
    ElMessage.error('PDF导出失败')
  }
}

const initCharts = () => {
  if (areaChartRef.value) {
    const chart = echarts.init(areaChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['供热量(GJ)'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: ['城东区', '城西区', '南区'] },
      yAxis: { type: 'value', name: '供热量(GJ)' },
      series: [{
        name: '供热量(GJ)',
        type: 'bar',
        data: [58600, 72400, 25840],
        itemStyle: { color: '#409eff' }
      }]
    })
  }

  if (monthlyChartRef.value) {
    const chart = echarts.init(monthlyChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['热负荷(MW)'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '11月', '12月'] },
      yAxis: { type: 'value', name: '热负荷(MW)' },
      series: [{
        name: '热负荷(MW)',
        type: 'line',
        smooth: true,
        areaStyle: {},
        data: [680, 720, 580, 620, 700],
        color: '#f56c6c'
      }]
    })
  }

  if (faultChartRef.value) {
    const chart = echarts.init(faultChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 8, name: '水泵故障', itemStyle: { color: '#409eff' } },
          { value: 5, name: '阀门故障', itemStyle: { color: '#67c23a' } },
          { value: 3, name: '传感器故障', itemStyle: { color: '#e6a23c' } },
          { value: 2, name: '换热器故障', itemStyle: { color: '#f56c6c' } },
          { value: 1, name: '其他', itemStyle: { color: '#909399' } }
        ]
      }]
    })
  }

  if (complaintChartRef.value) {
    const chart = echarts.init(complaintChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 28, name: '温度不达标', itemStyle: { color: '#f56c6c' } },
          { value: 12, name: '漏水', itemStyle: { color: '#409eff' } },
          { value: 8, name: '噪音', itemStyle: { color: '#e6a23c' } },
          { value: 5, name: '其他', itemStyle: { color: '#909399' } }
        ]
      }]
    })
  }
}

onMounted(() => {
  setTimeout(initCharts, 100)
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

.header-actions {
  display: flex;
  align-items: center;
}

.stat-card {
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.blue { background: #409eff; }
.stat-icon.green { background: #67c23a; }
.stat-icon.orange { background: #e6a23c; }
.stat-icon.red { background: #f56c6c; }

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>
