'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createMessage } from '@/lib/messages';
import { useRouter } from 'next/navigation';

export default function CreateMessagePage() {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [campus, setCampus] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();

    const MAX = 3000;
    const charCount = content.length;
    const counterClass = charCount > MAX ? 'over' : charCount > 160 ? 'warn' : '';

    // Auto-resize textarea
    const autoResize = useCallback(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }
    }, []);

    useEffect(() => {
        autoResize();
    }, [content, autoResize]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!content.trim()) {
            setError('Message content is required.');
            return;
        }

        if (!campus) {
            setError('Please select a campus.');
            return;
        }

        if (charCount > MAX) {
            setError(`Message must be ${MAX} characters or less.`);
            return;
        }

        setLoading(true);
        try {
            await createMessage({
                content: content.trim(),
                category: category || undefined,
                campus,
            });
            setContent('');
            setCategory('');
            setCampus('');
            setSuccess('Message posted anonymously! ✨ Redirecting...');
            setTimeout(() => router.push('/messages'), 1500);
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const axiosErr = err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
                if (axiosErr.response?.status === 429) {
                    setError('Too many messages! Please wait a minute before posting again.');
                } else if (axiosErr.response?.data?.errors) {
                    const firstError = Object.values(axiosErr.response.data.errors)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : 'Validation error.');
                } else {
                    setError(axiosErr.response?.data?.message || 'Failed to post message.');
                }
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="create-page">
            <motion.form
                className="create-card"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <h1 className="create-title">✍️ Write a Message</h1>
                <p className="create-subtitle">Share anonymously — no one will know it&apos;s you.</p>

                <textarea
                    ref={textareaRef}
                    className="create-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind? Write a message, a rant, or a story..."
                    maxLength={MAX}
                    rows={4}
                />

                <motion.div
                    className={`create-char ${counterClass}`}
                    animate={{ scale: charCount > 180 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {charCount}/{MAX}
                </motion.div>

                <div className="create-row">
                    <select
                        className="create-select"
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        style={{ marginRight: '0.5rem' }}
                    >
                        <option value="">Select Campus</option>
                        <option value="Main Campus">Main Campus</option>
                        <option value="Bulan">Bulan</option>
                        <option value="Magallanes">Magallanes</option>
                        <option value="Castilla">Castilla</option>
                        <option value="Baribag">Baribag</option>
                    </select>

                    <select
                        className="create-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">No category</option>
                        <option value="advice">💡 Advice</option>
                        <option value="confession">🤫 Confession / Rant</option>
                        <option value="fun">🎉 Fun</option>
                    </select>

                    <motion.button
                        className="create-submit"
                        type="submit"
                        disabled={loading || charCount === 0}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        {loading ? 'Posting...' : 'Post Anonymously'}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="create-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            className="create-success"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.form>
        </div>
    );
}
