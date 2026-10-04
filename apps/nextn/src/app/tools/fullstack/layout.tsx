import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

export default function FullStackLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={nunito.variable}>{children}</div>;
}
