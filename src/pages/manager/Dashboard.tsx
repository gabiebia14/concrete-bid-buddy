
import { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowUp, ArrowDown, DollarSign, Users, FileText, Clock, BarChart2, PieChart as PieChartIcon, TrendingUp, Search, Plus } from 'lucide-react';
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
              <CardTitle>Atividade do Assistente</CardTitle>
              <CardDescription>Interações do assistente virtual com clientes</CardDescription>
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
