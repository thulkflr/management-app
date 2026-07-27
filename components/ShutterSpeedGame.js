'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Zap, Trophy, RefreshCw, Crosshair } from 'lucide-react';

export default function ShutterSpeedGame() {
    // States: 'idle' | 'waiting' | 'ready' | 'result' | 'early'
    const [gameState, setGameState] = useState('idle');
    const [reactionTime, setReactionTime] = useState(null);
    const [bestScore, setBestScore] = useState(null);
    const [flashEffect, setFlashEffect] = useState(false);

    const startTimeRef = useRef(null);
    const timeoutRef = useRef(null);

    // Load best score from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('photobiz_shutter_best');
        if (saved) setBestScore(Number(saved));
    }, []);

    const startGame = () => {
        setGameState('waiting');
        setReactionTime(null);

        // Random delay between 1.8s and 4.2s
        const randomDelay = Math.floor(Math.random() * 2400) + 1800;

        timeoutRef.current = setTimeout(() => {
            setGameState('ready');
            startTimeRef.current = Date.now();
        }, randomDelay);
    };

    const handleShutterClick = () => {
        if (gameState === 'idle') {
            startGame();
        } else if (gameState === 'waiting') {
            // Clicked too early!
            clearTimeout(timeoutRef.current);
            setGameState('early');
        } else if (gameState === 'ready') {
            // Captured!
            const elapsed = Date.now() - startTimeRef.current;
            setReactionTime(elapsed);
            setGameState('result');
            triggerFlash();

            // Check best score
            if (!bestScore || elapsed < bestScore) {
                setBestScore(elapsed);
                localStorage.setItem('photobiz_shutter_best', String(elapsed));
            }
        } else if (gameState === 'result' || gameState === 'early') {
            startGame();
        }
    };

    const triggerFlash = () => {
        setFlashEffect(true);
        setTimeout(() => setFlashEffect(false), 200);
    };

    const resetBestScore = (e) => {
        e.stopPropagation();
        localStorage.removeItem('photobiz_shutter_best');
        setBestScore(null);
    };

    // Calculate Rating & Badge
    const getRating = (ms) => {
        if (!ms) return { title: '', rating: '', color: '' };
        if (ms < 220) return { title: '⚡ Insane Focus!', rating: '100% Sharp (1/8000s)', color: 'text-brand-gold border-brand-gold/40 bg-brand-gold/10' };
        if (ms < 320) return { title: '🎯 Crisp Capture!', rating: '94% Sharp (1/4000s)', color: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' };
        if (ms < 450) return { title: '📸 Good Shot!', rating: '82% Sharp (1/1000s)', color: 'text-sky-400 border-sky-400/40 bg-sky-400/10' };
        return { title: '🐢 Motion Blur!', rating: '50% Sharp (1/250s - Slow)', color: 'text-amber-400 border-amber-400/40 bg-amber-400/10' };
    };

    const ratingInfo = getRating(reactionTime);

    return (
        <div className="relative overflow-hidden rounded-3xl border border-card-border bg-card-bg p-5 md:p-6 shadow-xl transition-all">
            {/* White Shutter Flash Effect */}
            <AnimatePresence>
                {flashEffect && (
                    <motion.div
                        initial={{ opacity: 0.9 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-white z-50 pointer-events-none rounded-3xl"
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                        <Zap size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Shutter Speed Challenge</h3>
                        <p className="text-[9px] font-bold text-foreground/35">Test your reaction time & focus speed</p>
                    </div>
                </div>

                {bestScore && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black">
                            <Trophy size={12} /> Best: {bestScore}ms
                        </div>
                        <button onClick={resetBestScore} title="Reset Best Score" className="text-foreground/30 hover:text-brand-gold transition p-1">
                            <RefreshCw size={11} />
                        </button>
                    </div>
                )}
            </div>

            {/* Camera Viewfinder Area */}
            <div
                onClick={handleShutterClick}
                className={`relative h-44 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-300 ${
                    gameState === 'idle'
                        ? 'border-card-border bg-background/80 hover:border-brand-gold/30'
                        : gameState === 'waiting'
                        ? 'border-amber-500/30 bg-amber-950/10'
                        : gameState === 'ready'
                        ? 'border-emerald-500 bg-emerald-950/30 glow-emerald'
                        : gameState === 'early'
                        ? 'border-red-500/50 bg-red-950/20'
                        : 'border-brand-gold/40 bg-card-bg'
                }`}
            >
                {/* Viewfinder Crosshair Grid Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-foreground/40" />
                    <div className="h-full w-[1px] bg-foreground/40 absolute" />
                    <div className="w-32 h-32 rounded-full border border-foreground/30 absolute" />
                    <div className="w-48 h-48 rounded-full border border-foreground/15 absolute" />
                </div>

                {/* Viewfinder Corner Marks */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-foreground/30" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-foreground/30" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-foreground/30" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-foreground/30" />

                {/* Game Contents per State */}
                {gameState === 'idle' && (
                    <div className="text-center space-y-2 z-10 px-4">
                        <div className="w-12 h-12 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center mx-auto text-brand-gold">
                            <Camera size={22} />
                        </div>
                        <div>
                            <p className="font-black text-sm text-foreground">Click Anywhere to Start</p>
                            <p className="text-[10px] text-foreground/40 font-bold mt-0.5">Press CAPTURE as fast as you can when the target turns GREEN!</p>
                        </div>
                    </div>
                )}

                {gameState === 'waiting' && (
                    <div className="text-center space-y-2 z-10 animate-pulse">
                        <Crosshair size={32} className="mx-auto text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                        <p className="font-black text-xs uppercase tracking-widest text-amber-400">Locking Focus... Hold Ready!</p>
                    </div>
                )}

                {gameState === 'ready' && (
                    <div className="text-center space-y-2 z-10 animate-in zoom-in-75 duration-100">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center mx-auto text-black shadow-2xl shadow-emerald-500/50 animate-bounce">
                            <Zap size={32} />
                        </div>
                        <p className="font-black text-lg uppercase tracking-widest text-emerald-400 drop-shadow-md">PRESS NOW! 📸</p>
                    </div>
                )}

                {gameState === 'early' && (
                    <div className="text-center space-y-2 z-10">
                        <p className="font-black text-base text-red-400">⚠️ False Shutter Trigger!</p>
                        <p className="text-xs text-foreground/50 font-bold">You pressed before focus lock. Click to try again!</p>
                    </div>
                )}

                {gameState === 'result' && (
                    <div className="text-center space-y-1.5 z-10">
                        <div className="text-3xl font-black text-foreground tracking-tight flex items-baseline justify-center gap-1">
                            {reactionTime} <span className="text-sm font-bold text-foreground/40">ms</span>
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${ratingInfo.color}`}>
                            {ratingInfo.title} · {ratingInfo.rating}
                        </div>
                        <p className="text-[10px] text-foreground/35 font-bold pt-1">Click anywhere to shoot again 🔄</p>
                    </div>
                )}
            </div>
        </div>
    );
}
