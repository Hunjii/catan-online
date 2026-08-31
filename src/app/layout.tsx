import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Catan 3D Online Multiplayer',
  description: 'Trò chơi Catan 3D Online nhiều người chơi, chuẩn luật quốc tế, chạy hoàn toàn trên trình duyệt.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased select-none">{children}</body>
    </html>
  );
}
