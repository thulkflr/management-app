// app/login/page.js
'use client';

import { useSearchParams } from "next/navigation";
import LoginButton from "@/components/auth/LoginButton";
import { AlertCircle, Camera, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import logoImg from "@/assets/logo.png";
import Image from "next/image";

function LoginContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const isUnauthorized = error === "AccessDenied" || error === "Configuration";

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-gold/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-gold/5 blur-[120px] rounded-full" />
            
            <div className="w-full max-w-md z-10">
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[48px] p-10 md:p-14 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-50" />
                    
                    {/* Brand Section */}
                    <div className="flex flex-col items-center text-center mb-12">
                        <div className="w-24 h-24 bg-black rounded-[32px] flex items-center justify-center mb-6 shadow-[0_0_50px_-10px_rgba(197,160,34,0.3)] border-2 border-brand-gold overflow-hidden group relative">
                            {/* Bulletproof Static Image Import */}
                            <Image 
                                src={logoImg} 
                                alt="Caprice Logo" 
                                className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500 z-20 relative"
                                priority
                            />
                            {/* Subtle Background Fallback - Only visible if Image fails */}
                            <div className="absolute inset-0 flex items-center justify-center text-brand-gold bg-black z-10">
                                <Camera size={40} className="opacity-40" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic mb-2">
                            CAPRICE <span className="text-brand-gold font-light opacity-50 not-italic">MGMT</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Official Access Portal</p>
                    </div>

                    {/* Error Handling */}
                    {isUnauthorized && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-red-500 text-xs font-black uppercase tracking-widest mb-1">Access Denied</h4>
                                <p className="text-slate-400 text-[10px] leading-relaxed">
                                    Your email is not on the authorized list. Please contact the administrator.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-white font-black text-xs uppercase tracking-widest">Sign in to continue</h2>
                            <p className="text-slate-500 text-[10px] font-medium leading-relaxed">
                                Authorized personnel only. All access attempts are logged.
                            </p>
                        </div>

                        <LoginButton />

                        <div className="flex items-center justify-center gap-2 pt-4">
                            <ShieldCheck size={14} className="text-brand-gold opacity-50" />
                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-none">
                                Enterprise Secure Access
                            </span>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-700 text-[9px] font-black uppercase tracking-[0.3em]">
                    © 2026 CAPRICE MEDIA PRODUCTION
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center font-black text-brand-gold tracking-[1em] uppercase text-xs">
                Loading Secure Module...
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
