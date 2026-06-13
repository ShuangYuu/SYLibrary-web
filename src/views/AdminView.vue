<template>
  <div>
    <div class="action-bar" style="padding-top: 8px">
      <el-button type="primary" @click="AddAdmin">新增管理员</el-button>
      <div style="margin-top: 5px;">
        <el-input style="width: 240px;" placeholder="请输入用户名" v-model="params.username"></el-input>
        <el-button style="margin-left: 5px;" @click="getTableData">搜索</el-button>
        <el-button style="margin-left: 5px;" @click="reset">重置</el-button>
      </div>
    </div>

    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="username" label="用户名" width="200" />
      <el-table-column prop="phone" label="联系方式" width="250" />
      <el-table-column prop="email" label="邮箱" stroke-width="200" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>

  <div style="margin-top: 20px">
    <el-pagination
      background
      v-model:current-page="params.pageNum"
      :page-size="params.pageSize"
      :pager-count="5"
      layout="prev, pager, next"
      :total="total"
    />
  </div>

  <el-dialog
    v-model="dialogVisibleAdd"
    title="新增管理员"
    width="25%"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="用户名" prop="name" style="width: 250px">
        <el-input v-model="form.username" />
      </el-form-item>

      <el-form-item label="密码" prop="password" style="width: 250px">
        <el-input v-model="form.password" placeholder="默认密码: 123456"/>
      </el-form-item>

      <el-form-item label="联系方式" prop="phone" style="width: 200px">
        <el-input v-model="form.phone" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email" style="width: 250px">
        <el-input v-model="form.email" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="Cancel" type="danger">取消</el-button>
        <el-button type="primary" @click="formConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="dialogVisibleEdit"
    title="编辑管理员"
    width="25%"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="用户名" prop="username" style="width: 250px">
        <el-input v-model="form.username" />
      </el-form-item>

      <el-form-item label="联系方式" prop="phone" style="width: 200px">
        <el-input v-model="form.phone" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email" style="width: 250px">
        <el-input v-model="form.email" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="Cancel" type="danger">取消</el-button>
        <el-button type="primary" @click="formConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup>
import {onMounted, ref, watch, reactive} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import apiClient from '@/utils/apiClient.js';

// 表格相关内容
const tableData = ref([]);
const total = ref(0);
const params = reactive({
  pageNum: 1,
  pageSize: 10,
  username: '',
})

const getTableData = async () => {
  try {

    params.pageNum = 1;
    // 将接收到的数据赋值给 tableData 变量
    const res = await apiClient.get('/admin/page', { params: params });

    tableData.value = res.data.list;
    total.value = res.data.total;

    console.log('表格数据已成功接收:', tableData);

  } catch (error) {

    console.error('获取表格数据失败:', error.message);

  }
}

watch(
  () => params.pageNum,
  (newVal, oldVal) => {
    // 只有当新页码和旧页码不同时才重新获取数据

    if (newVal !== oldVal) {
      console.log(`页码通过 v-model 改变为: ${newVal}`);
      getTableData();
    }
  }
);

onMounted(() => {
  getTableData();
})

const reset = () => {
  params.pageNum = 1;
  params.username = '';
  getTableData();
}



// 弹窗表单相关内容
const dialogVisibleEdit = ref(false);
const dialogVisibleAdd = ref(false);
const form = reactive({
  id: '',
  username: '',
  password: '',
  phone: '',
  email: '',
});

const formConfirm = async () => {

  try {
    // 简单校验
    if (form.username === '') {
      ElMessage.error('用户名不能为空！');
      return;
    }
    if (form.phone === '') {
      ElMessage.error('联系方式不能为空！');
      return;
    }
    if (form.email === '') {
      ElMessage.error('邮箱不能为空！');
      return;
    }

    if (form.id === ''){
      const res = await apiClient.post(`/admin/`, form);
      console.log('成功提交行数：', res, '行');
      ElMessage.success('新增成功！');

      dialogVisibleAdd.value = false;
    }
    else {
      const res = await apiClient.put('/admin/', form);
      console.log('成功提交行数：', res, '行');
      ElMessage.success('编辑成功！');

      dialogVisibleEdit.value = false;
    }
    getTableData();

  } catch (error) {
    console.log('提交失败:', error);
    ElMessage.error('提交失败，请稍后重试');
  }

}

const Cancel = () => {
  dialogVisibleEdit.value = false;
  dialogVisibleAdd.value = false;
}

//新增
const AddAdmin = () => {

  Object.assign(form, {
    id: '',
    username: '',
    password: '',
    phone: '',
    email: '',
  });

  dialogVisibleAdd.value = true;

}

// 编辑
const handleEdit = (row) => {

  ElMessage.info(`开始编辑“${ row.username }”的数据`);
  Object.assign(form, row);
  dialogVisibleEdit.value = true;

};

// 删除
const handleDelete = async (index, row) => {

  try {
    await ElMessageBox.confirm(
      `你确定要删除${row.username}的数据吗?`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const res = await apiClient.delete(`/admin/${row.id}`);
    console.log(`成功删除${res}行数据`);
    ElMessage.success('删除成功');
    getTableData();
  } catch (error) {

    if (error === 'cancel') {
      ElMessage.info('取消删除');
    }
    else{
      ElMessage.error('删除失败，请稍后重试！');
      console.log('删除失败: ', error);
    }

  }
}
</script>

<style scoped>
.action-bar {
  margin-bottom: 20px;
}
</style>
