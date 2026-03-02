'use client';

import { Star, Clock, Users, Heart, ArrowRight, ChefHat } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthAction } from '@/lib/use-auth-action';
import AuthModal from './AuthModal';
import Link from 'next/link';

export default function FeaturedRecipes() {
    const { requireAuth, showAuthModal, handleAuthSuccess, handleAuthClose } = useAuthAction();
    const [favorites, setFavorites] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch featured recipes from database
    useEffect(() => {
        fetch('/api/recipes?featured=true&limit=4')
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setRecipes(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load recipes:', err);
                setLoading(false);
            });
    }, []);

    const handleFavorite = requireAuth((recipeId) => {
        // Toggle favorite
        if (favorites.includes(recipeId)) {
            setFavorites(favorites.filter(id => id !== recipeId));
        } else {
            setFavorites([...favorites, recipeId]);
        }
    });

    const getDifficultyColor = (difficulty) => {
        switch(difficulty?.toUpperCase()) {
            case 'EASY': return 'bg-green-500';
            case 'MEDIUM': return 'bg-orange-500';
            case 'HARD': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    if (loading) {
        return (
            <section className="py-32 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-display font-black text-slate-900 dark:text-white">
                            Loading Recipes...
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/5] rounded-[3rem] bg-slate-200 dark:bg-slate-800 mb-6"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (recipes.length === 0) {
        return (
            <section className="py-32 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <ChefHat className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        No Featured Recipes Yet
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Check back soon for amazing recipes!
                    </p>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="py-32 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-primary-500 font-black text-sm uppercase tracking-[0.2em] mb-4">
                                <ChefHat className="w-5 h-5" />
                                Top Rated Picks
                            </div>
                            <h2 className="text-5xl md:text-6xl font-display font-black text-slate-900 dark:text-white leading-tight">
                                Chef's <span className="text-gradient">Selection</span>
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md text-center md:text-left text-lg">
                            Discover the recipes that our community loves most. Hand-picked for their authentic flavors and clear instructions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {recipes.map((recipe, index) => (
                            <div
                                key={recipe.id}
                                className="group relative flex flex-col animate-slide-up"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-700">
                                    <img
                                        src={recipe.image || '/placeholder-recipe.jpg'}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 will-change-transform"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                                    <div className="absolute top-6 right-6">
                                        <button 
                                            onClick={() => handleFavorite(recipe.id)}
                                            className={`w-12 h-12 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all duration-300 ${
                                                favorites.includes(recipe.id)
                                                    ? 'bg-orange-500 border-orange-500 text-white'
                                                    : 'bg-white/10 border-white/20 text-white hover:bg-orange-500 hover:border-orange-500'
                                            }`}
                                        >
                                            <Heart className={`w-6 h-6 ${favorites.includes(recipe.id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="px-3 py-1 rounded-xl bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
                                                {recipe.cuisine_name || recipe.cuisine}
                                            </span>
                                            <span className={`px-3 py-1 rounded-xl ${getDifficultyColor(recipe.difficulty)} text-white text-[10px] font-black uppercase tracking-widest`}>
                                                {recipe.difficulty}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-display font-black text-white leading-tight group-hover:text-primary-400 transition-colors duration-300">
                                            {recipe.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="px-4">
                                    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                <Clock className="w-4 h-4 text-primary-500" />
                                                <span className="text-sm font-bold">{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                <Users className="w-4 h-4 text-primary-500" />
                                                <span className="text-sm font-bold">{recipe.servings}p</span>
                                            </div>
                                        </div>
                                        {recipe.avg_rating && parseFloat(recipe.avg_rating) > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                                    {parseFloat(recipe.avg_rating).toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Link 
                                        href={`/recipes/${recipe.slug}`}
                                        className="w-full py-4 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group/btn border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all duration-300"
                                    >
                                        See Recipe
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 text-center">
                        <Link 
                            href="/recipes"
                            className="group btn-secondary inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl transition-all duration-300"
                        >
                            Explore All Recipes
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Auth Modal */}
            <AuthModal 
                isOpen={showAuthModal}
                onClose={handleAuthClose}
                onSuccess={handleAuthSuccess}
                mode="login"
            />
        </>
    );
}
