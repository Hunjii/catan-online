import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Catan Online',
  description: 'Trò chơi Catan Online nhiều người chơi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased select-none text-amber-50">{children}</body>
    </html>
  );
}
