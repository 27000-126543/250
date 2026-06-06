<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>热源厂管理</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            新增热源厂
          </el-button>
        </div>
      </template>

      <el-table :data="dataStore.heatSources" border>
        <el-table-column prop="name" label="热源厂名称" width="150" />
        <el-table-column prop="address" label="地址" width="200" />
        <el-table-column prop="heatingCapacity" label="供热能力(MW)" width="130" />
        <el-table-column prop="heatingRadius" label="供热半径(km)" width="120" />
        <el-table-column prop="designPressure" label="设计压力(MPa)" width="130" />
        <el-table-column prop="operatingHours" label="累计运行时长(h)" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'running' ? 'success' : row.status === 'standby' ? 'warning' : 'info'" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑热源厂' : '新增热源厂'" width="700px">
      <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="热源厂名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入热源厂名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供热能力(MW)" prop="heatingCapacity">
              <el-input-number v-model="formData.heatingCapacity" :min="0" :max="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供热半径(km)" prop="heatingRadius">
              <el-input-number v-model="formData.heatingRadius" :min="0" :max="50" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设计压力(MPa)" prop="designPressure">
              <el-input-number v-model="formData.designPressure" :min="0" :max="10" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运行状态" prop="status">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option label="运行中" value="running" />
                <el-option label="备用" value="standby" />
                <el-option label="维护中" value="maintenance" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="设备清单">
          <el-button type="primary" link size="small" @click="openEquipmentDialog">
            <el-icon><List /></el-icon>
            管理设备 ({{ formData.equipmentList.length }})
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="equipmentDialogVisible" title="设备清单" width="900px">
      <el-button type="primary" size="small" style="margin-bottom: 12px">
        <el-icon><Plus /></el-icon>
        添加设备
      </el-button>
      <el-table :data="formData.equipmentList" size="small" border>
        <el-table-column prop="name" label="设备名称" width="150" />
        <el-table-column prop="model" label="型号" width="150" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="manufacturer" label="生产厂家" width="150" />
        <el-table-column prop="operatingHours" label="运行时长(h)" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'warning'" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ $index }">
            <el-button type="danger" link size="small" @click="removeEquipment($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { HeatSource, Equipment } from '@/types'
import { mockData } from '@/mock/data'
import { getStatusText } from '@/utils'
import { Plus, List } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const dialogVisible = ref(false)
const equipmentDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentId = ref('')

const defaultForm = () => ({
  name: '',
  address: '',
  heatingCapacity: 0,
  heatingRadius: 0,
  designPressure: 0,
  operatingHours: 0,
  status: 'running' as const,
  equipmentList: [] as Equipment[],
  createTime: new Date().toISOString().split('T')[0]
})

const formData = reactive<HeatSource>(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入热源厂名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  heatingCapacity: [{ required: true, message: '请输入供热能力', trigger: 'blur' }]
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(formData, defaultForm())
  formData.equipmentList = [...mockData.equipmentList.slice(0, 3)]
  dialogVisible.value = true
}

const openEditDialog = (row: HeatSource) => {
  isEdit.value = true
  currentId.value = row.id
  Object.assign(formData, { ...row })
  formData.equipmentList = [...row.equipmentList]
  dialogVisible.value = true
}

const viewDetail = (row: HeatSource) => {
  ElMessageBox.alert(
    `热源厂名称：${row.name}\n地址：${row.address}\n供热能力：${row.heatingCapacity}MW\n供热半径：${row.heatingRadius}km`,
    '热源厂详情'
  )
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        dataStore.updateHeatSource(currentId.value, formData)
        ElMessage.success('更新成功')
      } else {
        dataStore.addHeatSource({ ...formData, id: mockData.generateId() })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row: HeatSource) => {
  ElMessageBox.confirm('确定要删除该热源厂吗？', '提示', {
    type: 'warning'
  }).then(() => {
    dataStore.deleteHeatSource(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const openEquipmentDialog = () => {
  equipmentDialogVisible.value = true
}

const removeEquipment = (index: number) => {
  formData.equipmentList.splice(index, 1)
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
</style>
