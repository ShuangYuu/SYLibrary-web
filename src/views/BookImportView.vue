<template>
  <div class="book-import">
    <div class="toolbar">
      <el-select v-model="params.source" style="width: 160px">
        <el-option label="Google Books" value="googleBooks" />
        <el-option label="Open Library" value="openLibrary" />
      </el-select>
      <el-input
        v-model="params.keyword"
        placeholder="请输入关键词、作者或分类"
        style="width: 320px"
        @keyup.enter="searchExternalBooks"
      />
      <el-select v-model="params.limit" style="width: 120px">
        <el-option label="20 本" :value="20" />
        <el-option label="50 本" :value="50" />
        <el-option label="100 本" :value="100" />
      </el-select>
      <el-checkbox v-model="params.onlyWithCover">只看有封面</el-checkbox>
      <el-checkbox v-model="params.onlyWithDescription">只看有简介</el-checkbox>
      <el-checkbox v-model="params.skipExisting">跳过已存在</el-checkbox>
      <el-button type="primary" :loading="searching" @click="searchExternalBooks">搜索</el-button>
      <el-button
        type="success"
        :disabled="selectedBooks.length === 0"
        :loading="importing"
        @click="importSelectedBooks"
      >
        导入选中
      </el-button>
    </div>

    <el-alert
      v-if="importResult"
      class="result-alert"
      type="success"
      show-icon
      :closable="false"
      :title="`已选择 ${importResult.selected} 本，成功导入 ${importResult.imported} 本，重复 ${importResult.duplicated} 本，失败 ${importResult.failed} 本`"
    />

    <el-table
      ref="tableRef"
      :data="books"
      border
      row-key="sourceId"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="48" :selectable="row => !row.existsLocal" />
      <el-table-column label="封面" width="96">
        <template #default="scope">
          <img
            v-if="scope.row.imageUrl"
            :src="scope.row.imageUrl"
            alt="图书封面"
            class="cover"
          />
          <span v-else class="muted">无封面</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="书名" min-width="220" />
      <el-table-column prop="author" label="作者" width="180" />
      <el-table-column prop="publishYear" label="年份" width="90" />
      <el-table-column prop="tags" label="标签" min-width="180" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.existsLocal" type="info">已存在</el-tag>
          <el-tag v-else type="success">可导入</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="简介" min-width="260">
        <template #default="scope">
          <div class="description">{{ scope.row.description || scope.row.comment || '暂无简介' }}</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import apiClient from "@/utils/apiClient.js";

const tableRef = ref(null);
const books = ref([]);
const selectedBooks = ref([]);
const searching = ref(false);
const importing = ref(false);
const importResult = ref(null);

const params = reactive({
  source: 'googleBooks',
  keyword: '',
  limit: 20,
  page: 1,
  onlyWithCover: true,
  onlyWithDescription: false,
  skipExisting: false,
});

const requestParams = computed(() => ({
  ...params,
  keyword: params.keyword.trim(),
}));

const errorMessage = (error, fallback) => {
  return error?.response?.data?.msg || error?.message || fallback;
};

const searchExternalBooks = async (options = {}) => {
  if (!requestParams.value.keyword) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  if (requestParams.value.source === 'openLibrary' && requestParams.value.keyword.length < 3) {
    ElMessage.warning('Open Library 关键词至少需要 3 个字符，例如：中国历史、历史小说、Java');
    return;
  }

  searching.value = true;
  if (!options.keepResult) {
    importResult.value = null;
  }
  selectedBooks.value = [];

  try {
    const res = await apiClient.get('/book/external/search', { params: requestParams.value });
    books.value = res.data || [];
    ElMessage.success(`找到 ${books.value.length} 本外部书籍`);
  } catch (e) {
    console.log('搜索外部书籍失败: ', e);
    ElMessage.error(errorMessage(e, '搜索外部书籍失败'));
  } finally {
    searching.value = false;
  }
};

const handleSelectionChange = (rows) => {
  selectedBooks.value = rows;
};

const importSelectedBooks = async () => {
  if (selectedBooks.value.length === 0) {
    ElMessage.warning('请先选择要导入的书籍');
    return;
  }

  importing.value = true;
  try {
    const res = await apiClient.post('/book/import/selected', {
      source: params.source,
      books: selectedBooks.value,
    });
    importResult.value = res.data;
    ElMessage.success(`成功导入 ${res.data.imported} 本`);
    await searchExternalBooks({ keepResult: true });
  } catch (e) {
    console.log('导入书籍失败: ', e);
    ElMessage.error(errorMessage(e, '导入书籍失败'));
  } finally {
    importing.value = false;
  }
};
</script>

<style scoped>
.book-import {
  padding: 8px 8px 20px 0;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.result-alert {
  margin-bottom: 12px;
}

.cover {
  width: 56px;
  height: 76px;
  object-fit: cover;
}

.description {
  line-height: 1.5;
  max-height: 4.5em;
  overflow: hidden;
}

.muted {
  color: #909399;
}
</style>
