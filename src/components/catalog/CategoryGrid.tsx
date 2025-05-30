
import { Card, CardContent } from "@/components/ui/card";
import { Lamp, Cylinder, Package } from "lucide-react";

type CategoryProps = {
  onSelectCategory: (category: string) => void;
  categories: string[];
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'postes':
      return <Lamp className="w-12 h-12" />;
    case 'tubos':
      return <Cylinder className="w-12 h-12" />;
    case 'outros':
      return <Cylinder className="w-12 h-12" />;
    default:
      return <Package className="w-12 h-12" />;
  }
};

export function CategoryGrid({ categories, onSelectCategory }: CategoryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Card 
          key={category}
          className="group cursor-pointer transition-all hover:shadow-lg"
          onClick={() => onSelectCategory(category)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="text-lime-600 transition-transform group-hover:scale-110">
              {getCategoryIcon(category)}
            </div>
            <h3 className="font-medium text-lg">{category}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
