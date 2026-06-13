import axios from "axios";
import { ElMessage } from 'element-plus';
import router from "@/router/index.js";

const BASE_HOST = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_HOST,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

const clearTokensAndRedirectToLogin = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  ElMessage.warning("会话已过期，请重新登录");
  router.push('/login');
};

apiClient.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, error => Promise.reject(error));

apiClient.interceptors.response.use(
  response => {
    const { code, msg } = response.data;
    if (code === 200) {
      return response.data;
    }
    return Promise.reject(new Error(msg || '请求失败'));
  },
  async error => {
    const originalRequest = error.config;
    const { response } = error;

    if (response && response.status === 401 && originalRequest && !originalRequest._isRetry) {
      if (originalRequest.url.includes('/refresh')) {
        clearTokensAndRedirectToLogin();
        return Promise.reject(error);
      }

      originalRequest._isRetry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');

        try {
          if (!refreshToken) {
            clearTokensAndRedirectToLogin();
            return Promise.reject(error);
          }

          const refreshResponse = await axios.post(`${BASE_HOST}/admin/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          clearTokensAndRedirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
