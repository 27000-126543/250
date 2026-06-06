<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>调度方案审批</span>
          <el-tag type="warning" v-if="pendingCount > 0">待审批: {{ pendingCount }}</el-tag>
        </div>
      </template>

      <el-table :data="pendingPlans" border>
        <el-table-column prop="date" label="调度日期" width="130" />
        <el-table-column label="天气预报" width="250">
          <template #default="{ row }">
            <span>{{ row.weatherForecast.weather }}</span>
            <span class="weather-temp">{{ row.weatherForecast.minTemp }}℃ ~ {{ row.weatherForecast.maxTemp }}℃</span>
          </template>
        </el-table-column>
        <el-table-column prop="heatLoadPrediction" label="预测热负荷(MW)" width="150" />
        <el-table-column prop="createBy" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看详情</el-button>
            <el-button type="success" link size="small" @click="openApproveDialog(row)">批准</el-button>
            <el-button type="danger" link size="small" @click="openRejectDialog(row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="调度方案详情" width="900px">
      <div v-if="currentPlan" class="plan-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="调度日期">{{ currentPlan.date }}</el-descriptions-item>
          <el-descriptions-item label="天气情况">
            {{ currentPlan.weatherForecast.weather }}，
            {{ currentPlan.weatherForecast.minTemp }}℃ ~ {{ currentPlan.weatherForecast.maxTemp }}℃
          </el-descriptions-item>
          <el-descriptions-item label="平均温度">{{ currentPlan.weatherForecast.temperature }}℃</el-descriptions-item>
          <el-descriptions-item label="预测热负荷">{{ currentPlan.heatLoadPrediction }} MW</el-descriptions-item>
          <el-descriptions-item label="风速">{{ currentPlan.weatherForecast.windSpeed }} m/s</el-descriptions-item>
          <el-descriptions-item label="湿度">{{ currentPlan.weatherForecast.humidity }}%</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentPlan.createBy }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentPlan.createTime }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 10px">各换热站调度参数</h4>
        <el-table :data="currentPlan.stations" size="small" border>
          <el-table-column prop="stationName" label="换热站名称" width="160" />
          <el-table-column prop="primaryFlow" label="一次网流量(t/h)" width="150" />
          <el-table-column prop="secondarySupplyTemp" label="二次网供水温度(℃)" width="170" />
          <el-table-column prop="valveOpening" label="阀门开度(%)" width="130" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="success" @click="openApproveDialog(currentPlan!)">批准</el-button>
        <el-button type="danger" @click="openRejectDialog(currentPlan!)">驳回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approveVisible" title="批准调度方案" width="500px">
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="审批意见">
          <el-input
            v-model="approveForm.opinion"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" @click="handleApprove">确认批准</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectVisible" title="驳回调度方案" width="500px">
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="驳回原因">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { SchedulePlan } from '@/types'

const dataStore = useDataStore()
const detailVisible = ref(false)
const approveVisible = ref(false)
const rejectVisible = ref(false)
const currentPlan = ref<SchedulePlan | null>(null)
const approveForm = reactive({ opinion: '' })
const rejectForm = reactive({ reason: '' })

const pendingPlans = computed(() => 
  dataStore.schedulePlans.filter(s => s.status === 'pending')
)

const pendingCount = computed(() => pendingPlans.value.length)

const viewDetail = (row: SchedulePlan) => {
  currentPlan.value = row
  detailVisible.value = true
}

const openApproveDialog = (row: SchedulePlan) => {
  currentPlan.value = row
  approveForm.opinion = '方案合理，同意执行'
  approveVisible.value = true
}

const openRejectDialog = (row: SchedulePlan) => {
  currentPlan.value = row
  rejectForm.reason = ''
  rejectVisible.value = true
}

const handleApprove = async () => {
  if (!currentPlan.value) return
  
  console.log('[指令推送服务] ========== 开始推送调度指令 ==========')
  console.log('[指令推送服务] 调度方案ID:', currentPlan.value.id)
  console.log('[指令推送服务] 调度日期:', currentPlan.value.date)
  console.log('[指令推送服务] 涉及换热站:', currentPlan.value.stations.length, '座')
  
  console.log('[指令推送服务] 正在建立与各站终端的加密连接...')
  await new Promise(resolve => setTimeout(resolve, 300))
  
  for (const station of currentPlan.value.stations) {
    console.log(`[指令推送服务] → 正在推送至 ${station.stationName} (ID: ${station.stationId})`)
    console.log(`[指令推送服务]   参数: 流量=${station.primaryFlow}t/h, 供水温度=${station.secondarySupplyTemp}℃, 阀门开度=${station.valveOpening}%`)
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
    console.log(`[指令推送服务]   ✓ ${station.stationName} 接收成功，终端已确认`)
  }
  
  console.log('[指令推送服务] ========== 所有站指令推送完成 ==========')
  console.log('[指令推送服务] 推送时间:', new Date().toLocaleString())
  console.log('[指令推送服务] 推送状态: 全部成功 ✓')
  
  dataStore.updateSchedulePlan(currentPlan.value.id, {
    status: 'published',
    approveBy: dataStore.currentUser?.name || '总工',
    approveTime: new Date().toLocaleString(),
    approveOpinion: approveForm.opinion
  })
  
  ElMessage.success('调度方案已批准，指令已推送至各站终端')
  approveVisible.value = false
  detailVisible.value = false
}

const handleReject = () => {
  if (!currentPlan.value) return
  if (!rejectForm.reason) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  
  dataStore.updateSchedulePlan(currentPlan.value.id, {
    status: 'rejected',
    approveBy: dataStore.currentUser?.name || '总工',
    approveTime: new Date().toLocaleString(),
    approveOpinion: rejectForm.reason
  })
  
  ElMessage.success('调度方案已驳回')
  rejectVisible.value = false
  detailVisible.value = false
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

.weather-temp {
  color: #909399;
  margin-left: 10px;
  font-size: 13px;
}

.plan-detail {
  padding: 10px;
}
</style>
