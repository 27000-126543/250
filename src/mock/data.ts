import type {
  HeatSource,
  HeatExchangeStation,
  Pipeline,
  Equipment,
  SparePart,
  SchedulePlan,
  AlarmRecord,
  MaintenanceOrder,
  UserComplaint,
  BillingRecord,
  User
} from '@/types'

const generateId = () => Math.random().toString(36).substring(2, 10)

const spareParts: SparePart[] = [
  { id: 'sp001', name: '循环泵轴承', model: 'SKF-6312', quantity: 3, safeStock: 5, unit: '个' },
  { id: 'sp002', name: '电动阀门', model: 'DN100', quantity: 8, safeStock: 3, unit: '台' },
  { id: 'sp003', name: '温度传感器', model: 'PT100', quantity: 5, safeStock: 10, unit: '支' },
  { id: 'sp004', name: '压力变送器', model: 'YOKOGAWA-EJA', quantity: 1, safeStock: 2, unit: '台' },
  { id: 'sp005', name: '热量表', model: 'DN80', quantity: 5, safeStock: 2, unit: '台' },
  { id: 'sp006', name: '密封圈', model: 'φ150', quantity: 12, safeStock: 20, unit: '个' },
  { id: 'sp007', name: '过滤器滤芯', model: '100目', quantity: 30, safeStock: 10, unit: '个' }
]

const equipmentList: Equipment[] = [
  {
    id: 'eq001',
    name: '一次网循环泵',
    model: 'KQW200/315',
    type: '水泵',
    manufacturer: '上海凯泉',
    installDate: '2022-09-15',
    operatingHours: 8760,
    lastMaintenanceTime: '2025-10-01',
    nextMaintenanceTime: '2026-04-01',
    maintenanceInterval: 4380,
    status: 'normal',
    spareParts: [spareParts[0], spareParts[5]]
  },
  {
    id: 'eq002',
    name: '二次网循环泵',
    model: 'KQW150/300',
    type: '水泵',
    manufacturer: '上海凯泉',
    installDate: '2022-09-15',
    operatingHours: 8760,
    lastMaintenanceTime: '2025-10-10',
    nextMaintenanceTime: '2026-04-10',
    maintenanceInterval: 4380,
    status: 'normal',
    spareParts: [spareParts[0]]
  },
  {
    id: 'eq003',
    name: '板式换热器',
    model: 'BR0.8-120',
    type: '换热器',
    manufacturer: '兰州兰石',
    installDate: '2022-08-20',
    operatingHours: 9500,
    lastMaintenanceTime: '2025-09-15',
    nextMaintenanceTime: '2026-03-15',
    maintenanceInterval: 4380,
    status: 'normal',
    spareParts: [spareParts[5], spareParts[6]]
  },
  {
    id: 'eq004',
    name: '电动调节阀',
    model: 'VFW-DN125',
    type: '阀门',
    manufacturer: '德国西门子',
    installDate: '2022-09-01',
    operatingHours: 8200,
    lastMaintenanceTime: '2025-11-01',
    nextMaintenanceTime: '2026-05-01',
    maintenanceInterval: 4380,
    status: 'warning',
    spareParts: [spareParts[1]]
  },
  {
    id: 'eq005',
    name: '温度传感器',
    model: 'PT100-A级',
    type: '传感器',
    manufacturer: '北京昆仑海岸',
    installDate: '2022-09-20',
    operatingHours: 8600,
    lastMaintenanceTime: '2025-10-20',
    nextMaintenanceTime: '2026-04-20',
    maintenanceInterval: 4380,
    status: 'normal',
    spareParts: [spareParts[2]]
  },
  {
    id: 'eq006',
    name: '压力变送器',
    model: 'EJA530A',
    type: '传感器',
    manufacturer: '横河电机',
    installDate: '2022-09-20',
    operatingHours: 8600,
    lastMaintenanceTime: '2025-10-20',
    nextMaintenanceTime: '2026-04-20',
    maintenanceInterval: 4380,
    status: 'normal',
    spareParts: [spareParts[3]]
  },
  {
    id: 'eq007',
    name: '补水泵',
    model: 'CDL4-160',
    type: '水泵',
    manufacturer: '南方泵业',
    installDate: '2022-09-10',
    operatingHours: 7800,
    lastMaintenanceTime: '2025-11-10',
    nextMaintenanceTime: '2026-05-10',
    maintenanceInterval: 4380,
    status: 'normal',
    spareParts: [spareParts[0]]
  }
]

const heatSources: HeatSource[] = [
  {
    id: 'hs001',
    name: '第一热源厂',
    address: '城东区工业路88号',
    heatingCapacity: 280,
    heatingRadius: 8,
    designPressure: 1.6,
    operatingHours: 12500,
    status: 'running',
    equipmentList: equipmentList.slice(0, 4),
    position: { x: 100, y: 100 },
    createTime: '2022-06-01'
  },
  {
    id: 'hs002',
    name: '第二热源厂',
    address: '城西区建设路66号',
    heatingCapacity: 350,
    heatingRadius: 10,
    designPressure: 1.6,
    operatingHours: 11800,
    status: 'running',
    equipmentList: equipmentList.slice(2, 6),
    position: { x: 100, y: 300 },
    createTime: '2022-07-15'
  },
  {
    id: 'hs003',
    name: '第三热源厂',
    address: '南区开发区大道120号',
    heatingCapacity: 200,
    heatingRadius: 6,
    designPressure: 1.6,
    operatingHours: 9600,
    status: 'standby',
    equipmentList: equipmentList.slice(0, 3),
    position: { x: 700, y: 150 },
    createTime: '2023-05-20'
  }
]

const heatExchangeStations: HeatExchangeStation[] = [
  {
    id: 'st001',
    name: '阳光花园换热站',
    area: '城东区',
    address: '阳光花园小区12号楼',
    heatSourceId: 'hs001',
    heatSourceName: '第一热源厂',
    heatingArea: 150000,
    designPressure: 1.0,
    primaryFlow: 120,
    secondarySupplyTemp: 65,
    secondaryReturnTemp: 45,
    supplyPressure: 0.6,
    returnPressure: 0.4,
    operatingHours: 8760,
    status: 'normal',
    equipmentList: equipmentList,
    position: { x: 200, y: 150 },
    createTime: '2022-09-01'
  },
  {
    id: 'st002',
    name: '幸福里换热站',
    area: '城东区',
    address: '幸福里社区服务中心',
    heatSourceId: 'hs001',
    heatSourceName: '第一热源厂',
    heatingArea: 120000,
    designPressure: 1.0,
    primaryFlow: 95,
    secondarySupplyTemp: 63,
    secondaryReturnTemp: 43,
    supplyPressure: 0.58,
    returnPressure: 0.38,
    operatingHours: 8760,
    status: 'normal',
    equipmentList: equipmentList.slice(0, 5),
    position: { x: 320, y: 180 },
    createTime: '2022-09-05'
  },
  {
    id: 'st003',
    name: '翠湖天地换热站',
    area: '城西区',
    address: '翠湖天地A区',
    heatSourceId: 'hs002',
    heatSourceName: '第二热源厂',
    heatingArea: 200000,
    designPressure: 1.0,
    primaryFlow: 160,
    secondarySupplyTemp: 64,
    secondaryReturnTemp: 44,
    supplyPressure: 0.62,
    returnPressure: 0.42,
    operatingHours: 8500,
    status: 'warning',
    equipmentList: equipmentList,
    position: { x: 450, y: 280 },
    createTime: '2022-08-25'
  },
  {
    id: 'st004',
    name: '金色家园换热站',
    area: '城西区',
    address: '金色家园二期',
    heatSourceId: 'hs002',
    heatSourceName: '第二热源厂',
    heatingArea: 180000,
    designPressure: 1.0,
    primaryFlow: 145,
    secondarySupplyTemp: 66,
    secondaryReturnTemp: 46,
    supplyPressure: 0.65,
    returnPressure: 0.45,
    operatingHours: 8400,
    status: 'alarm',
    equipmentList: equipmentList.slice(1, 6),
    position: { x: 380, y: 350 },
    createTime: '2022-09-10'
  },
  {
    id: 'st005',
    name: '锦绣园换热站',
    area: '南区',
    address: '锦绣园小区',
    heatSourceId: 'hs003',
    heatSourceName: '第三热源厂',
    heatingArea: 100000,
    designPressure: 1.0,
    primaryFlow: 80,
    secondarySupplyTemp: 62,
    secondaryReturnTemp: 42,
    supplyPressure: 0.55,
    returnPressure: 0.35,
    operatingHours: 7200,
    status: 'normal',
    equipmentList: equipmentList.slice(0, 4),
    position: { x: 550, y: 200 },
    createTime: '2023-06-15'
  },
  {
    id: 'st006',
    name: '滨河小区换热站',
    area: '城东区',
    address: '滨河路88号',
    heatSourceId: 'hs001',
    heatSourceName: '第一热源厂',
    heatingArea: 90000,
    designPressure: 1.0,
    primaryFlow: 72,
    secondarySupplyTemp: 64,
    secondaryReturnTemp: 44,
    supplyPressure: 0.57,
    returnPressure: 0.37,
    operatingHours: 8600,
    status: 'normal',
    equipmentList: equipmentList.slice(0, 5),
    position: { x: 150, y: 280 },
    createTime: '2022-09-12'
  },
  {
    id: 'st007',
    name: '学府花园换热站',
    area: '南区',
    address: '学府路大学旁',
    heatSourceId: 'hs003',
    heatSourceName: '第三热源厂',
    heatingArea: 130000,
    designPressure: 1.0,
    primaryFlow: 105,
    secondarySupplyTemp: 63,
    secondaryReturnTemp: 43,
    supplyPressure: 0.59,
    returnPressure: 0.39,
    operatingHours: 7000,
    status: 'offline',
    equipmentList: equipmentList.slice(0, 4),
    position: { x: 620, y: 280 },
    createTime: '2023-07-01'
  },
  {
    id: 'st008',
    name: '盛世华庭换热站',
    area: '城西区',
    address: '盛世华庭别墅区',
    heatSourceId: 'hs002',
    heatSourceName: '第二热源厂',
    heatingArea: 85000,
    designPressure: 1.0,
    primaryFlow: 68,
    secondarySupplyTemp: 67,
    secondaryReturnTemp: 47,
    supplyPressure: 0.6,
    returnPressure: 0.4,
    operatingHours: 8300,
    status: 'normal',
    equipmentList: equipmentList.slice(0, 5),
    position: { x: 500, y: 380 },
    createTime: '2022-08-30'
  }
]

const pipelines: Pipeline[] = [
  {
    id: 'pl001',
    name: '一号主干线',
    startPoint: '第一热源厂',
    endPoint: '阳光花园换热站',
    diameter: 600,
    length: 3.5,
    designPressure: 1.6,
    material: '聚氨酯保温钢管',
    heatLossCoefficient: 0.08,
    status: 'normal',
    createTime: '2022-05-10'
  },
  {
    id: 'pl002',
    name: '二号主干线',
    startPoint: '第一热源厂',
    endPoint: '幸福里换热站',
    diameter: 500,
    length: 2.8,
    designPressure: 1.6,
    material: '聚氨酯保温钢管',
    heatLossCoefficient: 0.07,
    status: 'normal',
    createTime: '2022-05-15'
  },
  {
    id: 'pl003',
    name: '三号主干线',
    startPoint: '第二热源厂',
    endPoint: '翠湖天地换热站',
    diameter: 700,
    length: 4.2,
    designPressure: 1.6,
    material: '聚氨酯保温钢管',
    heatLossCoefficient: 0.09,
    status: 'maintenance',
    createTime: '2022-04-20'
  },
  {
    id: 'pl004',
    name: '四号主干线',
    startPoint: '第二热源厂',
    endPoint: '金色家园换热站',
    diameter: 600,
    length: 3.8,
    designPressure: 1.6,
    material: '聚氨酯保温钢管',
    heatLossCoefficient: 0.08,
    status: 'normal',
    createTime: '2022-05-01'
  },
  {
    id: 'pl005',
    name: '五号主干线',
    startPoint: '第三热源厂',
    endPoint: '锦绣园换热站',
    diameter: 500,
    length: 2.5,
    designPressure: 1.6,
    material: '聚氨酯保温钢管',
    heatLossCoefficient: 0.07,
    status: 'normal',
    createTime: '2023-04-10'
  },
  {
    id: 'pl006',
    name: '东区分支线',
    startPoint: '阳光花园换热站',
    endPoint: '滨河小区换热站',
    diameter: 300,
    length: 1.8,
    designPressure: 1.0,
    material: '聚氨酯保温钢管',
    heatLossCoefficient: 0.1,
    status: 'normal',
    createTime: '2022-06-10'
  }
]

const schedulePlans: SchedulePlan[] = [
  {
    id: 'sc001',
    date: '2026-01-15',
    status: 'published',
    weatherForecast: {
      date: '2026-01-15',
      temperature: -5,
      minTemp: -10,
      maxTemp: -2,
      weather: '晴',
      windSpeed: 3,
      humidity: 45
    },
    heatLoadPrediction: 680,
    stations: [
      { stationId: 'st001', stationName: '阳光花园换热站', primaryFlow: 125, secondarySupplyTemp: 68, valveOpening: 85 },
      { stationId: 'st002', stationName: '幸福里换热站', primaryFlow: 100, secondarySupplyTemp: 66, valveOpening: 82 },
      { stationId: 'st003', stationName: '翠湖天地换热站', primaryFlow: 165, secondarySupplyTemp: 67, valveOpening: 88 },
      { stationId: 'st004', stationName: '金色家园换热站', primaryFlow: 150, secondarySupplyTemp: 69, valveOpening: 90 },
      { stationId: 'st005', stationName: '锦绣园换热站', primaryFlow: 85, secondarySupplyTemp: 65, valveOpening: 80 },
      { stationId: 'st006', stationName: '滨河小区换热站', primaryFlow: 78, secondarySupplyTemp: 67, valveOpening: 83 },
      { stationId: 'st008', stationName: '盛世华庭换热站', primaryFlow: 72, secondarySupplyTemp: 70, valveOpening: 86 }
    ],
    createTime: '2026-01-14 10:30:00',
    createBy: '调度员张三',
    approveBy: '李总工',
    approveTime: '2026-01-14 15:00:00',
    approveOpinion: '方案合理，同意执行'
  },
  {
    id: 'sc002',
    date: '2026-01-16',
    status: 'approved',
    weatherForecast: {
      date: '2026-01-16',
      temperature: -3,
      minTemp: -8,
      maxTemp: 1,
      weather: '多云',
      windSpeed: 2,
      humidity: 52
    },
    heatLoadPrediction: 650,
    stations: [
      { stationId: 'st001', stationName: '阳光花园换热站', primaryFlow: 120, secondarySupplyTemp: 66, valveOpening: 82 },
      { stationId: 'st002', stationName: '幸福里换热站', primaryFlow: 95, secondarySupplyTemp: 64, valveOpening: 78 },
      { stationId: 'st003', stationName: '翠湖天地换热站', primaryFlow: 160, secondarySupplyTemp: 65, valveOpening: 85 },
      { stationId: 'st004', stationName: '金色家园换热站', primaryFlow: 145, secondarySupplyTemp: 67, valveOpening: 87 },
      { stationId: 'st005', stationName: '锦绣园换热站', primaryFlow: 80, secondarySupplyTemp: 63, valveOpening: 76 },
      { stationId: 'st006', stationName: '滨河小区换热站', primaryFlow: 73, secondarySupplyTemp: 65, valveOpening: 80 },
      { stationId: 'st008', stationName: '盛世华庭换热站', primaryFlow: 68, secondarySupplyTemp: 68, valveOpening: 82 }
    ],
    createTime: '2026-01-15 10:00:00',
    createBy: '调度员张三',
    approveBy: '李总工',
    approveTime: '2026-01-15 14:30:00',
    approveOpinion: '同意'
  },
  {
    id: 'sc003',
    date: '2026-01-17',
    status: 'pending',
    weatherForecast: {
      date: '2026-01-17',
      temperature: -8,
      minTemp: -15,
      maxTemp: -5,
      weather: '小雪',
      windSpeed: 5,
      humidity: 68
    },
    heatLoadPrediction: 750,
    stations: [
      { stationId: 'st001', stationName: '阳光花园换热站', primaryFlow: 135, secondarySupplyTemp: 72, valveOpening: 92 },
      { stationId: 'st002', stationName: '幸福里换热站', primaryFlow: 110, secondarySupplyTemp: 70, valveOpening: 88 },
      { stationId: 'st003', stationName: '翠湖天地换热站', primaryFlow: 180, secondarySupplyTemp: 71, valveOpening: 95 },
      { stationId: 'st004', stationName: '金色家园换热站', primaryFlow: 160, secondarySupplyTemp: 73, valveOpening: 96 },
      { stationId: 'st005', stationName: '锦绣园换热站', primaryFlow: 95, secondarySupplyTemp: 69, valveOpening: 86 },
      { stationId: 'st006', stationName: '滨河小区换热站', primaryFlow: 85, secondarySupplyTemp: 71, valveOpening: 90 },
      { stationId: 'st008', stationName: '盛世华庭换热站', primaryFlow: 80, secondarySupplyTemp: 74, valveOpening: 93 }
    ],
    createTime: '2026-01-16 09:30:00',
    createBy: '调度员李四'
  }
]

const alarmRecords: AlarmRecord[] = [
  {
    id: 'al001',
    stationId: 'st004',
    stationName: '金色家园换热站',
    type: 'temperature',
    level: 'alarm',
    message: '二次网供水温度超高',
    value: 82,
    threshold: 75,
    timestamp: '2026-01-15 08:45:23',
    status: 'processed',
    confirmBy: '值班员王五',
    confirmTime: '2026-01-15 08:50:00'
  },
  {
    id: 'al002',
    stationId: 'st003',
    stationName: '翠湖天地换热站',
    type: 'pressure',
    level: 'warning',
    message: '一次网供水压力偏低',
    value: 0.45,
    threshold: 0.5,
    timestamp: '2026-01-15 09:20:15',
    status: 'confirmed',
    confirmBy: '值班员赵六',
    confirmTime: '2026-01-15 09:25:00'
  },
  {
    id: 'al003',
    stationId: 'st004',
    stationName: '金色家园换热站',
    type: 'equipment',
    level: 'critical',
    message: '循环泵振动超标',
    value: 8.5,
    threshold: 4.5,
    timestamp: '2026-01-15 10:15:42',
    status: 'pending'
  },
  {
    id: 'al004',
    stationId: 'st007',
    stationName: '学府花园换热站',
    type: 'flow',
    level: 'alarm',
    message: '通讯中断，数据异常',
    value: 0,
    threshold: 50,
    timestamp: '2026-01-15 07:30:00',
    status: 'confirmed',
    confirmBy: '值班员王五',
    confirmTime: '2026-01-15 07:35:00'
  }
]

const maintenanceOrders: MaintenanceOrder[] = [
  {
    id: 'mo001',
    equipmentId: 'eq004',
    equipmentName: '电动调节阀',
    stationId: 'st001',
    stationName: '阳光花园换热站',
    type: 'scheduled',
    priority: 'medium',
    status: 'completed',
    assignee: '张师傅',
    team: '维修一班',
    createTime: '2026-01-10 08:00:00',
    startTime: '2026-01-10 09:00:00',
    endTime: '2026-01-10 11:30:00',
    description: '定期维护保养，检查阀门执行机构，润滑传动部件',
    sparePartsUsed: [
      { partId: 'sp001', partName: '循环泵轴承', quantity: 0 },
      { partId: 'sp005', partName: '密封圈', quantity: 2 }
    ]
  },
  {
    id: 'mo002',
    equipmentId: 'eq004',
    equipmentName: '电动调节阀',
    stationId: 'st004',
    stationName: '金色家园换热站',
    type: 'fault',
    priority: 'urgent',
    status: 'processing',
    assignee: '李师傅',
    team: '维修二班',
    createTime: '2026-01-15 10:20:00',
    startTime: '2026-01-15 10:45:00',
    description: '阀门开度反馈异常，无法正常调节，需紧急处理',
    sparePartsUsed: [
      { partId: 'sp002', partName: '电动阀门', quantity: 1 }
    ]
  },
  {
    id: 'mo003',
    equipmentId: 'eq002',
    equipmentName: '二次网循环泵',
    stationId: 'st002',
    stationName: '幸福里换热站',
    type: 'scheduled',
    priority: 'low',
    status: 'pending',
    team: '维修一班',
    createTime: '2026-01-14 16:00:00',
    description: '运行时长达到维护周期，需进行轴承检查和更换润滑油',
    sparePartsUsed: []
  },
  {
    id: 'mo004',
    equipmentId: 'eq003',
    equipmentName: '板式换热器',
    stationId: 'st003',
    stationName: '翠湖天地换热站',
    type: 'complaint',
    priority: 'high',
    status: 'assigned',
    assignee: '王师傅',
    team: '维修一班',
    createTime: '2026-01-15 09:00:00',
    assignTime: '2026-01-15 09:15:00',
    description: '用户反映温度不达标，检查换热器是否结垢，换热效率下降',
    sparePartsUsed: []
  }
]

const userComplaints: UserComplaint[] = [
  {
    id: 'uc001',
    userInfo: { name: '王先生', phone: '138****1234', address: '翠湖天地A区5号楼3单元102' },
    type: 'temperature',
    status: 'resolved',
    priority: 'high',
    description: '家里温度只有16度，达不到标准的18度，希望尽快处理',
    assignee: '张师傅',
    createTime: '2026-01-15 08:30:00',
    assignTime: '2026-01-15 08:45:00',
    resolveTime: '2026-01-15 11:20:00',
    isEscalated: false,
    feedback: '已检查过滤网，清洗后温度恢复正常'
  },
  {
    id: 'uc002',
    userInfo: { name: '李女士', phone: '139****5678', address: '金色家园二期8号楼2单元1501' },
    type: 'leakage',
    status: 'processing',
    priority: 'urgent',
    description: '楼道里暖气管漏水，已经流到电梯间了',
    assignee: '李师傅',
    createTime: '2026-01-15 10:05:00',
    assignTime: '2026-01-15 10:10:00',
    isEscalated: false
  },
  {
    id: 'uc003',
    userInfo: { name: '赵先生', phone: '136****9012', address: '阳光花园小区7号楼1单元501' },
    type: 'noise',
    status: 'pending',
    priority: 'medium',
    description: '晚上换热站噪音太大，影响休息',
    createTime: '2026-01-15 07:50:00',
    isEscalated: true,
    escalateTime: '2026-01-15 10:00:00'
  },
  {
    id: 'uc004',
    userInfo: { name: '刘阿姨', phone: '135****3456', address: '幸福里社区3号楼4单元203' },
    type: 'temperature',
    status: 'assigned',
    priority: 'medium',
    description: '卧室温度偏低，只有17度，老人孩子受不了',
    assignee: '王师傅',
    createTime: '2026-01-15 09:30:00',
    assignTime: '2026-01-15 09:40:00',
    isEscalated: false
  }
]

const billingRecords: BillingRecord[] = [
  {
    id: 'br001',
    userId: 'u001',
    userName: '王先生',
    address: '翠湖天地A区5号楼3单元102',
    heatingArea: 120,
    period: '2025-2026',
    heatConsumption: 14400,
    unitPrice: 5.8,
    totalAmount: 83520,
    paidAmount: 83520,
    status: 'paid',
    createTime: '2025-10-15 09:00:00',
    dueDate: '2025-12-31',
    remindCount: 0
  },
  {
    id: 'br002',
    userId: 'u002',
    userName: '李女士',
    address: '金色家园二期8号楼2单元1501',
    heatingArea: 95,
    period: '2025-2026',
    heatConsumption: 11400,
    unitPrice: 5.8,
    totalAmount: 66120,
    paidAmount: 33060,
    status: 'partial',
    createTime: '2025-10-15 09:00:00',
    dueDate: '2025-12-31',
    remindCount: 2
  },
  {
    id: 'br003',
    userId: 'u003',
    userName: '赵先生',
    address: '阳光花园小区7号楼1单元501',
    heatingArea: 110,
    period: '2025-2026',
    heatConsumption: 13200,
    unitPrice: 5.8,
    totalAmount: 76560,
    paidAmount: 0,
    status: 'unpaid',
    createTime: '2025-10-15 09:00:00',
    dueDate: '2025-12-31',
    remindCount: 3
  },
  {
    id: 'br004',
    userId: 'u004',
    userName: '刘阿姨',
    address: '幸福里社区3号楼4单元203',
    heatingArea: 85,
    period: '2025-2026',
    heatConsumption: 10200,
    unitPrice: 5.8,
    totalAmount: 59160,
    paidAmount: 59160,
    status: 'paid',
    createTime: '2025-10-15 09:00:00',
    dueDate: '2025-12-31',
    remindCount: 0
  },
  {
    id: 'br005',
    userId: 'u005',
    userName: '孙先生',
    address: '锦绣园小区2号楼3单元302',
    heatingArea: 100,
    period: '2025-2026',
    heatConsumption: 12000,
    unitPrice: 5.8,
    totalAmount: 69600,
    paidAmount: 0,
    status: 'unpaid',
    createTime: '2025-10-15 09:00:00',
    dueDate: '2025-12-31',
    remindCount: 4
  }
]

const users: User[] = [
  { id: 'admin', username: 'admin', name: '系统管理员', role: 'admin', phone: '138****0001' },
  { id: 'chief', username: 'chief', name: '李总工', role: 'chief', phone: '138****0002' },
  { id: 'op1', username: 'operator1', name: '调度员张三', role: 'operator', phone: '138****0003' },
  { id: 'op2', username: 'operator2', name: '调度员李四', role: 'operator', phone: '138****0004' },
  { id: 'eng1', username: 'engineer1', name: '值班员王五', role: 'engineer', phone: '138****0005' },
  { id: 'eng2', username: 'engineer2', name: '值班员赵六', role: 'engineer', phone: '138****0006' },
  { id: 'mt1', username: 'maint1', name: '张师傅', role: 'maintenance', phone: '138****0007' },
  { id: 'mt2', username: 'maint2', name: '李师傅', role: 'maintenance', phone: '138****0008' }
]

export const mockData = {
  spareParts,
  equipmentList,
  heatSources,
  heatExchangeStations,
  pipelines,
  schedulePlans,
  alarmRecords,
  maintenanceOrders,
  userComplaints,
  billingRecords,
  users,
  generateId
}
