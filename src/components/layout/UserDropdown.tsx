
import { Link } from 'react-router-dom';
import { User, LineChart, LogOut, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDropdownProps {
  user: any;
  isManager: boolean;
  handleSignOut: () => Promise<void>;
}

export function UserDropdown({ user, isManager, handleSignOut }: UserDropdownProps) {
  if (!user) return null;
  
  return (
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
  );
}
