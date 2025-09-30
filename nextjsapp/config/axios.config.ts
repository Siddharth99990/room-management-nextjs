import axios from 'axios';

const api=axios.create({
    baseURL: '/api',
    withCredentials:true,
    timeout:10000,
    headers:{
        'Content-Type':'application/json'
    }
});

api.interceptors.request.use(
    (config)=>{
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        return config;
    },
    (error)=>{
        console.error("Request error:",error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
  (response) => {
    console.log(`Response received: ${response.status} for ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (error.response?.status === 401) {
      console.log('Authentication failed - clearing auth state');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.message === 'Network Error') {
      console.error('Network error - check if server is running on http://localhost:8080');
    }
    return Promise.reject(error);
  }
);

export default api;
