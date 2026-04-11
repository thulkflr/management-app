// app/layout.js
'use client';
import { AppProvider } from '@/context/AppContext';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Users, Wallet, FolderKanban, Menu, X } from 'lucide-react';

export default function RootLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/projects', label: 'Projects', icon: FolderKanban },
        { href: '/wallet', label: 'Wallet', icon: Wallet },
        { href: '/members', label: 'Members', icon: Users },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <html lang="en">
            <body className="bg-slate-50 text-slate-900 h-screen overflow-hidden flex flex-col md:flex-row">
                <AppProvider>
                    {/* Mobile Header */}
                    <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-50">
                        <div className="text-xl font-bold">PhotoBiz</div>
                        <button onClick={toggleSidebar} className="p-2 hover:bg-slate-800 rounded-lg transition">
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </header>

                    {/* Overlay for mobile */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={closeSidebar}
                        />
                    )}

                    {/* Sidebar */}
                    <aside className={`
                        fixed inset-y-0 left-0 z-45 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
                        md:relative md:translate-x-0
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="p-6 text-xl font-bold border-b border-slate-800 hidden md:block text-center">
                            PhotoBiz
                        </div>
                        <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={closeSidebar}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition group ${isActive
                                                ? 'bg-indigo-600 text-white'
                                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
                            © 2026 PhotoBiz Manager
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                        {children}
                    </main>
                </AppProvider>
            </body>
        </html>
    );
}