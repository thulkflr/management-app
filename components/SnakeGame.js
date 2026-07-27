'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Trophy, RotateCcw, Play, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const GRID_SIZE = 16;
const INITIAL_SPEED = 130;

function getRandomFood(snake) {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
        const isCollision = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        if (!isCollision) break;
    }
    return newFood;
}

export default function SnakeGame() {
    const [snake, setSnake] = useState([{ x: 8, y: 8 }, { x: 8, y: 9 }]);
    const [food, setFood] = useState({ x: 8, y: 4 });
    const [dir, setDir] = useState({ x: 0, y: -1 }); // Moving up initially
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const dirRef = useRef(dir);
    dirRef.current = dir;

    // Load High Score
    useEffect(() => {
        const saved = localStorage.getItem('photobiz_snake_highscore');
        if (saved) setHighScore(Number(saved));
    }, []);

    const resetGame = () => {
        const initSnake = [{ x: 8, y: 8 }, { x: 8, y: 9 }];
        setSnake(initSnake);
        setFood(getRandomFood(initSnake));
        setDir({ x: 0, y: -1 });
        setScore(0);
        setIsGameOver(false);
        setIsPaused(false);
        setIsPlaying(true);
    };

    const changeDirection = useCallback((newDir) => {
        if (!isPlaying || isPaused || isGameOver) return;
        const current = dirRef.current;
        // Prevent opposite direction 180 turn
        if (newDir.x === -current.x && newDir.x !== 0) return;
        if (newDir.y === -current.y && newDir.y !== 0) return;
        setDir(newDir);
    }, [isPlaying, isPaused, isGameOver]);

    // Keyboard Listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault(); // Prevent page scrolling
            }
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection({ x: 0, y: -1 });
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection({ x: 0, y: 1 });
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection({ x: -1, y: 0 });
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection({ x: 1, y: 0 });
            if (e.key === ' ') {
                if (!isPlaying) resetGame();
                else setIsPaused(p => !p);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [changeDirection, isPlaying]);

    // Main Game Loop
    useEffect(() => {
        if (!isPlaying || isPaused || isGameOver) return;

        const interval = setInterval(() => {
            setSnake(prevSnake => {
                const head = { ...prevSnake[0] };
                const currentDir = dirRef.current;
                head.x += currentDir.x;
                head.y += currentDir.y;

                // Wall Collision check
                if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                    setIsGameOver(true);
                    return prevSnake;
                }

                // Self Collision check
                if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    setIsGameOver(true);
                    return prevSnake;
                }

                const newSnake = [head, ...prevSnake];

                // Food Eaten check
                if (head.x === food.x && head.y === food.y) {
                    setScore(s => {
                        const newScore = s + 10;
                        if (newScore > highScore) {
                            setHighScore(newScore);
                            localStorage.setItem('photobiz_snake_highscore', String(newScore));
                        }
                        return newScore;
                    });
                    setFood(getRandomFood(newSnake));
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, Math.max(60, INITIAL_SPEED - Math.floor(score / 30) * 10));

        return () => clearInterval(interval);
    }, [isPlaying, isPaused, isGameOver, food, score, highScore]);

    return (
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-[#0a120a] p-5 shadow-2xl transition-all font-mono">
            {/* Retro CRT Grid Lines Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-40" />

            {/* Header / Arcade Score HUD */}
            <div className="flex items-center justify-between mb-3 text-emerald-400 z-10 relative">
                <div className="flex items-center gap-2">
                    <Gamepad2 size={18} className="animate-pulse text-emerald-400" />
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                            ATARI 2600 SNAKE
                        </h3>
                        <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Retro Arcade Edition</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[8px] uppercase tracking-widest text-emerald-600 block leading-none">SCORE</span>
                        <span className="text-base font-black text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]">
                            {String(score).padStart(4, '0')}
                        </span>
                    </div>
                    <div className="text-right border-l border-emerald-900/60 pl-3">
                        <span className="text-[8px] uppercase tracking-widest text-amber-500 flex items-center gap-0.5 justify-end leading-none">
                            <Trophy size={9} /> HIGH
                        </span>
                        <span className="text-base font-black text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                            {String(highScore).padStart(4, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {/* LCD Screen Display */}
            <div className="relative aspect-square w-full rounded-2xl bg-[#040904] border-2 border-emerald-900/80 p-1.5 shadow-inner overflow-hidden flex flex-col justify-between">

                {/* Grid Canvas */}
                <div className="grid grid-cols-16 grid-rows-16 gap-[1px] w-full h-full bg-[#071307] rounded-xl overflow-hidden p-1 border border-emerald-950">
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                        const x = idx % GRID_SIZE;
                        const y = Math.floor(idx / GRID_SIZE);

                        const isHead = snake[0].x === x && snake[0].y === y;
                        const isBody = snake.some((s, i) => i > 0 && s.x === x && s.y === y);
                        const isFoodItem = food.x === x && food.y === y;

                        return (
                            <div
                                key={idx}
                                className={`rounded-[2px] transition-all duration-75 ${
                                    isHead
                                        ? 'bg-emerald-300 shadow-[0_0_10px_#34d399] z-10 scale-105'
                                        : isBody
                                        ? 'bg-emerald-500 opacity-90 shadow-[0_0_4px_#10b981]'
                                        : isFoodItem
                                        ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse rounded-full'
                                        : 'bg-emerald-950/20'
                                }`}
                            />
                        );
                    })}
                </div>

                {/* Overlays: Idle / GameOver / Paused */}
                <AnimatePresence>
                    {!isPlaying && !isGameOver && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#040904]/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 space-y-3"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                                <Gamepad2 size={26} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-emerald-400 tracking-wider uppercase">PRESS START TO PLAY</h4>
                                <p className="text-[10px] text-emerald-600 font-bold mt-1">Use Arrow Keys or D-Pad below</p>
                            </div>
                            <button
                                onClick={resetGame}
                                className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(52,211,153,0.4)] cursor-pointer"
                            >
                                <Play size={14} fill="black" /> START GAME
                            </button>
                        </motion.div>
                    )}

                    {isGameOver && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0a0505]/92 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 space-y-2 border-2 border-red-500/40 rounded-2xl"
                        >
                            <p className="text-xs font-black uppercase tracking-widest text-red-500 animate-pulse">GAME OVER</p>
                            <h4 className="text-2xl font-black text-white">SCORE: {score}</h4>
                            {score >= highScore && score > 0 && (
                                <p className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest">
                                    🏆 NEW HIGH SCORE!
                                </p>
                            )}
                            <button
                                onClick={resetGame}
                                className="mt-2 flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30 cursor-pointer"
                            >
                                <RotateCcw size={14} /> PLAY AGAIN
                            </button>
                        </motion.div>
                    )}

                    {isPaused && !isGameOver && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 flex items-center justify-center z-30"
                        >
                            <p className="text-sm font-black text-emerald-400 tracking-widest uppercase animate-pulse">PAUSED</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* D-Pad Controls for Touch / Mouse Click */}
            <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between">
                {/* Status / Control buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsPaused(p => !p)}
                        disabled={!isPlaying || isGameOver}
                        className="px-3 py-1.5 rounded-lg border border-emerald-900 bg-emerald-950/40 text-[9px] font-black text-emerald-400 uppercase tracking-wider hover:bg-emerald-900/60 disabled:opacity-30 transition cursor-pointer"
                    >
                        {isPaused ? <Play size={10} className="inline mr-1" /> : <Pause size={10} className="inline mr-1" />}
                        {isPaused ? 'RESUME' : 'PAUSE'}
                    </button>
                    <button
                        onClick={resetGame}
                        className="px-3 py-1.5 rounded-lg border border-emerald-900 bg-emerald-950/40 text-[9px] font-black text-emerald-400 uppercase tracking-wider hover:bg-emerald-900/60 transition cursor-pointer"
                    >
                        RESET
                    </button>
                </div>

                {/* D-PAD Arrow Keys */}
                <div className="grid grid-cols-3 gap-1 w-28">
                    <div />
                    <button
                        onClick={() => changeDirection({ x: 0, y: -1 })}
                        className="h-7 rounded bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 flex items-center justify-center hover:bg-emerald-800/60 active:bg-emerald-500 active:text-black transition cursor-pointer"
                    >
                        <ChevronUp size={14} />
                    </button>
                    <div />
                    <button
                        onClick={() => changeDirection({ x: -1, y: 0 })}
                        className="h-7 rounded bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 flex items-center justify-center hover:bg-emerald-800/60 active:bg-emerald-500 active:text-black transition cursor-pointer"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={() => changeDirection({ x: 0, y: 1 })}
                        className="h-7 rounded bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 flex items-center justify-center hover:bg-emerald-800/60 active:bg-emerald-500 active:text-black transition cursor-pointer"
                    >
                        <ChevronDown size={14} />
                    </button>
                    <button
                        onClick={() => changeDirection({ x: 1, y: 0 })}
                        className="h-7 rounded bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 flex items-center justify-center hover:bg-emerald-800/60 active:bg-emerald-500 active:text-black transition cursor-pointer"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
