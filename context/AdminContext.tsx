'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AdminProfile } from '@/lib/admin';

interface AdminContextType {
    token: string | null;
    admin: AdminProfile | null;
    isAuthenticated: boolean;
    login: (token: string, admin: AdminProfile) => void;
    logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
    token: null,
    admin: null,
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [admin, setAdmin] = useState<AdminProfile | null>(null);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('admin_token');
        const savedAdmin = localStorage.getItem('admin_profile');
        if (savedToken && savedAdmin) {
            setToken(savedToken);
            try {
                setAdmin(JSON.parse(savedAdmin));
            } catch {
                localStorage.removeItem('admin_profile');
            }
        }
        setHydrated(true);
    }, []);

    const login = useCallback((newToken: string, newAdmin: AdminProfile) => {
        setToken(newToken);
        setAdmin(newAdmin);
        localStorage.setItem('admin_token', newToken);
        localStorage.setItem('admin_profile', JSON.stringify(newAdmin));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setAdmin(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_profile');
    }, []);

    // Don't render children until localStorage is checked
    if (!hydrated) return null;

    return (
        <AdminContext.Provider
            value={{ token, admin, isAuthenticated: !!token, login, logout }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    return useContext(AdminContext);
}
