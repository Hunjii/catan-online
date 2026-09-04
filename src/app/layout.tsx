import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const cinzel = localFont({
  src: [{
    path: '../../public/fonts/Cinzel-Variable.ttf',
    weight: '600 900',
    style: 'normal',
  }],
  variable: '--font-cinzel',
  display: 'swap',
});

const cinzelDecorative = localFont({
  src: [
    {
      path: '../../public/fonts/CinzelDecorative-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/CinzelDecorative-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-cinzel-decorative',
  display: 'swap',
});

const cormorant = localFont({
  src: [
    {
      path: '../../public/fonts/CormorantGaramond-Variable.ttf',
      weight: '300 700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/CormorantGaramond-Italic-Variable.ttf',
      weight: '300 700',
      style: 'italic',
    },
  ],
  variable: '--font-cormorant',
  display: 'swap',
});

const grenzeGotisch = localFont({
  src: [{
    path: '../../public/fonts/GrenzeGotisch-Variable.ttf',
    weight: '600 900',
    style: 'normal',
  }],
  variable: '--font-grenze-gotisch',
  display: 'swap',
});

const alegreyaSC = localFont({
  src: [
    {
      path: '../../public/fonts/AlegreyaSC-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AlegreyaSC-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AlegreyaSC-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-alegreya-sc',
  display: 'swap',
});

const beVietnam = localFont({
  src: [
    {
      path: '../../public/fonts/BeVietnamPro-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BeVietnamPro-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BeVietnamPro-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BeVietnamPro-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BeVietnamPro-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BeVietnamPro-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-be-vietnam',
  display: 'swap',
});

const inter = localFont({
  src: [{
    path: '../../public/fonts/Inter-Variable.ttf',
    weight: '100 900',
    style: 'normal',
  }],
  variable: '--font-inter',
  display: 'swap',
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
      <body suppressHydrationWarning className="antialiased select-none text-amber-50 font-sans">{children}</body>
    </html>
  );
}
