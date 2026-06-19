# 数字图书元数据采集系统 - 前端管理端

本项目是“数字图书元数据采集系统”的 Vue 管理端，用于管理员维护图书元数据、用户信息、管理员账号，并从外部书籍平台检索和导入图书数据。

## 技术栈

- Vue 3
- Vite / rolldown-vite
- Vue Router
- Pinia
- Element Plus
- Axios
- ESLint / oxlint

## 功能模块

- 登录认证：管理员手机号验证码登录、密码登录、Token 自动刷新。
- 工作台：首页欢迎区、近 10 天新增图书数量趋势、近 10 天用户总量趋势。
- 图书管理：图书列表、搜索、新增、编辑、删除、封面展示。
- 外部书籍导入：支持 Google Books、Open Library 搜索，按封面/简介/重复数据过滤，并批量导入选中书籍。
- 用户管理：用户分页查询、新增、编辑、删除。
- 管理员管理：管理员分页查询、新增、编辑、删除。
- 页面框架：淡蓝色图书馆风格布局、侧边栏导航、右上角个人名称和退出登录。

## 目录结构

```text
vue/
├─ public/                  # 静态资源
├─ src/
│  ├─ assets/               # 全局样式和资源
│  │  ├─ global.css
│  │  └─ logo.svg
│  ├─ router/               # 路由和登录拦截
│  │  └─ index.js
│  ├─ stores/               # Pinia 状态
│  ├─ utils/                # Axios 请求封装
│  │  ├─ apiClient.js
│  │  └─ request.js
│  ├─ views/                # 页面
│  │  ├─ HomeView.vue
│  │  ├─ LayoutView.vue
│  │  ├─ BookView.vue
│  │  ├─ BookImportView.vue
│  │  ├─ UsersView.vue
│  │  ├─ AdminView.vue
│  │  ├─ NotFound.vue
│  │  └─ login/
│  │     └─ LoginView.vue
│  ├─ App.vue
│  └─ main.js
├─ index.html
├─ package.json
└─ vite.config.js
```

## 环境要求

`package.json` 指定 Node.js 版本：

```text
^20.19.0 || >=22.12.0
```

建议使用对应版本的 Node.js 和 npm。

## 安装依赖

```sh
npm install
```

## 本地开发

```sh
npm run dev
```

默认 Vite 地址通常为：

```text
http://localhost:5173
```

如端口被占用，Vite 会自动选择下一个可用端口。

## 生产构建

```sh
npm run build
```

构建产物输出到：

```text
dist/
```

## 本地预览构建产物

```sh
npm run preview
```

## 代码检查

```sh
npm run lint
```

该命令会依次执行：

```sh
npm run lint:oxlint
npm run lint:eslint
```

## 后端接口依赖

前端请求封装位于：

```text
src/utils/apiClient.js
```

当前默认后端地址：

```text
http://localhost:8080
```

运行前请确保后端 Spring Boot 服务已启动，并且数据库结构与后端接口保持一致。

主要接口依赖包括：

- `/admin/login/code/send`
- `/admin/login/code`
- `/admin/login/password`
- `/admin/refresh`
- `/admin/info`
- `/dashboard/trends`
- `/book/page`
- `/book/external/search`
- `/book/import/selected`
- `/user/page`
- `/admin/page`

## 登录和权限

- 路由守卫位于 `src/router/index.js`。
- 未登录访问业务页面会自动跳转到 `/login`。
- 登录成功后会在 `localStorage` 中保存 `accessToken` 和 `refreshToken`。
- 接口返回 `401` 时，`apiClient` 会尝试使用刷新令牌换取新的访问令牌，并重试原请求。

## 开发注意事项

- 页面样式以 `src/assets/global.css` 和各页面内样式为主。
- Element Plus 组件主题色已按淡蓝色图书馆风格覆盖。
- 工作台趋势图使用页面内 SVG 绘制，没有额外图表库依赖。
- 不要直接删除用户已有未提交改动；修改前建议查看当前 Git 状态。
- 后端接口字段变更后，需要同步检查 `apiClient` 调用和对应页面的数据处理逻辑。
