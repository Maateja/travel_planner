import React, { createContext, useContext, useState, useEffect } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

export const LoadingProvider = ({ children }) => {
    const [requestCount, setRequestCount] = useState(0);
    const [manualLoading, setManualLoading] = useState(false);
    
    const showLoading = () => setManualLoading(true);
    const hideLoading = () => setManualLoading(false);

    const startRequest = () => setRequestCount(prev => prev + 1);
    const endRequest = () => setRequestCount(prev => Math.max(0, prev - 1));

    const isLoading = requestCount > 0 || manualLoading;

    return (
        <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, startRequest, endRequest }}>
            {children}
        </LoadingContext.Provider>
    );
};
