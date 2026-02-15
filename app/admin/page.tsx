'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { adminLogin } from '@/lib/admin';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAdmin();
    const router = useRouter();

    // If already logged in, redirect
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/admin/dashboard');
        }
    }, [isAuthenticated, router]);

    if (isAuthenticated) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        setLoading(true);
        try {
            const data = await adminLogin(email, password);
            login(data.token, data.admin);
            router.push('/admin/dashboard');
        } catch (err: unknown) {
            if (
                typeof err === 'object' &&
                err !== null &&
                'response' in err
            ) {
                const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
                if (axiosErr.response?.status === 401) {
                    setError('Invalid email or password.');
                } else if (axiosErr.response?.status === 429) {
                    setError('Too many login attempts. Please wait a minute.');
                } else if (axiosErr.response?.status === 422) {
                    setError('Please enter a valid email and password.');
                } else {
                    setError(axiosErr.response?.data?.message || 'Login failed.');
                }
            } else {
                setError('Network error. Is the backend running?');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="admin-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1 className="login-title">🔒 Admin Login</h1>
                <p className="login-subtitle">Moderation panel access</p>

                <label className="login-label" htmlFor="admin-email">
                    Email
                </label>
                <input
                    id="admin-email"
                    className="login-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="daniel@gmail.com"
                    autoComplete="email"
                />

                <label className="login-label" htmlFor="admin-password">
                    Password
                </label>
                <input
                    id="admin-password"
                    className="login-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                />

                {error && <div className="form-error">{error}</div>}

                <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
