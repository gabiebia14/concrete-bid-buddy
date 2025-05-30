
import { useState, useEffect } from 'react';
import { Plus, Minus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchProducts } from '@/lib/supabase';
import { Product, QuoteItem } from '@/lib/database.types';
import { toast } from 'sonner';

interface ProductSelectorProps {
  onProductsSelected: (products: QuoteItem[]) => void;
  initialProducts?: QuoteItem[];
}

export function ProductSelector({ onProductsSelected, initialProducts = [] }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await fetchProducts();
        
        setProducts(productsData);
        
        // Extrair categorias únicas
        const uniqueCategories = Array.from(
          new Set(productsData.map((product: Product) => product.category))
        ) as string[];
        
        setCategories(uniqueCategories);
        
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Erro ao carregar produtos. Por favor, tente novamente.');
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setSelectedItems(initialProducts);
      // Notificar o componente pai
      onProductsSelected(initialProducts);
    }
  }, [initialProducts, onProductsSelected]);

  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category === selectedCategory)
    : products;

  const handleAddProduct = (product: Product) => {
    // Verificar se o produto já está na lista
    const existingIndex = selectedItems.findIndex(item => 
      item.product_id === product.id
    );
    
    if (existingIndex >= 0) {
      // Atualizar quantidade
      const updatedItems = [...selectedItems];
      updatedItems[existingIndex].quantity += 1;
      setSelectedItems(updatedItems);
    } else {
      // Adicionar novo item
      // Verificar se dimensions é uma string ou array e tratar adequadamente
      const defaultDimension = Array.isArray(product.dimensions) 
        ? product.dimensions[0] 
        : product.dimensions;
      
      const newItem: QuoteItem = {
        product_id: product.id,
        product_name: product.name,
        dimensions: defaultDimension, // Usar a primeira dimensão ou a string completa
        quantity: 1,
      };
      
      setSelectedItems([...selectedItems, newItem]);
    }
    
    // Notificar componente pai
    onProductsSelected([...selectedItems]);
    
    toast.success(`${product.name} adicionado ao orçamento`);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
    
    // Notificar componente pai
    onProductsSelected(updatedItems);
  };

  const handleQuantityChange = (index: number, amount: number) => {
    const updatedItems = [...selectedItems];
    const newQuantity = updatedItems[index].quantity + amount;
    
    if (newQuantity < 1) return;
    
    updatedItems[index].quantity = newQuantity;
    setSelectedItems(updatedItems);
    
    // Notificar componente pai
    onProductsSelected(updatedItems);
  };

  const handleDimensionChange = (index: number, dimension: string) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].dimensions = dimension;
    setSelectedItems(updatedItems);
    
    // Notificar componente pai
    onProductsSelected(updatedItems);
  };

  // Para tratar corretamente as dimensões do produto
  const getProductDimensions = (productId: string): string[] => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    
    // Se dimensions for uma string, converta para um array com um único elemento
    if (typeof product.dimensions === 'string') {
      return [product.dimensions];
    }
    
    // Se já for um array, retorne diretamente
    return product.dimensions;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="w-full sm:w-64">
            <Label htmlFor="category-select">Categoria</Label>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              disabled={isLoading || categories.length === 0}
            >
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {selectedItems.length === 0 ? (
              <span>Nenhum produto adicionado</span>
            ) : (
              <span>{selectedItems.length} produto(s) selecionado(s)</span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <p className="text-muted-foreground">Carregando produtos...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria</p>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden card-hover">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">Sem imagem</div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-medium leading-tight mb-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{product.description}</p>
                      <div className="text-xs">
                        <span className="font-medium">Dimensões:</span>{' '}
                        {Array.isArray(product.dimensions) 
                          ? product.dimensions.join(', ')
                          : product.dimensions}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="shrink-0"
                      onClick={() => handleAddProduct(product)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {selectedItems.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 p-3 border-b">
            <h3 className="font-medium">Produtos selecionados</h3>
          </div>
          <div className="divide-y">
            {selectedItems.map((item, index) => (
              <div key={`${item.product_id}-${index}`} className="p-4 animate-scale-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label htmlFor={`dimension-${index}`}>Dimensão</Label>
                        <Select 
                          value={item.dimensions} 
                          onValueChange={(value) => handleDimensionChange(index, value)}
                        >
                          <SelectTrigger id={`dimension-${index}`}>
                            <SelectValue placeholder="Selecione uma dimensão" />
                          </SelectTrigger>
                          <SelectContent>
                            {getProductDimensions(item.product_id).map((dim) => (
                              <SelectItem key={dim} value={dim}>
                                {dim}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`quantity-${index}`}>Quantidade</Label>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 rounded-r-none"
                            onClick={() => handleQuantityChange(index, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value);
                              if (newValue >= 1) {
                                const updatedItems = [...selectedItems];
                                updatedItems[index].quantity = newValue;
                                setSelectedItems(updatedItems);
                                onProductsSelected(updatedItems);
                              }
                            }}
                            className="rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() => handleQuantityChange(index, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-muted/50 p-3 border-t flex justify-end">
            <Button variant="default" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Concluir seleção
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
