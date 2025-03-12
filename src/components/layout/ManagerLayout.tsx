
import { ReactNode } from 'react';
import { ManagerSidebar } from './ManagerSidebar';

interface ManagerLayoutProps {
  children: ReactNode;
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ManagerSidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
