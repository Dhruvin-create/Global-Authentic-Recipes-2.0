'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Menu, X, ChefHat, Heart, User, LogOut, Settings } from 'lucide-react';
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
            ? 'glass-navbar py-3 shadow-2xl shadow-slate-900/10 border-b border-white/20'
            : 'bg-gradient-to-b from-white/95 via-white/90 to-transparent dark:from-slate-950/95 dark:via-slate-950/90 backdrop-blur-xl py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative">
                            <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-orange-500 p-2.5 rounded-2xl group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 shadow-xl shadow-primary-500/40 group-hover:shadow-2xl group-hover:shadow-primary-600/50">
                                <ChefHat className="text-white w-6 h-6" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full animate-ping opacity-75"></div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-2xl font-display font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
                            Global<span className="bg-gradient-to-r from-primary-500 via-orange-500 to-primary-600 bg-clip-text text-transparent">Recipes</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2">
                        <Link href="/" className="nav-link group flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 transition-all duration-300">
                            <span className="relative">
                                Home
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                            </span>
                        </Link>
                        <Link href="/recipes" className="nav-link group flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 transition-all duration-300">
                            <span className="relative">
                                Recipes
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                            </span>
                        </Link>
                        <Link href="/categories" className="nav-link group flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 transition-all duration-300">
                            <span className="relative">
                                Cuisines
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                            </span>
                        </Link>
                        <Link href="/about" className="nav-link group flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 transition-all duration-300">
                            <span className="relative">
                                About
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                            </span>
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search recipes..."
                                className="w-48 xl:w-64 pl-10 pr-4 py-2.5 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700/50 rounded-full text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 focus:shadow-lg focus:shadow-primary-500/10 transition-all duration-300 hover:shadow-md"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 group-focus-within:scale-110 transition-all duration-300" />
                        </div>

                        <div className="flex items-center gap-2 border-l border-slate-200/50 dark:border-slate-700/50 ml-2 pl-6">
                            {isAuthenticated ? (
                                <>
                                    <button className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-primary-500 hover:bg-gradient-to-br hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                    
                                    {/* User Menu */}
                                    <div className="relative group">
                                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 border border-slate-200/50 dark:border-slate-700/50 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
                                            <User className="w-5 h-5" />
                                            <span className="font-bold text-sm">{user?.name}</span>
                                        </button>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 top-full mt-3 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 group-hover:translate-y-0 translate-y-2 backdrop-blur-xl">
                                            <div className="p-2">
                                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 transition-all duration-300 hover:scale-105">
                                                    <Settings className="w-4 h-4" />
                                                    <span className="text-sm font-bold">Profile Settings</span>
                                                </Link>
                                                {isSuperAdmin && (
                                                    <Link href="/super-admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 hover:scale-105">
                                                        <span className="text-sm font-bold">Super Admin</span>
                                                    </Link>
                                                )}
                                                {isAdmin && (
                                                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 transition-all duration-300 hover:scale-105">
                                                        <span className="text-sm font-bold">Admin Panel</span>
                                                    </Link>
                                                )}
                                                <button 
                                                    onClick={logout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-105"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="text-sm font-bold">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Profile Button for Non-Authenticated Users */
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 border border-slate-200/50 dark:border-slate-700/50 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
                                        <User className="w-5 h-5" />
                                        <span className="font-bold text-sm">Account</span>
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 top-full mt-3 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 group-hover:translate-y-0 translate-y-2 backdrop-blur-xl">
                                        <div className="p-2">
                                            <Link href="/login" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 transition-all duration-300 hover:scale-105">
                                                <User className="w-4 h-4" />
                                                <span className="text-sm font-bold">Login</span>
                                            </Link>
                                            <Link href="/signup" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 text-primary-600 dark:text-primary-400 transition-all duration-300 hover:scale-105">
                                                <span className="text-sm font-bold">Sign Up</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-3">
                        <button className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 rounded-xl transition-all duration-300 hover:scale-110">
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl text-slate-900 dark:text-white hover:from-primary-500 hover:to-orange-500 hover:text-white border border-slate-200/50 dark:border-slate-700/50 hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-white via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 border-b-2 border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="p-6 space-y-3 max-h-[80vh] overflow-y-auto">
                    <Link href="/" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-primary-500 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 transition-all duration-300 hover:scale-105 hover:shadow-md">Home</Link>
                    <Link href="/recipes" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-primary-500 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 transition-all duration-300 hover:scale-105 hover:shadow-md">Recipes</Link>
                    <Link href="/categories" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-primary-500 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 transition-all duration-300 hover:scale-105 hover:shadow-md">Cuisines</Link>
                    <Link href="/about" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-primary-500 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 dark:hover:from-primary-900/20 dark:hover:to-orange-900/20 transition-all duration-300 hover:scale-105 hover:shadow-md">About</Link>
                    
                    <div className="pt-6 mt-3 border-t-2 border-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 flex flex-col gap-3">
                        {isAuthenticated ? (
                            <>
                                <div className="text-sm text-slate-600 dark:text-slate-400 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl">
                                    Welcome, <span className="font-bold text-primary-600 dark:text-primary-400">{user?.name}</span>
                                </div>
                                <Link href="/profile" className="btn-primary w-full text-center py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                    Profile Settings
                                </Link>
                                {isSuperAdmin && (
                                    <Link href="/super-admin/dashboard" className="w-full text-center px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                        Super Admin
                                    </Link>
                                )}
                                {isAdmin && (
                                    <Link href="/admin/dashboard" className="w-full text-center px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-bold hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                        Admin Panel
                                    </Link>
                                )}
                                <button 
                                    onClick={logout}
                                    className="w-full text-center px-4 py-3 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="w-full text-center px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-900 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                                    Login
                                </Link>
                                <Link href="/signup" className="btn-primary w-full text-center py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Welcome, {user?.name}
                                </div>
                                <Link href="/profile" className="btn-primary w-full text-center">
                                    Profile Settings
                                </Link>
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
                                <Link href="/login" className="w-full text-center px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    Login
                                </Link>
                                <Link href="/signup" className="btn-primary w-full text-center">
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
