'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createMessage } from '@/lib/messages';
import type { Message } from '@/lib/messages';

interface Props {
    onMessageCreated: (message: Message) => void;
}

export default function MessageForm({ onMessageCreated }: Props) {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const charCount = content.length;
    const MAX = 200;

    const counterClass = charCount > MAX ? 'over' : charCount > 160 ? 'warn' : '';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!content.trim()) {
            setError('Message content is required.');
            return;
        }

        if (charCount > MAX) {
            setError(`Message must be ${MAX} characters or less.`);
            return;
        }

        setLoading(true);
        try {
            const msg = await createMessage({
                content: content.trim(),
                category: category || undefined,
            });
            setContent('');
            setCategory('');
            setSuccess('Message posted anonymously! ✨');
            onMessageCreated(msg);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            if (
                typeof err === 'object' &&
                err !== null &&
                'response' in err
            ) {
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
        <motion.form
            className="form-container"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <h2 className="form-title">💬 Share your thoughts anonymously</h2>

            <textarea
                className="form-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something... be kind, be honest, be anonymous."
                maxLength={MAX}
                rows={3}
            />

            <motion.div
                className={`char-counter ${counterClass}`}
                animate={{ scale: charCount > 180 ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 0.2 }}
            >
                {charCount}/{MAX}
            </motion.div>

            <div className="form-row">
                <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">No category</option>
                    <option value="advice">💡 Advice</option>
                    <option value="confession">🤫 Confession</option>
                    <option value="fun">🎉 Fun</option>
                </select>

                <motion.button
                    className="form-submit"
                    type="submit"
                    disabled={loading || charCount === 0}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {loading ? 'Posting...' : 'Post Message'}
                </motion.button>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        className="form-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        className="form-success"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {success}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>
    );
}
