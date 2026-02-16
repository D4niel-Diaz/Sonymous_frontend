'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getMessages, likeMessage } from '@/lib/messages';
import type { Message } from '@/lib/messages';
import CategoryFilter from '@/components/CategoryFilter';
import TextType from '@/components/TextType';

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

const catConfig: Record<string, { emoji: string; avatar: string; name: string; bubble: string; badge: string; face: string }> = {
    advice: { emoji: '💡', avatar: 'avatar-advice', name: 'name-advice', bubble: 'bubble-advice', badge: 'badge-advice', face: '😊' },
    confession: { emoji: '🤫', avatar: 'avatar-confession', name: 'name-confession', bubble: 'bubble-confession', badge: 'badge-confession', face: '😔' },
    fun: { emoji: '🎉', avatar: 'avatar-fun', name: 'name-fun', bubble: 'bubble-fun', badge: 'badge-fun', face: '😄' },
};

const defaultCat = { emoji: '💬', avatar: 'avatar-default', name: 'name-default', bubble: 'bubble-default', badge: '', face: '😶' };

function MessageCard({ message, index }: { message: Message; index: number }) {
    const [likes, setLikes] = useState(message.likes_count);
    const [loading, setLoading] = useState(false);
    const [hearts, setHearts] = useState<number[]>([]);

    const cat = message.category ? catConfig[message.category] || defaultCat : defaultCat;

    useEffect(() => {
        setLikes(message.likes_count);
    }, [message.likes_count]);

    async function handleLike() {
        if (loading) return;
        setLoading(true);
        setLikes((prev) => prev + 1);
        setHearts((prev) => [...prev, Date.now()]);
        setTimeout(() => setHearts((prev) => prev.slice(1)), 900);

        try {
            const newCount = await likeMessage(message.id);
            setLikes(newCount);
        } catch {
            setLikes((prev) => prev - 1);
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            className="msg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
            layout
        >
            <div className="msg-card-header">
                <div className="msg-card-user">
                    <span className="msg-card-label">anonymous message</span>
                    <span className={`msg-card-name ${cat.name}`}>
                        {message.category ? `${cat.emoji} ${message.category.charAt(0).toUpperCase() + message.category.slice(1)}` : 'Anonymous'}
                    </span>
                    <span className="msg-card-time">{formatTime(message.created_at)} · {timeAgo(message.created_at)}</span>
                </div>
                <div className={`msg-avatar ${cat.avatar}`}>
                    {cat.face}
                </div>
            </div>

            <div className={`msg-bubble ${cat.bubble}`}>
                <TextType
                    text={[message.content]}
                    typingSpeed={25}
                    initialDelay={index * 150 + 200}
                    pauseDuration={999999}
                    loop={false}
                    showCursor={false}
                    startOnVisible={true}
                    className="card-typing"
                />
            </div>

            <div className="msg-actions">
                <div className="msg-actions-left" style={{ position: 'relative' }}>
                    {hearts.map((id) => (
                        <span key={id} className="heart-float" style={{ left: '8px', bottom: '100%' }}>❤️</span>
                    ))}
                    <motion.button
                        className="msg-action-btn"
                        onClick={handleLike}
                        disabled={loading}
                        whileTap={{ scale: 0.85 }}
                    >
                        ❤️ <span className="action-count">{likes}</span>
                    </motion.button>
                </div>
                {message.category && (
                    <span className={`msg-badge ${cat.badge}`}>
                        {cat.emoji} {message.category}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

function SkeletonCards() {
    return (
        <div className="skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="skeleton-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                >
                    <div className="skeleton-line w-50" />
                    <div className="skeleton-line w-75" />
                    <div className="skeleton-line w-90" style={{ height: 60, borderRadius: 14 }} />
                    <div className="skeleton-line short" />
                </motion.div>
            ))}
        </div>
    );
}

export default function BrowseMessagesPage() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || '';

    const [messages, setMessages] = useState<Message[]>([]);
    const [category, setCategory] = useState(initialCategory);
    const [campus, setCampus] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchMessages = useCallback(async (pageNum: number, append: boolean = false) => {
        if (!campus) return; // Don't fetch if no campus selected
        try {
            const res = await getMessages(category || undefined, campus, pageNum);
            if (append) {
                setMessages((prev) => [...prev, ...res.data]);
            } else {
                setMessages(res.data);
            }
            setLastPage(res.meta.last_page);
            setTotal(res.meta.total);
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [category, campus]);

    // Reset when category or campus changes
    useEffect(() => {
        if (campus) {
            setLoading(true);
            setPage(1);
            fetchMessages(1, false);
        }
    }, [fetchMessages, campus]);

    // Auto-refresh current messages every 30s
    useEffect(() => {
        if (!campus) return;
        const interval = setInterval(() => {
            fetchMessages(1, false);
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchMessages, campus]);

    function handleLoadMore() {
        const nextPage = page + 1;
        setPage(nextPage);
        setLoadingMore(true);
        fetchMessages(nextPage, true);
    }

    const hasMore = page < lastPage;

    if (!campus) {
        return (
            <div className="campus-selection-overlay" style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="campus-card"
                    style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '16px', border: '1px solid #333', maxWidth: '400px', width: '100%', textAlign: 'center' }}
                >
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>🏫 Select Campus</h2>
                    <p style={{ color: '#888', marginBottom: '2rem' }}>To browse messages, please select your campus.</p>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {['Main Campus', 'Bulan', 'Magallanes', 'Castilla', 'Baribag'].map((c) => (
                            <button
                                key={c}
                                onClick={() => setCampus(c)}
                                className="campus-btn"
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    background: '#333',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    textAlign: 'left'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.background = '#444')}
                                onMouseOut={(e) => (e.currentTarget.style.background = '#333')}
                            >
                                📍 {c}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="browse-page">
            <motion.div
                className="browse-header"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <h1 className="browse-title">💬 Message Wall</h1>
                    <button
                        onClick={() => setCampus('')}
                        style={{
                            fontSize: '0.8rem', padding: '0.3rem 0.8rem', borderRadius: '20px',
                            background: '#333', border: 'none', color: '#ccc', cursor: 'pointer'
                        }}
                    >
                        📍 {campus} (Change)
                    </button>
                </div>
                <p className="browse-subtitle">
                    Read what others have shared — anonymously.
                    {total > 0 && <span className="browse-count"> · {total} messages</span>}
                </p>
            </motion.div>

            <CategoryFilter selected={category} onChange={setCategory} />

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SkeletonCards />
                    </motion.div>
                ) : messages.length === 0 ? (
                    <motion.div
                        key="empty"
                        className="empty-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.span
                            className="empty-emoji"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        >
                            📭
                        </motion.span>
                        <p className="empty-text">No messages yet. Be the first to share!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="messages-grid">
                            {messages.map((msg, i) => (
                                <MessageCard key={msg.id} message={msg} index={i} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <motion.div
                                className="load-more-container"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.button
                                    className="load-more-btn"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {loadingMore ? (
                                        <>⏳ Loading...</>
                                    ) : (
                                        <>📬 Load More Messages</>
                                    )}
                                </motion.button>
                                <p className="load-more-info">
                                    Showing {messages.length} of {total} messages
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
