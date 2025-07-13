import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Poppins } from 'next/font/google';
import { AppLayout } from '@/components/app-layout';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { SettingsProvider } from '@/context/settings-context';
import { DataProvider } from '@/context/data-context';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
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
    <html lang="en" suppressHydrationWarning className={`${poppins.variable}`}>
      <head>
      </head>
      <body>
        <ThemeProvider>
          <SettingsProvider>
            <DataProvider>
              <AuthProvider>
                <AppLayout>{children}</AppLayout>
                <Toaster />
              </AuthProvider>
            </DataProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
