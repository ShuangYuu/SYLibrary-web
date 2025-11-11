import axios from "axios";
import { ElMessage } from 'element-plus';
import router from "@/router/index.js";

const BASE_HOST = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_HOST,
  timeout: 10000,
  headers: {'Content-Type': 'application/json'},
})

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => {
    if (error) {
      p.reject(error);
    }
    else{
      p.resolve(token);
    }
  });
  failedQueue = [];
}

const clearTokensAndRedirectToLogin = () => {

  // 清除所有本地存储的凭证
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  console.warn('会话已过期');
  ElMessage.warning("会话已过期，请重新登录。");

  router.push('/login');
}

const subscribeTokenRefresh = (p) => {
  failedQueue.push(p);
}

apiClient.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
})

apiClient.interceptors.response.use(
  response => {
    const { code , data, msg } = response.data;
    if (code === 200) {
      return response.data;
    }
    else {
      console.error('API Error:', msg);
      return Promise.reject(new Error(msg));
    }
  },
  async(error) => {
      const originalRequest = error.config;
      const { response } = error;
      console.log(response)

      // 1. 检查是否为 AccessToken 过期
      if (response && response.status === 401 && !originalRequest._isRetry) {

        // 如果 401 是来自接口自身，则 RefreshToken 失效
        if (originalRequest.url.includes('/refresh')) {
          console.log(1)
          clearTokensAndRedirectToLogin();
          return Promise.reject(error);
        }

        originalRequest._isRetry = true; // 标记原请求

        // 2. 如果当前没有在刷新
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem('refreshToken');

          try {
            if (!refreshToken) {
              console.log(2)
              clearTokensAndRedirectToLogin();
              return Promise.reject(error);
            }

            // 异步调用 Refresh API 换取新 Token
            const refreshResponse = await axios.post(`${BASE_HOST}/admin/refresh`, {refreshToken: refreshToken}); // 使用绝对路径
            console.log("新的双令牌: ", refreshResponse.data)
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // 处理队列：通知所有等待的请求使用新 Token 重试
            processQueue(null, accessToken);

            // 重新发起当前失败的原始请求
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return apiClient(originalRequest);

          } catch (refreshError) {
            processQueue(refreshError);
            clearTokensAndRedirectToLogin();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        // 3. 如果已经在刷新中，则返回一个新的 Promise 等待
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(token => {
            // 刷新成功后，使用新 token 重试请求
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      return Promise.reject(error);
})

export default apiClient;



