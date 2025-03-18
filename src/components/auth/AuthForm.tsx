
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

// Schema para validação
const authSchema = z.object({
  email: z.string().email({ message: 'Digite um email válido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type AuthFormValues = z.infer<typeof authSchema>;

interface AuthFormProps {
  isManager?: boolean;
}

export function AuthForm({ isManager = false }: AuthFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("entrar");

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: AuthFormValues) {
    setIsLoading(true);
    try {
      if (activeTab === "entrar") {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        // Redirecionar para o dashboard apropriado
        navigate(isManager ? '/manager/dashboard' : '/dashboard');
      } else {
        // Cadastro
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              is_manager: isManager,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode fazer login.",
        });
        
        setActiveTab("entrar");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {isManager ? 'Área do Gerente' : 'Área do Cliente'}
        </CardTitle>
        <CardDescription className="text-center">
          {isManager 
            ? 'Acesse o painel administrativo da IPT Teixeira' 
            : 'Entre na sua conta para acessar seus orçamentos e produtos'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="entrar" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="entrar">Entrar</TabsTrigger>
            <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? "Processando..." : activeTab === "entrar" ? "Entrar" : "Cadastrar"}
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full text-muted-foreground">
          {isManager 
            ? 'Acesso exclusivo para gerentes da IPT Teixeira' 
            : 'Precisa de ajuda? Entre em contato com o suporte'}
        </p>
      </CardFooter>
    </Card>
  );
}
