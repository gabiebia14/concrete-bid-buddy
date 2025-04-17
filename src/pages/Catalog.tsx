
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { fetchProducts, fetchProductCategories } from '@/lib/supabase';
import { Product } from '@/lib/database.types';
import { CategoryGrid } from '@/components/catalog/CategoryGrid';
import { ProductList } from '@/components/catalog/ProductList';

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchProductCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : [];

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {selectedCategory || 'Categorias de Produtos'}
          </h1>
          <p className="text-muted-foreground">
            {selectedCategory 
              ? 'Selecione os produtos para solicitar um orçamento'
              : 'Escolha uma categoria para ver os produtos disponíveis'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-lime-500 rounded-full border-t-transparent"></div>
          </div>
        ) : selectedCategory ? (
          <ProductList 
            products={filteredProducts}
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
          />
        ) : (
          <CategoryGrid 
            categories={categories}
            onSelectCategory={setSelectedCategory}
          />
        )}
      </div>
    </Layout>
  );
}
