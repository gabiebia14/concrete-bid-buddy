
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Menu, X, User, LineChart, Smartphone, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { UserDropdown } from './UserDropdown';
import { AuthButtons } from './AuthButtons';
import { NavLinkProps } from './types';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isManager = user?.isManager || location.pathname.startsWith('/manager');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const clientLinks: NavLinkProps[] = [{
    title: 'Criar Orçamento',
    path: '/criar-orcamento'
  }, {
    title: 'Histórico',
    path: '/historico'
  }, {
    title: 'Catálogo',
    path: '/catalogo'
  }];

  const managerLinks: NavLinkProps[] = [{
    title: 'Dashboard',
    path: '/manager/dashboard'
  }, {
    title: 'Orçamentos',
    path: '/manager/quotes'
  }, {
    title: 'Clientes',
    path: '/manager/clients'
  }, {
    title: 'Chat WhatsApp',
    path: '/manager/whatsapp-chats',
    icon: <Smartphone className="w-4 h-4 mr-1" />
  }, {
    title: 'Chat Web',
    path: '/manager/web-chats',
    icon: <Globe className="w-4 h-4 mr-1" />
  }];

  const navLinks = isManager ? managerLinks : clientLinks;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" 
                alt="IPT Teixeira Logo" 
                className="h-10 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-lime-500 hidden sm:inline-block">
                IPT Teixeira
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <DesktopNav navLinks={navLinks} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <UserDropdown user={user} handleSignOut={handleSignOut} />
            ) : (
              <AuthButtons />
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMenu}
                className="text-foreground"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <MobileNav navLinks={navLinks} isMenuOpen={isMenuOpen} closeMenu={closeMenu} isManager={isManager} user={user} handleSignOut={handleSignOut} />
    </header>
  );
}
