"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";

interface HeaderProps {
    user?: { email?: string } | null;
    isAdmin?: boolean;
}

export function Header({ user, isAdmin }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24 relative">

                    {/* Left Side Navigation (Admin Only) */}
                    <div className="flex-1 flex items-center">
                        <div className="hidden md:flex items-center gap-6">
                            {isAdmin && (
                                <NavLink href="/admin" active={pathname.startsWith("/admin")}>
                                    Admin Dashboard
                                </NavLink>
                            )}
                        </div>
                        {/* Mobile menu toggle (Left aligned now for balance) */}
                        <button
                            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>

                    {/* Center Logo */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <Logo />
                    </div>

                    {/* Right Side Auth */}
                    <div className="flex-1 flex items-center justify-end gap-3">
                        {user ? (
                            <form action={signOut}>
                                <button type="submit" className="btn-secondary text-sm py-2 px-4 shadow-sm">
                                    Sign Out
                                </button>
                            </form>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm font-medium text-carmelita-dark hover:text-carmelita-red transition-colors bg-carmelita-cream/50 hover:bg-carmelita-cream px-4 py-2 rounded-full hidden md:block"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-gray-100 py-4 space-y-2 animate-fade-in">
                        <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>
                            Home
                        </MobileNavLink>
                        <MobileNavLink href="/book" onClick={() => setMenuOpen(false)}>
                            Book a Table
                        </MobileNavLink>
                        {isAdmin && (
                            <MobileNavLink href="/admin" onClick={() => setMenuOpen(false)}>
                                Admin Dashboard
                            </MobileNavLink>
                        )}
                        <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                            {user ? (
                                <form action={signOut}>
                                    <button
                                        type="submit"
                                        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600"
                                    >
                                        Sign Out
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-carmelita-dark"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-medium text-carmelita-dark"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}

function NavLink({
    href,
    children,
    active,
}: {
    href: string;
    children: React.ReactNode;
    active: boolean;
}) {
    return (
        <Link
            href={href}
            className={`text-sm font-medium transition-colors hover:text-carmelita-red ${active ? "text-carmelita-red" : "text-gray-600"
                }`}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({
    href,
    children,
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-4 py-2 text-sm font-medium text-carmelita-dark hover:text-carmelita-red hover:bg-gray-50 rounded-lg transition-colors"
        >
            {children}
        </Link>
    );
}
