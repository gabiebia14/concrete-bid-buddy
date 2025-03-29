
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  HelpCircle
} from 'lucide-react';

export function ManagerSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      label: 'Visão Geral',
      icon: <LayoutDashboard size={20} />,
      href: '/manager/dashboard'
    },
    {
      label: 'Orçamentos',
      icon: <FileText size={20} />,
      href: '/manager/quotes'
    },
    {
      label: 'Clientes',
      icon: <Users size={20} />,
      href: '/manager/clients'
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
    },
    {
      label: 'Configurações',
      icon: <Settings size={20} />,
      href: '/manager/settings'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 shadow-lg ${
      collapsed ? 'w-16' : 'w-64'
    } bg-sidebar bg-concrete-texture bg-opacity-90`}>
      <div className="p-4 flex flex-col items-center justify-center border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex flex-col items-center">
            <img 
              src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" 
              alt="IPT Teixeira Logo" 
              className="h-16 w-auto mb-3 drop-shadow-md" 
            />
            <div className="text-center">
              <div className="text-sm font-bold text-white tracking-wider mb-1">IPT TEIXEIRA</div>
              <div className="text-xs bg-white/20 px-2 py-0.5 rounded-sm text-white/70 font-medium">ADMINISTRAÇÃO</div>
            </div>
          </div>
        ) : (
          <img 
            src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" 
            alt="IPT Teixeira Logo" 
            className="h-10 w-auto drop-shadow-md" 
          />
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="mt-3 text-white hover:bg-lime-600/20"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      
      {!collapsed && (
        <div className="px-4 py-2">
          <p className="text-xs uppercase font-semibold text-lime-500 mx-2 mt-2 mb-1">MENU</p>
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
              <span className={`flex items-center ${isActive(item.href) ? 'text-lime-400' : ''}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className={`ml-3 ${isActive(item.href) ? 'text-white drop-shadow-sm' : ''}`}>
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-lime-700 flex items-center justify-center text-white shadow-inner">
                <span className="font-medium text-sm">A</span>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-lime-400">admin@ipteixeira.com</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" className={`text-white hover:bg-lime-600/20 ${collapsed ? '' : 'ml-auto'}`}>
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
