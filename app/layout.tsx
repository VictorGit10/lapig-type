import type { Metadata } from 'next';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({ variable: '--font-display', subsets: ['latin'] });
const body = Hanken_Grotesk({ variable: '--font-body', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://lapig-type.vitoriagouveia343.chatgpt.site'),
  title: 'LAPIG Type — Ciência na ponta dos dedos',
  description: 'Treine digitação com pesquisas sobre o Cerrado, uso da terra e geoinformação.',
  openGraph: {
    title: 'LAPIG Type — Ciência na ponta dos dedos',
    description: 'Treine digitação com pesquisas sobre o Cerrado, uso da terra e geoinformação.',
    url: 'https://lapig-type.vitoriagouveia343.chatgpt.site',
    siteName: 'LAPIG Type',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://lapig-type.vitoriagouveia343.chatgpt.site/og.png', width: 1734, height: 907, alt: 'LAPIG Type — Ciência na ponta dos dedos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LAPIG Type — Ciência na ponta dos dedos',
    description: 'Treine digitação com pesquisas sobre o Cerrado, uso da terra e geoinformação.',
    images: ['https://lapig-type.vitoriagouveia343.chatgpt.site/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
