import type { WeatherForecast, StationSchedule, HeatExchangeStation } from '@/types'

const BUILDING_INSULATION_FACTOR: Record<string, number> = {
  '新建小区': 0.85,
  '老旧小区': 1.15,
  '商业建筑': 1.0,
  '学校医院': 0.95,
  'default': 1.0
}

const PIPE_HEAT_LOSS_TABLE = [
  { diameter: 100, lossPerKm: 8 },
  { diameter: 200, lossPerKm: 12 },
  { diameter: 300, lossPerKm: 15 },
  { diameter: 400, lossPerKm: 18 },
  { diameter: 500, lossPerKm: 22 },
  { diameter: 600, lossPerKm: 26 },
  { diameter: 700, lossPerKm: 30 }
]

export const calculateBuildingType = (stationName: string): string => {
  if (stationName.includes('花园') || stationName.includes('家园') || stationName.includes('华庭')) return '新建小区'
  if (stationName.includes('里') || stationName.includes('小区')) return '老旧小区'
  if (stationName.includes('商业') || stationName.includes('广场')) return '商业建筑'
  if (stationName.includes('学校') || stationName.includes('医院') || stationName.includes('学府')) return '学校医院'
  return 'default'
}

export const calculateHeatLoad = (
  weather: WeatherForecast,
  heatingArea: number,
  buildingType: string = 'default',
  pipeLength: number = 2.0,
  pipeDiameter: number = 300
): number => {
  console.log('[热负荷预测API] 开始计算热负荷...')
  console.log('[热负荷预测API] 输入参数:', { weather, heatingArea, buildingType, pipeLength, pipeDiameter })

  const baseTemp = 18
  const tempDiff = Math.max(0, baseTemp - weather.temperature)

  const tempFactor = 1 + 0.065 * tempDiff + 0.0015 * tempDiff * tempDiff
  console.log('[热负荷预测API] 温度修正系数:', tempFactor.toFixed(4))

  const windChillFactor = 1 + 0.025 * weather.windSpeed + 0.002 * weather.windSpeed * weather.windSpeed
  console.log('[热负荷预测API] 风速修正系数:', windChillFactor.toFixed(4))

  const humidityFactor = 1 + (weather.humidity - 50) * 0.004
  console.log('[热负荷预测API] 湿度修正系数:', humidityFactor.toFixed(4))

  const weatherPenalty: Record<string, number> = {
    '晴': 1.0,
    '多云': 1.02,
    '阴': 1.05,
    '小雨': 1.1,
    '小雪': 1.12,
    '中雪': 1.18,
    '大雪': 1.25
  }
  const weatherFactor = weatherPenalty[weather.weather] || 1.0
  console.log('[热负荷预测API] 天气修正系数:', weatherFactor.toFixed(4))

  const insulationFactor = BUILDING_INSULATION_FACTOR[buildingType] || 1.0
  console.log('[热负荷预测API] 建筑保温系数:', insulationFactor.toFixed(4))

  const pipeLossData = PIPE_HEAT_LOSS_TABLE.find(p => p.diameter >= pipeDiameter) || PIPE_HEAT_LOSS_TABLE[3]
  const pipeHeatLoss = pipeLossData.lossPerKm * pipeLength
  console.log('[热负荷预测API] 管网热损失补偿:', pipeHeatLoss.toFixed(2), 'W/㎡')

  const baseHeatIndex = 45
  const areaBaseLoad = heatingArea * baseHeatIndex / 1000000
  console.log('[热负荷预测API] 面积基础热负荷:', areaBaseLoad.toFixed(2), 'MW')

  const historicalCorrection = 0.98 + Math.random() * 0.04
  console.log('[热负荷预测API] 历史数据修正系数:', historicalCorrection.toFixed(4))

  const totalLoad = areaBaseLoad * tempFactor * windChillFactor * humidityFactor * weatherFactor * insulationFactor * historicalCorrection + pipeHeatLoss * heatingArea / 1000000

  const randomVariation = 0.97 + Math.random() * 0.06
  const finalLoad = Math.round(totalLoad * randomVariation * 100) / 100

  console.log('[热负荷预测API] 最终预测热负荷:', finalLoad, 'MW')
  return finalLoad
}

export const generateStationSchedule = (
  station: HeatExchangeStation,
  targetHeatLoad: number,
  totalHeatLoad: number,
  weather: WeatherForecast
): StationSchedule => {
  console.log('[调度计算API] 计算换热站调度参数:', station.name)

  const loadRatio = targetHeatLoad / totalHeatLoad
  console.log('[调度计算API] 负荷占比:', (loadRatio * 100).toFixed(2) + '%')

  const baseFlow = station.primaryFlow || 100
  const baseTemp = station.secondarySupplyTemp || 60

  const tempDiff = Math.max(0, 18 - weather.temperature)
  const flowTempFactor = 1 + tempDiff * 0.015

  const hydronicBalanceOffset = (Math.random() - 0.5) * 0.08
  const adjustedFlow = Math.round(baseFlow * (1 + (loadRatio - 0.125) * 0.7 + hydronicBalanceOffset) * flowTempFactor)

  const supplyTempBase = 50 + tempDiff * 1.2
  const loadTempAdjust = loadRatio * 15
  const heatLossCompensation = 2 + pipeHeatLossCompensation(station.heatingArea)
  const adjustedTemp = Math.round(supplyTempBase + loadTempAdjust + heatLossCompensation + (Math.random() - 0.5) * 2)

  const hydraulicResistance = 0.7 + loadRatio * 0.25
  const valveOpening = Math.round(50 + (loadRatio * 50) / hydraulicResistance)

  const finalFlow = Math.max(50, Math.min(220, adjustedFlow))
  const finalTemp = Math.max(52, Math.min(78, adjustedTemp))
  const finalValve = Math.max(45, Math.min(100, valveOpening))

  console.log('[调度计算API] 计算结果:', {
    primaryFlow: finalFlow,
    secondarySupplyTemp: finalTemp,
    valveOpening: finalValve
  })

  return {
    stationId: station.id,
    stationName: station.name,
    primaryFlow: finalFlow,
    secondarySupplyTemp: finalTemp,
    valveOpening: finalValve
  }
}

const pipeHeatLossCompensation = (heatingArea: number): number => {
  if (heatingArea > 180000) return 5
  if (heatingArea > 150000) return 4
  if (heatingArea > 120000) return 3
  if (heatingArea > 100000) return 2
  return 1
}

export const simulateHeatLoadPredictionAPI = async (
  weather: WeatherForecast,
  stations: HeatExchangeStation[]
): Promise<{
  totalHeatLoad: number
  stationSchedules: (StationSchedule & { heatingArea: number; stationHeatLoad: number })[]
}> => {
  console.log('[API模拟] ========== 调用热负荷预测服务 ==========')
  console.log('[API模拟] 天气预报:', weather)
  console.log('[API模拟] 换热站数量:', stations.length)

  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500))

  let totalHeatLoad = 0
  const stationLoads: { station: HeatExchangeStation; load: number; buildingType: string }[] = []

  stations.forEach(station => {
    const buildingType = calculateBuildingType(station.name)
    const pipeLength = 1.5 + Math.random() * 3
    const pipeDiameter = 200 + Math.floor(Math.random() * 3) * 100
    const load = calculateHeatLoad(weather, station.heatingArea, buildingType, pipeLength, pipeDiameter)
    stationLoads.push({ station, load, buildingType })
    totalHeatLoad += load
  })

  totalHeatLoad = Math.round(totalHeatLoad * 100) / 100

  console.log('[API模拟] 总预测热负荷:', totalHeatLoad, 'MW')

  const stationSchedules = stationLoads.map(item => {
    const schedule = generateStationSchedule(item.station, item.load, totalHeatLoad, weather)
    return {
      ...schedule,
      heatingArea: item.station.heatingArea,
      stationHeatLoad: Math.round(item.load * 100) / 100
    }
  })

  console.log('[API模拟] ========== 热负荷预测服务调用完成 ==========')

  return { totalHeatLoad, stationSchedules }
}

export const generateHistoryLoadData = (days: number = 30) => {
  const data = []
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const baseTemp = -5 + Math.random() * 10
    const baseLoad = 600 + Math.random() * 200

    for (let hour = 0; hour < 24; hour += 4) {
      const hourFactor = 1 + 0.1 * Math.sin((hour - 6) * Math.PI / 12)
      data.push({
        time: `${date.getMonth() + 1}/${date.getDate()} ${hour}:00`,
        temperature: Math.round((baseTemp + Math.random() * 5) * 10) / 10,
        heatLoad: Math.round(baseLoad * hourFactor + Math.random() * 50)
      })
    }
  }

  return data
}

export const calculateHeatLoss = (flow: number, supplyTemp: number, returnTemp: number): number => {
  const specificHeat = 4.2
  return flow * (supplyTemp - returnTemp) * specificHeat / 3600
}

export const formatValue = (value: number, unit: string, decimals: number = 1): string => {
  return `${value.toFixed(decimals)} ${unit}`
}

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    normal: '#67c23a',
    running: '#67c23a',
    paid: '#67c23a',
    completed: '#67c23a',
    resolved: '#67c23a',
    approved: '#67c23a',
    published: '#67c23a',
    warning: '#e6a23c',
    standby: '#e6a23c',
    partial: '#e6a23c',
    assigned: '#e6a23c',
    processing: '#e6a23c',
    pending: '#909399',
    draft: '#909399',
    offline: '#909399',
    maintenance: '#909399',
    alarm: '#f56c6c',
    fault: '#f56c6c',
    critical: '#f56c6c',
    urgent: '#f56c6c',
    rejected: '#f56c6c',
    unpaid: '#f56c6c',
    escalated: '#f56c6c',
    closed: '#409eff'
  }
  return colorMap[status] || '#909399'
}

export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    normal: '正常',
    running: '运行中',
    paid: '已缴清',
    completed: '已完成',
    resolved: '已解决',
    approved: '已批准',
    published: '已发布',
    warning: '预警',
    standby: '备用',
    partial: '部分缴纳',
    assigned: '已派单',
    processing: '处理中',
    pending: '待处理',
    draft: '草稿',
    offline: '离线',
    maintenance: '维护中',
    alarm: '告警',
    fault: '故障',
    critical: '严重',
    urgent: '紧急',
    rejected: '已驳回',
    unpaid: '未缴费',
    escalated: '已升级',
    closed: '已关闭'
  }
  return textMap[status] || status
}

export const getAlarmLevelText = (level: string): string => {
  const map: Record<string, string> = {
    warning: '预警',
    alarm: '告警',
    critical: '严重'
  }
  return map[level] || level
}

export const getPriorityText = (priority: string): string => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return map[priority] || priority
}

export const getComplaintTypeText = (type: string): string => {
  const map: Record<string, string> = {
    temperature: '温度不达标',
    leakage: '漏水',
    noise: '噪音',
    other: '其他'
  }
  return map[type] || type
}
