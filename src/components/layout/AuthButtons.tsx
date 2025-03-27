
import { Link } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

export function AuthButtons() {
  const { user, signOut, isLoading } = useAuth();

  // Se estiver carregando, não mostra nada
  if (isLoading) {
    return null;
  }

  // Se o usuário estiver logado, mostra botão de sair
  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-1">
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    );
  }

  // Se não estiver logado, mostra botões de entrar e cadastrar
  return (
    <div className="flex items-center space-x-2">
      <Button asChild variant="outline" size="sm">
        <Link to="/login" className="flex items-center gap-1">
          <LogIn size={16} />
          <span className="hidden sm:inline">Entrar</span>
        </Link>
      </Button>
      <Button asChild variant="default" size="sm" className="hidden sm:flex">
        <Link to="/login?tab=cadastrar">Cadastrar</Link>
      </Button>
    </div>
  );
}
