'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { getAdminMessages, deleteMessage, createAnnouncement, deleteAnnouncement } from '@/lib/admin';
import type { Message } from '@/lib/messages';
import type { Announcement } from '@/lib/announcements';
import { getAnnouncements } from '@/lib/announcements';

export default function AdminDashboardPage() {
    const { isAuthenticated, admin, logout } = useAdmin();
    const router = useRouter();

    const [view, setView] = useState<'messages' | 'announcements'>('messages');
    const [messages, setMessages] = useState<Message[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'deleted'
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // New Announcement State
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
    const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin');
        }
    }, [isAuthenticated, router]);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            if (view === 'messages') {
                const params: Record<string, string | number> = { page };
                if (filter === 'active') params.is_deleted = 'false';
                if (filter === 'deleted') params.is_deleted = 'true';

                const res = await getAdminMessages(params as { page?: number; is_deleted?: string });
                setMessages(res.data);
                setMeta(res.meta);
            } else {
                const res = await getAnnouncements();
                setAnnouncements(res);
            }
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const axiosErr = err as { response?: { status?: number } };
                if (axiosErr.response?.status === 401) {
                    logout();
                    router.push('/admin');
                }
            }
        } finally {
            setLoading(false);
        }
    }, [page, filter, logout, router, view]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMessages();
        }
    }, [isAuthenticated, fetchMessages]);

    function showToast(type: 'success' | 'error', message: string) {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    }

    async function handleCreateAnnouncement(e: React.FormEvent) {
        e.preventDefault();
        try {
            await createAnnouncement({ ...newAnnouncement, is_active: true });
            setNewAnnouncement({ title: '', content: '' });
            setIsCreatingAnnouncement(false);
            showToast('success', 'Announcement created!');
            fetchMessages();
        } catch (error) {
            showToast('error', 'Failed to create announcement.');
        }
    }

    async function handleDeleteAnnouncement(id: number) {
        if (!confirm('Delete this announcement?')) return;
        try {
            await deleteAnnouncement(id);
            showToast('success', 'Announcement deleted.');
            fetchMessages();
        } catch (error) {
            showToast('error', 'Failed to delete announcement.');
        }
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
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                        <button
                            className={`filter-pill ${view === 'messages' ? 'active' : ''}`}
                            onClick={() => setView('messages')}
                        >
                            Messages
                        </button>
                        <button
                            className={`filter-pill ${view === 'announcements' ? 'active' : ''}`}
                            onClick={() => setView('announcements')}
                        >
                            Announcements
                        </button>
                    </div>
                </div>
                <div className="dashboard-stats">
                    {view === 'messages' ? (
                        <>
                            <div className="stat-badge">
                                ✅ Active: <span className="count">{messages.filter((m) => !m.is_deleted).length}</span>
                            </div>
                            <div className="stat-badge">
                                🗑️ Deleted: <span className="count">{messages.filter((m) => m.is_deleted).length}</span>
                            </div>
                        </>
                    ) : (
                        <div className="stat-badge">
                            📢 Total: <span className="count">{announcements.length}</span>
                        </div>
                    )}
                </div>
            </div>

            {view === 'messages' ? (
                <>
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
                            <div className="table-scroll-wrapper">
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
                            </div>

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
                </>
            ) : (
                <div className="announcements-view">
                    <div style={{ marginBottom: '1rem' }}>
                        <button className="btn-primary" onClick={() => setIsCreatingAnnouncement(!isCreatingAnnouncement)}>
                            {isCreatingAnnouncement ? 'Cancel' : '➕ New Announcement'}
                        </button>
                    </div>

                    {isCreatingAnnouncement && (
                        <form onSubmit={handleCreateAnnouncement} className="create-card" style={{ marginBottom: '2rem' }}>
                            <input
                                type="text"
                                placeholder="Title"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                className="create-textarea"
                                style={{ height: 'auto', marginBottom: '0.5rem' }}
                                required
                            />
                            <textarea
                                placeholder="Content"
                                value={newAnnouncement.content}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                className="create-textarea"
                                style={{ minHeight: '100px' }}
                                required
                            />
                            <button type="submit" className="create-submit" style={{ marginTop: '0.5rem' }}>
                                Publish
                            </button>
                        </form>
                    )}

                    <div className="table-scroll-wrapper">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Content</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.map((a) => (
                                    <tr key={a.id}>
                                        <td>#{a.id}</td>
                                        <td>{a.title}</td>
                                        <td>{a.content}</td>
                                        <td>{formatDate(a.created_at)}</td>
                                        <td>
                                            <button className="btn-delete" onClick={() => handleDeleteAnnouncement(a.id)}>
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
