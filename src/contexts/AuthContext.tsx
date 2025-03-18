
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  email: string;
  isManager: boolean;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          isManager: data.user.user_metadata?.is_manager || false,
        });
      }
      
      setIsLoading(false);
    };

    fetchUser();

    // Ouvir mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            isManager: session.user.user_metadata?.is_manager || false,
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
