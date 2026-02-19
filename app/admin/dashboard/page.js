'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Heart, MessageSquare, TrendingUp, LogOut, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminDashboard() {
  const { user, logout, isAdmin, showNotification } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    myRecipes: 0,
    totalLikes: 0,
    totalReviews: 0,
    totalViews: 0
  });

  useEffect(() => {
    // Check authentication and role
    if (user && !isAdmin) {
      showNotification('Admin access required', 'error');
      router.push('/');
      return;
    }

    if (user && isAdmin) {
      // Load stats here if needed
      setStats({
        myRecipes: 5,
        totalLikes: 124,
        totalReviews: 23,
        totalViews: 1250
      });
    }
  }, [user, isAdmin, router, showNotification]);

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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-orange-600 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">
                  Admin Dashboard
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
              icon: ChefHat,
              label: 'My Recipes',
              value: stats.myRecipes,
              color: 'text-primary-600',
              bgColor: 'bg-primary-500/10'
            },
            {
              icon: Heart,
              label: 'Total Likes',
              value: stats.totalLikes,
              color: 'text-red-600',
              bgColor: 'bg-red-500/10'
            },
            {
              icon: MessageSquare,
              label: 'Reviews',
              value: stats.totalReviews,
              color: 'text-blue-600',
              bgColor: 'bg-blue-500/10'
            },
            {
              icon: TrendingUp,
              label: 'Total Views',
              value: stats.totalViews,
              color: 'text-green-600',
              bgColor: 'bg-green-500/10'
            }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-black text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary-600 to-orange-600 text-white hover:shadow-lg transition-all">
              <Plus className="w-6 h-6" />
              <div className="text-left">
                <p className="font-bold">Create New Recipe</p>
                <p className="text-sm text-white/80">Add a new recipe to the platform</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
              <ChefHat className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">My Recipes</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">View and edit your recipes</p>
              </div>
            </button>
          </div>
        </div>

        {/* My Recent Recipes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            My Recent Recipes
          </h2>
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">No recipes yet</p>
            <button className="btn-primary">
              Create Your First Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
