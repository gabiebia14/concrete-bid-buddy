
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/layout/Layout";
import { AuthForm } from "@/components/auth/AuthForm";
import { supabase } from '@/lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        navigate('/dashboard');
      }
      setIsLoading(false);
    };

    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <p className="text-lg text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto">
          <AuthForm isManager={false} />
        </div>
      </div>
    </Layout>
  );
}
