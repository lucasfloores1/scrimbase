import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/shared/config/env';
import { tokenStorage } from '@/shared/lib/storage';
import type { LoginResponse } from '@/shared/types/dto';

export const http = axios.create({
    baseURL : env.apiUrl
});


http.interceptors.request.use((config : InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let pendingQeue : Array<(token : string | null) => void> = [];

function resolveQeue(token : string | null) {
    pendingQeue.forEach((cb)=> cb(token));
    pendingQeue = [];
}

http.interceptors.response.use(
    (res) => res,
    async (error : AxiosError) => {
        const original = error.config as (InternalAxiosRequestConfig & {_retry ? : boolean}) | undefined;

        if (!original) throw error;

        // If already tried, reject the promise and stop retrying.
        if (original._retry) throw error;

        // Only try to refresh withj 401
        if (error.response?.status !== 401) throw error;

        const refreshToken = tokenStorage.getRefresh();
        if (!refreshToken) throw error;

        // Qeue : if refresh incoming, wait
        if (isRefreshing) {
            return new Promise((resolve,reject)=>{
                pendingQeue.push((token) => {
                    if (!token) return reject(error);
                    original._retry = true;
                    original.headers.Authorization = `Bearer ${token}`;
                    resolve(http(original));
                });
            })
        }

        isRefreshing = true;

        try {
            const refreshResponse = await http.post<LoginResponse>(`${env.apiUrl}/auth/refresh`, { refreshToken });
            tokenStorage.setAccess(refreshResponse.data.accessToken);
            tokenStorage.setRefresh(refreshResponse.data.refreshToken);
        } catch (e) {
            resolveQeue(null);
            tokenStorage.clear();
            throw e            
        } finally {
            isRefreshing = false;
        }
    }
);