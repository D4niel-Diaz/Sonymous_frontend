'use client';

import { motion } from 'framer-motion';

const CATEGORIES = [
    { value: '', label: 'All', emoji: '✨' },
    { value: 'advice', label: 'Advice', emoji: '💡' },
    { value: 'confession', label: 'Confession', emoji: '🤫' },
    { value: 'fun', label: 'Fun', emoji: '🎉' },
];

interface Props {
    selected: string;
    onChange: (category: string) => void;
}

export default function CategoryFilter({ selected, onChange }: Props) {
    return (
        <motion.div
            className="filter-bar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            {CATEGORIES.map((cat) => (
                <motion.button
                    key={cat.value}
                    className={`filter-pill ${selected === cat.value ? 'active' : ''}`}
                    onClick={() => onChange(cat.value)}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    layout
                >
                    {cat.emoji} {cat.label}
                </motion.button>
            ))}
        </motion.div>
    );
}
