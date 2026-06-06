<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>调度方案管理</span>
          <el-button type="primary" @click="$router.push('/schedule/generate')">
            <el-icon><Plus /></el-icon>
            生成调度方案
          </el-button>
        </div>
      </template>

      <el-table :data="dataStore.schedulePlans" border>
        <el-table-column prop="date" label="调度日期" width="130" />
        <el-table-column label="天气预报" width="250">
          <template #default="{ row }">
            <span>{{ row.weatherForecast.weather }}</span>
            <span class="weather-temp">{{ row.weatherForecast.minTemp }}℃ ~ {{ row.weatherForecast.maxTemp }}℃</span>
          </template>
        </el-table-column>
        <el-table-column prop="heatLoadPrediction" label="预测热负荷(MW)" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="approveBy" label="审批人" width="100" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看详情</el-button>
            <el-button v-if="row.status === 'draft'" type="primary" link size="small">编辑</el-button>
            <el-button v-if="row.status === 'approved'" type="success" link size="small" @click="publishPlan(row)">发布</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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
          <el-descriptions-item label="创建人">{{ currentPlan.createBy }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentPlan.createTime }}</el-descriptions-item>
          <el-descriptions-item v-if="currentPlan.approveBy" label="审批人">{{ currentPlan.approveBy }}</el-descriptions-item>
          <el-descriptions-item v-if="currentPlan.approveTime" label="审批时间">{{ currentPlan.approveTime }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 10px">各换热站调度参数</h4>
        <el-table :data="currentPlan.stations" size="small" border>
          <el-table-column prop="stationName" label="换热站名称" width="160" />
          <el-table-column prop="primaryFlow" label="一次网流量(t/h)" width="150" />
          <el-table-column prop="secondarySupplyTemp" label="二次网供水温度(℃)" width="170" />
          <el-table-column prop="valveOpening" label="阀门开度(%)" width="130" />
        </el-table>

        <el-alert
          v-if="currentPlan.approveOpinion"
          :title="'审批意见：' + currentPlan.approveOpinion"
          type="info"
          :closable="false"
          style="margin-top: 15px"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { SchedulePlan } from '@/types'
import { getStatusText } from '@/utils'
import { Plus } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const detailVisible = ref(false)
const currentPlan = ref<SchedulePlan | null>(null)

const statusTagType = (status: string) => {
  const map: Record<string, any> = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    published: 'success'
  }
  return map[status] || 'info'
}

const viewDetail = (row: SchedulePlan) => {
  currentPlan.value = row
  detailVisible.value = true
}

const publishPlan = (row: SchedulePlan) => {
  ElMessageBox.confirm('确定要发布该调度方案吗？发布后将推送至各换热站终端。', '提示', { type: 'warning' })
    .then(() => {
      dataStore.updateSchedulePlan(row.id, { status: 'published' })
      ElMessage.success('发布成功，操作指令已推送至各站终端')
    })
    .catch(() => {})
}

const handleDelete = (row: SchedulePlan) => {
  ElMessageBox.confirm('确定要删除该调度方案吗？', '提示', { type: 'warning' }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
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
