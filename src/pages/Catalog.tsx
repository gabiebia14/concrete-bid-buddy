
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Package, 
  Grid3X3,
  List 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/supabase';
import { Product } from '@/lib/database.types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  
  // Buscar produtos do Supabase
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
  
  // Extrair categorias únicas dos produtos
  const categories = [...new Set(products.map((product: Product) => product.category))].sort();
  
  // Filtrar produtos com base na pesquisa e categoria selecionada
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = 
      searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === '' || 
      product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Agrupar produtos por categoria para a visualização em abas
  const productsByCategory: Record<string, Product[]> = {};
  categories.forEach(category => {
    productsByCategory[category] = products.filter((product: Product) => 
      product.category === category && 
      (searchTerm === '' || 
       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
            <p className="text-muted-foreground">
              Explore nossa linha completa de artefatos de concreto
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={viewType === 'grid' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setViewType('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewType === 'list' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setViewType('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de filtros */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Refine sua busca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Categorias</h3>
                  <div className="space-y-2">
                    <div 
                      className={`cursor-pointer rounded-md ${selectedCategory === '' 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted/50'
                      } px-2 py-1.5 transition-colors`}
                      onClick={() => setSelectedCategory('')}
                    >
                      Todas as Categorias
                    </div>
                    {categories.map((category) => (
                      <div 
                        key={category}
                        className={`cursor-pointer rounded-md ${selectedCategory === category 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted/50'
                        } px-2 py-1.5 transition-colors`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {isLoading ? (
              // Estado de carregamento
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="h-[200px] w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              // Estado de erro
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-red-500 mb-2">Erro ao carregar produtos.</p>
                  <p className="text-muted-foreground">
                    Por favor, tente novamente mais tarde ou entre em contato com o suporte.
                  </p>
                </CardContent>
              </Card>
            ) : selectedCategory ? (
              // Visualização de categoria específica
              <div>
                <h2 className="text-2xl font-bold mb-4">{selectedCategory}</h2>
                {viewType === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product: Product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product: Product) => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Visualização com abas de categorias
              <Tabs defaultValue={categories[0] || ''}>
                <TabsList className="mb-4 overflow-auto">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map((category) => (
                  <TabsContent key={category} value={category}>
                    {viewType === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {productsByCategory[category]?.map((product: Product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {productsByCategory[category]?.map((product: Product) => (
                          <ProductListItem key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Componente de card de produto
function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg leading-tight mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
        <div className="flex flex-wrap gap-1 mt-auto pt-2">
          {product.dimensions.map((dimension, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {dimension}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de item de lista de produto
function ProductListItem({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 bg-muted flex items-center justify-center p-4">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-auto object-contain max-h-[100px]"
            />
          ) : (
            <Package className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        <CardContent className="p-4 sm:w-3/4">
          <h3 className="font-semibold text-lg leading-tight mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {product.dimensions.map((dimension, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {dimension}
              </Badge>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
