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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

// Schema para validação
const loginSchema = z.object({
  email: z.string().email({ message: 'Digite um email válido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

// Schema de cadastro atualizado com novos campos
const registerSchema = z.object({
  tipoPessoa: z.enum(['fisica', 'juridica'], { 
    required_error: 'Selecione o tipo de pessoa' 
  }),
  nome: z.string().min(2, { message: 'Digite o nome completo ou razão social' }),
  cpfCnpj: z.string().min(11, { message: 'Digite um CPF ou CNPJ válido' }),
  email: z.string().email({ message: 'Digite um email válido' }),
  telefone: z.string().min(8, { message: 'Digite um telefone válido' }),
  endereco: z.string().optional(),
  representanteNome: z.string().optional(),
  representanteCpf: z.string().optional(),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
}).refine(data => {
  // Validação condicional: se for pessoa jurídica, o representante é obrigatório
  if (data.tipoPessoa === 'juridica') {
    return !!data.representanteNome && !!data.representanteCpf;
  }
  return true;
}, {
  message: "Representante legal é obrigatório para pessoa jurídica",
  path: ["representanteNome"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  isManager?: boolean;
  initialTab?: string;
}

export function AuthForm({ isManager = false, initialTab = "entrar" }: AuthFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

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
      tipoPessoa: "fisica",
      nome: "",
      cpfCnpj: "",
      email: "",
      telefone: "",
      endereco: "",
      representanteNome: "",
      representanteCpf: "",
      password: "",
    },
  });

  const tipoPessoa = registerForm.watch("tipoPessoa");

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
      console.log('Tentando cadastrar usuário:', data);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.nome,
            phone: data.telefone,
            is_manager: isManager,
            tipo_pessoa: data.tipoPessoa,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const clientData = {
          name: data.nome,
          email: data.email,
          phone: data.telefone,
          address: data.endereco || null,
          tipo_pessoa: data.tipoPessoa,
          cpf_cnpj: data.cpfCnpj,
          representante_nome: data.representanteNome || null,
          representante_cpf: data.representanteCpf || null
        };
        
        const { error: clientError } = await supabase
          .from('clients')
          .insert(clientData);
          
        if (clientError) {
          console.error('Erro ao criar perfil de cliente:', clientError);
        }
      }
      
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
        <Tabs defaultValue={initialTab} value={activeTab} onValueChange={setActiveTab}>
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
                  name="tipoPessoa"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Tipo de Pessoa</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fisica" id="fisica" />
                            <FormLabel htmlFor="fisica" className="font-normal cursor-pointer">
                              Pessoa Física
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="juridica" id="juridica" />
                            <FormLabel htmlFor="juridica" className="font-normal cursor-pointer">
                              Pessoa Jurídica
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tipoPessoa === 'fisica' ? 'Nome Completo' : 'Razão Social'}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={tipoPessoa === 'fisica' ? 'Seu nome completo' : 'Nome da empresa'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="cpfCnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={tipoPessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {tipoPessoa === 'juridica' && (
                  <>
                    <FormField
                      control={registerForm.control}
                      name="representanteNome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Representante Legal</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo do representante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="representanteCpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF do Representante</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
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
                  name="telefone"
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
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, bairro, cidade" {...field} />
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
