<template>
  <div style="display: flex; height: 100vh; justify-content: center; align-items: center; background-color: #f0f2f5;">
    <div class="login-box">
      <h2 class="login-title">用户登录</h2>

      <el-form :model="form" label-width="60px">

        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"/>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" show-password/>
        </el-form-item>

        <el-form-item label-width="0px">
          <el-button type="primary" style="display: block; margin: 0 auto" @click="login">登录</el-button>
        </el-form-item>

      </el-form>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import apiClient from "@/utils/apiClient.js";
import router from "@/router/index.js";
import {ElMessage} from "element-plus";

const form = reactive({
  username: "",
  password: "",
})

const admin = ref({
  id: "",
  username: "",
  phone: "",
  email: "",
})

const login = async () => {

  try {
    const res = await apiClient.post("/admin/login", form);

    console.log(res);

    if (res.code === 200) {

      admin.value = res.data;
      localStorage.setItem("accessToken", admin.value.accessToken);
      localStorage.setItem("refreshToken", admin.value.refreshToken);
      console.log("登录成功: ", admin);

      //跳转到首页
      await router.push("/");
      ElMessage.success("登录成功");

    }
  } catch (error) {
    console.log(error)
    ElMessage.error(error.message);
  }

}

</script>

<style scoped>
.login-box {
  width: 350px;
  background-color: #ffffff;
  padding: 30px; /* 增加内边距，让内容不紧贴边缘 */
  border-radius: 8px; /* 增加圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 增加阴影，更具立体感 */
}
.login-title {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}
</style>
