<template>
  <div class="main">
    <div class="box">
      <h1 style="margin-top: 60px">该页面不存在</h1>
      <el-button type="primary" size="large" style="margin-top: 30px" @click="$router.push('/')">点击返回主页</el-button>
    </div>
  </div>
</template>

<style scoped>
.main {
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.box {
  display: flex;
  flex-direction: column;
  height: 800px;
  width: 500px;
  background-color: #ffffff;
  align-items: center;
}
</style>
