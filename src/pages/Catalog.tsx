
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { fetchProducts, fetchProductCategories } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GridIcon, ListIcon, SearchIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  // Filtrar produtos por categoria e termo de busca
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Catálogo de Produtos</h1>
        
        {/* Barra de busca e filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs de categorias */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedCategory}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Conteúdo */}
          <TabsContent value={selectedCategory || 'all'} className="mt-6">
            {isLoadingProducts ? (
              <div className="flex justify-center py-12">
                <p>Carregando produtos...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                        <CardDescription>{product.category}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Dimensões:</p>
                          <ul className="text-sm">
                            {product.dimensions.map((dim, index) => (
                              <li key={index} className="text-muted-foreground">{dim}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">Solicitar Orçamento</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id}>
                      <div className="flex flex-col md:flex-row p-4 gap-4">
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                          <p className="text-sm mb-4">{product.description}</p>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Dimensões:</p>
                            <div className="flex flex-wrap gap-2">
                              {product.dimensions.map((dim, index) => (
                                <span key={index} className="text-xs bg-muted px-2 py-1 rounded">{dim}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-4 md:mt-0">
                          <Button variant="outline">Solicitar Orçamento</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum produto encontrado.</p>
                <Button variant="outline" onClick={() => {setSearchTerm(''); setSelectedCategory('all');}}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Catalog;
