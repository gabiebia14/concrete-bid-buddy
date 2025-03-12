
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
  LogOut
} from 'lucide-react';

export function ManagerSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      label: 'Dashboard',
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
      label: 'Produtos',
      icon: <Package size={20} />,
      href: '/manager/products'
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
    <div className={`bg-card border-r h-screen flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <div className="font-bold text-lg text-primary">IPT Teixeira</div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          {!collapsed && <p className="text-xs font-medium text-muted-foreground mb-2 px-3">MENU</p>}
          <nav className="space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/80 hover:bg-accent hover:text-foreground'
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
      </div>
      
      <div className="p-3 border-t">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="font-medium text-sm">A</span>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground">admin@ipteixeira.com</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" className={collapsed ? '' : 'ml-auto'}>
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
