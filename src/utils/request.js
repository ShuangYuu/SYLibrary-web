import axios from 'axios';

// 创建一个 Axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 请求拦截器
api.interceptors.request.use(config => {

  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;

},
    error => {
  return Promise.reject(error);
});

// 响应拦截器
api.interceptors.response.use(response => {
    const { code, data, msg } = response.data;

    if (code === 200) {
      return response.data;
    } else {
      console.error('API Error:', msg);
      return Promise.reject(new Error(msg));
    }

  },
  error => {

    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);

  })

// 响应拦截器
request.interceptors.response.use(response => {
    const { code, data, msg } = response.data;

    if (code === 200) {

      return response.data;

    } else {
      // 失败：使用 Promise.reject 抛出错误，把 msg 传递给 .catch
      // 这样，在调用请求的地方就可以通过 .catch 来捕获错误信息了
      console.error('API Error:', msg);
      return Promise.reject(new Error(msg));
    }
  },
    error => {
      console.log(error)
      return Promise.reject(error);
})

export { request, api };
