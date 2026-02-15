'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { getAdminMessages, deleteMessage } from '@/lib/admin';
import type { Message } from '@/lib/messages';

export default function AdminDashboardPage() {
    const { isAuthenticated, admin, logout } = useAdmin();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'deleted'
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin');
        }
    }, [isAuthenticated, router]);

    const fetchMessages = useCallback(async () => {
        try {
            const params: Record<string, string | number> = { page };
            if (filter === 'active') params.is_deleted = 'false';
            if (filter === 'deleted') params.is_deleted = 'true';

            const res = await getAdminMessages(params as { page?: number; is_deleted?: string });
            setMessages(res.data);
            setMeta(res.meta);
        } catch (err: unknown) {
            if (
                typeof err === 'object' &&
                err !== null &&
                'response' in err
            ) {
                const axiosErr = err as { response?: { status?: number } };
                if (axiosErr.response?.status === 401) {
                    logout();
                    router.push('/admin');
                }
            }
        } finally {
            setLoading(false);
        }
    }, [page, filter, logout, router]);

    useEffect(() => {
        if (isAuthenticated) {
            setLoading(true);
            fetchMessages();
        }
    }, [isAuthenticated, fetchMessages]);

    function showToast(type: 'success' | 'error', message: string) {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this message?')) return;

        setDeleting(id);
        try {
            await deleteMessage(id);
            setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, is_deleted: true } : m))
            );
            showToast('success', `Message #${id} deleted successfully.`);
        } catch (err: unknown) {
            if (
                typeof err === 'object' &&
                err !== null &&
                'response' in err
            ) {
                const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
                showToast('error', axiosErr.response?.data?.message || 'Failed to delete message.');
            } else {
                showToast('error', 'Network error.');
            }
        } finally {
            setDeleting(null);
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    if (!isAuthenticated) return null;

    const activeCount = messages.filter((m) => !m.is_deleted).length;
    const deletedCount = messages.filter((m) => m.is_deleted).length;

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Moderation Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        Welcome, {admin?.name} · {meta.total} total messages
                    </p>
                </div>
                <div className="dashboard-stats">
                    <div className="stat-badge">
                        ✅ Active: <span className="count">{activeCount}</span>
                    </div>
                    <div className="stat-badge">
                        🗑️ Deleted: <span className="count">{deletedCount}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-filters">
                {['all', 'active', 'deleted'].map((f) => (
                    <button
                        key={f}
                        className={`filter-pill ${filter === f ? 'active' : ''}`}
                        onClick={() => { setFilter(f); setPage(1); }}
                    >
                        {f === 'all' ? '📋 All' : f === 'active' ? '✅ Active' : '🗑️ Deleted'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner" />
                </div>
            ) : messages.length === 0 ? (
                <div className="empty-state">
                    <span className="emoji">📭</span>
                    No messages found.
                </div>
            ) : (
                <>
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Content</th>
                                <th>Category</th>
                                <th>Likes</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((msg) => (
                                <tr key={msg.id} className={msg.is_deleted ? 'deleted' : ''}>
                                    <td>#{msg.id}</td>
                                    <td style={{ maxWidth: '320px' }}>
                                        {msg.content.length > 80
                                            ? msg.content.slice(0, 80) + '…'
                                            : msg.content}
                                    </td>
                                    <td>
                                        {msg.category ? (
                                            <span className="paper-category" style={{ fontSize: '0.7rem' }}>
                                                {msg.category}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                                        )}
                                    </td>
                                    <td>{msg.likes_count}</td>
                                    <td>
                                        {msg.is_deleted ? (
                                            <span className="status-badge deleted-badge">Deleted</span>
                                        ) : (
                                            <span className="status-badge active">Active</span>
                                        )}
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(msg.created_at)}</td>
                                    <td>
                                        {!msg.is_deleted ? (
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(msg.id)}
                                                disabled={deleting === msg.id}
                                            >
                                                {deleting === msg.id ? '...' : '🗑️ Delete'}
                                            </button>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {meta.last_page > 1 && (
                        <div className="pagination">
                            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                ← Previous
                            </button>
                            <span>
                                Page {meta.current_page} of {meta.last_page}
                            </span>
                            <button disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}

            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
