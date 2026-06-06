<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>备件库存</span>
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            入库
          </el-button>
        </div>
      </template>

      <el-table :data="dataStore.spareParts" border :row-class-name="tableRowClassName">
        <el-table-column prop="name" label="备件名称" width="150" />
        <el-table-column prop="model" label="规格型号" width="150" />
        <el-table-column prop="quantity" label="当前库存" width="120">
          <template #default="{ row }">
            <span :class="{ 'low-stock': row.quantity <= row.safeStock }">
              {{ row.quantity }} {{ row.unit }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="safeStock" label="安全库存" width="120">
          <template #default="{ row }">
            {{ row.safeStock }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column label="库存状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.quantity <= row.safeStock" type="danger" size="small">库存不足</el-tag>
            <el-tag v-else type="success" size="small">充足</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="stockIn(row)">入库</el-button>
            <el-button type="warning" link size="small" @click="stockOut(row)">出库</el-button>
            <el-button v-if="row.quantity <= row.safeStock" type="danger" link size="small" @click="purchase(row)">
              采购预警
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="stockDialogVisible" :title="isStockIn ? '备件入库' : '备件出库'" width="400px">
      <el-form :model="stockForm" label-width="80px">
        <el-form-item label="备件名称">
          <span>{{ currentPart?.name }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentPart?.quantity }} {{ currentPart?.unit }}</span>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="stockForm.quantity" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stockForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStock">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { SparePart } from '@/types'
import { Plus } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const stockDialogVisible = ref(false)
const isStockIn = ref(true)
const currentPart = ref<SparePart | null>(null)
const stockForm = reactive({ quantity: 1, remark: '' })

const stockIn = (row: SparePart) => {
  isStockIn.value = true
  currentPart.value = row
  stockForm.quantity = 1
  stockForm.remark = ''
  stockDialogVisible.value = true
}

const stockOut = (row: SparePart) => {
  if (row.quantity <= 0) {
    ElMessage.warning('库存不足，无法出库')
    return
  }
  isStockIn.value = false
  currentPart.value = row
  stockForm.quantity = 1
  stockForm.remark = ''
  stockDialogVisible.value = true
}

const confirmStock = () => {
  if (!currentPart.value) return
  
  const newQuantity = isStockIn.value 
    ? currentPart.value.quantity + stockForm.quantity
    : currentPart.value.quantity - stockForm.quantity
  
  if (newQuantity < 0) {
    ElMessage.error('出库数量不能大于库存')
    return
  }
  
  dataStore.updateSparePart(currentPart.value.id, { quantity: newQuantity })
  ElMessage.success(isStockIn.value ? '入库成功' : '出库成功')
  stockDialogVisible.value = false
  
  if (newQuantity <= currentPart.value.safeStock) {
    ElMessage.warning(`备件【${currentPart.value.name}】库存已低于安全库存，请及时采购`)
  }
}

const purchase = (row: SparePart) => {
  ElMessageBox.confirm(
    `备件【${row.name}】当前库存 ${row.quantity}，安全库存 ${row.safeStock}，是否生成采购申请？`,
    '库存预警',
    { type: 'warning' }
  ).then(() => {
    ElMessage.success('采购申请已生成')
  }).catch(() => {})
}

const tableRowClassName = ({ row }: { row: SparePart }) => {
  if (row.quantity <= row.safeStock) {
    return 'warning-row'
  }
  return ''
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

.low-stock {
  color: #f56c6c;
  font-weight: 600;
}

:deep(.el-table .warning-row) {
  background-color: #fef0f0 !important;
}

:deep(.el-table .warning-row:hover > td) {
  background-color: #fde2e2 !important;
}
</style>
