import type { Metadata } from 'next';
import { Alegreya_SC, Be_Vietnam_Pro, Cinzel, Cinzel_Decorative, Cormorant_Garamond, Grenze_Gotisch, Inter } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-cinzel',
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-cinzel-decorative',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const grenzeGotisch = Grenze_Gotisch({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-grenze-gotisch',
});

const alegreyaSC = Alegreya_SC({
  subsets: ['latin', 'vietnamese'],
  weight: ['700', '800', '900'],
  variable: '--font-alegreya-sc',
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam',
});

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

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
    <html lang="en" className={`${cinzel.variable} ${cinzelDecorative.variable} ${cormorant.variable} ${grenzeGotisch.variable} ${alegreyaSC.variable} ${beVietnam.variable} ${inter.variable}`}>
      <body className="antialiased select-none text-amber-50 font-sans">{children}</body>
    </html>
  );
}
