import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { SettingsProvider } from '@/context/settings-context';
import { DataProvider } from '@/context/data-context';

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
    <html lang="en" suppressHydrationWarning>
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
