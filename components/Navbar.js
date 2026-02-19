'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Menu, X, ChefHat, Heart, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'glass-navbar py-3 shadow-2xl shadow-slate-900/5'
            : 'bg-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative">
                            <div className="bg-primary-500 p-2.5 rounded-2xl group-hover:rotate-[15deg] transition-all duration-500 shadow-xl shadow-primary-500/30 group-hover:shadow-primary-600/40">
                                <ChefHat className="text-white w-6 h-6" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-300 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white">
                            Global<span className="text-primary-500">Recipes</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-10">
                        <Link href="/" className="nav-link group flex items-center gap-1.5">
                            Home
                        </Link>
                        <Link href="/recipes" className="nav-link group flex items-center gap-1.5">
                            Recipes
                        </Link>
                        <Link href="/categories" className="nav-link group flex items-center gap-1.5">
                            Cuisines
                        </Link>
                        <Link href="/about" className="nav-link group flex items-center gap-1.5">
                            About
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search recipes..."
                                className="w-48 xl:w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/5 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500/50 transition-all duration-300"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        </div>

                        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 ml-2 pl-6">
                            {isAuthenticated ? (
                                <>
                                    <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                    
                                    {/* User Menu */}
                                    <div className="relative group">
                                        <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                            <User className="w-5 h-5" />
                                            <span className="font-bold text-sm">{user?.name}</span>
                                        </button>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                            <div className="p-2">
                                                {isSuperAdmin && (
                                                    <Link href="/super-admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                        <span className="text-sm font-bold">Super Admin</span>
                                                    </Link>
                                                )}
                                                {isAdmin && (
                                                    <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                        <span className="text-sm font-bold">Admin Panel</span>
                                                    </Link>
                                                )}
                                                <button 
                                                    onClick={logout}
                                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="text-sm font-bold">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-all">
                                        Login
                                    </Link>
                                    <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-4">
                        <button className="p-2 text-slate-600 dark:text-slate-400">
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-900 dark:text-white hover:bg-primary-500 hover:text-white transition-all duration-300"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <Link href="/" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-primary-500 transition-colors">Home</Link>
                    <Link href="/recipes" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-primary-500 transition-colors">Recipes</Link>
                    <Link href="/categories" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-primary-500 transition-colors">Cuisines</Link>
                    <Link href="/about" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-primary-500 transition-colors">About</Link>
                    
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Welcome, {user?.name}
                                </div>
                                {isSuperAdmin && (
                                    <Link href="/super-admin/dashboard" className="btn-primary w-full text-center">
                                        Super Admin
                                    </Link>
                                )}
                                {isAdmin && (
                                    <Link href="/admin/dashboard" className="btn-primary w-full text-center">
                                        Admin Panel
                                    </Link>
                                )}
                                <button 
                                    onClick={logout}
                                    className="w-full text-center px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn-primary w-full text-center">
                                    Login
                                </Link>
                                <Link href="/signup" className="w-full text-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
