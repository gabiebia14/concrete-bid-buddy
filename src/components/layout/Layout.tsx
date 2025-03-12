
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
    <div className="flex h-screen overflow-hidden bg-background">
      <ClientSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hideHeader && <Header />}
        <main className="flex-grow overflow-y-auto py-2 px-2 md:px-4">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
        {!hideFooter && <Footer />}
      </div>
    </div>
  );
}
