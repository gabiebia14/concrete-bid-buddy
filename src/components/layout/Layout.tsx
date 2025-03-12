
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ClientSidebar } from './ClientSidebar';

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function Layout({ 
  children, 
  hideHeader = true, 
  hideFooter = true
}: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ClientSidebar />
      <div className="flex-1 overflow-y-auto">
        {!hideHeader && <Header />}
        <main className="flex-grow">
          {children}
        </main>
        {!hideFooter && <Footer />}
      </div>
    </div>
  );
}
