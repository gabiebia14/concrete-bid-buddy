
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { fetchProducts, fetchProductCategories } from '@/lib/supabase';
import { Product } from '@/lib/database.types';

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar produtos
        const productsData = await fetchProducts();
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Carregar categorias
        const categoriesData = await fetchProductCategories();
        setCategories(categoriesData || []);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filtrar produtos quando a pesquisa ou categoria mudar
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  // Renderizar produtos em formato grid
  const renderProductGrid = () => {
    if (filteredProducts.length === 0) {
      return (
        <div className="col-span-full flex justify-center items-center py-10">
          <p className="text-center text-muted-foreground">
            Nenhum produto encontrado para os filtros selecionados
          </p>
        </div>
      );
    }

    return filteredProducts.map(product => (
      <Card key={product.id} className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-2xl font-bold text-muted-foreground opacity-30">
              IPT
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex flex-col gap-1">
            <Badge className="w-fit my-1 bg-lime-500 hover:bg-lime-600">
              {product.category}
            </Badge>
            <h3 className="font-medium text-lg">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {product.description || 'Sem descrição disponível'}
            </p>
            
            <div className="mt-auto pt-2 flex flex-col gap-1 text-sm">
              {product.type && (
                <div className="flex justify-between">
                  <span className="font-medium">Tipo:</span>
                  <span>{product.type}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Dimensões:</span>
                <span>
                  {Array.isArray(product.dimensions) 
                    ? product.dimensions.join(', ')
                    : product.dimensions}
                </span>
              </div>
            </div>
            
            <Button 
              className="mt-4 w-full bg-green-600 hover:bg-green-700" 
              size="sm"
            >
              Solicitar Orçamento
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  };

  // Renderizar produtos em formato lista
  const renderProductList = () => {
    if (filteredProducts.length === 0) {
      return (
        <div className="flex justify-center items-center py-10">
          <p className="text-center text-muted-foreground">
            Nenhum produto encontrado para os filtros selecionados
          </p>
        </div>
      );
    }

    return filteredProducts.map(product => (
      <Card key={product.id} className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 lg:w-1/5 bg-muted flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover aspect-video md:aspect-square"
                />
              ) : (
                <div className="text-2xl font-bold text-muted-foreground opacity-30 h-full flex items-center justify-center aspect-video md:aspect-square">
                  IPT
                </div>
              )}
            </div>
            
            <div className="p-4 w-full md:w-3/4 lg:w-4/5 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div>
                  <Badge className="mb-2 bg-lime-500 hover:bg-lime-600">
                    {product.category}
                  </Badge>
                  <h3 className="font-medium text-lg">{product.name}</h3>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
                  size="sm"
                >
                  Solicitar Orçamento
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.description || 'Sem descrição disponível'}
              </p>
              
              <div className="mt-auto flex flex-col sm:flex-row gap-4 text-sm">
                {product.type && (
                  <div className="flex gap-2">
                    <span className="font-medium">Tipo:</span>
                    <span>{product.type}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-medium">Dimensões:</span>
                  <span>
                    {Array.isArray(product.dimensions) 
                      ? product.dimensions.join(', ')
                      : product.dimensions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Catálogo de Produtos</h1>
            <p className="text-muted-foreground">
              Conheça nossos produtos e solicite orçamentos
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="w-full sm:w-48">
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Mais recentes</DropdownMenuItem>
                  <DropdownMenuItem>A-Z</DropdownMenuItem>
                  <DropdownMenuItem>Categoria</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex rounded-md border overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`rounded-none h-10 w-10 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`rounded-none h-10 w-10 ${viewMode === 'list' ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-lime-500 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {viewMode === 'grid' ? renderProductGrid() : renderProductList()}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
