
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  requireManager?: boolean;
}

export function PrivateRoute({ children, requireManager = false }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
    }
  }, [isLoading]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-center">
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário autenticado, redireciona para login
  if (!user) {
    return <Navigate to={requireManager ? "/manager/login" : "/login"} state={{ from: location }} replace />;
  }

  // Se requer gerente, mas usuário não é gerente
  if (requireManager && !user.isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se não requer gerente, mas usuário é gerente
  if (!requireManager && user.isManager) {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <>{children}</>;
}
