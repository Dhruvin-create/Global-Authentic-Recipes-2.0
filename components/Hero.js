import { Search, MapPin, ArrowRight, Play, Globe, Sparkles } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="animate-slide-up">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-primary-500 dark:text-primary-400 text-sm font-bold tracking-tight mb-8 shadow-sm">
                            <Sparkles className="w-4 h-4" />
                            <span className="animate-reveal">Discover Authentic Global Recipes</span>
                        </span>

                        <h1 className="text-6xl md:text-8xl font-display font-black text-slate-900 dark:text-white leading-[1.1] mb-8">
                            Taste the <br />
                            <span className="text-gradient drop-shadow-sm">World</span> in Your <br />
                            Kitchen
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed max-w-xl">
                            Unlock thousands of curated recipes from 120+ countries. Join the world's most passionate cooking community and master international cuisine.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <button className="btn-primary py-5 px-10 text-lg group">
                                Start Cooking
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                            </button>
                            <button className="btn-secondary py-5 px-10 text-lg group">
                                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                                Watch Tutorial
                            </button>
                        </div>

                        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10 flex items-center gap-10">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="relative group">
                                        <img
                                            className="w-12 h-12 rounded-2xl border-4 border-white dark:border-slate-950 object-cover transform group-hover:-translate-y-2 transition-transform duration-300 will-change-transform"
                                            src={`https://i.pravatar.cc/150?u=acc${i}`}
                                            alt="User"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-black text-xl leading-none mb-1">50K+</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Happy Chefs</p>
                            </div>
                            <div className="w-px h-10 bg-slate-200 dark:bg-white/10"></div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-black text-xl leading-none mb-1">4.9/5</p>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-3 h-3 bg-orange-400 rounded-full"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="animate-fade-in-scale relative z-10">
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-primary-500/20 border-8 border-white dark:border-white/5 aspect-square">
                                <img
                                    src="https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                    alt="Global Cuisine"
                                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-1000 will-change-transform"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                            </div>

                            {/* Floating Stats Card */}
                            <div className="absolute -top-10 -right-10 animate-float z-20">
                                <div className="glass-card p-6 rounded-3xl border-white/40 max-w-[200px]">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-black uppercase text-slate-500 tracking-tighter">Live Map</p>
                                    </div>
                                    <p className="text-slate-900 dark:text-white font-bold leading-tight">Trending in Tokyo: Ramen Mastery</p>
                                </div>
                            </div>

                            <div className="absolute -bottom-8 -left-8 animate-float [animation-delay:1.5s] z-20">
                                <div className="glass-card p-6 rounded-3xl border-white/40">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-orange-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white font-black text-lg leading-none">127+</p>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Cuisines Explorer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background mesh/grid pattern */}
                        <div className="absolute -inset-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
