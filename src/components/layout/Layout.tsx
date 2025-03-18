
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ClientSidebar } from './ClientSidebar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideSidebar?: boolean;
}

export function Layout({ 
  children, 
  hideHeader = true, 
  hideFooter = true,
  hideSidebar
}: LayoutProps) {
  const location = useLocation();
  
  // Verificar automaticamente se estamos em uma página de login
  const isLoginPage = location.pathname === '/login' || location.pathname === '/manager/login';
  
  // Se hideSidebar foi explicitamente definido, use esse valor
  // Caso contrário, esconda a barra lateral em páginas de login
  const shouldHideSidebar = hideSidebar !== undefined ? hideSidebar : isLoginPage;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!shouldHideSidebar && <ClientSidebar />}
      <div className={`flex-1 flex flex-col overflow-hidden ${!shouldHideSidebar ? '' : 'w-full'}`}>
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
