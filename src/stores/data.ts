import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  HeatSource,
  HeatExchangeStation,
  Pipeline,
  SparePart,
  SchedulePlan,
  AlarmRecord,
  MaintenanceOrder,
  UserComplaint,
  BillingRecord,
  User
} from '@/types'
import { mockData } from '@/mock/data'

export const useDataStore = defineStore('data', () => {
  const heatSources = ref<HeatSource[]>([...mockData.heatSources])
  const heatExchangeStations = ref<HeatExchangeStation[]>([...mockData.heatExchangeStations])
  const pipelines = ref<Pipeline[]>([...mockData.pipelines])
  const spareParts = ref<SparePart[]>([...mockData.spareParts])
  const schedulePlans = ref<SchedulePlan[]>([...mockData.schedulePlans])
  const alarmRecords = ref<AlarmRecord[]>([...mockData.alarmRecords])
  const maintenanceOrders = ref<MaintenanceOrder[]>([...mockData.maintenanceOrders])
  const userComplaints = ref<UserComplaint[]>([...mockData.userComplaints])
  const billingRecords = ref<BillingRecord[]>([...mockData.billingRecords])
  const users = ref<User[]>([...mockData.users])
  const currentUser = ref<User | null>(users.value[0])

  const stationStatusCount = computed(() => {
    return {
      normal: heatExchangeStations.value.filter(s => s.status === 'normal').length,
      warning: heatExchangeStations.value.filter(s => s.status === 'warning').length,
      alarm: heatExchangeStations.value.filter(s => s.status === 'alarm').length,
      offline: heatExchangeStations.value.filter(s => s.status === 'offline').length
    }
  })

  const pendingAlarms = computed(() => {
    return alarmRecords.value.filter(a => a.status === 'pending').length
  })

  const pendingComplaints = computed(() => {
    return userComplaints.value.filter(c => c.status === 'pending').length
  })

  const pendingMaintenance = computed(() => {
    return maintenanceOrders.value.filter(m => m.status === 'pending').length
  })

  const pendingSchedules = computed(() => {
    return schedulePlans.value.filter(s => s.status === 'pending').length
  })

  const addHeatSource = (source: HeatSource) => {
    heatSources.value.push(source)
  }

  const updateHeatSource = (id: string, data: Partial<HeatSource>) => {
    const index = heatSources.value.findIndex(s => s.id === id)
    if (index !== -1) {
      heatSources.value[index] = { ...heatSources.value[index], ...data }
    }
  }

  const deleteHeatSource = (id: string) => {
    const index = heatSources.value.findIndex(s => s.id === id)
    if (index !== -1) {
      heatSources.value.splice(index, 1)
    }
  }

  const addStation = (station: HeatExchangeStation) => {
    heatExchangeStations.value.push(station)
  }

  const updateStation = (id: string, data: Partial<HeatExchangeStation>) => {
    const index = heatExchangeStations.value.findIndex(s => s.id === id)
    if (index !== -1) {
      heatExchangeStations.value[index] = { ...heatExchangeStations.value[index], ...data }
    }
  }

  const deleteStation = (id: string) => {
    const index = heatExchangeStations.value.findIndex(s => s.id === id)
    if (index !== -1) {
      heatExchangeStations.value.splice(index, 1)
    }
  }

  const addPipeline = (pipeline: Pipeline) => {
    pipelines.value.push(pipeline)
  }

  const updatePipeline = (id: string, data: Partial<Pipeline>) => {
    const index = pipelines.value.findIndex(p => p.id === id)
    if (index !== -1) {
      pipelines.value[index] = { ...pipelines.value[index], ...data }
    }
  }

  const deletePipeline = (id: string) => {
    const index = pipelines.value.findIndex(p => p.id === id)
    if (index !== -1) {
      pipelines.value.splice(index, 1)
    }
  }

  const addSchedulePlan = (plan: SchedulePlan) => {
    schedulePlans.value.push(plan)
  }

  const updateSchedulePlan = (id: string, data: Partial<SchedulePlan>) => {
    const index = schedulePlans.value.findIndex(s => s.id === id)
    if (index !== -1) {
      schedulePlans.value[index] = { ...schedulePlans.value[index], ...data }
    }
  }

  const addAlarm = (alarm: AlarmRecord) => {
    alarmRecords.value.unshift(alarm)
  }

  const updateAlarm = (id: string, data: Partial<AlarmRecord>) => {
    const index = alarmRecords.value.findIndex(a => a.id === id)
    if (index !== -1) {
      alarmRecords.value[index] = { ...alarmRecords.value[index], ...data }
    }
  }

  const addMaintenanceOrder = (order: MaintenanceOrder) => {
    maintenanceOrders.value.push(order)
  }

  const updateMaintenanceOrder = (id: string, data: Partial<MaintenanceOrder>) => {
    const index = maintenanceOrders.value.findIndex(m => m.id === id)
    if (index !== -1) {
      maintenanceOrders.value[index] = { ...maintenanceOrders.value[index], ...data }
    }
  }

  const addComplaint = (complaint: UserComplaint) => {
    userComplaints.value.unshift(complaint)
  }

  const updateComplaint = (id: string, data: Partial<UserComplaint>) => {
    const index = userComplaints.value.findIndex(c => c.id === id)
    if (index !== -1) {
      userComplaints.value[index] = { ...userComplaints.value[index], ...data }
    }
  }

  const updateSparePart = (id: string, data: Partial<SparePart>) => {
    const index = spareParts.value.findIndex(s => s.id === id)
    if (index !== -1) {
      spareParts.value[index] = { ...spareParts.value[index], ...data }
    }
  }

  const updateBillingRecord = (id: string, data: Partial<BillingRecord>) => {
    const index = billingRecords.value.findIndex(b => b.id === id)
    if (index !== -1) {
      billingRecords.value[index] = { ...billingRecords.value[index], ...data }
    }
  }

  const setCurrentUser = (user: User) => {
    currentUser.value = user
  }

  return {
    heatSources,
    heatExchangeStations,
    pipelines,
    spareParts,
    schedulePlans,
    alarmRecords,
    maintenanceOrders,
    userComplaints,
    billingRecords,
    users,
    currentUser,
    stationStatusCount,
    pendingAlarms,
    pendingComplaints,
    pendingMaintenance,
    pendingSchedules,
    addHeatSource,
    updateHeatSource,
    deleteHeatSource,
    addStation,
    updateStation,
    deleteStation,
    addPipeline,
    updatePipeline,
    deletePipeline,
    addSchedulePlan,
    updateSchedulePlan,
    addAlarm,
    updateAlarm,
    addMaintenanceOrder,
    updateMaintenanceOrder,
    addComplaint,
    updateComplaint,
    updateSparePart,
    updateBillingRecord,
    setCurrentUser
  }
})
