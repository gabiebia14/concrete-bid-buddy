
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LineChart, LogOut, Settings, Smartphone, Globe, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

// Definir o tipo para os links de navegação com icon opcional
type NavLink = {
  title: string;
  path: string;
  icon?: React.ReactNode;
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
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

  const clientLinks: NavLink[] = [
    { title: 'Criar Orçamento', path: '/criar-orcamento' },
    { title: 'Histórico', path: '/historico' },
    { title: 'Catálogo', path: '/catalogo' },
  ];

  const managerLinks: NavLink[] = [
    { title: 'Dashboard', path: '/manager/dashboard' },
    { title: 'Orçamentos', path: '/manager/quotes' },
    { title: 'Clientes', path: '/manager/clients' },
    { title: 'Chat WhatsApp', path: '/manager/whatsapp-chats', icon: <Smartphone className="w-4 h-4 mr-1" /> },
    { title: 'Chat Web', path: '/manager/web-chats', icon: <Globe className="w-4 h-4 mr-1" /> },
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
            {user && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center ${
                  location.pathname === link.path
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                }`}
              >
                {link.icon && link.icon}
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
                      <Link to="/manager/login" className="flex items-center cursor-pointer">
                        <LineChart className="mr-2 h-4 w-4" />
                        <span>Área do Gerente</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isManager && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center cursor-pointer">
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
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/login" className="flex items-center gap-1">
                    <LogIn size={16} />
                    <span className="hidden sm:inline">Entrar</span>
                  </Link>
                </Button>
                <Button asChild variant="default" size="sm" className="hidden sm:flex">
                  <Link to="/login">Cadastrar</Link>
                </Button>
              </div>
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
              {user && navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm rounded-md flex items-center ${
                    location.pathname === link.path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                  }`}
                  onClick={closeMenu}
                >
                  {link.icon && link.icon}
                  {link.title}
                </Link>
              ))}
              
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm rounded-md text-foreground/80 hover:text-foreground hover:bg-accent"
                    onClick={closeMenu}
                  >
                    Entrar como Cliente
                  </Link>
                  <Link
                    to="/manager/login"
                    className="px-3 py-2 text-sm rounded-md text-foreground/80 hover:text-foreground hover:bg-accent"
                    onClick={closeMenu}
                  >
                    Entrar como Gerente
                  </Link>
                </>
              )}
              
              {user && !isManager && (
                <Link
                  to="/manager/login"
                  className="px-3 py-2 text-sm rounded-md text-foreground/80 hover:text-foreground hover:bg-accent"
                  onClick={closeMenu}
                >
                  Área do Gerente
                </Link>
              )}
              
              {user && isManager && (
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm rounded-md text-foreground/80 hover:text-foreground hover:bg-accent"
                  onClick={closeMenu}
                >
                  Área do Cliente
                </Link>
              )}
              
              {user && (
                <button
                  className="px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 text-left flex items-center"
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
