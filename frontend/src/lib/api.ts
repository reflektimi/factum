import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Handle CSRF for Sanctum
export const getCsrfToken = async () => {
    await api.get('/sanctum/csrf-cookie');
};

export default api;
