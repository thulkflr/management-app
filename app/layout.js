// app/layout.js
'use client';
import { AppProvider } from '@/context/AppContext';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { LayoutDashboard, Users, Wallet, FolderKanban, Menu, X, Lightbulb } from 'lucide-react';

export default function RootLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/projects', label: 'Projects', icon: FolderKanban },
        { href: '/wallet', label: 'Wallet', icon: Wallet },
        { href: '/members', label: 'Members', icon: Users },
        { href: '/ideas', label: 'Ideas', icon: Lightbulb },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <html lang="en">
            <body className="bg-slate-50 text-slate-900 h-screen overflow-hidden flex flex-col md:flex-row">
                <AppProvider>
                    {/* Mobile Header */}
                    <header className="md:hidden bg-black text-white p-4 flex justify-between items-center z-50 border-b border-brand-gold/20 backdrop-blur-md bg-black/90 sticky top-0">
                        <div className="text-lg font-black text-brand-gold tracking-tighter uppercase italic">
                            CAPRICE <span className="text-white opacity-50 font-light">MGMT</span>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="p-2.5 bg-brand-gold/10 text-brand-gold rounded-xl border border-brand-gold/20 hover:bg-brand-gold hover:text-black transition-all active:scale-90"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </header>

                    {/* Overlay for mobile */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-300"
                            onClick={closeSidebar}
                        />
                    )}

                    {/* Sidebar */}
                    <aside className={`
                        fixed inset-y-0 left-0 z-[60] w-72 bg-black text-white flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                        md:relative md:translate-x-0 border-r border-brand-gold/10
                        ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}
                    `}>
                        <div className="p-6 border-b border-brand-gold/10 flex items-center justify-between">
                            <div className="text-lg font-black text-brand-gold tracking-tighter uppercase italic">
                                CAPRICE <span className="text-white opacity-50 font-light">MGMT</span>
                            </div>
                            <button onClick={closeSidebar} className="md:hidden p-2 text-white/40 hover:text-brand-gold transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="flex-1 p-4 space-y-1.5 mt-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={closeSidebar}
                                        className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                            ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20 scale-[1.02]'
                                            : 'text-slate-400 hover:bg-brand-gold/5 hover:text-brand-gold'
                                            }`}
                                    >
                                        <Icon size={18} className={isActive ? 'text-black' : 'text-slate-500 group-hover:text-brand-gold transition-colors'} />
                                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-6 border-t border-brand-gold/10 text-center">
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">© 2026 CAPRICE</p>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-32 md:pb-8">
                        {children}
                    </main>
                </AppProvider>
            </body>
        </html>
    );
}