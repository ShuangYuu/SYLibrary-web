import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const createClient = () => axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const request = createClient();
const api = createClient();

api.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, error => Promise.reject(error));

const handleBusinessResponse = response => {
  const { code, msg } = response.data;
  if (code === 200) {
    return response.data;
  }
  return Promise.reject(new Error(msg || '请求失败'));
};

const handleHttpError = error => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

api.interceptors.response.use(handleBusinessResponse, handleHttpError);
request.interceptors.response.use(handleBusinessResponse, handleHttpError);

export { request, api };
