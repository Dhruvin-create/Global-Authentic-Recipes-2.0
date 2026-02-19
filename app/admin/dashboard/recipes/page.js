'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function RecipeListing() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const fetchRecipes = async (page = 1) => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search,
                category
            }).toString();

            const res = await fetch(`/api/recipes?${query}`);
            const data = await res.json();

            if (data.success) {
                setRecipes(data.data);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, [search, category]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        try {
            const res = await fetch(`/api/recipes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchRecipes(pagination.page);
            }
        } catch (err) {
            alert('Failed to delete recipe');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="input-field w-auto"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="BREAKFAST">Breakfast</option>
                        <option value="LUNCH">Lunch</option>
                        <option value="DINNER">Dinner</option>
                        <option value="DESSERT">Dessert</option>
                        <option value="SNACKS">Snacks</option>
                    </select>

                    <Link href="/admin/dashboard/recipes/new" className="btn-primary flex items-center gap-2">
                        <Plus size={18} />
                        <span>Add Recipe</span>
                    </Link>
                </div>
            </div>

            {/* Table Section */}
            <div className="glass-card overflow-hidden rounded-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Recipe</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Difficulty</th>
                                <th className="px-6 py-4 text-center">Stats</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-8 h-16 bg-slate-50/20 dark:bg-slate-800/10" />
                                    </tr>
                                ))
                            ) : recipes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-slate-500">
                                        No recipes found. Start by adding one!
                                    </td>
                                </tr>
                            ) : (
                                recipes.map((recipe) => (
                                    <tr key={recipe.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                    <img src={recipe.image || 'https://via.placeholder.com/150'} alt={recipe.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{recipe.title}</p>
                                                    <p className="text-xs text-slate-500">{recipe.cuisine_name || 'Global'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 uppercase">
                                                {recipe.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-medium ${recipe.difficulty === 'EASY' ? 'text-emerald-500' :
                                                    recipe.difficulty === 'MEDIUM' ? 'text-orange-500' : 'text-rose-500'
                                                }`}>
                                                {recipe.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Eye size={12} /> {recipe.view_count || 0}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-rose-500">
                                                    <Plus size={12} className="rotate-45" /> {recipe.like_count || 0}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className={`w-2 h-2 rounded-full mr-2 ${recipe.is_published ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-medium">{recipe.is_published ? 'Active' : 'Draft'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/dashboard/recipes/edit/${recipe.id}`} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-all">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(recipe.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Showing page <span className="font-bold">{pagination.page}</span> of <span className="font-bold">{pagination.totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => fetchRecipes(pagination.page - 1)}
                                className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => fetchRecipes(pagination.page + 1)}
                                className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
