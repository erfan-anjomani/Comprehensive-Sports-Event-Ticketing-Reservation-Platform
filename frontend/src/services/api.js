import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // آدرس بک‌اند
    headers: {
        'Content-Type': 'application/json'
    }
});

// اینترسپتور برای تزریق خودکار توکن
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    // فقط اگر توکن واقعی وجود داشت آن را بفرست
    if (token && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;