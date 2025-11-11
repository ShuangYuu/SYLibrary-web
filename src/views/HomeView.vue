<template>
  <h1 v-if="adminInfo" style="margin-left: 20px">欢迎管理员, {{adminInfo.username}}</h1>
  <div v-else>
    <p>正在载入管理员信息...</p>
  </div>
</template>

<script setup>
import { ref,  onMounted } from "vue";
import apiClient from "@/utils/apiClient.js";


const adminInfo = ref(null);

const getAdminInfo = async () => {
  const res = await apiClient.get("/admin/info");

  adminInfo.value = res.data;
}

onMounted(() => {
  getAdminInfo();
})

</script>
