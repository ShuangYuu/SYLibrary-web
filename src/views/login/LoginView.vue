<template>
  <div class="login-container">
    <div class="login-ambient">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>

    <div class="login-box">
      <div class="login-heading">
        <div class="login-mark">典</div>
        <p class="login-kicker">Metadata Acquisition</p>
        <h2 class="login-title">数字图书元数据采集系统</h2>
      </div>

      <el-form :model="form" label-width="70px">
        <template v-if="loginType === 'password'">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名"/>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" placeholder="请输入密码" show-password/>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号">
              <template #append>
                <el-button type="primary" @click="sendCode" :disabled="countdown > 0">
                  {{ countdown > 0 ? `${countdown}s后可重发` : '获取验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="code">
            <el-input v-model="form.code" placeholder="请输入短信验证码"/>
          </el-form-item>
        </template>

        <el-form-item label-width="0px">
          <el-button type="primary" class="login-submit" @click="login">
            {{ loginType === 'password' ? '登录' : '登录/注册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="footer-links">
        <el-button link type="primary" style="font-size: 14px" @click="toggleLoginType">
          {{ loginType === 'password' ? '验证码登录' : '密码登录' }}
        </el-button>
        <template v-if="loginType === 'password'">
          <el-divider direction="vertical" />
          <el-button link type="primary" style="font-size: 14px">
            忘记密码
          </el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import apiClient from "@/utils/apiClient.js";
import router from "@/router/index.js";
import { ElMessage } from "element-plus";

const loginType = ref("phone");
const countdown = ref(0);

const form = reactive({
  username: "",
  password: "",
  phone: "",
  code: "",
});

const toggleLoginType = () => {
  loginType.value = loginType.value === 'password' ? 'phone' : 'password';
};

const sendCode = async () => {
  try {
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);

    const res = await apiClient.post('/admin/login/code/send', form.phone);
    if (res.code === 200) {
      ElMessage.success("验证码已发送");
    }
  } catch (e) {
    countdown.value = 0;
    const errorMsg = e.response?.data?.msg || e.message || "请求失败，请稍后再试";
    ElMessage.error(errorMsg);
  }
};

const login = async () => {
  try {
    let res;
    if (loginType.value === 'password') {
      res = await apiClient.post('/admin/login/password', {
        username: form.username,
        password: form.password,
      });
    } else {
      res = await apiClient.post('/admin/login/code', {
        phone: form.phone,
        code: form.code,
      });
    }

    if (res.code === 200) {
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      await router.push("/");
      ElMessage.success("登录成功");
    }
  } catch (error) {
    ElMessage.error(error.message);
  }
};
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  min-height: 100dvh;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 32px 16px;
  background:
    linear-gradient(115deg, rgba(232, 244, 251, 0.96), rgba(214, 234, 247, 0.9)),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.42) 0, rgba(255, 255, 255, 0.42) 1px, transparent 1px, transparent 72px),
    var(--library-primary-soft);
}

.login-ambient {
  position: absolute;
  inset: auto 7% 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  opacity: 0.32;
  pointer-events: none;
}

.login-ambient span {
  width: 42px;
  height: 280px;
  display: block;
  border: 1px solid rgba(255, 250, 241, 0.22);
  border-bottom: 0;
  background: linear-gradient(180deg, rgba(106, 169, 214, 0.22), rgba(255, 255, 255, 0.16));
}

.login-ambient span:nth-child(2) {
  height: 230px;
  background: linear-gradient(180deg, rgba(111, 130, 145, 0.28), rgba(255, 255, 255, 0.1));
}

.login-ambient span:nth-child(3) {
  height: 320px;
  background: linear-gradient(180deg, rgba(200, 157, 98, 0.22), rgba(255, 255, 255, 0.12));
}

.login-ambient span:nth-child(4) {
  height: 260px;
}

.login-ambient span:nth-child(5) {
  height: 360px;
  background: linear-gradient(180deg, rgba(184, 107, 118, 0.18), rgba(255, 255, 255, 0.08));
}

.login-box {
  position: relative;
  z-index: 1;
  width: min(430px, 100%);
  padding: 36px 34px 30px;
  border: 1px solid rgba(255, 250, 241, 0.46);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 251, 254, 0.96)),
    #fbfdff;
  box-shadow: 0 28px 70px rgba(58, 93, 118, 0.22);
}

.login-box::before {
  content: "";
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(143, 191, 227, 0.28);
  border-radius: 6px;
  pointer-events: none;
}

.login-heading {
  position: relative;
  margin-bottom: 30px;
  text-align: center;
}

.login-mark {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  border-radius: 8px;
  color: #fffaf1;
  background: linear-gradient(145deg, var(--library-primary), var(--library-primary-deep));
  box-shadow: 0 10px 22px rgba(106, 169, 214, 0.3);
  font-size: 24px;
  font-weight: 800;
}

.login-kicker {
  margin: 0 0 8px;
  color: var(--library-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.login-title {
  margin: 0;
  color: var(--library-primary-deep);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.28;
}

.login-submit {
  width: 100%;
  margin-top: 4px;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
}

:deep(.el-input-group__append) {
  background-color: var(--el-color-primary) !important;
  color: white !important;
  border-color: var(--el-color-primary) !important;
}

:deep(.el-input-group__append:hover) {
  background-color: var(--library-primary) !important;
}

@media (max-width: 520px) {
  .login-box {
    padding: 30px 22px 24px;
  }

  .login-title {
    font-size: 20px;
  }
}
</style>
