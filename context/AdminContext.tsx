'use client';

import React, { createContext, useContext, useState, useSyncExternalStore, useCallback } from 'react';
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

// SSR-safe hydration check using useSyncExternalStore
const emptySubscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useHydrated(): boolean {
    return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}

function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
}

function getStoredAdmin(): AdminProfile | null {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('admin_profile');
    if (saved) {
        try { return JSON.parse(saved); } catch { localStorage.removeItem('admin_profile'); }
    }
    return null;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const hydrated = useHydrated();
    const [token, setToken] = useState<string | null>(getStoredToken);
    const [admin, setAdmin] = useState<AdminProfile | null>(getStoredAdmin);

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

    // Don't render children until client is hydrated
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
