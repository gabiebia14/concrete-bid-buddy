
import { Product } from "@/lib/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

type ProductListProps = {
  products: Product[];
  category: string;
  onBack: () => void;
};

export function ProductList({ products, category, onBack }: ProductListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">{category}</h2>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
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
        ))}
      </div>
    </div>
  );
}
