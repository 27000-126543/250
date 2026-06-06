<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户投诉处理</span>
          <el-tag v-if="escalatedCount > 0" type="danger">
            已升级: {{ escalatedCount }}
          </el-tag>
        </div>
      </template>

      <el-table :data="dataStore.userComplaints" border>
        <el-table-column prop="id" label="投诉编号" width="120" />
        <el-table-column label="用户信息" width="250">
          <template #default="{ row }">
            <div>
              <div>{{ row.userInfo.name }} ({{ row.userInfo.phone }})</div>
              <div style="font-size: 12px; color: #909399">{{ row.userInfo.address }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="投诉类型" width="110">
          <template #default="{ row }">
            <el-tag size="small">{{ getComplaintTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90">
          <template #default="{ row }">
            <el-tag :type="priorityTagType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="投诉内容" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <div class="status-wrapper">
              <el-tag :type="statusTagType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
              <el-tag v-if="row.isEscalated" type="danger" size="small" effect="plain">已升级</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="assignee" label="处理人" width="90" />
        <el-table-column prop="createTime" label="投诉时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="openAssignDialog(row)">派单</el-button>
            <el-button v-if="row.status === 'assigned' || row.status === 'processing'" type="warning" link size="small" @click="resolveComplaint(row)">
              处理完成
            </el-button>
            <el-button v-if="!row.isEscalated && isOverdue(row)" type="danger" link size="small" @click="escalate(row)">
              升级
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="assignVisible" title="投诉派单" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="指派人员">
          <el-select v-model="assignForm.assignee" style="width: 100%">
            <el-option label="张师傅" value="张师傅" />
            <el-option label="李师傅" value="李师傅" />
            <el-option label="王师傅" value="王师傅" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计到达时间">
          <el-date-picker
            v-model="assignForm.arriveTime"
            type="datetime"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认派单</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="投诉详情" width="700px">
      <div v-if="currentComplaint">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="投诉编号">{{ currentComplaint.id }}</el-descriptions-item>
          <el-descriptions-item label="投诉类型">{{ getComplaintTypeText(currentComplaint.type) }}</el-descriptions-item>
          <el-descriptions-item label="用户姓名">{{ currentComplaint.userInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentComplaint.userInfo.phone }}</el-descriptions-item>
          <el-descriptions-item label="用户地址" :span="2">{{ currentComplaint.userInfo.address }}</el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="priorityTagType(currentComplaint.priority)" size="small">
              {{ getPriorityText(currentComplaint.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(currentComplaint.status)" size="small">
              {{ getStatusText(currentComplaint.status) }}
            </el-tag>
            <el-tag v-if="currentComplaint.isEscalated" type="danger" size="small" style="margin-left: 5px">已升级</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人">{{ currentComplaint.assignee || '-' }}</el-descriptions-item>
          <el-descriptions-item label="投诉时间">{{ currentComplaint.createTime }}</el-descriptions-item>
          <el-descriptions-item label="解决时间">{{ currentComplaint.resolveTime || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-divider content-position="left">投诉内容</el-divider>
        <p>{{ currentComplaint.description }}</p>
        <el-divider v-if="currentComplaint.feedback" content-position="left">处理反馈</el-divider>
        <p v-if="currentComplaint.feedback" style="background: #f5f7fa; padding: 10px; border-radius: 4px">
          {{ currentComplaint.feedback }}
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { UserComplaint } from '@/types'
import { getStatusText, getPriorityText, getComplaintTypeText } from '@/utils'

const dataStore = useDataStore()
const assignVisible = ref(false)
const detailVisible = ref(false)
const currentComplaint = ref<UserComplaint | null>(null)
const currentComplaintId = ref('')
const assignForm = reactive({ assignee: '', arriveTime: '' })

const escalatedCount = computed(() => 
  dataStore.userComplaints.filter(c => c.isEscalated).length
)

const priorityTagType = (priority: string) => {
  const map: Record<string, any> = { low: 'info', medium: '', high: 'warning', urgent: 'danger' }
  return map[priority] || ''
}

const statusTagType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    assigned: 'warning',
    processing: 'primary',
    resolved: 'success',
    closed: 'success'
  }
  return map[status] || 'info'
}

const isOverdue = (row: UserComplaint) => {
  const createTime = new Date(row.createTime).getTime()
  const now = Date.now()
  return (now - createTime) > 2 * 60 * 60 * 1000
}

const viewDetail = (row: UserComplaint) => {
  currentComplaint.value = row
  detailVisible.value = true
}

const openAssignDialog = (row: UserComplaint) => {
  currentComplaintId.value = row.id
  assignForm.assignee = ''
  assignVisible.value = true
}

const confirmAssign = () => {
  if (!assignForm.assignee) {
    ElMessage.warning('请选择处理人员')
    return
  }
  dataStore.updateComplaint(currentComplaintId.value, {
    status: 'assigned',
    assignee: assignForm.assignee,
    assignTime: new Date().toLocaleString()
  })
  ElMessage.success('派单成功，已通知维修工')
  assignVisible.value = false
}

const resolveComplaint = (row: UserComplaint) => {
  dataStore.updateComplaint(row.id, {
    status: 'resolved',
    resolveTime: new Date().toLocaleString(),
    feedback: '已上门处理，问题已解决，用户确认满意'
  })
  ElMessage.success('投诉已处理完成')
}

const escalate = (row: UserComplaint) => {
  dataStore.updateComplaint(row.id, {
    isEscalated: true,
    escalateTime: new Date().toLocaleString(),
    priority: 'urgent'
  })
  ElMessage.warning('投诉已升级，将通知上级主管')
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

.status-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
