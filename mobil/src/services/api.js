import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { BASE_URL } from '../constants/api';

const api = axios.create({
    baseURL: BASE_URL,
});

// İstek gönderilmeden önce token ekle
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('usertoken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Yanıt geldiğinde 401 kontrolü
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/login')) {
            await AsyncStorage.removeItem('usertoken');
            await AsyncStorage.removeItem('userData');
            Alert.alert('Oturum Süresi Doldu', 'Lütfen tekrar giriş yapın.');
        }
        return Promise.reject(error);
    }
);

export default api;
