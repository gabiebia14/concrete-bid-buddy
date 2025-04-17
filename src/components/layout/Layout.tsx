
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ClientSidebar } from './ClientSidebar';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Verificar automaticamente se estamos em uma página de login
  const isLoginPage = location.pathname === '/login' || location.pathname === '/manager/login';
  
  // Se hideSidebar foi explicitamente definido, use esse valor
  // Caso contrário, esconda a barra lateral em páginas de login
  const shouldHideSidebar = hideSidebar !== undefined ? hideSidebar : isLoginPage;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      {!shouldHideSidebar && !isMobile && <ClientSidebar />}
      
      <div className={`flex-1 flex flex-col overflow-hidden ${!shouldHideSidebar && !isMobile ? 'md:w-4/5' : 'w-full'}`}>
        {!hideHeader && <Header />}
        <main className="flex-grow overflow-y-auto">
          {children}
        </main>
        {!hideFooter && <Footer />}
      </div>
      
      {/* Mobile Bottom Navigation quando no mobile */}
      {!shouldHideSidebar && isMobile && <MobileBottomNav />}
    </div>
  );
}

// Componente para navegação inferior em dispositivos móveis
function MobileBottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-30">
      <div className="flex justify-around items-center h-16">
        <a 
          href="/dashboard" 
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('/dashboard') ? 'text-lime-600' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span className="text-xs">Início</span>
        </a>
        <a 
          href="/criar-orcamento" 
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('/criar-orcamento') ? 'text-lime-600' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <span className="text-xs">Orçamento</span>
        </a>
        <a 
          href="/catalogo" 
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('/catalogo') ? 'text-lime-600' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          <span className="text-xs">Catálogo</span>
        </a>
        <a 
          href="/vendedor" 
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('/vendedor') ? 'text-lime-600' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className="text-xs">Vendedor</span>
        </a>
      </div>
    </div>
  );
}
