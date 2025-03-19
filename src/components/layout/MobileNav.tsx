
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NavLink } from './NavLink';
import { NavLinkProps } from './types';
import { useAuth } from "@/contexts/AuthContext";

interface MobileNavProps {
  navLinks: NavLinkProps[];
  isMenuOpen: boolean;
  closeMenu: () => void;
  isManager: boolean;
  user: any | null;
  handleSignOut: () => Promise<void>;
}

export function MobileNav({ 
  navLinks, 
  isMenuOpen, 
  closeMenu, 
  isManager, 
  user, 
  handleSignOut 
}: MobileNavProps) {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-background border-t animate-fade-in">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex flex-col space-y-1">
          {user && navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              {...link} 
              className="px-3 py-2 text-sm rounded-md flex items-center"
              onClick={closeMenu}
            />
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
  );
}
