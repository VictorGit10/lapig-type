import type { Metadata } from 'next';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({ variable: '--font-display', subsets: ['latin'] });
const body = Hanken_Grotesk({ variable: '--font-body', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://victorgit10.github.io/lapig-type/'),
  title: 'LAPIG Type — Desafio de digitação',
  description: 'Um desafio de 60 segundos de digitação com textos acadêmicos do LAPIG.',
  openGraph: {
    title: 'LAPIG Type — Desafio de digitação',
    description: 'Um desafio de 60 segundos de digitação com textos acadêmicos do LAPIG.',
    url: 'https://victorgit10.github.io/lapig-type/',
    siteName: 'LAPIG Type',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://victorgit10.github.io/lapig-type/og.jpg', width: 1200, height: 628, type: 'image/jpeg', alt: 'LAPIG Type — desafio de digitação com textos acadêmicos do LAPIG' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LAPIG Type — Desafio de digitação',
    description: 'Um desafio de 60 segundos de digitação com textos acadêmicos do LAPIG.',
    images: ['https://victorgit10.github.io/lapig-type/og.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
