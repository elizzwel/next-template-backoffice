import { Inter } from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Admin Panel - User & Role Management',
  description: 'Complete admin template with authentication and user management',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}



