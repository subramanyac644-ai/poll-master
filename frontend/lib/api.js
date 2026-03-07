import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const RENDER_API_URL = 'https://poll-master.onrender.com';

// Clean up the URL: Remove trailing slash if exists, and handle the /api suffix consistently
const cleanUrl = (url) => url ? url.replace(/\/+$/, '').replace(/\/api$/, '') : '';

const isProd = process.env.NODE_ENV === 'production' || (typeof window !== 'undefined' && !window.location.hostname.includes('localhost'));

// If API_URL is provided, clean it. Otherwise use the prod or local defaults.
const finalAPI_URL = cleanUrl(API_URL) || (isProd ? RENDER_API_URL : 'http://localhost:5000');


const api = axios.create({
    baseURL: finalAPI_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authAPI = {
    login: (data) => api.post('/api/auth/login', data),
    register: (data) => api.post('/api/auth/register', data),
    getAllUsers: () => api.get('/api/auth/users'),
    deleteUser: (id) => api.delete(`/api/auth/users/${id}`),
    updateUser: (id, data) => api.put(`/api/auth/users/${id}`, data),
};

export const pollsAPI = {
    getAllActive: () => api.get('/api/polls'),
    getExplore: () => api.get('/api/polls'),
    getAllAdmin: () => api.get('/api/polls/all'),
    getById: (id) => api.get(`/api/polls/${id}`),
    create: (data) => api.post('/api/polls', data),
    updateStatus: (id, isActive) => api.put(`/api/polls/${id}`, { is_active: isActive }),
    delete: (id) => api.delete(`/api/polls/${id}`),
    vote: (id, optionId) => api.post(`/api/polls/${id}/vote`, { option_id: optionId }),
    getResults: (id) => api.get(`/api/polls/${id}/results`),
};

export default api;
