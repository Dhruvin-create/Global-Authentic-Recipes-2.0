import { ArrowRight, Flame, UtensilsCrossed } from 'lucide-react';

const categories = [
    { name: 'Indian', dishes: '1,200', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', color: 'from-orange-500/20' },
    { name: 'Italian', dishes: '850', image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400&q=80', color: 'from-red-500/20' },
    { name: 'Mexican', dishes: '640', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', color: 'from-green-600/20' },
    { name: 'Japanese', dishes: '420', image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&q=80', color: 'from-rose-500/20' },
    { name: 'French', dishes: '310', image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&q=80', color: 'from-blue-600/20' },
    { name: 'Thai', dishes: '290', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80', color: 'from-yellow-500/20' },
];

export default function CategorySection() {
    return (
        <section className="py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-primary-500 font-black text-sm uppercase tracking-[0.2em] mb-4">
                            <UtensilsCrossed className="w-5 h-5" />
                            World Cuisines
                        </div>
                        <h2 className="text-5xl md:text-6xl font-display font-black text-slate-900 dark:text-white leading-tight">
                            Explore by <span className="text-gradient">World Flavors</span>
                        </h2>
                    </div>
                    <button className="group flex items-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-8 py-4 rounded-2xl text-slate-900 dark:text-white hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-300 font-bold shadow-sm hover:shadow-xl hover:shadow-primary-500/20">
                        View All Categories
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
                    {categories.map((cat, index) => (
                        <div
                            key={cat.name}
                            className="group cursor-pointer animate-fade-in-scale"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 shadow-xl group-hover:shadow-[0_20px_50px_rgba(249,115,22,0.15)] transition-all duration-500 group-hover:-translate-y-3">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 will-change-transform"
                                    loading="lazy"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-slate-950/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity`}></div>
                                <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent">
                                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <p className="text-white font-black text-2xl mb-1">{cat.name}</p>
                                        <p className="text-slate-300 text-sm font-medium flex items-center gap-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                                            {cat.dishes} Recipes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
