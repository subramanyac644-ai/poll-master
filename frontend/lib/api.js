import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const RENDER_API_URL = 'https://poll-master.onrender.com';

// Clean up the URL: Remove trailing slash if exists, and handle the /api suffix consistently
const cleanUrl = (url) => url ? url.replace(/\/+$/, '').replace(/\/api$/, '') : '';

const isProd = process.env.NODE_ENV === 'production' || (typeof window !== 'undefined' && !window.location.hostname.includes('localhost'));

// If API_URL is provided, clean it. Otherwise use the prod or local defaults.
const finalAPI_URL = cleanUrl(API_URL) || (isProd ? 'https://poll-master-1.onrender.com' : 'http://localhost:5000');

if (typeof window !== 'undefined' && isProd) {
    console.log('🚀 PollMaster Production API:', finalAPI_URL);
}


const api = axios.create({
    baseURL: finalAPI_URL,
    withCredentials: true, // Crucial for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to handle fallback local storage tokens (transitional)
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            // If we have a local token but aren't using cookies yet, send it
            if (token && !document.cookie.includes('token=')) {
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
