'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children }) {
    const pathname = usePathname();
    
    // Hide navbar and footer on these pages
    const isAdminPage = pathname?.startsWith('/admin');
    const isSuperAdminPage = pathname?.startsWith('/super-admin');
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    
    const hideNavbar = isAdminPage || isSuperAdminPage || isAuthPage;

    return (
        <>
            {!hideNavbar && <Navbar />}
            {children}
            {!hideNavbar && <Footer />}
        </>
    );
}
