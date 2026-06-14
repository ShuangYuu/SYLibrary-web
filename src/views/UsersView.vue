<template>
  <div>
    <div class="action-bar" style="padding-top: 8px">
      <el-button type="primary" @click="openForm">新增用户</el-button>
      <div style="margin-top: 5px;">
        <el-input style="width: 240px;" placeholder="请输入姓名" v-model="params.username"></el-input>
        <el-button style="margin-left: 5px;" @click="getTableData">搜索</el-button>
        <el-button style="margin-left: 5px;" @click="reset">重置</el-button>
      </div>
    </div>

    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="username" label="姓名" width="150" />
      <el-table-column prop="cardID" label="卡号" width="350" />
      <el-table-column prop="age" label="年龄" width="100" />
      <el-table-column prop="sex" label="性别" width="100" />
      <el-table-column prop="phone" label="联系方式" width="180" />
      <el-table-column prop="address" label="地址" />

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
    v-model="dialogVisible"
    :title="form.id ? '编辑用户' : '新增用户'"
    width="25%"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="姓名" prop="username" style="width: 250px">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="年龄" prop="age" style="width: 150px;">
        <el-input v-model="form.age" type="number" />
      </el-form-item>
      <el-form-item label="性别" prop="sex" style="width: 150px">
        <el-select v-model="form.sex" placeholder="">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="联系方式" prop="phone" style="width: 200px">
        <el-input v-model="form.phone" />
      </el-form-item>
      <el-form-item label="密码" prop="password" style="width: 200px">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="danger" @click="Cancel">取消</el-button>
        <el-button type="primary" @click="formConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup>
import {onMounted, ref, watch, reactive} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import apiClient from "@/utils/apiClient.js";

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
    const res = await apiClient.get('/user/page', { params: params });

    tableData.value = res.data.list;
    total.value = res.data.total;

    console.log('表格数据已成功接收:', tableData);

  } catch (error) {
    // 拦截器中抛出的错误会在这里被捕获
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
const dialogVisible = ref(false);
const form = reactive({
  id: '',
  username: '',
  cardID: '',
  age: '',
  sex: '',
  phone: '',
  password: '',
  address: '',
});

const openForm = () => {

  Object.assign(form, {
    id: '',
    username: '',
    cardID: '',
    age: '',
    sex: '',
    phone: '',
    password: '',
    address: '',
  });

  dialogVisible.value = true;

}

const formConfirm = async () => {

  try {
    // 简单校验
    if (form.username === '') {
      ElMessage.error('姓名不能为空！');
      return;
    }
    if (form.age === '') {
      ElMessage.error('年龄不能为空！');
      return;
    }
    if (form.sex === '') {
      ElMessage.error('性别不能为空！');
      return;
    }
    if (form.phone === '') {
      ElMessage.error('联系方式不能为空！');
      return;
    }
    if (form.password === '') {
      ElMessage.error('联系方式不能为空！');
      return;
    }
    if (form.address === '') {
      ElMessage.error('地址不能为空！');
      return;
    }

    // 提交
    if (form.id === '') {
      const res = await apiClient.post('/user/', form);
      console.log('成功提交行数：', res, '行');
      ElMessage.success('新增成功！');
    }
    else {
      const res = await apiClient.put('/user/', form);
      console.log('成功提交行数：', res, '行');
      ElMessage.success('编辑成功！');
    }

    dialogVisible.value = false;
    getTableData();
  } catch (error) {
    console.log('提交失败:', error);
    ElMessage.error('提交失败，请稍后重试');
  }

}

const Cancel = () => {
  dialogVisible.value = false;
}

// 编辑
const handleEdit = (row) => {

  ElMessage.info(`开始编辑“${ row.username }”的数据`);
  Object.assign(form, row);
  dialogVisible.value = true;

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

    const res = await apiClient.delete(`/user/${row.id}`);
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
