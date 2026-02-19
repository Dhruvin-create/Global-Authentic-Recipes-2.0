import { Star, Clock, Users, Heart, ArrowRight, ChefHat } from 'lucide-react';

const recipes = [
    {
        id: 1,
        title: 'Authentic Butter Chicken',
        cuisine: 'Indian',
        time: '45 mins',
        servings: 4,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1603894584202-74092b60450b?w=600&q=80',
        author: 'Chef Dhruvin',
        level: 'Medium'
    },
    {
        id: 2,
        title: 'Spaghetti Carbonara',
        cuisine: 'Italian',
        time: '20 mins',
        servings: 2,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
        author: 'Chef Maria',
        level: 'Easy'
    },
    {
        id: 3,
        title: 'Sushi Dragon Roll',
        cuisine: 'Japanese',
        time: '60 mins',
        servings: 3,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
        author: 'Chef Sato',
        level: 'Hard'
    },
    {
        id: 4,
        title: 'Beef Tacos Al Pastor',
        cuisine: 'Mexican',
        time: '35 mins',
        servings: 6,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80',
        author: 'Chef Ricardo',
        level: 'Medium'
    }
];

export default function FeaturedRecipes() {
    return (
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
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 will-change-transform"
                                    loading="lazy"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                                <div className="absolute top-6 right-6">
                                    <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 transition-all duration-300">
                                        <Heart className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 rounded-xl bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
                                            {recipe.cuisine}
                                        </span>
                                        <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                            {recipe.level}
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
                                            <span className="text-sm font-bold">{recipe.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <Users className="w-4 h-4 text-primary-500" />
                                            <span className="text-sm font-bold">{recipe.servings}p</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{recipe.rating}</span>
                                    </div>
                                </div>

                                <button className="w-full py-4 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group/btn border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all duration-300">
                                    See Recipe
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <button className="group btn-secondary inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl transition-all duration-300">
                        Explore All Recipes
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}
