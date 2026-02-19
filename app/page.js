import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import FeaturedRecipes from '@/components/FeaturedRecipes';
import { ChefHat, Globe, Users, Award, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
    return (
        <main className="bg-white dark:bg-slate-950">
            <Hero />

            {/* Stats Section - Premium Look */}
            <section className="py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { icon: ChefHat, count: '1000+', label: 'Expert Chefs', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                            { icon: Globe, count: '50+', label: 'Countries', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { icon: Users, count: '50k+', label: 'Members', color: 'text-green-500', bg: 'bg-green-500/10' },
                            { icon: Award, count: '4.9★', label: 'Top Rated', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center md:items-start animate-fade-in-scale" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className={`w-16 h-16 rounded-[2rem] ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-sm`}>
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <h4 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-1">{stat.count}</h4>
                                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CategorySection />
            <FeaturedRecipes />

            {/* Premium CTA Section */}
            <section className="py-32 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative rounded-[4rem] bg-slate-900 overflow-hidden py-24 px-8 md:px-20 text-center">
                        {/* Dynamic Background */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-primary-400 text-sm font-black uppercase tracking-widest mb-8">
                                <Sparkles className="w-4 h-4" />
                                Join the Movement
                            </div>
                            <h2 className="text-5xl md:text-7xl font-display font-black text-white leading-tight mb-8">
                                Ready to Cook Something <span className="text-gradient">Extraordinary?</span>
                            </h2>
                            <p className="text-slate-400 text-xl mb-12 leading-relaxed">
                                Join 50,000+ home chefs and start your culinary journey today. Save recipes, share your own, and get daily inspiration.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <button className="btn-primary py-5 px-12 text-lg shadow-2xl shadow-primary-500/40">
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
                                </button>
                                <button className="px-12 py-5 rounded-full border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
