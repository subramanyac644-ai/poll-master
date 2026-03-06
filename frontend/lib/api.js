import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
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
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getAllUsers: () => api.get('/auth/users'),
    deleteUser: (id) => api.delete(`/auth/users/${id}`),
    updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
};

export const pollsAPI = {
    getAllActive: () => api.get('/polls'),
    getAllAdmin: () => api.get('/polls/all'),
    getById: (id) => api.get(`/polls/${id}`),
    create: (data) => api.post('/polls', data),
    updateStatus: (id, isActive) => api.put(`/polls/${id}`, { is_active: isActive }),
    delete: (id) => api.delete(`/polls/${id}`),
    vote: (id, optionId) => api.post(`/polls/${id}/vote`, { option_id: optionId }),
    getResults: (id) => api.get(`/polls/${id}/results`),
};

export default api;
