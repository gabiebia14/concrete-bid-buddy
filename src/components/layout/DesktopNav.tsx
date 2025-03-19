
import { Link, useLocation } from 'react-router-dom';
import { NavLink } from './NavLink';
import { NavLinkProps } from './types';

interface DesktopNavProps {
  navLinks: NavLinkProps[];
}

export function DesktopNav({ navLinks }: DesktopNavProps) {
  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navLinks.map((link) => (
        <NavLink key={link.path} {...link} />
      ))}
    </nav>
  );
}
