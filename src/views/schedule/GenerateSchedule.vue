<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>生成次日调度方案</span>
        </div>
      </template>

      <el-steps :active="step" finish-status="success" style="margin-bottom: 30px">
        <el-step title="输入天气预报" />
        <el-step title="热负荷预测" />
        <el-step title="生成调度参数" />
        <el-step title="提交审批" />
      </el-steps>

      <div v-if="step === 0" class="step-content">
        <h3>请输入次日天气预报信息</h3>
        <el-form :model="weatherForm" label-width="120px" style="max-width: 600px; margin-top: 20px">
          <el-form-item label="预报日期">
            <el-date-picker
              v-model="weatherForm.date"
              type="date"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最低温度(℃)">
                <el-input-number v-model="weatherForm.minTemp" :min="-30" :max="20" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最高温度(℃)">
                <el-input-number v-model="weatherForm.maxTemp" :min="-20" :max="30" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="平均温度(℃)">
                <el-input-number v-model="weatherForm.temperature" :min="-25" :max="25" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="天气状况">
                <el-select v-model="weatherForm.weather" style="width: 100%">
                  <el-option label="晴" value="晴" />
                  <el-option label="多云" value="多云" />
                  <el-option label="阴" value="阴" />
                  <el-option label="小雨" value="小雨" />
                  <el-option label="小雪" value="小雪" />
                  <el-option label="中雪" value="中雪" />
                  <el-option label="大雪" value="大雪" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="风速(m/s)">
                <el-input-number v-model="weatherForm.windSpeed" :min="0" :max="20" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="湿度(%)">
                <el-input-number v-model="weatherForm.humidity" :min="0" :max="100" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="step-actions">
          <el-button type="primary" @click="goToStep(1)">下一步：热负荷预测</el-button>
        </div>
      </div>

      <div v-if="step === 1" class="step-content">
        <h3>热负荷预测结果</h3>
        <div class="prediction-result">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="预测总热负荷" :value="predictedHeatLoad" suffix="MW" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="影响因素-温度" :value="tempFactor * 100" suffix="%" :precision="1" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="影响因素-风速" :value="windFactor * 100" suffix="%" :precision="1" />
            </el-col>
          </el-row>
        </div>
        <div class="chart-container" ref="loadChartRef" style="height: 300px; margin-top: 20px"></div>
        <div class="step-actions">
          <el-button @click="goToStep(0)">上一步</el-button>
          <el-button type="primary" :loading="isGenerating" @click="generateSchedule">
            {{ isGenerating ? '正在计算...' : '下一步：生成调度参数' }}
          </el-button>
        </div>
      </div>

      <div v-if="step === 2" class="step-content">
        <h3>各换热站调度参数</h3>
        <p style="color: #606266; margin-bottom: 15px">
          系统已根据水力平衡计算和热损失补偿，自动生成各换热站的一次网流量、二次网供水温度和阀门开度
        </p>
        <el-table :data="stationSchedules" border>
          <el-table-column prop="stationName" label="换热站名称" width="160" />
          <el-table-column prop="heatingArea" label="供热面积(万㎡)" width="130">
            <template #default="{ row }">
              {{ (row.heatingArea / 10000).toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column prop="primaryFlow" label="一次网流量(t/h)" width="150">
            <template #default="{ row }">
              <el-input-number v-model="row.primaryFlow" :min="30" :max="250" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="secondarySupplyTemp" label="二次网供水温度(℃)" width="170">
            <template #default="{ row }">
              <el-input-number v-model="row.secondarySupplyTemp" :min="50" :max="80" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="valveOpening" label="阀门开度(%)" width="140">
            <template #default="{ row }">
              <el-slider v-model="row.valveOpening" :min="30" :max="100" show-input size="small" />
            </template>
          </el-table-column>
        </el-table>
        <div class="step-actions">
          <el-button @click="goToStep(1)">上一步</el-button>
          <el-button type="primary" @click="goToStep(3)">下一步：提交审批</el-button>
        </div>
      </div>

      <div v-if="step === 3" class="step-content">
        <h3>确认调度方案并提交审批</h3>
        <el-result icon="success" title="调度方案已生成" sub-title="请确认以下信息无误后提交总工审批">
          <template #extra>
            <el-descriptions :column="2" border size="small" style="text-align: left">
              <el-descriptions-item label="调度日期">{{ weatherForm.date }}</el-descriptions-item>
              <el-descriptions-item label="天气">{{ weatherForm.weather }}</el-descriptions-item>
              <el-descriptions-item label="温度范围">{{ weatherForm.minTemp }}℃ ~ {{ weatherForm.maxTemp }}℃</el-descriptions-item>
              <el-descriptions-item label="预测热负荷">{{ predictedHeatLoad }} MW</el-descriptions-item>
              <el-descriptions-item label="涉及换热站">{{ stationSchedules.length }} 座</el-descriptions-item>
              <el-descriptions-item label="总供热面积">{{ totalHeatingArea.toFixed(1) }} 万㎡</el-descriptions-item>
            </el-descriptions>
          </template>
        </el-result>
        <div class="step-actions">
          <el-button @click="goToStep(2)">上一步</el-button>
          <el-button type="primary" @click="submitApproval">提交审批</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import type { WeatherForecast, StationSchedule } from '@/types'
import { calculateHeatLoad, generateStationSchedule, generateHistoryLoadData, simulateHeatLoadPredictionAPI } from '@/utils'
import { mockData } from '@/mock/data'

const dataStore = useDataStore()
const router = useRouter()
const step = ref(0)
const loadChartRef = ref<HTMLElement>()

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

const weatherForm = reactive<WeatherForecast>({
  date: tomorrow.toISOString().split('T')[0],
  temperature: -5,
  minTemp: -10,
  maxTemp: -2,
  weather: '晴',
  windSpeed: 3,
  humidity: 50
})

const predictedHeatLoad = ref(0)
const tempFactor = ref(1)
const windFactor = ref(1)
const stationSchedules = ref<(StationSchedule & { heatingArea: number })[]>([])

const totalHeatingArea = computed(() => {
  return stationSchedules.value.reduce((sum, s) => sum + s.heatingArea, 0) / 10000
})

const goToStep = (s: number) => {
  if (s === 1) {
    calculatePrediction()
  }
  step.value = s
}

const isGenerating = ref(false)

const calculatePrediction = () => {
  const activeStations = dataStore.heatExchangeStations.filter(s => s.status !== 'offline')
  let totalLoad = 0

  tempFactor.value = 1 + 0.08 * (18 - weatherForm.temperature)
  windFactor.value = 1 + weatherForm.windSpeed * 0.02

  activeStations.forEach(station => {
    totalLoad += calculateHeatLoad(weatherForm, station.heatingArea)
  })

  predictedHeatLoad.value = Math.round(totalLoad)
  initLoadChart()
}

const generateSchedule = async () => {
  const activeStations = dataStore.heatExchangeStations.filter(s => s.status !== 'offline')
  
  isGenerating.value = true
  try {
    const result = await simulateHeatLoadPredictionAPI(weatherForm, activeStations)
    
    predictedHeatLoad.value = result.totalHeatLoad
    stationSchedules.value = result.stationSchedules
    
    initLoadChart()
    goToStep(2)
    
    ElMessage.success('调度方案生成成功！详细计算过程请查看控制台日志')
  } catch (error) {
    console.error('调度方案生成失败:', error)
    ElMessage.error('调度方案生成失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

const submitApproval = () => {
  const newPlan = {
    id: mockData.generateId(),
    date: weatherForm.date,
    status: 'pending' as const,
    weatherForecast: { ...weatherForm },
    heatLoadPrediction: predictedHeatLoad.value,
    stations: stationSchedules.value.map(s => ({
      stationId: s.stationId,
      stationName: s.stationName,
      primaryFlow: s.primaryFlow,
      secondarySupplyTemp: s.secondarySupplyTemp,
      valveOpening: s.valveOpening
    })),
    createTime: new Date().toLocaleString(),
    createBy: dataStore.currentUser?.name || '调度员'
  }

  dataStore.addSchedulePlan(newPlan)
  ElMessage.success('调度方案已提交，等待总工审批')
  setTimeout(() => {
    router.push('/schedule/plan')
  }, 1500)
}

const initLoadChart = () => {
  if (!loadChartRef.value) return
  const chart = echarts.init(loadChartRef.value)
  const data = generateHistoryLoadData(7)

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['历史热负荷', '预测热负荷'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: data.map(d => d.time) },
    yAxis: { type: 'value', name: '热负荷(MW)' },
    series: [
      {
        name: '历史热负荷',
        type: 'line',
        smooth: true,
        data: data.map(d => d.heatLoad),
        color: '#909399'
      },
      {
        name: '预测热负荷',
        type: 'line',
        smooth: true,
        lineStyle: { type: 'dashed' },
        data: data.map((d, i) => i >= data.length - 6 ? predictedHeatLoad.value + (Math.random() - 0.5) * 50 : null),
        color: '#f56c6c'
      }
    ]
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

.step-content {
  padding: 20px;
}

.step-content h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 10px;
}

.prediction-result {
  background: #f5f7fa;
  padding: 30px;
  border-radius: 8px;
  margin-top: 20px;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>
