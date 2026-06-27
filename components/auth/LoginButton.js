// components/auth/LoginButton.js
'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Chrome, Loader2 } from "lucide-react";

export default function LoginButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (error) {
            console.error("Login failed", error);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogin}
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-white px-8 py-5 font-black text-black shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(197,160,34,0.3)] active:scale-95 disabled:opacity-50 disabled:grayscale transition-duration-500"
        >
            {isLoading ? (
                <Loader2 className="animate-spin text-brand-gold" size={24} />
            ) : (
                <>
                    <div className="absolute inset-0 bg-brand-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Chrome size={24} className="text-[#4285F4] group-hover:scale-110 transition-transform" />
                    <span className="uppercase tracking-[0.2em] text-xs">Sign In With Google</span>
                </>
            )}
        </button>
    );
}
