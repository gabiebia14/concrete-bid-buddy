
import { ReactNode } from 'react';
import { ManagerSidebar } from './ManagerSidebar';

interface ManagerLayoutProps {
  children: ReactNode;
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-grow overflow-y-auto py-2 px-2 md:px-4">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
