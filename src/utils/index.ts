import type { WeatherForecast, StationSchedule, HeatExchangeStation } from '@/types'

export const calculateHeatLoad = (
  weather: WeatherForecast,
  heatingArea: number,
  historicalFactor: number = 1.0
): number => {
  const baseTemp = 18
  const tempDiff = baseTemp - weather.temperature
  const heatIndex = 1 + 0.08 * tempDiff
  const windFactor = 1 + weather.windSpeed * 0.02
  const humidityFactor = 1 + (weather.humidity - 50) * 0.005
  const areaFactor = heatingArea * 0.08

  return areaFactor * heatIndex * windFactor * humidityFactor * historicalFactor
}

export const generateStationSchedule = (
  station: HeatExchangeStation,
  targetHeatLoad: number,
  totalHeatLoad: number
): StationSchedule => {
  const loadRatio = targetHeatLoad / totalHeatLoad
  const baseFlow = station.primaryFlow || 100
  const baseTemp = station.secondarySupplyTemp || 60

  const adjustedFlow = Math.round(baseFlow * (1 + (loadRatio - 0.125) * 0.5))
  const adjustedTemp = Math.round(baseTemp + (loadRatio - 0.125) * 20)
  const valveOpening = Math.round(70 + loadRatio * 30)

  return {
    stationId: station.id,
    stationName: station.name,
    primaryFlow: Math.max(50, Math.min(200, adjustedFlow)),
    secondarySupplyTemp: Math.max(55, Math.min(75, adjustedTemp)),
    valveOpening: Math.max(50, Math.min(100, valveOpening))
  }
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
