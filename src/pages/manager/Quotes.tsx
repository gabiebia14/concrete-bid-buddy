
import { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Eye
} from 'lucide-react';
import { Quote, QuoteStatus } from '@/lib/types';

export default function ManagerQuotes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('all');

  // Mock data
  const quotes: Quote[] = [
    {
      id: 'Q001',
      client_id: 'C001',
      client_name: 'João Silva',
      client_email: 'joao@exemplo.com',
      client_phone: '(11) 98765-4321',
      status: 'pending',
      items: [
        { product_id: 'P001', product_name: 'Bloco de Concreto', dimensions: '14x19x39cm', quantity: 500, unit_price: 2.5, total_price: 1250 }
      ],
      total_amount: 1250,
      delivery_location: 'São Paulo, SP',
      created_at: '2023-08-15T10:30:00Z',
      updated_at: '2023-08-15T10:30:00Z'
    },
    {
      id: 'Q002',
      client_id: 'C002',
      client_name: 'Maria Oliveira',
      client_email: 'maria@exemplo.com',
      client_phone: '(11) 91234-5678',
      status: 'approved',
      items: [
        { product_id: 'P002', product_name: 'Piso Intertravado', dimensions: '10x20x6cm', quantity: 200, unit_price: 1.8, total_price: 360 }
      ],
      total_amount: 360,
      delivery_location: 'Campinas, SP',
      created_at: '2023-08-14T14:45:00Z',
      updated_at: '2023-08-15T09:20:00Z'
    },
    {
      id: 'Q003',
      client_id: 'C003',
      client_name: 'Pedro Santos',
      client_email: 'pedro@exemplo.com',
      client_phone: '(11) 97777-8888',
      status: 'completed',
      items: [
        { product_id: 'P001', product_name: 'Bloco de Concreto', dimensions: '14x19x39cm', quantity: 300, unit_price: 2.5, total_price: 750 },
        { product_id: 'P003', product_name: 'Laje Pré-Moldada', dimensions: '30x10x3m', quantity: 5, unit_price: 120, total_price: 600 }
      ],
      total_amount: 1350,
      delivery_location: 'Guarulhos, SP',
      created_at: '2023-08-10T11:15:00Z',
      updated_at: '2023-08-12T16:30:00Z'
    },
    {
      id: 'Q004',
      client_id: 'C004',
      client_name: 'Ana Costa',
      client_email: 'ana@exemplo.com',
      client_phone: '(11) 95555-6666',
      status: 'rejected',
      items: [
        { product_id: 'P004', product_name: 'Meio-Fio', dimensions: '30x15x100cm', quantity: 50, unit_price: 18, total_price: 900 }
      ],
      total_amount: 900,
      delivery_location: 'São Bernardo, SP',
      created_at: '2023-08-13T09:30:00Z',
      updated_at: '2023-08-14T10:45:00Z'
    }
  ];

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      (quote.client_name && quote.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      quote.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = currentTab === 'all' || quote.status === currentTab;
    
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'outline' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      approved: { label: 'Aprovado', variant: 'default' as const },
      sent: { label: 'Enviado', variant: 'default' as const },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const },
      completed: { label: 'Concluído', variant: 'default' as const },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <ManagerLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Gestão de Orçamentos</h1>
            <p className="text-muted-foreground">
              Visualize, edite e acompanhe todos os orçamentos
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button className="flex items-center">
              <FileText className="mr-2 h-4 w-4" /> Novo Orçamento
            </Button>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar orçamentos..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="md:w-auto flex items-center">
                <Filter className="mr-2 h-4 w-4" /> Filtros
              </Button>
              <Button variant="outline" className="md:w-auto flex items-center">
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
            </div>
            
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="approved">Aprovados</TabsTrigger>
                <TabsTrigger value="completed">Concluídos</TabsTrigger>
                <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
              </TabsList>
              
              <TabsContent value={currentTab} className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuotes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nenhum orçamento encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredQuotes.map((quote) => (
                          <TableRow key={quote.id}>
                            <TableCell className="font-medium">{quote.id}</TableCell>
                            <TableCell>
                              <div className="font-medium">{quote.client_name}</div>
                              <div className="text-sm text-muted-foreground">{quote.client_email}</div>
                            </TableCell>
                            <TableCell>{getStatusBadge(quote.status)}</TableCell>
                            <TableCell>{formatDate(quote.created_at || '')}</TableCell>
                            <TableCell className="text-right font-medium">
                              {quote.total_amount ? formatCurrency(quote.total_amount) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="flex items-center">
                                    <Eye className="mr-2 h-4 w-4" /> Visualizar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center">
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center">
                                    <MessageSquare className="mr-2 h-4 w-4" /> Contatar Cliente
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}
