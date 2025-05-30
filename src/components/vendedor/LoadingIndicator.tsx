
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  isLoading: boolean;
}

export function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  if (!isLoading) return null;
  
  return (
    <div className="flex justify-center mt-4">
      <Loader2 className="h-6 w-6 animate-spin text-lime-600" />
    </div>
  );
}
