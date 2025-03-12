
import { Badge } from '@/components/ui/badge';
import { QuoteStatus } from '@/lib/types';
import * as React from 'react';

export const getStatusBadge = (status: QuoteStatus) => {
  const statusConfig = {
    draft: { label: 'Rascunho', variant: 'outline' as const },
    pending: { label: 'Pendente', variant: 'secondary' as const },
    approved: { label: 'Aprovado', variant: 'default' as const },
    sent: { label: 'Enviado', variant: 'default' as const },
    rejected: { label: 'Rejeitado', variant: 'destructive' as const },
    completed: { label: 'Concluído', variant: 'default' as const },
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};
