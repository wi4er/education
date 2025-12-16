import React from 'react';
import type { Metadata } from 'next';
import { UserProvider } from '@/contexts/userContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';
import '../fonts/Poppins/font.css';
import '../fonts/PlayfairDisplay/font.css';

export const metadata: Metadata = {};

export default function RootLayout(
  {
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>,
) {
  return (
    <html lang="en">
    <body>
    <UserProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </UserProvider>
    </body>
    </html>
  );
}