'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, ChefHat, Globe, Shield, 
  Settings, LogOut, Activity 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SuperAdminDashboard() {
  const { user, logout, isSuperAdmin, showNotification } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalRecipes: 0,
    totalCuisines: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and role
    if (user && !isSuperAdmin) {
      showNotification('Super Admin access required', 'error');
      router.push('/');
      return;
    }

    if (user && isSuperAdmin) {
      loadStats();
    }
  }, [user, isSuperAdmin, router, showNotification]);

  const loadStats = async () => {
    try {
      // Load statistics
      const token = localStorage.getItem('auth_token');
      
      // Get users count
      const usersRes = await fetch('/api/admin/users?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      
      // Get cuisines count
      const cuisinesRes = await fetch('/api/cuisines');
      const cuisinesData = await cuisinesRes.json();
      
      // Get recipes count
      const recipesRes = await fetch('/api/recipes?limit=1');
      const recipesData = await recipesRes.json();

      setStats({
        totalUsers: usersData.pagination?.total || 0,
        totalAdmins: 2, // Placeholder
        totalRecipes: recipesData.pagination?.total || 0,
        totalCuisines: cuisinesData.data?.length || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: Users,
              label: 'Total Users',
              value: stats.totalUsers,
              color: 'from-blue-600 to-blue-700',
              bgColor: 'bg-blue-500/10',
              textColor: 'text-blue-600'
            },
            {
              icon: Shield,
              label: 'Admins',
              value: stats.totalAdmins,
              color: 'from-red-600 to-orange-600',
              bgColor: 'bg-red-500/10',
              textColor: 'text-red-600'
            },
            {
              icon: ChefHat,
              label: 'Total Recipes',
              value: stats.totalRecipes,
              color: 'from-green-600 to-green-700',
              bgColor: 'bg-green-500/10',
              textColor: 'text-green-600'
            },
            {
              icon: Globe,
              label: 'Cuisines',
              value: stats.totalCuisines,
              bgColor: 'bg-purple-500/10',
              textColor: 'text-purple-600'
            }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} ${stat.textColor} flex items-center justify-center mb-4`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-black text-slate-900 dark:text-white">
                {loading ? '...' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/super-admin/users" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
              <Users className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Manage Users</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">View and edit users</p>
              </div>
            </Link>
            <button className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
              <ChefHat className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Manage Recipes</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Add or edit recipes</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
              <Settings className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">System Settings</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Configure platform</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white">New user registered</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white">Recipe published</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
