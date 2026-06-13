<template>
  <div class="library-shell">
    <header class="library-header">
      <div class="brand">
        <div class="brand-mark">
          <img src="@/assets/logo.svg" alt="">
        </div>
        <div>
          <div class="brand-title">数字图书元数据采集系统</div>
          <div class="brand-subtitle">Library Metadata Acquisition Console</div>
        </div>
      </div>

      <div class="header-actions">
        <el-dropdown size="large">
          <span class="el-dropdown-link">
            设置
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item class="profile-item" disabled>
                {{ adminInfo?.username || '未获取' }}
              </el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="library-body">
      <aside class="library-sidebar">
        <div class="sidebar-section">馆务导航</div>
        <el-menu :default-active="$route.path" router class="library-menu">
          <el-menu-item index="/home">工作台</el-menu-item>
          <el-sub-menu index="1">
            <template #title>人员管理</template>
            <el-menu-item index="/users">用户管理</el-menu-item>
            <el-menu-item index="/admin">管理员管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>图书管理</template>
            <el-menu-item index="/books">图书列表</el-menu-item>
            <el-menu-item index="/book-import">外部书籍导入</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <main class="library-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ArrowDown } from '@element-plus/icons-vue';
import router from "@/router/index.js";
import apiClient from "@/utils/apiClient.js";

const adminInfo = ref(null);

const getAdminInfo = async () => {
  try {
    const res = await apiClient.get("/admin/info");
    adminInfo.value = res.data;
  } catch (e) {
    console.log("获取管理员信息失败", e);
  }
};

const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    await apiClient.post("/admin/deleteToken", { refreshToken });
  } catch (e) {
    console.log("后端删除 token 接口调用失败", e);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  }
};

onMounted(() => {
  getAdminInfo();
});
</script>

<style scoped>
.library-shell {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: 76px 1fr;
  color: var(--library-ink);
}

.library-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 28px;
  background:
    linear-gradient(90deg, rgba(245, 250, 253, 0.98), rgba(232, 244, 251, 0.96)),
    var(--library-primary-soft);
  border-bottom: 4px solid var(--library-primary);
  box-shadow: 0 16px 40px rgba(58, 93, 118, 0.14);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.brand-mark {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(106, 169, 214, 0.32);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
}

.brand-mark img {
  width: 32px;
  height: 32px;
}

.brand-title {
  color: var(--library-primary-deep);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
}

.brand-subtitle {
  margin-top: 5px;
  color: var(--library-muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-actions {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--library-primary-deep);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 600;
}

.el-dropdown-link:focus-visible {
  outline: 2px solid rgba(106, 169, 214, 0.5);
  outline-offset: 4px;
}

.library-body {
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  gap: 18px;
  min-height: 0;
  padding: 18px;
}

.library-sidebar {
  overflow: hidden;
  border: 1px solid var(--library-line);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(239, 247, 252, 0.92)),
    #fbfdff;
  box-shadow: 0 20px 44px rgba(49, 43, 33, 0.1);
}

.sidebar-section {
  padding: 18px 20px 12px;
  color: var(--library-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.library-menu {
  border-right: 0;
  background: transparent;
}

.library-main {
  min-width: 0;
  overflow: auto;
  padding: 20px;
  border: 1px solid var(--library-line);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(246, 251, 254, 0.94)),
    #fbfdff;
  box-shadow: 0 20px 44px rgba(49, 43, 33, 0.1);
}

@media (max-width: 900px) {
  .library-shell {
    grid-template-rows: auto 1fr;
  }

  .library-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .brand-title {
    white-space: normal;
    font-size: 19px;
  }

  .library-body {
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .library-main {
    padding: 14px;
  }
}
</style>

<style>
.profile-item.is-disabled {
  color: #425769;
  cursor: default;
  opacity: 1;
}

.library-shell .library-menu .el-menu-item,
.library-shell .library-menu .el-sub-menu__title {
  height: 48px;
  color: #425769;
  font-weight: 600;
}

.library-shell .library-menu .el-menu-item.is-active {
  color: var(--library-primary-deep);
  background: linear-gradient(90deg, rgba(143, 191, 227, 0.2), rgba(232, 244, 251, 0.72));
  border-left: 4px solid var(--library-primary);
}

.library-shell .library-menu .el-menu-item:hover,
.library-shell .library-menu .el-sub-menu__title:hover {
  background-color: rgba(143, 191, 227, 0.16);
}
</style>
