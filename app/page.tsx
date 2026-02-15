'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ── Left Section ── */}
      <motion.div
        className="landing-left"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="landing-logo">SoNymous</div>
        <div className="landing-tagline">a safe space for sorsu students</div>

        <h1 className="landing-headline">
          <span className="line">Free to share your thoughts?</span>
          <span className="line">Want to listen?</span>
          <span className="line">
            You&apos;ve come to the{' '}
            <span className="highlight">right place.</span>
          </span>
        </h1>

        <p className="landing-desc">
          Share your thoughts, rants, and stories completely anonymously.
          No accounts, no judgment — just a safe wall where every voice matters.
        </p>

        <div className="landing-cta">
          <Link href="/create" className="btn-primary">
            ✍️ Write a Message, Rant, or Story
          </Link>
          <div className="btn-row">
            <Link href="/messages" className="btn-outline">
              💬 Browse Messages
            </Link>
            <Link href="/messages?category=confession" className="btn-outline">
              🤫 Browse Rants
            </Link>
          </div>
        </div>

        <p className="landing-footer-note">Free. No signup required!</p>

        <div className="landing-socials">
          <p className="socials-heading">Follow me on my social media</p>
          <div className="socials-icons">
            <a href="https://www.instagram.com/_danyeeeeeel?igsh=MW9panR1OGZ1MzBydQ==" target="_blank" rel="noopener noreferrer" className="social-btn social-ig">
              📷 Instagram
            </a>
            <a href="https://www.facebook.com/share/1KHVNxXuZJ/" target="_blank" rel="noopener noreferrer" className="social-btn social-fb">
              👤 Facebook
            </a>
          </div>
        </div>
      </motion.div>

      {/* ── Right Section (Preview) ── */}
      <motion.div
        className="landing-right"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
      >
        <div className="preview-float-1">
          &quot;Daniel&quot;
        </div>

        <motion.div
          className="preview-card"
          initial={{ y: 10, rotate: -2 }}
          animate={{ y: [10, -5, 10], rotate: [-2, -1, -2] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          <p className="preview-content">
            &quot;Wag po tayong Bastos and Enjoy langg&quot;
          </p>
          <div className="preview-meta">
            <span>❤️ </span>
            <span className="preview-dot" />
            <span>Admin</span>

          </div>
        </motion.div>

        <div className="preview-float-2">
          &quot;Stay strong, sorsu students ✊&quot;
        </div>
      </motion.div>
    </div>
  );
}
