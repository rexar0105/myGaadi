
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { ThemeProvider } from '@/context/theme-context';
import { SettingsProvider } from '@/context/settings-context';
import { AppProvider } from '@/context/app-provider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'myGaadi - Your Vehicle Companion',
  description: 'Track the health, services, and expenses of your vehicles with myGaadi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <head>
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
