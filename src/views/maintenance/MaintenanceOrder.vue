<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>维保工单</span>
          <div class="header-actions">
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 150px; margin-right: 10px">
              <el-option label="待分配" value="pending" />
              <el-option label="已派单" value="assigned" />
              <el-option label="处理中" value="processing" />
              <el-option label="已完成" value="completed" />
            </el-select>
            <el-button type="primary" @click="openCreateDialog">
              <el-icon><Plus /></el-icon>
              新建工单
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredOrders" border>
        <el-table-column prop="id" label="工单号" width="120" />
        <el-table-column prop="stationName" label="所属换热站" width="140" />
        <el-table-column prop="equipmentName" label="设备名称" width="140" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'fault' ? 'danger' : row.type === 'complaint' ? 'warning' : 'info'" size="small">
              {{ getOrderTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90">
          <template #default="{ row }">
            <el-tag :type="priorityTagType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="故障描述" show-overflow-tooltip />
        <el-table-column prop="team" label="维修班组" width="100" />
        <el-table-column prop="assignee" label="负责人" width="90" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="openAssignDialog(row)">派单</el-button>
            <el-button v-if="row.status === 'assigned' || row.status === 'processing'" type="warning" link size="small" @click="startWork(row)">
              {{ row.status === 'assigned' ? '开始处理' : '完成工单' }}
            </el-button>
            <el-button type="danger" link size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="assignVisible" title="工单派单" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="维修班组">
          <el-select v-model="assignForm.team" style="width: 100%">
            <el-option label="维修一班" value="维修一班" />
            <el-option label="维修二班" value="维修二班" />
            <el-option label="维修三班" value="维修三班" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="assignForm.assignee" style="width: 100%">
            <el-option label="张师傅" value="张师傅" />
            <el-option label="李师傅" value="李师傅" />
            <el-option label="王师傅" value="王师傅" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认派单</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="工单详情" width="700px">
      <div v-if="currentOrder">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="工单号">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="所属换热站">{{ currentOrder.stationName }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentOrder.equipmentName }}</el-descriptions-item>
          <el-descriptions-item label="工单类型">{{ getOrderTypeText(currentOrder.type) }}</el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="priorityTagType(currentOrder.priority)" size="small">
              {{ getPriorityText(currentOrder.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(currentOrder.status)" size="small">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="维修班组">{{ currentOrder.team || '-' }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentOrder.assignee || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ currentOrder.endTime || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-divider content-position="left">故障描述</el-divider>
        <p>{{ currentOrder.description }}</p>
        <el-divider content-position="left">使用备件</el-divider>
        <el-table :data="currentOrder.sparePartsUsed" size="small" border>
          <el-table-column prop="partName" label="备件名称" />
          <el-table-column prop="quantity" label="使用数量" width="100" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { MaintenanceOrder } from '@/types'
import { getStatusText, getPriorityText } from '@/utils'
import { Plus } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const statusFilter = ref('')
const assignVisible = ref(false)
const detailVisible = ref(false)
const currentOrder = ref<MaintenanceOrder | null>(null)
const currentOrderId = ref('')
const assignForm = reactive({ team: '', assignee: '' })

const filteredOrders = computed(() => {
  if (!statusFilter.value) return dataStore.maintenanceOrders
  return dataStore.maintenanceOrders.filter(o => o.status === statusFilter.value)
})

const getOrderTypeText = (type: string) => {
  const map: Record<string, string> = { scheduled: '定期维保', fault: '故障维修', complaint: '投诉处理' }
  return map[type] || type
}

const priorityTagType = (priority: string) => {
  const map: Record<string, any> = { low: 'info', medium: '', high: 'warning', urgent: 'danger' }
  return map[priority] || ''
}

const statusTagType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    assigned: 'warning',
    processing: 'primary',
    completed: 'success'
  }
  return map[status] || 'info'
}

const openCreateDialog = () => {
  ElMessage.info('新建工单功能开发中...')
}

const viewDetail = (row: MaintenanceOrder) => {
  currentOrder.value = row
  detailVisible.value = true
}

const openAssignDialog = (row: MaintenanceOrder) => {
  currentOrderId.value = row.id
  assignForm.team = ''
  assignForm.assignee = ''
  assignVisible.value = true
}

const confirmAssign = () => {
  if (!assignForm.team || !assignForm.assignee) {
    ElMessage.warning('请选择维修班组和负责人')
    return
  }
  dataStore.updateMaintenanceOrder(currentOrderId.value, {
    status: 'assigned',
    team: assignForm.team,
    assignee: assignForm.assignee,
    assignTime: new Date().toLocaleString()
  })
  ElMessage.success('派单成功')
  assignVisible.value = false
}

const startWork = (row: MaintenanceOrder) => {
  if (row.status === 'assigned') {
    dataStore.updateMaintenanceOrder(row.id, {
      status: 'processing',
      startTime: new Date().toLocaleString()
    })
    ElMessage.success('已开始处理')
  } else {
    dataStore.updateMaintenanceOrder(row.id, {
      status: 'completed',
      endTime: new Date().toLocaleString()
    })
    
    if (row.sparePartsUsed && row.sparePartsUsed.length > 0) {
      row.sparePartsUsed.forEach(part => {
        if (part.quantity > 0) {
          const sparePart = dataStore.spareParts.find(sp => sp.id === part.partId)
          if (sparePart) {
            const newQuantity = Math.max(0, sparePart.quantity - part.quantity)
            dataStore.updateSparePart(part.partId, { quantity: newQuantity })
          }
        }
      })
      ElMessage.success('工单已完成，备件库存已扣减')
    } else {
      ElMessage.success('工单已完成')
    }
  }
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
}
</style>
