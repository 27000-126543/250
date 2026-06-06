<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管网管理</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            新增管网
          </el-button>
        </div>
      </template>

      <el-table :data="dataStore.pipelines" border>
        <el-table-column prop="name" label="管网名称" width="150" />
        <el-table-column prop="startPoint" label="起点" width="150" />
        <el-table-column prop="endPoint" label="终点" width="150" />
        <el-table-column prop="diameter" label="管径(mm)" width="100" />
        <el-table-column prop="length" label="长度(km)" width="100" />
        <el-table-column prop="designPressure" label="设计压力(MPa)" width="130" />
        <el-table-column prop="material" label="材质" width="160" />
        <el-table-column prop="heatLossCoefficient" label="热损失系数" width="110" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : row.status === 'maintenance' ? 'warning' : 'danger'" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑管网' : '新增管网'" width="600px">
      <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="管网名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入管网名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="起点" prop="startPoint">
              <el-input v-model="formData.startPoint" placeholder="请输入起点" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="终点" prop="endPoint">
              <el-input v-model="formData.endPoint" placeholder="请输入终点" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="管径(mm)" prop="diameter">
              <el-input-number v-model="formData.diameter" :min="50" :max="1000" :step="50" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="长度(km)" prop="length">
              <el-input-number v-model="formData.length" :min="0" :max="50" :step="0.1" style="width: 100%" />
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
            <el-form-item label="热损失系数" prop="heatLossCoefficient">
              <el-input-number v-model="formData.heatLossCoefficient" :min="0" :max="1" :step="0.01" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="材质" prop="material">
          <el-select v-model="formData.material" style="width: 100%">
            <el-option label="聚氨酯保温钢管" value="聚氨酯保温钢管" />
            <el-option label="玻璃钢保温管" value="玻璃钢保温管" />
            <el-option label="钢套钢保温管" value="钢套钢保温管" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="正常" value="normal" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="故障" value="fault" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { Pipeline } from '@/types'
import { mockData } from '@/mock/data'
import { getStatusText } from '@/utils'
import { Plus } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentId = ref('')

const defaultForm = (): Pipeline => ({
  id: '',
  name: '',
  startPoint: '',
  endPoint: '',
  diameter: 300,
  length: 1.0,
  designPressure: 1.6,
  material: '聚氨酯保温钢管',
  heatLossCoefficient: 0.08,
  status: 'normal',
  createTime: new Date().toISOString().split('T')[0]
})

const formData = reactive<Pipeline>(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入管网名称', trigger: 'blur' }],
  startPoint: [{ required: true, message: '请输入起点', trigger: 'blur' }],
  endPoint: [{ required: true, message: '请输入终点', trigger: 'blur' }]
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(formData, defaultForm())
  dialogVisible.value = true
}

const openEditDialog = (row: Pipeline) => {
  isEdit.value = true
  currentId.value = row.id
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        dataStore.updatePipeline(currentId.value, formData)
        ElMessage.success('更新成功')
      } else {
        dataStore.addPipeline({ ...formData, id: mockData.generateId() })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row: Pipeline) => {
  ElMessageBox.confirm('确定要删除该管网吗？', '提示', { type: 'warning' }).then(() => {
    dataStore.deletePipeline(row.id)
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
</style>
