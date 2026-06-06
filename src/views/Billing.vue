<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>收费管理</span>
          <div class="header-actions">
            <el-select v-model="statusFilter" placeholder="缴费状态" clearable style="width: 150px; margin-right: 10px">
              <el-option label="未缴费" value="unpaid" />
              <el-option label="部分缴纳" value="partial" />
              <el-option label="已缴清" value="paid" />
            </el-select>
            <el-button type="primary" @click="generateBill">
              <el-icon><DocumentAdd /></el-icon>
              生成账单
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="总用户数" :value="dataStore.billingRecords.length" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已缴清" :value="paidCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="欠费用户" :value="unpaidCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="累计收费(元)" :value="totalPaid" :precision="2" />
        </el-col>
      </el-row>

      <el-table :data="filteredRecords" border>
        <el-table-column prop="id" label="账单编号" width="120" />
        <el-table-column prop="userName" label="用户姓名" width="100" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column prop="heatingArea" label="供热面积(㎡)" width="120" />
        <el-table-column prop="period" label="采暖期" width="100" />
        <el-table-column prop="heatConsumption" label="用热量(kWh)" width="130" />
        <el-table-column prop="unitPrice" label="单价(元/kWh)" width="120">
          <template #default="{ row }">
            {{ row.unitPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="应缴金额(元)" width="130">
          <template #default="{ row }">
            {{ row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已缴金额(元)" width="130">
          <template #default="{ row }">
            {{ row.paidAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'paid' ? 'success' : row.status === 'partial' ? 'warning' : 'danger'" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remindCount" label="催缴次数" width="90" />
        <el-table-column prop="dueDate" label="缴费截止日" width="110" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status !== 'paid'" type="success" link size="small" @click="recordPayment(row)">
              登记缴费
            </el-button>
            <el-button v-if="row.status !== 'paid'" type="warning" link size="small" @click="sendReminder(row)">
              催缴
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="paymentVisible" title="登记缴费" width="500px">
      <div v-if="currentRecord">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="用户">{{ currentRecord.userName }}</el-descriptions-item>
          <el-descriptions-item label="应缴金额">{{ currentRecord.totalAmount.toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="已缴金额">{{ currentRecord.paidAmount.toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="待缴金额">
            <span style="color: #f56c6c; font-weight: 600">
              {{ (currentRecord.totalAmount - currentRecord.paidAmount).toFixed(2) }} 元
            </span>
          </el-descriptions-item>
        </el-descriptions>
        <el-form :model="paymentForm" label-width="100px" style="margin-top: 20px">
          <el-form-item label="缴费金额">
            <el-input-number v-model="paymentForm.amount" :min="0" :max="currentRecord.totalAmount - currentRecord.paidAmount" style="width: 100%" />
          </el-form-item>
          <el-form-item label="支付方式">
            <el-select v-model="paymentForm.method" style="width: 100%">
              <el-option label="现金" value="cash" />
              <el-option label="微信" value="wechat" />
              <el-option label="支付宝" value="alipay" />
              <el-option label="银行转账" value="bank" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="paymentVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPayment">确认缴费</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '@/stores/data'
import type { BillingRecord } from '@/types'
import { getStatusText } from '@/utils'
import { DocumentAdd } from '@element-plus/icons-vue'

const dataStore = useDataStore()
const statusFilter = ref('')
const paymentVisible = ref(false)
const currentRecord = ref<BillingRecord | null>(null)
const paymentForm = reactive({ amount: 0, method: 'wechat' })

const filteredRecords = computed(() => {
  if (!statusFilter.value) return dataStore.billingRecords
  return dataStore.billingRecords.filter(r => r.status === statusFilter.value)
})

const paidCount = computed(() => dataStore.billingRecords.filter(r => r.status === 'paid').length)
const unpaidCount = computed(() => dataStore.billingRecords.filter(r => r.status !== 'paid').length)
const totalPaid = computed(() => dataStore.billingRecords.reduce((sum, r) => sum + r.paidAmount, 0))

const generateBill = () => {
  ElMessage.success('账单生成中，将自动计算各用户采暖费')
}

const viewDetail = (row: BillingRecord) => {
  ElMessageBox.alert(
    `用户：${row.userName}\n地址：${row.address}\n供热面积：${row.heatingArea}㎡\n用热量：${row.heatConsumption}kWh\n单价：${row.unitPrice}元/kWh\n应缴：${row.totalAmount.toFixed(2)}元\n已缴：${row.paidAmount.toFixed(2)}元`,
    '账单详情'
  )
}

const recordPayment = (row: BillingRecord) => {
  currentRecord.value = row
  paymentForm.amount = row.totalAmount - row.paidAmount
  paymentForm.method = 'wechat'
  paymentVisible.value = true
}

const confirmPayment = () => {
  if (!currentRecord.value) return
  
  const newPaidAmount = currentRecord.value.paidAmount + paymentForm.amount
  const newStatus = newPaidAmount >= currentRecord.value.totalAmount ? 'paid' : 'partial'
  
  dataStore.updateBillingRecord(currentRecord.value.id, {
    paidAmount: newPaidAmount,
    status: newStatus
  })
  
  ElMessage.success('缴费登记成功')
  paymentVisible.value = false
}

const sendReminder = (row: BillingRecord) => {
  ElMessageBox.confirm(
    `确定向【${row.userName}】发送催缴通知吗？\n欠费金额：${(row.totalAmount - row.paidAmount).toFixed(2)} 元`,
    '催缴确认',
    { type: 'warning' }
  ).then(() => {
    dataStore.updateBillingRecord(row.id, {
      remindCount: row.remindCount + 1
    })
    ElMessage.success('催缴通知已发送')
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
