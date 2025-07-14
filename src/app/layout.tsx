
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { ThemeProvider } from '@/context/theme-context';
import { SettingsProvider } from '@/context/settings-context';
import { AppProvider } from '@/context/app-provider';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'myGaadi - Your Vehicle Companion',
  description: 'Track the health, services, and expenses of your vehicles with myGaadi.',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'myGaadi',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={figtree.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        <ThemeProvider>
          <SettingsProvider>
            <AppProvider>
                <AppLayout>{children}</AppLayout>
                <Toaster />
            </AppProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
