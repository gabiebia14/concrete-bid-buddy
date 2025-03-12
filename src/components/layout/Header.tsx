
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LineChart, LogOut, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/supabase';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isManager = location.pathname.startsWith('/manager');
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const clientLinks = [
    { title: 'Criar Orçamento', path: '/criar-orcamento' },
    { title: 'Histórico', path: '/historico' },
    { title: 'Catálogo', path: '/catalogo' },
  ];

  const managerLinks = [
    { title: 'Dashboard', path: '/manager/dashboard' },
    { title: 'Orçamentos', path: '/manager/quotes' },
    { title: 'Clientes', path: '/manager/clients' },
  ];

  const navLinks = isManager ? managerLinks : clientLinks;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                IPT Teixeira
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                }`}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full h-8 w-8 bg-primary/10 text-primary"
                  >
                    <User size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {isManager ? 'Gerente' : 'Cliente'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {!isManager && (
                    <DropdownMenuItem asChild>
                      <Link to="/manager/dashboard" className="flex items-center cursor-pointer">
                        <LineChart className="mr-2 h-4 w-4" />
                        <span>Área do Gerente</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isManager && (
                    <DropdownMenuItem asChild>
                      <Link to="/criar-orcamento" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Área do Cliente</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">Entrar</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t animate-fade-in">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm rounded-md ${
                    location.pathname === link.path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                  }`}
                  onClick={closeMenu}
                >
                  {link.title}
                </Link>
              ))}
              
              {user && !isManager && (
                <Link
                  to="/manager/dashboard"
                  className="px-3 py-2 text-sm rounded-md text-foreground/80 hover:text-foreground hover:bg-accent"
                  onClick={closeMenu}
                >
                  Área do Gerente
                </Link>
              )}
              
              {user && isManager && (
                <Link
                  to="/criar-orcamento"
                  className="px-3 py-2 text-sm rounded-md text-foreground/80 hover:text-foreground hover:bg-accent"
                  onClick={closeMenu}
                >
                  Área do Cliente
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
