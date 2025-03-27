
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { fetchProducts, fetchProductCategories } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GridIcon, ListIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Buscar todos os produtos
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  // Buscar categorias
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchProductCategories
  });

  // Obter tipos únicos dos produtos
  const types = React.useMemo(() => {
    const allTypes = products.map(product => product.type || '').filter(Boolean);
    return [...new Set(allTypes)];
  }, [products]);

  // Filtrar produtos por categoria, tipo e termo de busca
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <Layout>
      <div className="w-full px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Catálogo de Produtos</h1>
            <p className="text-muted-foreground">Visualize a linha completa de produtos IPT Teixeira</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-lime-500 hover:bg-lime-600' : ''}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-lime-500 hover:bg-lime-600' : ''}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Barra de busca e filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="w-full md:w-40">
                <p className="text-sm mb-1">Categoria</p>
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-40">
                <p className="text-sm mb-1">Tipo</p>
                <Select 
                  value={selectedType} 
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {(selectedCategory !== 'all' || selectedType !== 'all' || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Categoria: {selectedCategory}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 p-0" 
                    onClick={() => setSelectedCategory('all')}
                  >
                    <span className="sr-only">Remover</span>
                    ×
                  </Button>
                </Badge>
              )}
              
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tipo: {selectedType}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 p-0" 
                    onClick={() => setSelectedType('all')}
                  >
                    <span className="sr-only">Remover</span>
                    ×
                  </Button>
                </Badge>
              )}
              
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: "{searchTerm}"
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 p-0" 
                    onClick={() => setSearchTerm('')}
                  >
                    <span className="sr-only">Remover</span>
                    ×
                  </Button>
                </Badge>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs" 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setSearchTerm('');
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          {isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <p>Carregando produtos...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="h-full flex flex-col border-t-4 border-t-lime-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-2 text-lg">{product.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="bg-zinc-100">
                          {product.category}
                        </Badge>
                        {product.type && (
                          <Badge variant="outline" className="bg-zinc-100">
                            {product.type}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow py-3">
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                      )}
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Dimensões:</p>
                        <p className="text-sm bg-zinc-100 px-2 py-1 rounded inline-block">
                          {product.dimensions}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t">
                      <Button variant="default" className="w-full bg-lime-500 hover:bg-lime-600">
                        Solicitar Orçamento
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Dimensões</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.type || "-"}</TableCell>
                      <TableCell>{product.dimensions}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="text-lime-600 border-lime-600 hover:bg-lime-50">
                          Orçamento
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum produto encontrado.</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;
