import type { Metadata } from 'next';
import './globals.css';
import { DM_Sans, MuseoModerno } from 'next/font/google';
import NavBar from '@/components/navbar/nav-bar';
import { Toaster } from '@/components/ui/sonner';
import { WrapperWithQuery } from '@/components/wrapper-with-query';
import { PusherPresenceProvider } from '@/components/providers/pusher-presence-provider';
import { AuthProvider } from '@/lib/auth-context';
import Footer from '@/components/footer/footer';

const dm_sans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm_sans',
});
const museoModerno = MuseoModerno({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-museoModerno',
});

export const metadata: Metadata = {
  title: 'Sofor',
  description: 'A bus ticket booking system',
  icons: "🚌"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en">
      <head>
        <link rel="icon" href="/icon.jpg" />
      </head>
      <body className={'h-full bg-white'} suppressHydrationWarning={true}>
        <WrapperWithQuery>
          <AuthProvider>
            <PusherPresenceProvider>
              <NavBar />
              {children}
              <Footer />
              <Toaster richColors />
            </PusherPresenceProvider>
          </AuthProvider>
        </WrapperWithQuery>
      </body>
    </html>
  );
}
