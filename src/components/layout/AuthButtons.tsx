
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex items-center space-x-2">
      <Button asChild variant="outline" size="sm">
        <Link to="/login" className="flex items-center gap-1">
          <LogIn size={16} />
          <span className="hidden sm:inline">Entrar</span>
        </Link>
      </Button>
      <Button asChild variant="default" size="sm" className="hidden sm:flex">
        <Link to="/login">Cadastrar</Link>
      </Button>
    </div>
  );
}
