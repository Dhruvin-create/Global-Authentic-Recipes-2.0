'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    UtensilsCrossed,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
        if (!user || user.role !== 'ADMIN') {
            router.push('/admin/login');
        } else {
            setIsAdmin(true);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    if (!isAdmin) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />;

    const navigation = [
        { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Recipes', href: '/admin/dashboard/recipes', icon: UtensilsCrossed },
        { name: 'Users', href: '/admin/dashboard/users', icon: Users },
        { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
            {/* Mobile Sidebar Overlay */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary-600 text-white rounded-full shadow-2xl"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out`}
            >
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center justify-between mb-10">
                        <Link href="/admin/dashboard" className="text-2xl font-display font-bold">
                            Global<span className="text-primary-600">Recipes</span>
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={isActive ? 'text-primary-600' : 'group-hover:text-primary-500 transition-colors'} />
                                        <span>{item.name}</span>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all duration-200"
                        >
                            <LogOut size={20} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-bottom border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                    </h2>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium">Chef Admin</p>
                            <p className="text-xs text-slate-500">Master of the Kitchen</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=f97316&color=fff" alt="Avatar" />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
