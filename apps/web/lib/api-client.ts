import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Création de l'instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Pour les cookies de session si nécessaire
});

// Intercepteur de requête : Ajout du token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nexus_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse : Gestion des erreurs globales (401, 403, 500)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
        // Optionnel : Redirection vers login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
