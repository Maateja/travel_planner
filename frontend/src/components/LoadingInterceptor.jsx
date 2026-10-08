import { useEffect } from 'react';
import api from '../api';
import { useLoading } from '../context/LoadingContext';

const LoadingInterceptor = () => {
    const { startRequest, endRequest } = useLoading();

    // Handle Axios Interceptors
    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                if (config.skipLoader) {
                    return config;
                }
                // For API calls, show if they take longer than 150ms
                const timer = setTimeout(() => {
                    startRequest();
                }, 150); 
                config.loadingTimer = timer;
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const responseInterceptor = api.interceptors.response.use(
            (response) => {
                if (response.config.loadingTimer) {
                    clearTimeout(response.config.loadingTimer);
                }
                if (response.config.skipLoader) {
                    return response;
                }
                // Minimum duration to prevent flickering
                setTimeout(() => endRequest(), 200);
                return response;
            },
            (error) => {
                if (error.config?.loadingTimer) {
                    clearTimeout(error.config.loadingTimer);
                }
                if (!error.config?.skipLoader) {
                    endRequest();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [startRequest, endRequest]);

    return null;
};

export default LoadingInterceptor;
