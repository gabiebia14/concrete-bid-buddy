
import { Link, useLocation } from 'react-router-dom';
import { NavLinkProps } from './types';

export function NavLink({ title, path, icon, className, onClick }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === path;
  
  return (
    <Link
      to={path}
      className={`${
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-foreground/80 hover:text-foreground hover:bg-accent'
      } ${className || 'px-3 py-2 text-sm rounded-md transition-colors flex items-center'}`}
      onClick={onClick}
    >
      {icon && icon}
      {title}
    </Link>
  );
}
