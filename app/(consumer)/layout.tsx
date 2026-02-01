import * as React from 'react';
import { Header, Footer } from '@/components/shared';

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
