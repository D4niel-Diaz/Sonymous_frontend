'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';

export default function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, admin, logout } = useAdmin();
    const [menuOpen, setMenuOpen] = useState(false);

    const isLanding = pathname === '/';
    const isAdmin = pathname.startsWith('/admin');

    // Close the mobile menu
    function closeMenu() {
        setMenuOpen(false);
    }

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    return (
        <nav className="navbar">
            <Link href="/" className="navbar-brand" onClick={closeMenu}>
                📝 <span>SoNymous</span>
            </Link>

            {/* Hamburger toggle — visible only on mobile via CSS */}
            <button
                className={`hamburger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
            >
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
            </button>

            {/* Backdrop overlay for mobile */}
            {menuOpen && (
                <div
                    className="nav-backdrop"
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}

            <div className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
                {/* Landing page: minimal — CTAs handle navigation */}
                {isLanding && (
                    <>
                        {isAuthenticated ? (
                            <Link href="/admin/dashboard" className="navbar-link" onClick={closeMenu}>
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/admin" className="navbar-link" onClick={closeMenu}>
                                🔒 Admin
                            </Link>
                        )}
                    </>
                )}

                {/* Public pages (Browse, Write): show navigation links */}
                {!isLanding && !isAdmin && (
                    <>
                        <Link href="/" className="navbar-link" onClick={closeMenu}>Home</Link>
                        <Link href="/messages" className={`navbar-link ${pathname === '/messages' ? 'active' : ''}`} onClick={closeMenu}>
                            Browse
                        </Link>
                        <Link href="/create" className={`navbar-link ${pathname === '/create' ? 'active' : ''}`} onClick={closeMenu}>
                            Write
                        </Link>
                    </>
                )}

                {/* Admin pages: show dashboard + logout only */}
                {isAdmin && isAuthenticated && (
                    <>
                        <Link href="/" className="navbar-link" onClick={closeMenu}>Home</Link>
                        <Link
                            href="/admin/dashboard"
                            className={`navbar-link ${pathname === '/admin/dashboard' ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            Dashboard
                        </Link>
                        <button onClick={() => { logout(); closeMenu(); }} className="navbar-link" aria-label="Logout">
                            Logout ({admin?.name})
                        </button>
                    </>
                )}

                {/* Admin login page when not authenticated */}
                {isAdmin && !isAuthenticated && (
                    <Link href="/" className="navbar-link" onClick={closeMenu}>Home</Link>
                )}
            </div>
        </nav>
    );
}
