
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchProducts } from '@/lib/supabase';
import { Search, Filter, Package } from 'lucide-react';
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
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Catálogo de Produtos</h1>
        <p className="text-muted-foreground mb-8">
          Explore nossa linha completa de produtos de concreto para sua construção
        </p>
        
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
            <TabsList className="mb-6">
              {getCategories().map(category => (
                <TabsTrigger key={category} value={category}>
                  {category === 'all' ? 'Todos' : category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array(8).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden h-[360px] flex flex-col animate-pulse">
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
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar seus filtros ou termos de busca
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden h-full flex flex-col">
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
                        <Badge className="absolute top-2 right-2">
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
                              <Badge key={index} variant="outline" className="text-xs">
                                {dimension}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 py-3 border-t">
                        <Button asChild className="w-full" variant="secondary">
                          <Link to={`/criar-orcamento?product=${product.id}`}>
                            Solicitar Orçamento
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
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
