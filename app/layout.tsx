import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MotionGen — AI Motion Graphics Studio',
  description: 'Turn ideas into production-ready motion graphics with AI.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
