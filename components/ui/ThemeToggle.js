// components/ui/ThemeToggle.js
'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

/**
 * Light/dark theme switch. `variant="sidebar"` (default) renders on the
 * always-dark chrome (desktop rail / mobile header); `variant="content"`
 * renders on the theme-reactive content area.
 */
export default function ThemeToggle({ variant = 'sidebar', className = '' }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const styles = variant === 'sidebar'
        ? 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-foreground/[0.08]'
        : 'text-foreground/50 hover:text-foreground hover:bg-foreground/[0.08]';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${styles} ${className}`}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
