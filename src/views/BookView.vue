<template>
  <div style="margin-bottom: 10px">
    <div style="margin-top: 8px">
      <el-button type="primary" @click="openForm">新增图书</el-button>
    </div>
    <div style="margin-top: 8px">
      <el-input placeholder="请输入书本名称" style="width: 300px" v-model="params.name" />
      <el-button style="margin-left: 5px" @click="getBookData">搜索</el-button>
      <el-button style="margin-left: 5px" @click="reset">重置</el-button>
    </div>
  </div>

  <el-table :data="bookData" style="width: 100%" border>
    <el-table-column prop="book_id" label="ID" width="100" />
    <el-table-column label="封面" width="100">
      <template #default="scope">
        <img
          v-if="scope.row.imageUrl"
          :src="scope.row.imageUrl"
          alt="书籍封面"
          style="width: 60px; height: 80px;"
        />
        <span v-else>无封面</span>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="名称" width="300" />
    <el-table-column prop="author" label="作者" width="200" />
    <el-table-column prop="isbn" label="isbn" width="250" />
    <el-table-column prop="tags" label="标签" width="150" />
    <el-table-column prop="comment" label="说明" />
    <el-table-column label="操作" width="150">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="danger" size="small" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

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
    :title="form.id ? '编辑图书' : '新增图书'"
    width="25%"
  >
    <el-form v-model="form" label-width="80px">
      <el-form-item prop="name" label="图书名称" style="width: 350px">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item prop="imageUrl" label="封面" style="width: 350px">
        <el-input v-model="form.imageUrl" />
      </el-form-item>
      <el-form-item prop="author" label="作者" style="width: 250px">
        <el-input v-model="form.author" />
      </el-form-item>
      <el-form-item prop="isbn" label="isbn" style="width: 220px">
        <el-input v-model="form.isbn" />
      </el-form-item>
      <el-form-item prop="type" label="标签" style="width: 220px">
        <el-input v-model="form.tags" />
      </el-form-item>
      <el-form-item prop="comment" label="说明" style="width: 400px">
        <el-input v-model="form.comment" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </div>
    </template>
  </el-dialog>

</template>



<script setup>
import {onMounted, reactive, ref} from "vue";
import apiClient from "@/utils/apiClient.js";
import {ElMessage, ElMessageBox} from "element-plus";

const total = ref(0);
const dialogVisible = ref(false);
const bookData = ref();
const params = reactive({
  pageNum: 1,
  pageSize: 15,
  name: '',
})
const form = reactive({
  id: '',
  name: '',
  author: '',
  isbn: '',
  imageUrl: '',
  tags: '',
  comment: '',
})

const getBookData = async () => {

  try {
    params.pageNum = 1;

    const res = await apiClient.get('/book/page', {params: params});

    bookData.value = res.data.list;
    total.value = res.data.total;

    console.log("已成功接收数据: ", res.data.list);
  } catch (e) {
    console.log("接收数据失败: ", e);
  }

}

onMounted(() => {
  getBookData();
})

const openForm = () => {

  Object.assign(form, {
    id: '',
    name: '',
    author: '',
    isbn: '',
    cover: '',
    type: '',
    comment: '',
  });

  dialogVisible.value = true;
}

//表单确认
const submit = async () => {

  try {
    if (form.id) {
      await apiClient.put('/book/', form);
    }
    else {
      await apiClient.post('/book/', form);
    }

    ElMessage.success("提交成功！");
    dialogVisible.value = false;
    getBookData();

  } catch (e) {
    ElMessage.error("提交失败，请稍后重试");
    console.log("提交失败: ", e);
  }

}

//编辑
const handleEdit = (row) => {
  ElMessage.info(`开始编辑"${ row.name }"的数据`);
  console.log("编辑的原数据为: ", row);
  Object.assign(form, row);
  dialogVisible.value = true;
}

//删除
const handleDelete = async (index, row) => {

  try {
    await ElMessageBox.confirm(
      `你确定要删除"${ row.name }"的数据吗?`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await apiClient.delete(`/book/${ row.id }`);
    ElMessage.success('删除成功');
    getBookData();

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

//重置
const reset = () => {
  params.pageNum = 1;
  params.pageSize = 10;
  params.name = '';

  getBookData();
}


</script>
