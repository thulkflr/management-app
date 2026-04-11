// app/layout.js
import { AppProvider } from '@/context/AppContext';
import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, Users, Wallet, FolderKanban } from 'lucide-react';

export const metadata = { title: 'PhotoBiz Manager' };

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="bg-slate-50 text-slate-900 flex h-screen overflow-hidden">
                <AppProvider>
                    {/* Sidebar */}
                    <aside className="w-64 bg-slate-900 text-white flex flex-col">
                        <div className="p-6 text-xl font-bold border-b border-slate-800">PhotoBiz</div>
                        <nav className="flex-1 p-4 space-y-2">
                            <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
                                <LayoutDashboard size={20} /> Dashboard
                            </Link>
                            <Link href="/projects" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
                                <FolderKanban size={20} /> Projects
                            </Link>
                            <Link href="/wallet" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
                                <Wallet size={20} /> Wallet
                            </Link>
                            <Link href="/members" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
                                <Users size={20} /> Members
                            </Link>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-8">
                        {children}
                    </main>
                </AppProvider>
            </body>
        </html>
    );
}