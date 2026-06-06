export interface HeatSource {
  id: string
  name: string
  address: string
  heatingCapacity: number
  heatingRadius: number
  designPressure: number
  operatingHours: number
  status: 'running' | 'standby' | 'maintenance'
  equipmentList: Equipment[]
  position: { x: number; y: number }
  createTime: string
}

export interface HeatExchangeStation {
  id: string
  name: string
  area: string
  address: string
  heatSourceId: string
  heatSourceName: string
  heatingArea: number
  designPressure: number
  primaryFlow: number
  secondarySupplyTemp: number
  secondaryReturnTemp: number
  supplyPressure: number
  returnPressure: number
  operatingHours: number
  status: 'normal' | 'warning' | 'alarm' | 'offline'
  equipmentList: Equipment[]
  position: { x: number; y: number }
  createTime: string
}

export interface Pipeline {
  id: string
  name: string
  startPoint: string
  endPoint: string
  diameter: number
  length: number
  designPressure: number
  material: string
  heatLossCoefficient: number
  status: 'normal' | 'maintenance' | 'fault'
  createTime: string
}

export interface Equipment {
  id: string
  name: string
  model: string
  type: string
  manufacturer: string
  installDate: string
  operatingHours: number
  lastMaintenanceTime: string
  nextMaintenanceTime: string
  maintenanceInterval: number
  status: 'normal' | 'warning' | 'fault' | 'maintenance'
  spareParts: SparePart[]
}

export interface SparePart {
  id: string
  name: string
  model: string
  quantity: number
  safeStock: number
  unit: string
}

export interface SchedulePlan {
  id: string
  date: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published'
  weatherForecast: WeatherForecast
  heatLoadPrediction: number
  stations: StationSchedule[]
  createTime: string
  createBy: string
  approveBy?: string
  approveTime?: string
  approveOpinion?: string
}

export interface StationSchedule {
  stationId: string
  stationName: string
  primaryFlow: number
  secondarySupplyTemp: number
  valveOpening: number
}

export interface WeatherForecast {
  date: string
  temperature: number
  minTemp: number
  maxTemp: number
  weather: string
  windSpeed: number
  humidity: number
}

export interface RealTimeData {
  stationId: string
  stationName: string
  timestamp: string
  supplyTemp: number
  returnTemp: number
  supplyPressure: number
  returnPressure: number
  flow: number
  valveOpening: number
}

export interface AlarmRecord {
  id: string
  stationId: string
  stationName: string
  type: 'temperature' | 'pressure' | 'flow' | 'equipment'
  level: 'warning' | 'alarm' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: string
  status: 'pending' | 'confirmed' | 'processed'
  confirmBy?: string
  confirmTime?: string
}

export interface MaintenanceOrder {
  id: string
  equipmentId: string
  equipmentName: string
  stationId: string
  stationName: string
  type: 'scheduled' | 'fault' | 'complaint'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'processing' | 'completed'
  assignee?: string
  team?: string
  createTime: string
  startTime?: string
  endTime?: string
  description: string
  sparePartsUsed: { partId: string; partName: string; quantity: number }[]
}

export interface UserComplaint {
  id: string
  userInfo: {
    name: string
    phone: string
    address: string
  }
  type: 'temperature' | 'leakage' | 'noise' | 'other'
  status: 'pending' | 'assigned' | 'processing' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  description: string
  assignee?: string
  createTime: string
  assignTime?: string
  resolveTime?: string
  isEscalated: boolean
  escalateTime?: string
  feedback?: string
}

export interface BillingRecord {
  id: string
  userId: string
  userName: string
  address: string
  heatingArea: number
  period: string
  heatConsumption: number
  unitPrice: number
  totalAmount: number
  paidAmount: number
  status: 'unpaid' | 'partial' | 'paid'
  createTime: string
  dueDate: string
  remindCount: number
}

export interface StatisticsData {
  totalHeatSupply: number
  avgHeatConsumption: number
  equipmentFailureRate: number
  complaintRate: number
  stationStatus: {
    normal: number
    warning: number
    alarm: number
    offline: number
  }
}

export interface User {
  id: string
  username: string
  name: string
  role: 'admin' | 'engineer' | 'operator' | 'maintenance' | 'chief'
  phone: string
}
