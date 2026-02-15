'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';

export default function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, admin, logout } = useAdmin();

    const isLanding = pathname === '/';
    const isAdmin = pathname.startsWith('/admin');

    return (
        <nav className="navbar">
            <Link href="/" className="navbar-brand">
                📝 <span>SoNymous</span>
            </Link>

            <div className="navbar-links">
                {/* Landing page: minimal — CTAs handle navigation */}
                {isLanding && (
                    <>
                        {isAuthenticated ? (
                            <Link href="/admin/dashboard" className="navbar-link">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/admin" className="navbar-link">
                                🔒 Admin
                            </Link>
                        )}
                    </>
                )}

                {/* Public pages (Browse, Write): show navigation links */}
                {!isLanding && !isAdmin && (
                    <>
                        <Link href="/" className="navbar-link">Home</Link>
                        <Link href="/messages" className={`navbar-link ${pathname === '/messages' ? 'active' : ''}`}>
                            Browse
                        </Link>
                        <Link href="/create" className={`navbar-link ${pathname === '/create' ? 'active' : ''}`}>
                            Write
                        </Link>
                    </>
                )}

                {/* Admin pages: show dashboard + logout only */}
                {isAdmin && isAuthenticated && (
                    <>
                        <Link href="/" className="navbar-link">Home</Link>
                        <Link
                            href="/admin/dashboard"
                            className={`navbar-link ${pathname === '/admin/dashboard' ? 'active' : ''}`}
                        >
                            Dashboard
                        </Link>
                        <button onClick={logout} className="navbar-link" aria-label="Logout">
                            Logout ({admin?.name})
                        </button>
                    </>
                )}

                {/* Admin login page when not authenticated */}
                {isAdmin && !isAuthenticated && (
                    <Link href="/" className="navbar-link">Home</Link>
                )}
            </div>
        </nav>
    );
}
