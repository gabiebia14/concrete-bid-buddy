
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  History,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ClientSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      label: 'Visão Geral',
      icon: <LayoutDashboard size={20} />,
      href: '/dashboard'
    },
    {
      label: 'Criar Orçamento',
      icon: <FileText size={20} />,
      href: '/criar-orcamento'
    },
    {
      label: 'Histórico',
      icon: <History size={20} />,
      href: '/historico'
    },
    {
      label: 'Catálogo',
      icon: <Package size={20} />,
      href: '/catalogo'
    },
    {
      label: 'Ajuda',
      icon: <HelpCircle size={20} />,
      href: '/ajuda'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 shadow-lg ${
      collapsed ? 'w-16' : 'w-64'
    } bg-sidebar`}>
      <div className="p-4 flex flex-col items-center justify-center border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex flex-col items-center">
            <img 
              src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" 
              alt="IPT Teixeira Logo" 
              className="h-12 w-auto mb-2"
            />
            <div className="text-center">
              <div className="text-xs text-white/70">ISO 9001</div>
            </div>
          </div>
        ) : (
          <img 
            src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" 
            alt="IPT Teixeira Logo" 
            className="h-8 w-auto" 
          />
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 text-white hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      
      {!collapsed && (
        <div className="px-4 py-2">
          <p className="text-xs uppercase font-semibold text-white/70 mx-2 mt-2 mb-1">MENU</p>
        </div>
      )}
      
      <div className="flex-1 py-2 overflow-y-auto px-2">
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                isActive(item.href)
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              } transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <span className="flex items-center">
                {item.icon}
              </span>
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-white">Cliente</p>
                <p className="text-xs text-white/70">cliente@exemplo.com</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" className={`text-white hover:bg-sidebar-accent ${collapsed ? '' : 'ml-auto'}`}>
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
