import type { Metadata } from 'next';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({ variable: '--font-display', subsets: ['latin'] });
const body = Hanken_Grotesk({ variable: '--font-body', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://victorgit10.github.io/lapig-type/'),
  title: 'LAPIG Type — Treino de digitação',
  description: 'Treine digitação por 60 segundos com textos científicos selecionados pelo LAPIG.',
  openGraph: {
    title: 'LAPIG Type — Treino de digitação',
    description: 'Treine digitação por 60 segundos com textos científicos selecionados pelo LAPIG.',
    url: 'https://victorgit10.github.io/lapig-type/',
    siteName: 'LAPIG Type',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://victorgit10.github.io/lapig-type/og.png', width: 1734, height: 907, alt: 'LAPIG Type — treino de digitação com textos científicos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LAPIG Type — Treino de digitação',
    description: 'Treine digitação por 60 segundos com textos científicos selecionados pelo LAPIG.',
    images: ['https://victorgit10.github.io/lapig-type/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
