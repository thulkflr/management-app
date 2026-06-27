// app/layout.js
import { AuthProvider } from '@/context/SessionProvider';
import MainLayout from '@/components/layout/MainLayout';
import './globals.css';

export const metadata = {
    title: 'Caprice MGMT - Production Studio',
    description: 'Management system for Caprice Media Production',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <AuthProvider>
                    <MainLayout>
                        {children}
                    </MainLayout>
                </AuthProvider>
            </body>
        </html>
    );
}