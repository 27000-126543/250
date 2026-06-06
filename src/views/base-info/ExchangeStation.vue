<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>换热站管理</span>
          <div class="header-actions">
            <el-select v-model="areaFilter" placeholder="选择区域" clearable style="width: 150px; margin-right: 10px">
              <el-option label="全部区域" value="" />
              <el-option label="城东区" value="城东区" />
              <el-option label="城西区" value="城西区" />
              <el-option label="南区" value="南区" />
            </el-select>
            <el-button type="primary" @click="openAddDialog">
              <el-icon><Plus /></el-icon>
              新增换热站
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredStations" border>
        <el-table-column prop="name" label="换热站名称" width="160" />
        <el-table-column prop="area" label="所属区域" width="100" />
        <el-table-column prop="address" label="地址" width="200" />
        <el-table-column prop="heatSourceName" label="所属热源厂" width="130" />
        <el-table-column prop="heatingArea" label="供热面积(㎡)" width="130" />
        <el-table-column prop="designPressure" label="设计压力(MPa)" width="130" />
        <el-table-column prop="secondarySupplyTemp" label="供水温度(℃)" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="stationTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑换热站' : '新增换热站'" width="750px">
      <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="换热站名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入换热站名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属区域" prop="area">
              <el-select v-model="formData.area" style="width: 100%">
                <el-option label="城东区" value="城东区" />
                <el-option label="城西区" value="城西区" />
                <el-option label="南区" value="南区" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属热源厂" prop="heatSourceId">
              <el-select v-model="formData.heatSourceId" style="width: 100%" @change="onHeatSourceChange">
                <el-option
                  v-for="hs in dataStore.heatSources"
                  :key="hs.id"
                  :label="hs.name"
                  :value="hs.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供热面积(㎡)" prop="heatingArea">
              <el-input-number v-model="formData.heatingArea" :min="0" :max="1000000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设计压力(MPa)" prop="designPressure">
              <el-input-number v-model="formData.designPressure" :min="0" :max="5" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="一次网流量(t/h)">
              <el-input-number v-model="formData.primaryFlow" :min="0" :max="300" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="供水温度(℃)">
              <el-input-number v-model="formData.secondarySupplyTemp" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="回水温度(℃)">
              <el-input-number v-model="formData.secondaryReturnTemp" :min="0" :max="80" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备清单">
              <el-button type="primary" link size="small">
                管理设备 ({{ formData.equipmentList.length }})
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运行状态">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option label="正常" value="normal" />
                <el-option label="预警" value="warning" />
                <el-option label="告警" value="alarm" />
                <el-option label="离线" value="offline" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { HeatExchangeStation } from '@/types'
import { mockData } from '@/mock/data'
import { getStatusText } from '@/utils'
import { Plus } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentId = ref('')
const areaFilter = ref('')

const filteredStations = computed(() => {
  if (!areaFilter.value) return dataStore.heatExchangeStations
  return dataStore.heatExchangeStations.filter(s => s.area === areaFilter.value)
})

const stationTagType = (status: string) => {
  const map: Record<string, any> = { normal: 'success', warning: 'warning', alarm: 'danger', offline: 'info' }
  return map[status] || 'info'
}

const defaultForm = (): HeatExchangeStation => ({
  id: '',
  name: '',
  area: '城东区',
  address: '',
  heatSourceId: dataStore.heatSources[0]?.id || '',
  heatSourceName: dataStore.heatSources[0]?.name || '',
  heatingArea: 0,
  designPressure: 1.0,
  primaryFlow: 100,
  secondarySupplyTemp: 60,
  secondaryReturnTemp: 40,
  supplyPressure: 0.6,
  returnPressure: 0.4,
  operatingHours: 0,
  status: 'normal',
  equipmentList: [...mockData.equipmentList],
  position: { x: 300, y: 250 },
  createTime: new Date().toISOString().split('T')[0]
})

const formData = reactive<HeatExchangeStation>(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入换热站名称', trigger: 'blur' }],
  area: [{ required: true, message: '请选择所属区域', trigger: 'change' }],
  heatSourceId: [{ required: true, message: '请选择所属热源厂', trigger: 'change' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  heatingArea: [{ required: true, message: '请输入供热面积', trigger: 'blur' }]
}

const onHeatSourceChange = (val: string) => {
  const hs = dataStore.heatSources.find(h => h.id === val)
  if (hs) {
    formData.heatSourceName = hs.name
  }
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(formData, defaultForm())
  dialogVisible.value = true
}

const openEditDialog = (row: HeatExchangeStation) => {
  isEdit.value = true
  currentId.value = row.id
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const viewDetail = (row: HeatExchangeStation) => {
  ElMessageBox.alert(
    `换热站名称：${row.name}\n所属区域：${row.area}\n地址：${row.address}\n供热面积：${row.heatingArea}㎡\n所属热源厂：${row.heatSourceName}`,
    '换热站详情'
  )
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        dataStore.updateStation(currentId.value, formData)
        ElMessage.success('更新成功')
      } else {
        dataStore.addStation({ ...formData, id: mockData.generateId() })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row: HeatExchangeStation) => {
  ElMessageBox.confirm('确定要删除该换热站吗？', '提示', { type: 'warning' }).then(() => {
    dataStore.deleteStation(row.id)
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

.header-actions {
  display: flex;
  align-items: center;
}
</style>
