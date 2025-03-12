
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Plus, ArrowUp, ArrowDown, MoreHorizontal, DollarSign, Package, Clock, CircleCheck } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { TransactionItem } from '@/lib/types';

export default function Dashboard() {
  const [period, setPeriod] = useState('month');
  
  // Dados simulados para o dashboard do cliente
  const statsData = [
    {
      title: 'Orçamentos Ativos',
      value: '3',
      change: '+12.5%',
      positive: true,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Orçamentos Aprovados',
      value: '28',
      change: '+8.2%',
      positive: true,
      icon: <CircleCheck className="h-5 w-5" />,
      color: 'bg-green-500',
    },
    {
      title: 'Economia Total',
      value: 'R$ 12.450',
      change: '+15.3%',
      positive: true,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-amber-500',
    },
  ];
  
  const pieData = [
    { name: 'Visualizações', value: 350, color: '#4ade80' },
    { name: 'Percentual', value: 120, color: '#0f172a' },
    { name: 'Vendas', value: 95, color: '#fbbf24' },
  ];
  
  const categoryData = [
    { name: 'Jan', revenue: 3200, savings: 2500 },
    { name: 'Fev', revenue: 4100, savings: 2800 },
    { name: 'Mar', revenue: 2900, savings: 2100 },
    { name: 'Abr', revenue: 9800, savings: 4000 },
    { name: 'Mai', revenue: 3900, savings: 2800 },
    { name: 'Jun', revenue: 4800, savings: 3500 },
  ];
  
  const salesReportData = [
    { product: 'Blocos lançados', value: 75, count: 233 },
    { product: 'Em andamento', value: 25, count: 23 },
    { product: 'Produtos vendidos', value: 100, count: 482 },
  ];
  
  const transactions: TransactionItem[] = [
    {
      id: '1',
      product: 'Blocos de concreto 14x19x39',
      date: '10/07/2023',
      value: 2500,
      status: 'completed',
    },
    {
      id: '2',
      product: 'Piso intertravado 20x10x6',
      date: '15/07/2023',
      value: 4200,
      status: 'approved',
    },
    {
      id: '3',
      product: 'Laje pré-moldada 30x10',
      date: '22/07/2023',
      value: 3800,
      status: 'pending',
    },
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'approved': return 'text-blue-600';
      case 'pending': return 'text-amber-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Área do Cliente</h1>
            <p className="text-muted-foreground">Visão Geral</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="pl-8 h-9 w-[200px] lg:w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
            <Button asChild variant="default">
              <Link to="/criar-orcamento" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 rounded-full text-white`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  {stat.positive ? (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={stat.positive ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">do último mês</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Orçamentos</CardTitle>
                <CardDescription>Total View Performance</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center">
                <div className="relative">
                  <ResponsiveContainer width={250} height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} unidades`, '']}
                        contentStyle={{ background: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-3xl font-bold">565K</p>
                    <p className="text-xs text-muted-foreground">Total Count</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Economia por Categoria</CardTitle>
                <CardDescription>Revenue</CardDescription>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold mr-2">R$ 193.000</span>
                <span className="text-xs text-green-500">+36% do último mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(value) => [`R$ ${value}`, '']}
                      contentStyle={{ background: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={35} />
                    <Bar dataKey="savings" fill="#4ade80" radius={[4, 4, 0, 0]} maxBarSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle>Relatório de Compras</CardTitle>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {salesReportData.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.product}</span>
                      <span className="text-sm font-medium">({item.count})</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted p-2 rounded">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.product}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {transaction.value.toLocaleString('pt-BR')}</p>
                      <p className={`text-sm ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'completed' && 'Concluído'}
                        {transaction.status === 'approved' && 'Aprovado'}
                        {transaction.status === 'pending' && 'Pendente'}
                        {transaction.status === 'rejected' && 'Rejeitado'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
