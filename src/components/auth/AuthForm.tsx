
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

// Schema para validação
const loginSchema = z.object({
  email: z.string().email({ message: 'Digite um email válido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Digite seu nome completo' }),
  email: z.string().email({ message: 'Digite um email válido' }),
  phone: z.string().min(8, { message: 'Digite um telefone válido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  isManager?: boolean;
}

export function AuthForm({ isManager = false }: AuthFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("entrar");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  async function onLoginSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      console.log('Tentando fazer login com:', data.email);
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      console.log('Login bem-sucedido:', authData);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });

      // Redirecionar para o dashboard apropriado
      navigate(isManager ? '/manager/dashboard' : '/dashboard');
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      
      let errorMessage = "Ocorreu um erro. Tente novamente.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function onRegisterSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
      console.log('Tentando cadastrar usuário:', data.email);
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            phone: data.phone,
            is_manager: isManager,
          },
        },
      });

      if (error) throw error;

      console.log('Cadastro bem-sucedido:', authData);
      
      if (authData.user?.identities?.length === 0) {
        toast({
          variant: "destructive",
          title: "Email já cadastrado",
          description: "Este email já está em uso, tente fazer login.",
        });
        setActiveTab("entrar");
        return;
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar o cadastro.",
      });
      
      setActiveTab("entrar");
    } catch (error: any) {
      console.error('Erro de cadastro:', error);
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar sua conta.",
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
          
          <TabsContent value="entrar">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
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
                  control={loginForm.control}
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
                  {isLoading ? "Processando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="cadastrar">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
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
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
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
                  {isLoading ? "Processando..." : "Cadastrar"}
                </Button>
              </form>
            </Form>
          </TabsContent>
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
