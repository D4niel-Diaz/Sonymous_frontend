'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '@/lib/messages';
import { likeMessage } from '@/lib/messages';
import TextType from '@/components/TextType';

interface Props {
    message: Message;
    index: number;
}

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

const categoryConfig: Record<string, { emoji: string; badge: string; card: string }> = {
    advice: { emoji: '💡', badge: 'badge-advice', card: 'cat-advice' },
    confession: { emoji: '🤫', badge: 'badge-confession', card: 'cat-confession' },
    fun: { emoji: '🎉', badge: 'badge-fun', card: 'cat-fun' },
};

export default function MessageCard({ message, index }: Props) {
    const [likes, setLikes] = useState(message.likes_count);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hearts, setHearts] = useState<number[]>([]);
    const cardRef = useRef<HTMLDivElement>(null);

    const cat = message.category ? categoryConfig[message.category] : null;

    async function handleLike() {
        if (liked || loading) return;
        setLoading(true);

        // Spawn floating heart
        setHearts((prev) => [...prev, Date.now()]);
        setTimeout(() => setHearts((prev) => prev.slice(1)), 900);

        try {
            const newCount = await likeMessage(message.id);
            setLikes(newCount);
            setLiked(true);
        } catch {
            setLiked(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            ref={cardRef}
            className={`glass-card ${cat?.card || ''}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.45,
                delay: index * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            layout
        >
            <div className="card-content">
                <TextType
                    text={[message.content]}
                    typingSpeed={30}
                    initialDelay={index * 200 + 300}
                    pauseDuration={999999}
                    deletingSpeed={20}
                    loop={false}
                    showCursor={true}
                    cursorCharacter="_"
                    cursorBlinkDuration={0.5}
                    startOnVisible={true}
                    className="card-typing"
                />
            </div>

            <div className="card-footer">
                <div className="card-meta">
                    {cat && (
                        <span className={`category-badge ${cat.badge}`}>
                            {cat.emoji} {message.category}
                        </span>
                    )}
                    <span className="card-time">{timeAgo(message.created_at)}</span>
                </div>

                <div style={{ position: 'relative' }}>
                    {hearts.map((id) => (
                        <span key={id} className="heart-float" style={{ left: '50%', bottom: '100%' }}>
                            ❤️
                        </span>
                    ))}
                    <motion.button
                        className={`like-btn ${liked ? 'liked' : ''}`}
                        onClick={handleLike}
                        disabled={liked || loading}
                        whileTap={{ scale: 0.85 }}
                        whileHover={!liked ? { scale: 1.1 } : {}}
                        title={liked ? 'Already liked' : 'Like this message'}
                    >
                        {liked ? '❤️' : '🤍'} {likes}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
