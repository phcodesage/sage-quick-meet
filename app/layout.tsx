import type { ReactNode } from 'react';
import '../src/app/globals.css';

export const metadata = {
  title: 'Meetra',
  description: 'Next.js WebRTC video calling with serverless API',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
