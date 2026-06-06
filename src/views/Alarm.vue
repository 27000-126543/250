<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报警管理</span>
          <div class="header-actions">
            <el-radio-group v-model="statusFilter" size="small">
              <el-radio-button value="">全部</el-radio-button>
              <el-radio-button value="pending">待处理</el-radio-button>
              <el-radio-button value="confirmed">已确认</el-radio-button>
              <el-radio-button value="processed">已处理</el-radio-button>
            </el-radio-group>
            <el-button type="danger" @click="testAlarm" :disabled="sounding">
              <el-icon><Warning /></el-icon>
              {{ sounding ? '停止报警' : '模拟报警' }}
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="sounding" class="alarm-banner">
        <el-icon class="alarm-icon" :size="24"><Bell /></el-icon>
        <span>当前有 {{ pendingCount }} 条报警未处理！请注意查看。</span>
        <el-button type="danger" size="small" @click="sounding = false">关闭提示</el-button>
      </div>

      <el-table :data="filteredAlarms" border>
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="报警类型">{{ getAlarmTypeText(row.type) }}</el-descriptions-item>
              <el-descriptions-item label="报警级别">
                <el-tag :type="alarmTagType(row.level)" size="small">
                  {{ getAlarmLevelText(row.level) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="当前值">{{ row.value }}</el-descriptions-item>
              <el-descriptions-item label="阈值">{{ row.threshold }}</el-descriptions-item>
              <el-descriptions-item label="报警时间">{{ row.timestamp }}</el-descriptions-item>
              <el-descriptions-item label="确认人">{{ row.confirmBy || '-' }}</el-descriptions-item>
            </el-descriptions>
          </template>
        </el-table-column>
        <el-table-column label="级别" width="80">
          <template #default="{ row }">
            <el-icon :size="20" :color="alarmLevelColor(row.level)">
              <CircleClose v-if="row.level === 'critical'" />
              <Warning v-else-if="row.level === 'alarm'" />
              <Info v-else />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="stationName" label="换热站" width="150" />
        <el-table-column prop="message" label="报警内容" />
        <el-table-column prop="timestamp" label="报警时间" width="170" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'pending' ? 'danger' : row.status === 'confirmed' ? 'warning' : 'success'" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="primary" link size="small" @click="confirmAlarm(row)">确认报警</el-button>
            <el-button v-if="row.status === 'confirmed'" type="success" link size="small" @click="processAlarm(row)">标记处理</el-button>
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { AlarmRecord } from '@/types'
import { getStatusText, getAlarmLevelText } from '@/utils'
import { Warning, Bell, CircleClose, Info } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const statusFilter = ref('')
const sounding = ref(false)

const pendingCount = computed(() => 
  dataStore.alarmRecords.filter(a => a.status === 'pending').length
)

const filteredAlarms = computed(() => {
  if (!statusFilter.value) return dataStore.alarmRecords
  return dataStore.alarmRecords.filter(a => a.status === statusFilter.value)
})

const alarmTagType = (level: string) => {
  const map: Record<string, any> = { warning: 'warning', alarm: 'danger', critical: 'danger' }
  return map[level] || 'info'
}

const alarmLevelColor = (level: string) => {
  const map: Record<string, string> = { warning: '#e6a23c', alarm: '#f56c6c', critical: '#f56c6c' }
  return map[level] || '#909399'
}

const getAlarmTypeText = (type: string) => {
  const map: Record<string, string> = {
    temperature: '温度异常',
    pressure: '压力异常',
    flow: '流量异常',
    equipment: '设备故障'
  }
  return map[type] || type
}

const confirmAlarm = (row: AlarmRecord) => {
  ElMessageBox.confirm('确认收到该报警信息？', '确认报警', { type: 'warning' }).then(() => {
    dataStore.updateAlarm(row.id, {
      status: 'confirmed',
      confirmBy: dataStore.currentUser?.name || '值班员',
      confirmTime: new Date().toLocaleString()
    })
    ElMessage.success('报警已确认')
  }).catch(() => {})
}

const processAlarm = (row: AlarmRecord) => {
  ElMessageBox.confirm('确认该报警已处理完成？', '处理完成', { type: 'success' }).then(() => {
    dataStore.updateAlarm(row.id, { status: 'processed' })
    ElMessage.success('报警已处理')
  }).catch(() => {})
}

const viewDetail = (row: AlarmRecord) => {
  ElMessageBox.alert(
    `换热站：${row.stationName}\n报警内容：${row.message}\n报警值：${row.value}\n阈值：${row.threshold}\n报警时间：${row.timestamp}`,
    '报警详情'
  )
}

const testAlarm = () => {
  if (sounding.value) {
    sounding.value = false
    ElMessage.info('已停止报警提示')
    return
  }
  
  const newAlarm: AlarmRecord = {
    id: 'al' + Date.now(),
    stationId: 'st001',
    stationName: '阳光花园换热站',
    type: 'temperature',
    level: 'alarm',
    message: '二次网供水温度超高',
    value: 78.5,
    threshold: 75,
    timestamp: new Date().toLocaleString(),
    status: 'pending'
  }
  
  dataStore.addAlarm(newAlarm)
  sounding.value = true
  ElMessage.warning('新报警：阳光花园换热站 - 二次网供水温度超高')
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

.alarm-banner {
  background: linear-gradient(90deg, #fef0f0, #fef0f0);
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  padding: 12px 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: pulse 2s infinite;
}

.alarm-icon {
  color: #f56c6c;
  animation: ring 1s infinite;
}

@keyframes pulse {
  0%, 100% { background-color: #fef0f0; }
  50% { background-color: #fde2e2; }
}

@keyframes ring {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}
</style>
