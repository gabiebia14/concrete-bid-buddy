
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ClientSidebar } from './ClientSidebar';

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  showSidebar?: boolean;
}

export function Layout({ 
  children, 
  hideHeader = false, 
  hideFooter = false,
  showSidebar = true
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && <Header />}
      <div className="flex flex-1">
        {showSidebar && <ClientSidebar />}
        <main className={`flex-grow ${showSidebar ? 'pt-0' : 'pt-16'}`}>{children}</main>
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
}
