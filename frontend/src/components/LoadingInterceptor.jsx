import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { useLoading } from '../context/LoadingContext';

const LoadingInterceptor = () => {
    const { startRequest, endRequest, showLoading, hideLoading } = useLoading();
    const location = useLocation();
    const [initialLoad, setInitialLoad] = useState(true);

    // Handle Initial App Load / Page Refresh
    useEffect(() => {
        if (initialLoad) {
            showLoading();
            const timer = setTimeout(() => {
                hideLoading();
                setInitialLoad(false);
            }, 1500); 
            return () => clearTimeout(timer);
        }
    }, [initialLoad, showLoading, hideLoading]);

    // Show loader on route change
    useEffect(() => {
        if (!initialLoad) {
            showLoading();
            const timer = setTimeout(() => hideLoading(), 800);
            return () => clearTimeout(timer);
        }
    }, [location.pathname]);

    // Handle Axios Interceptors
    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                // For API calls, show if they take longer than 100ms
                const timer = setTimeout(() => {
                    startRequest();
                }, 100); 
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
                // Minimum duration to prevent flickering
                setTimeout(() => endRequest(), 200);
                return response;
            },
            (error) => {
                if (error.config?.loadingTimer) {
                    clearTimeout(error.config.loadingTimer);
                }
                endRequest();
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
