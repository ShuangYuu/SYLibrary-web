<template>
  <div id="app" style="display:flex; flex-direction: column; height: 100vh">
    <!--头部导航栏-->
    <div style="display: flex; height:60px; line-height:60px; background-color: #fff; margin-bottom: 2px">
      <div>
        <img src="@/assets/logo.svg" alt="" style="width: 40px; position: relative; top: 10px; left: 6px">
        <span style="color: #181818; margin-left: 20px; font-size: 20px">图书管理系统</span>
      </div>
      <div style="flex: 1; text-align: right; margin: 20px 25px">
        <el-dropdown size="large">
          <span class="el-dropdown-link" style="font-size: 18px">
            设置
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>Action 1</el-dropdown-item>
              <el-dropdown-item>Action 2</el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!--侧边栏与主体部分-->
    <div style="display: flex; flex: 1">
      <!--侧边栏-->
      <div style="width: 200px; overflow: hidden; margin-right: 2px; background-color: #fff;">
        <el-menu :default-active="$route.path" router class="el-menu-demo">
          <el-menu-item index="/home">首页</el-menu-item>
          <el-sub-menu index="1">
            <template #title>人员管理</template>
            <el-menu-item index="/users">用户管理</el-menu-item>
            <el-menu-item index="/admin">管理员管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>图书管理</template>
            <el-menu-item index="/books">图书列表</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <!--主体-->
      <div style="flex: 1; background-color: #fff; padding-left: 8px;">
        <router-view/>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import router from "@/router/index.js";
import apiClient from "@/utils/apiClient.js";

const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const res = await apiClient.post("/admin/deleteToken", { refreshToken : refreshToken });
  console.log("删除结果: ", res);
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  router.push("/login");
}

</script>

<style>
/* 确保 html 和 body 的高度也是 100% */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.example-showcase .el-dropdown-link {
 cursor: pointer;
 color: var(--el-color-primary);
 display: flex;
 align-items: center;
}

.el-dropdown-link:focus {
  outline: none;
}

</style>
