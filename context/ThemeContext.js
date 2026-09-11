// context/ThemeContext.js
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'caprice-theme';
const ThemeContext = createContext();

function getPreferredTheme() {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
    // Always starts as 'dark' so the very first client render matches the
    // server-rendered HTML (SSR has no window/localStorage to check). The
    // inline no-flash script in app/layout.js already paints the real
    // theme's colors before this ever mounts — only this hook's belief
    // about `theme` needs correcting, which happens right after mount,
    // outside of hydration, so it can never cause a mismatch.
    const [theme, setThemeState] = useState('dark');

    useEffect(() => {
        setThemeState(getPreferredTheme());
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // localStorage unavailable (private mode, etc.) — theme still works for this session.
        }
    }, [theme]);

    const setTheme = (next) => setThemeState(next);
    const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
}
