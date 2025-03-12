
import { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  MoreHorizontal, 
  FileText, 
  MessageSquare, 
  Edit, 
  Trash2,
  Eye
} from 'lucide-react';
import { ClientData } from '@/lib/types';

export default function ManagerClients() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const clients: (ClientData & { 
    totalQuotes?: number; 
    lastInteraction?: string;
    totalSpent?: number;
    status?: 'active' | 'inactive' | 'new';
  })[] = [
    {
      id: 'C001',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      phone: '(11) 98765-4321',
      address: 'Rua Exemplo, 123 - São Paulo/SP',
      totalQuotes: 5,
      lastInteraction: '2023-08-15T10:30:00Z',
      totalSpent: 12500,
      status: 'active'
    },
    {
      id: 'C002',
      name: 'Maria Oliveira',
      email: 'maria@exemplo.com',
      phone: '(11) 91234-5678',
      address: 'Av. Principal, 456 - Campinas/SP',
      totalQuotes: 2,
      lastInteraction: '2023-08-10T14:45:00Z',
      totalSpent: 3600,
      status: 'active'
    },
    {
      id: 'C003',
      name: 'Pedro Santos',
      email: 'pedro@exemplo.com',
      phone: '(11) 97777-8888',
      address: 'Rua Central, 789 - Guarulhos/SP',
      totalQuotes: 8,
      lastInteraction: '2023-08-12T16:30:00Z',
      totalSpent: 18750,
      status: 'active'
    },
    {
      id: 'C004',
      name: 'Ana Costa',
      email: 'ana@exemplo.com',
      phone: '(11) 95555-6666',
      address: 'Av. Secundária, 321 - São Bernardo/SP',
      totalQuotes: 1,
      lastInteraction: '2023-08-14T10:45:00Z',
      totalSpent: 900,
      status: 'new'
    },
    {
      id: 'C005',
      name: 'Carlos Ferreira',
      email: 'carlos@exemplo.com',
      phone: '(11) 94444-3333',
      address: 'Rua Comercial, 654 - Osasco/SP',
      totalQuotes: 0,
      lastInteraction: '2023-08-09T08:15:00Z',
      totalSpent: 0,
      status: 'inactive'
    }
  ];

  const filteredClients = clients.filter(client => {
    return searchQuery.toLowerCase() === '' || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: 'active' | 'inactive' | 'new' | undefined) => {
    if (status === 'active') {
      return <Badge variant="default">Ativo</Badge>;
    } else if (status === 'inactive') {
      return <Badge variant="secondary">Inativo</Badge>;
    } else if (status === 'new') {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Novo</Badge>;
    }
    return null;
  };

  return (
    <ManagerLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Gestão de Clientes</h1>
            <p className="text-muted-foreground">
              Base completa de clientes e suas interações
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
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
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Orçamentos</TableHead>
                    <TableHead>Última Interação</TableHead>
                    <TableHead className="text-right">Total Gasto</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.totalQuotes}</TableCell>
                        <TableCell>
                          {client.lastInteraction ? formatDate(client.lastInteraction) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {client.totalSpent !== undefined ? formatCurrency(client.totalSpent) : '-'}
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
                                <FileText className="mr-2 h-4 w-4" /> Ver Orçamentos
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" /> Enviar Mensagem
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
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}
