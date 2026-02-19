'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: email, password }),
            });

            const data = await res.json();

            if (data.success && data.data.user.role === 'ADMIN') {
                localStorage.setItem('adminToken', data.data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.data.user));
                router.push('/admin/dashboard');
            } else if (data.success) {
                setError('Access denied. Admin role required.');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-height-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <div className="glass-card w-full max-w-md p-8 rounded-3xl relative animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">
                        Admin <span className="text-primary-500">Portal</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Welcome back! Please login to manage your kitchen.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 ml-1">Account Email</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            placeholder="admin@recipes.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 ml-1">Secure Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 mt-4 text-lg"
                    >
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    &copy; 2026 Global Authentic Recipes. All Rights Reserved.
                </p>
            </div>
        </div>
    );
}
