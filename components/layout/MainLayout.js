'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
    LayoutDashboard, Users, Wallet, FolderKanban, Menu, X, Lightbulb,
    ListChecks, LayoutList, LogOut, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

import { AppProvider } from '@/context/AppContext';
import { TasksProvider } from '@/context/TasksContext';

export default function MainLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'Admin';

    const navItems = [
        { href: '/',          label: 'Dashboard', icon: LayoutDashboard },
        { href: '/tasks',     label: 'Tasks',     icon: LayoutList },
        { href: '/projects',  label: 'Projects',  icon: FolderKanban },
        { href: '/wallet',    label: 'Wallet',    icon: Wallet,     adminOnly: true },
        { href: '/members',   label: 'Members',   icon: Users,      adminOnly: true },
        { href: '/ideas',     label: 'Ideas',     icon: Lightbulb },
        { href: '/checklist', label: 'Checklist', icon: ListChecks },
    ];

    const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);
    const closeSidebar = () => setIsSidebarOpen(false);

    if (pathname === '/login') return <>{children}</>;

    return (
        <AppProvider>
            <TasksProvider>
                <div className="bg-background text-foreground h-screen overflow-hidden flex flex-col md:flex-row">

                    {/* ── Mobile Header ─────────────────────────────────────── */}
                    <header className="md:hidden sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-brand-gold/15 flex justify-between items-center px-4 py-3">
                        <div className="flex items-center gap-3">
                            {session?.user?.image && (
                                <div className="w-8 h-8 rounded-xl border border-brand-gold/30 overflow-hidden shadow-sm">
                                    <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="text-[17px] font-black text-brand-gold tracking-tighter uppercase italic leading-none">
                                CAPRICE <span className="text-white/40 font-light not-italic text-sm">MGMT</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {session && (
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="p-2 text-foreground/30 hover:text-red-400 transition-colors rounded-lg"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            )}
                            <motion.button
                                onClick={() => setIsSidebarOpen(v => !v)}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-foreground/60 hover:text-foreground rounded-lg transition-colors"
                            >
                                {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
                            </motion.button>
                        </div>
                    </header>

                    {/* ── Mobile Overlay ────────────────────────────────────── */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={closeSidebar}
                            />
                        )}
                    </AnimatePresence>

                    {/* ── Sidebar ───────────────────────────────────────────── */}
                    <aside className={`
                        fixed inset-y-0 left-0 z-40 w-[17rem] bg-black text-white transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                        md:relative md:translate-x-0
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        flex flex-col border-r border-brand-gold/10 shadow-2xl shadow-black/50
                    `}>

                        {/* Logo */}
                        <div className="px-7 pt-8 pb-6 flex-shrink-0">
                            <div className="text-[22px] font-black text-brand-gold tracking-tighter uppercase italic leading-none">
                                CAPRICE
                            </div>
                            <div className="text-white/20 font-light not-italic text-[11px] tracking-[0.35em] uppercase mt-0.5">
                                MGMT · Studio
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
                            <LayoutGroup>
                                {filteredNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={closeSidebar}
                                            className={`
                                                relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-colors duration-150 group
                                                ${isActive ? 'text-black' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'}
                                            `}
                                        >
                                            {isActive && (
                                                <motion.span
                                                    layoutId="sidebar-active"
                                                    className="absolute inset-0 rounded-2xl bg-brand-gold"
                                                    style={{ zIndex: -1 }}
                                                    transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                                                />
                                            )}
                                            <Icon
                                                size={16}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                className="flex-shrink-0"
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                                                {item.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </LayoutGroup>
                        </nav>

                        {/* User Card */}
                        {session?.user && (
                            <div className="mx-3 mb-4 mt-2 p-4 rounded-[22px] bg-white/[0.03] border border-white/[0.06]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-[13px] bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold overflow-hidden">
                                            {session.user.image ? (
                                                <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={20} />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-white uppercase tracking-wide truncate leading-none mb-1">
                                            {session.user.name}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                                            <p className="text-[9px] font-black text-brand-gold/70 uppercase tracking-[0.2em]">
                                                {session.user.role || 'Member'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/[0.04] text-white/30 hover:bg-red-500/15 hover:text-red-400 transition-colors font-black uppercase tracking-[0.18em] text-[9px] border border-white/[0.05] hover:border-red-500/20"
                                >
                                    <LogOut size={13} />
                                    Sign Out
                                </motion.button>
                            </div>
                        )}

                        <div className="px-6 pb-5 pt-2 border-t border-white/[0.04] text-center flex-shrink-0">
                            <p className="text-[8px] text-white/15 font-black uppercase tracking-[0.45em]">
                                © 2026 CAPRICE MEDIA
                            </p>
                        </div>
                    </aside>

                    {/* ── Main Content ──────────────────────────────────────── */}
                    <main className="flex-1 overflow-hidden relative">
                        {children}
                    </main>
                </div>
            </TasksProvider>
        </AppProvider>
    );
}
