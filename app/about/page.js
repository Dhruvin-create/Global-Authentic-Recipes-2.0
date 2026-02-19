import { Globe, Heart, Users, Award, ChefHat, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-display font-black mb-6">
            About Us
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Bringing authentic flavors from around the world to your kitchen
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-black uppercase tracking-widest mb-6">
                <Sparkles className="w-4 h-4" />
                Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-6">
                Preserving Culinary Heritage
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Global Authentic Recipes is dedicated to preserving and sharing traditional cooking methods and recipes from cultures around the world. We believe that food is more than sustenance—it's a connection to our heritage, our communities, and our shared humanity.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Our platform brings together home cooks, professional chefs, and food enthusiasts to celebrate the diversity of global cuisine while maintaining the authenticity that makes each dish special.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800"
                  alt="Cooking"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Globe,
                title: 'Authenticity',
                description: 'We prioritize traditional recipes and cooking methods passed down through generations',
                color: 'text-blue-500',
                bg: 'bg-blue-500/10'
              },
              {
                icon: Heart,
                title: 'Community',
                description: 'Building connections between cultures through the universal language of food',
                color: 'text-red-500',
                bg: 'bg-red-500/10'
              },
              {
                icon: Users,
                title: 'Inclusivity',
                description: 'Welcoming cooks of all skill levels and celebrating diverse culinary traditions',
                color: 'text-green-500',
                bg: 'bg-green-500/10'
              },
              {
                icon: Award,
                title: 'Quality',
                description: 'Ensuring every recipe is tested, verified, and delivers exceptional results',
                color: 'text-orange-500',
                bg: 'bg-orange-500/10'
              }
            ].map((value, i) => (
              <div key={i} className="text-center">
                <div className={`w-20 h-20 rounded-[2rem] ${value.bg} ${value.color} flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                  <value.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-600 to-orange-600 rounded-[4rem] p-12 md:p-20 text-white text-center">
            <h2 className="text-4xl md:text-5xl font-display font-black mb-12">
              Our Impact
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: '10,000+', label: 'Recipes' },
                { number: '50+', label: 'Countries' },
                { number: '50,000+', label: 'Members' },
                { number: '1M+', label: 'Monthly Views' }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-5xl md:text-6xl font-display font-black mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/80 font-bold uppercase tracking-widest text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Passionate food lovers dedicated to bringing you the best recipes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Chef Maria Rodriguez',
                role: 'Head of Culinary',
                image: 'https://i.pravatar.cc/400?img=1',
                specialty: 'Latin American Cuisine'
              },
              {
                name: 'Chef Raj Patel',
                role: 'Recipe Developer',
                image: 'https://i.pravatar.cc/400?img=2',
                specialty: 'Indian & Asian Cuisine'
              },
              {
                name: 'Chef Sophie Chen',
                role: 'Community Manager',
                image: 'https://i.pravatar.cc/400?img=3',
                specialty: 'East Asian Cuisine'
              }
            ].map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6 shadow-xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 font-bold mb-2">
                  {member.role}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {member.specialty}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ChefHat className="w-16 h-16 mx-auto text-primary-600 mb-6" />
          <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-6">
            Join Our Community
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Start your culinary journey today and discover recipes from around the world
          </p>
          <button className="btn-primary py-4 px-12 text-lg">
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}
