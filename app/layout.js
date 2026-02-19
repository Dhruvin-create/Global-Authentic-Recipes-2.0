import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import MainLayout from '@/components/MainLayout';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata = {
    title: 'Global Authentic Recipes | Discover World Flavors',
    description: 'Explore authentic recipes from around the world. Traditional techniques, secret ingredients, and stunning global cuisines.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="font-sans antialiased text-slate-900 bg-slate-50 dark:bg-slate-950 dark:text-slate-50 overflow-x-hidden">
                <AuthProvider>
                    <MainLayout>
                        {children}
                    </MainLayout>
                </AuthProvider>
            </body>
        </html>
    );
}
