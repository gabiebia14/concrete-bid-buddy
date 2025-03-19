
import { ReactNode } from 'react';

export interface NavLinkProps {
  title: string;
  path: string;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
}
