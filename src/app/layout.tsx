import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Navbar from './components/Navbar/Navbar';

export const metadata: Metadata = {
  title: 'Table Tennis Match Tracker',
  description:
    'This app tracks table tennis match scores and displays rankings by communicating with a spreadsheet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <UserProvider>
        <body>
          <Navbar />
          <div className="p-8">{children}</div>
        </body>
      </UserProvider>
    </html>
  );
}
