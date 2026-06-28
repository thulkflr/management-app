// components/layout/MainLayout.js
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { 
    LayoutDashboard, Users, Wallet, FolderKanban, Menu, X, Lightbulb, 
    ListChecks, LayoutList, LogOut, User as UserIcon 
} from 'lucide-react';

import { AppProvider } from '@/context/AppContext';
import { TasksProvider } from '@/context/TasksContext';

export default function MainLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'Admin';

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/tasks', label: 'Tasks', icon: LayoutList },
        { href: '/projects', label: 'Projects', icon: FolderKanban },
        { href: '/wallet', label: 'Wallet', icon: Wallet, adminOnly: true },
        { href: '/members', label: 'Members', icon: Users, adminOnly: true },
        { href: '/ideas', label: 'Ideas', icon: Lightbulb },
        { href: '/checklist', label: 'Checklist', icon: ListChecks },
    ];

    const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Don't show sidebar on login page
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <AppProvider>
            <TasksProvider>
                <div className="bg-background text-foreground h-screen overflow-hidden flex flex-col md:flex-row">
                    {/* Mobile Header */}
                    <header className="md:hidden bg-black text-white p-4 flex justify-between items-center z-50 border-b border-brand-gold/20 backdrop-blur-md bg-black/90 sticky top-0">
                        <div className="flex items-center gap-3">
                            {session?.user?.image && (
                                <div className="w-8 h-8 rounded-xl border border-brand-gold/30 overflow-hidden shadow-lg shadow-brand-gold/10">
                                    <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="text-lg font-black text-brand-gold tracking-tighter uppercase italic">
                                CAPRICE <span className="text-white font-light not-italic opacity-50">MGMT</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {session && (
                                <button 
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            )}
                            <button onClick={toggleSidebar} className="p-2">
                                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </header>

                    {/* Sidebar */}
                    <aside className={`
                        fixed inset-y-0 left-0 z-40 w-72 bg-black text-white transform transition-transform duration-300 ease-in-out
                        md:relative md:translate-x-0
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        flex flex-col border-r border-brand-gold/11 shadow-2xl shadow-black
                    `}>
                        <div className="p-8">
                            <div className="text-2xl font-black text-brand-gold tracking-tighter uppercase italic mb-1">
                                CAPRICE <span className="text-white font-light not-italic opacity-30">MGMT</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Production Studio</p>
                        </div>

                        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar scrollbar-hide">
                            {filteredNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={closeSidebar}
                                        className={`
                                            flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
                                            ${isActive 
                                                ? 'bg-brand-gold text-black font-black shadow-lg shadow-brand-gold/20 scale-[1.02]' 
                                                : 'text-slate-400 hover:text-brand-gold hover:bg-white/5'}
                                        `}
                                    >
                                        <Icon size={20} className={`${isActive ? 'text-black' : 'group-hover:translate-x-1 transition-transform'}`} />
                                        <span className="uppercase tracking-widest text-[10px] font-black">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Profile & Logout Section */}
                        {session?.user && (
                            <div className="mx-4 mb-6 p-5 rounded-[28px] bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shadow-lg overflow-hidden p-0.5">
                                            {session.user.image ? (
                                                <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover rounded-[14px]" />
                                            ) : (
                                                <UserIcon size={24} />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-black rounded-full" title="Online" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white uppercase tracking-wider truncate mb-0.5">
                                            {session.user.name}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                                            <p className="text-[8px] font-bold text-brand-gold uppercase tracking-[0.2em] opacity-80">
                                                {session.user.role || 'Member'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white/5 text-slate-400 hover:bg-red-500 hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[9px] group border border-white/5 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20"
                                >
                                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                        <div className="p-6 border-t border-white/5 text-center">
                            <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.4em]">© 2026 CAPRICE MEDIA</p>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-hidden p-0 md:p-0 relative">
                        {children}
                    </main>
                </div>
            </TasksProvider>
        </AppProvider>
    );
}
