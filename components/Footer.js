import Link from 'next/link';
import { ChefHat, Mail, Instagram, Twitter, Facebook, ArrowRight, Heart, Github, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 dark:bg-slate-950 pt-24 pb-12 overflow-hidden relative">
            {/* Decorative background element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand & Mission */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="bg-primary-500 p-2.5 rounded-2xl shadow-xl shadow-primary-500/20">
                                <ChefHat className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-display font-black tracking-tight text-white">
                                Global<span className="text-primary-500">Recipes</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Empowering home chefs to explore authentic flavors from across the globe. Join our mission to preserve culinary traditions.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Instagram, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Youtube, href: '#' },
                                { icon: Github, href: '#' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-primary-500 hover:border-primary-500 transition-all duration-300 group"
                                >
                                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-sm mb-8">Explore World</h4>
                        <ul className="space-y-4">
                            {['All Recipes', 'Regional Cuisines', 'Popular Picks', 'Latest Additions', 'Chef Tutorials'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-400 hover:text-primary-500 transition-all duration-300 flex items-center gap-2 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary-500 transition-colors"></div>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-sm mb-8">Resources</h4>
                        <ul className="space-y-4">
                            {['About Our Story', 'Culinary Blog', 'Join as Chef', 'Contact Us', 'Privacy Policy'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-400 hover:text-primary-500 transition-all duration-300 flex items-center gap-2 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary-500 transition-colors"></div>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter - Premium Look */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <h4 className="text-white font-black text-xl mb-4 relative z-10">Fresh recipes in your inbox</h4>
                            <p className="text-slate-400 text-sm mb-8 relative z-10">Join 50k+ foodies for weekly authentic recipe hand-picks.</p>

                            <form className="space-y-3 relative z-10">
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-5 pr-12 text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                </div>
                                <button className="w-full btn-primary py-4 group">
                                    Subscribe Now
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-sm font-medium">
                        &copy; 2026 Global Authentic Recipes. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8 text-slate-500 text-sm">
                        <p className="flex items-center gap-1.5">
                            Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> for the world
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
