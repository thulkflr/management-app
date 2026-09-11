// app/layout.js
import Script from 'next/script';
import { AuthProvider } from '@/context/SessionProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import MainLayout from '@/components/layout/MainLayout';
import './globals.css';

export const metadata = {
    title: 'Caprice MGMT - Production Studio',
    description: 'Management system for Caprice Media Production',
};

export const viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#F1EDE3' },
        { media: '(prefers-color-scheme: dark)', color: '#151617' },
    ],
    colorScheme: 'dark light',
};

// Applies the saved/system theme to <html> before first paint so there is
// no flash of the wrong theme. Mirrors the fallback logic in ThemeContext.
const noFlashThemeScript = `
(function () {
    try {
        var stored = window.localStorage.getItem('caprice-theme');
        var theme = stored === 'light' || stored === 'dark'
            ? stored
            : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <Script
                    id="theme-init"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{ __html: noFlashThemeScript }}
                />
                <ThemeProvider>
                    <AuthProvider>
                        <MainLayout>
                            {children}
                        </MainLayout>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}