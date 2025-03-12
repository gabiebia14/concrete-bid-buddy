
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchProducts } from '@/lib/supabase';
import { Search, Filter, Package, Grid3X3, List } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  dimensions: string[];
  image_url?: string;
};

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();
        setProducts(data || getMockProducts());
        setFilteredProducts(data || getMockProducts());
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Erro ao carregar produtos. Tentando dados offline.');
        const mockData = getMockProducts();
        setProducts(mockData);
        setFilteredProducts(mockData);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts(searchQuery, activeCategory);
  }, [searchQuery, activeCategory, products]);

  const filterProducts = (query: string, category: string) => {
    let filtered = [...products];
    
    // Filtrar por busca
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por categoria
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }
    
    setFilteredProducts(filtered);
  };

  const getCategories = () => {
    const categories = products.map(product => product.category);
    return ['all', ...Array.from(new Set(categories))];
  };

  const getMockProducts = (): Product[] => {
    return [
      {
        id: 'prod-001',
        name: 'Bloco de Concreto Estrutural',
        description: 'Bloco estrutural de concreto ideal para construções resistentes',
        category: 'Blocos',
        dimensions: ['14x19x39cm', '19x19x39cm'],
        image_url: '/images/produtos/bloco-estrutural.jpg',
      },
      {
        id: 'prod-002',
        name: 'Piso Intertravado',
        description: 'Piso intertravado perfeito para calçadas e áreas externas',
        category: 'Pisos',
        dimensions: ['10x20x6cm', '10x20x8cm'],
        image_url: '/images/produtos/piso-intertravado.jpg',
      },
      {
        id: 'prod-003',
        name: 'Laje Pré-Moldada',
        description: 'Laje pré-moldada de alta resistência para construções diversas',
        category: 'Lajes',
        dimensions: ['30x10x3m', '30x12x3m'],
        image_url: '/images/produtos/laje-premoldada.jpg',
      },
      {
        id: 'prod-004',
        name: 'Bloco de Vedação',
        description: 'Bloco de vedação para fechamento de paredes não estruturais',
        category: 'Blocos',
        dimensions: ['9x19x39cm', '14x19x39cm'],
        image_url: '/images/produtos/bloco-vedacao.jpg',
      },
      {
        id: 'prod-005',
        name: 'Meio-Fio de Concreto',
        description: 'Meio-fio de concreto para delimitação de calçadas e jardins',
        category: 'Urbanismo',
        dimensions: ['30x15x100cm', '45x15x100cm'],
        image_url: '/images/produtos/meio-fio.jpg',
      },
      {
        id: 'prod-006',
        name: 'Canaleta de Concreto',
        description: 'Canaleta de concreto para passagem de tubulações e reforço estrutural',
        category: 'Blocos',
        dimensions: ['14x19x39cm', '19x19x39cm'],
        image_url: '/images/produtos/canaleta.jpg',
      },
    ];
  };

  return (
    <Layout>
      <div className="py-6 px-4 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Catálogo de Produtos</h1>
            <p className="text-muted-foreground">
              Explore nossa linha completa de produtos de concreto para sua construção
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-primary/10' : ''}
            >
              <Grid3X3 size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-primary/10' : ''}
            >
              <List size={18} />
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="md:w-auto flex items-center">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </div>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-6 bg-background border">
              {getCategories().map(category => (
                <TabsTrigger key={category} value={category} className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  {category === 'all' ? 'Todos' : category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array(8).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden h-[360px] flex flex-col animate-pulse border-l-4 border-l-primary">
                      <div className="h-48 bg-muted"></div>
                      <CardContent className="p-4 flex-grow">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-background rounded-lg border">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar seus filtros ou termos de busca
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden h-full flex flex-col card-hover">
                      <div className="h-48 bg-muted relative flex items-center justify-center">
                        {product.image_url ? (
                          <img 
                            src={product.image_url}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package className="h-12 w-12 text-muted-foreground/60" />
                        )}
                        <Badge className="absolute top-2 right-2 bg-primary">
                          {product.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {product.description}
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Dimensões disponíveis:</p>
                          <div className="flex flex-wrap gap-2">
                            {product.dimensions.map((dimension, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-accent text-primary">
                                {dimension}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 py-3 border-t">
                        <Button asChild className="w-full bg-primary hover:bg-primary/90">
                          <Link to={`/criar-orcamento?product=${product.id}`}>
                            Solicitar Orçamento
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-card rounded-lg overflow-hidden shadow-sm border border-l-4 border-l-primary hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 h-48 md:h-auto bg-muted relative flex items-center justify-center">
                          {product.image_url ? (
                            <img 
                              src={product.image_url}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="h-12 w-12 text-muted-foreground/60" />
                          )}
                          <Badge className="absolute top-2 right-2 bg-primary">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                            <p className="text-muted-foreground mb-4">
                              {product.description}
                            </p>
                            <div>
                              <p className="text-sm font-medium mb-2">Dimensões disponíveis:</p>
                              <div className="flex flex-wrap gap-2">
                                {product.dimensions.map((dimension, index) => (
                                  <Badge key={index} variant="outline" className="bg-accent text-primary">
                                    {dimension}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 flex justify-end">
                            <Button asChild className="bg-primary hover:bg-primary/90">
                              <Link to={`/criar-orcamento?product=${product.id}`}>
                                Solicitar Orçamento
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
