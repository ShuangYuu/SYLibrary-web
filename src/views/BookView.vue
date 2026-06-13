<template>
  <div style="margin-bottom: 10px">
    <div style="margin-top: 8px">
      <el-button type="primary" @click="openForm">新增图书</el-button>
    </div>
    <div style="margin-top: 8px">
      <el-input placeholder="请输入书名" style="width: 300px" v-model="params.name" />
      <el-input placeholder="请输入作者" style="width: 220px; margin-left: 5px" v-model="params.author" />
      <el-input placeholder="请输入标签" style="width: 220px; margin-left: 5px" v-model="params.tags" />
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
          alt="图书封面"
          style="width: 60px; height: 80px; object-fit: cover;"
        />
        <span v-else>无封面</span>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="名称" width="300" />
    <el-table-column prop="author" label="作者" width="200" />
    <el-table-column prop="tags" label="标签" width="180" />
    <el-table-column label="说明">
      <template #default="scope">
        <div class="book-comment">{{ scope.row.comment }}</div>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="150">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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
    :title="form.book_id ? '编辑图书' : '新增图书'"
    width="25%"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item prop="name" label="图书名称" style="width: 350px">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item prop="imageUrl" label="封面" style="width: 350px">
        <el-input v-model="form.imageUrl" />
      </el-form-item>
      <el-form-item prop="author" label="作者" style="width: 250px">
        <el-input v-model="form.author" />
      </el-form-item>
      <el-form-item prop="tags" label="标签" style="width: 250px">
        <el-input v-model="form.tags" />
      </el-form-item>
      <el-form-item prop="comment" label="说明" style="width: 400px">
        <el-input v-model="form.comment" type="textarea" :rows="6" />
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
import { onMounted, reactive, ref, watch } from "vue";
import apiClient from "@/utils/apiClient.js";
import { ElMessage, ElMessageBox } from "element-plus";

const total = ref(0);
const dialogVisible = ref(false);
const bookData = ref([]);

const params = reactive({
  pageNum: 1,
  pageSize: 15,
  name: '',
  author: '',
  tags: '',
});

const emptyForm = () => ({
  book_id: '',
  name: '',
  author: '',
  imageUrl: '',
  tags: '',
  comment: '',
});

const form = reactive(emptyForm());

const normalizeNewlines = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/\\n/g, '\n');
};

const getBookData = async () => {
  try {
    const res = await apiClient.get('/book/page', { params });
    bookData.value = res.data.list.map((book) => ({
      ...book,
      comment: normalizeNewlines(book.comment),
    }));
    total.value = res.data.total;
  } catch (e) {
    console.log("获取图书数据失败: ", e);
    ElMessage.error("获取图书数据失败");
  }
};

onMounted(() => {
  getBookData();
});

watch(
  () => params.pageNum,
  () => {
    getBookData();
  }
);

const openForm = () => {
  Object.assign(form, emptyForm());
  dialogVisible.value = true;
};

const submit = async () => {
  try {
    if (form.book_id) {
      await apiClient.put('/book/', form);
    } else {
      await apiClient.post('/book/', form);
    }

    ElMessage.success("提交成功");
    dialogVisible.value = false;
    getBookData();
  } catch (e) {
    ElMessage.error("提交失败，请稍后重试");
    console.log("提交失败: ", e);
  }
};

const handleEdit = (row) => {
  ElMessage.info(`开始编辑"${row.name}"`);
  Object.assign(form, {
    ...row,
    comment: normalizeNewlines(row.comment),
  });
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${row.name}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await apiClient.delete(`/book/${row.book_id}`);
    ElMessage.success('删除成功');
    getBookData();
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消删除');
    } else {
      ElMessage.error('删除失败，请稍后重试');
      console.log('删除失败: ', error);
    }
  }
};

const reset = () => {
  params.pageNum = 1;
  params.pageSize = 15;
  params.name = '';
  params.author = '';
  params.tags = '';
  getBookData();
};
</script>

<style scoped>
.book-comment {
  white-space: pre-line;
  line-height: 1.6;
}
</style>
