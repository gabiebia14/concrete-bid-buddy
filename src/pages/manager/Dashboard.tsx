
import { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowUp, ArrowDown, DollarSign, Users, FileText, Clock, BarChart2, PieChart as PieChartIcon, TrendingUp, Search, Plus, Bot, MessageSquare, BrainCircuit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

export default function ManagerDashboard() {
  const [period, setPeriod] = useState('month');

  const salesData = [
    { name: 'Jan', value: 12000 },
    { name: 'Fev', value: 19000 },
    { name: 'Mar', value: 15000 },
    { name: 'Abr', value: 21000 },
    { name: 'Mai', value: 30000 },
    { name: 'Jun', value: 25000 },
    { name: 'Jul', value: 32000 },
  ];

  const quotesData = [
    { name: 'Pendentes', value: 28, color: '#f59e0b' },
    { name: 'Aprovados', value: 45, color: '#10b981' },
    { name: 'Rejeitados', value: 12, color: '#ef4444' },
    { name: 'Concluídos', value: 15, color: '#3b82f6' },
  ];

  const productData = [
    { name: 'Blocos', value: 45000 },
    { name: 'Pisos', value: 28000 },
    { name: 'Lajes', value: 18000 },
    { name: 'Urbanismo', value: 12000 },
    { name: 'Outros', value: 5000 },
  ];

  const statsCards = [
    {
      title: 'Vendas Totais',
      value: 'R$ 135.420',
      change: '+12,5%',
      positive: true,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-green-500',
    },
    {
      title: 'Novos Clientes',
      value: '14',
      change: '+8,3%',
      positive: true,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Orçamentos',
      value: '32',
      change: '+24,2%',
      positive: true,
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Tempo Médio',
      value: '2,4 dias',
      change: '-8,1%',
      positive: true,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-amber-500',
    },
  ];

  // Dados do novo agente de IA
  const assistantMetrics = {
    conversationCount: 328,
    conversionRate: 32,
    responseTime: 8, // segundos
    satisfactionScore: 4.8,
    topQuestions: [
      'Qual o prazo de entrega para blocos?',
      'Vocês trabalham com personalização?',
      'Como funciona o frete?',
      'Preciso de um orçamento urgente'
    ]
  };

  return (
    <ManagerLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitoramento de vendas, orçamentos e desempenho
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="pl-8 h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild>
              <Link to="/criar-orcamento" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-2 rounded-full text-white`}>
                    {card.icon}
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  {card.positive ? (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={card.positive ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                    {card.change}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">vs último período</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Card do Assistente de IA - Nova implementação */}
        <Card className="mb-8 border-l-4 border-l-primary overflow-hidden bg-gradient-to-br from-white to-primary/5 dark:from-gray-900 dark:to-primary/10">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/3 p-6">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/15 p-2 rounded-full">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Assistente de Vendas com IA</CardTitle>
                    <CardDescription>
                      Análise de desempenho e métricas do novo assistente GPT-4o
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                  <div className="bg-background rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Conversas</span>
                    </div>
                    <p className="text-2xl font-bold">{assistantMetrics.conversationCount}</p>
                    <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Taxa de conversão</span>
                    </div>
                    <p className="text-2xl font-bold">{assistantMetrics.conversionRate}%</p>
                    <p className="text-xs text-muted-foreground">Conversas → Orçamentos</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Tempo de resposta médio</span>
                      <span className="text-sm font-medium">{assistantMetrics.responseTime}s</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Satisfação do cliente</span>
                      <span className="text-sm font-medium">{assistantMetrics.satisfactionScore}/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Perguntas frequentes</h4>
                  <ul className="space-y-1">
                    {assistantMetrics.topQuestions.map((question, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="p-0 pt-4">
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/chat-assistant">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Testar assistente
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/assistant-settings">
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Configurar modelo
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </div>
            <div className="lg:w-1/3 bg-primary/10 flex items-center justify-center p-6">
              <div className="max-w-xs">
                <div className="bg-background dark:bg-gray-800 rounded-lg p-3 shadow-md mb-3 ml-auto max-w-[80%]">
                  <p className="text-xs text-gray-500 mb-1">Cliente</p>
                  <p className="text-sm">Preciso de um orçamento para blocos estruturais</p>
                </div>
                <div className="bg-primary/15 rounded-lg p-3 shadow-md mr-auto max-w-[80%]">
                  <p className="text-xs text-gray-500 mb-1">Assistente IPT</p>
                  <p className="text-sm">Claro! Posso ajudar com isso. Qual a quantidade e as dimensões dos blocos estruturais que você precisa?</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" /> Histórico de Vendas
              </CardTitle>
              <CardDescription>Total de vendas ao longo do período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ background: "white", border: "1px solid #ccc", borderRadius: "4px" }} 
                      formatter={(value) => [`R$ ${value}`, "Valor"]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <PieChartIcon className="mr-2 h-5 w-5" /> Status de Orçamentos
              </CardTitle>
              <CardDescription>Distribuição por status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={quotesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {quotesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} orçamentos`, name]}
                      contentStyle={{ background: "white", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="mr-2 h-5 w-5" /> Vendas por Categoria
              </CardTitle>
              <CardDescription>Desempenho de vendas por tipo de produto</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Gráfico</TabsTrigger>
                  <TabsTrigger value="table">Tabela</TabsTrigger>
                </TabsList>
                <TabsContent value="chart" className="mt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`R$ ${value}`, "Valor"]}
                          contentStyle={{ background: "white", border: "1px solid #ccc", borderRadius: "4px" }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="table" className="mt-0">
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          <th className="py-3 px-4 text-left font-medium">Categoria</th>
                          <th className="py-3 px-4 text-right font-medium">Valor (R$)</th>
                          <th className="py-3 px-4 text-right font-medium">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productData.map((item, index) => {
                          const total = productData.reduce((sum, i) => sum + i.value, 0);
                          const percentage = ((item.value / total) * 100).toFixed(1);
                          return (
                            <tr key={index} className="border-b">
                              <td className="py-3 px-4">{item.name}</td>
                              <td className="py-3 px-4 text-right">{item.value.toLocaleString('pt-BR')}</td>
                              <td className="py-3 px-4 text-right">{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Métricas do Assistente</CardTitle>
              <CardDescription>Desempenho do assistente virtual com GPT-4o</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Conversas iniciadas</div>
                      <div className="text-sm font-medium">75%</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Taxa de conversão</div>
                      <div className="text-sm font-medium">54%</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '54%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Tempo médio de resposta</div>
                      <div className="text-sm font-medium">82%</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Satisfação do cliente</div>
                      <div className="text-sm font-medium">92%</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
