'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    Image as ImageIcon,
    Clock,
    Users,
    Flame,
    ChevronDown
} from 'lucide-react';

export default function RecipeForm() {
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params.id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        category: 'MAIN_COURSE',
        difficulty: 'EASY',
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        calories: 350,
        isPublished: true,
        isFeatured: false,
        ingredients: [{ name: '', quantity: '' }],
        instructions: [{ description: '', image: '' }]
    });

    const categories = ['BREAKFAST', 'LUNCH', 'DINNER', 'DESSERT', 'SNACKS', 'APPETIZER', 'DRINK'];
    const difficulties = ['EASY', 'MEDIUM', 'HARD'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleListItemChange = (index, listName, field, value) => {
        const newList = [...formData[listName]];
        newList[index][field] = value;
        setFormData(prev => ({ ...prev, [listName]: newList }));
    };

    const addItem = (listName) => {
        const newItem = listName === 'ingredients' ? { name: '', quantity: '' } : { description: '', image: '' };
        setFormData(prev => ({ ...prev, [listName]: [...prev[listName], newItem] }));
    };

    const removeItem = (index, listName) => {
        if (formData[listName].length <= 1) return;
        const newList = formData[listName].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [listName]: newList }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit ? `/api/recipes/${params.id}` : '/api/recipes';
            const method = isEdit ? 'PUT' : 'POST';

            // Need a cuisineId for the backend - simplified for this demo
            const finalData = { ...formData, cuisineId: '98cc63e7-06a9-11f1-9d18-0eda1af4787f' };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(finalData),
            });

            const data = await res.json();
            if (data.success) {
                router.push('/admin/dashboard/recipes');
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-fade-in mb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} type="button" className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-display font-bold">
                        {isEdit ? 'Edit Recipe' : 'Add New Recipe'}
                    </h1>
                </div>
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8 py-3">
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Recipe'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass-card p-8 rounded-3xl space-y-6">
                        <div className="space-y-4">
                            <label className="text-lg font-bold font-display ml-1">Recipe Basics</label>
                            <input
                                name="title"
                                required
                                className="input-field px-6 py-4 text-xl font-bold bg-slate-50/50 dark:bg-slate-800/30"
                                placeholder="Ex: Spicy Mughlai Butter Chicken"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                            <textarea
                                name="description"
                                required
                                rows="4"
                                className="input-field px-6 py-4 resize-none"
                                placeholder="Describe this amazing dish..."
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="relative">
                                <label className="text-xs uppercase font-bold text-slate-500 mb-1.5 block ml-1">Category</label>
                                <select name="category" className="input-field appearance-none cursor-pointer pr-10" value={formData.category} onChange={handleInputChange}>
                                    {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-[38px] text-slate-400 pointer-events-none" size={16} />
                            </div>
                            <div className="relative">
                                <label className="text-xs uppercase font-bold text-slate-500 mb-1.5 block ml-1">Difficulty</label>
                                <select name="difficulty" className="input-field appearance-none cursor-pointer pr-10" value={formData.difficulty} onChange={handleInputChange}>
                                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-[38px] text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </section>

                    <section className="glass-card p-8 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-lg font-bold font-display">Ingredients</label>
                            <button
                                type="button"
                                onClick={() => addItem('ingredients')}
                                className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.ingredients.map((ing, idx) => (
                                <div key={idx} className="flex gap-3 animate-fade-in">
                                    <input
                                        placeholder="Quantity (e.g. 200g)"
                                        className="input-field flex-1"
                                        value={ing.quantity}
                                        onChange={(e) => handleListItemChange(idx, 'ingredients', 'quantity', e.target.value)}
                                    />
                                    <input
                                        placeholder="Ingredient name"
                                        className="input-field flex-[2]"
                                        value={ing.name}
                                        onChange={(e) => handleListItemChange(idx, 'ingredients', 'name', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeItem(idx, 'ingredients')}
                                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-colors"
                                    >
                                        <Minus size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card p-8 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-lg font-bold font-display">Step-by-Step Instructions</label>
                            <button
                                type="button"
                                onClick={() => addItem('instructions')}
                                className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Step
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.instructions.map((inst, idx) => (
                                <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 relative animate-fade-in border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'instructions')}
                                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <textarea
                                            placeholder="Describe this step..."
                                            rows="2"
                                            className="input-field bg-transparent border-none p-0 focus:ring-0 resize-none"
                                            value={inst.description}
                                            onChange={(e) => handleListItemChange(idx, 'instructions', 'description', e.target.value)}
                                        />
                                        <div className="flex items-center gap-2 group cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 p-2 rounded-xl hover:border-primary-500 transition-colors">
                                            <ImageIcon size={14} className="text-slate-400" />
                                            <input
                                                placeholder="Step image URL (optional)"
                                                className="text-xs bg-transparent border-none focus:ring-0 w-full p-0"
                                                value={inst.image}
                                                onChange={(e) => handleListItemChange(idx, 'instructions', 'image', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <aside className="space-y-8">
                    <section className="glass-card p-8 rounded-3xl space-y-6">
                        <label className="text-lg font-bold font-display block ml-1">Cover Image</label>
                        <div className="aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                            {formData.image ? (
                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <>
                                    <ImageIcon size={48} className="text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-xs text-slate-400">Click below to add URL</p>
                                </>
                            )}
                        </div>
                        <input
                            name="image"
                            className="input-field text-sm"
                            placeholder="Paste image URL here..."
                            value={formData.image}
                            onChange={handleInputChange}
                        />
                    </section>

                    <section className="glass-card p-8 rounded-3xl space-y-5">
                        <label className="text-lg font-bold font-display block ml-1">Cooking Specs</label>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-primary-500" />
                                    <span className="text-sm font-medium">Prep Time</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input name="prepTime" type="number" className="w-12 bg-transparent text-right font-bold focus:ring-0 outline-none" value={formData.prepTime} onChange={handleInputChange} />
                                    <span className="text-xs text-slate-400">min</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-2">
                                    <Flame size={16} className="text-primary-500" />
                                    <span className="text-sm font-medium">Cook Time</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input name="cookTime" type="number" className="w-12 bg-transparent text-right font-bold focus:ring-0 outline-none" value={formData.cookTime} onChange={handleInputChange} />
                                    <span className="text-xs text-slate-400">min</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-primary-500" />
                                    <span className="text-sm font-medium">Servings</span>
                                </div>
                                <input name="servings" type="number" className="w-12 bg-transparent text-right font-bold focus:ring-0 outline-none" value={formData.servings} onChange={handleInputChange} />
                            </div>
                        </div>
                    </section>

                    <section className="glass-card p-8 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">Publish Immediately</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    className="sr-only peer"
                                    checked={formData.isPublished}
                                    onChange={handleInputChange}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">Feature on Homepage</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    className="sr-only peer"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </section>
                </aside>
            </div>
        </form>
    );
}
