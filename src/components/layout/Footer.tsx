
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} IPT Teixeira. Todos os direitos reservados.
          </p>
          
          <div className="flex space-x-4">
            <Link 
              to="/criar-orcamento" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Orçamentos
            </Link>
            <Link 
              to="/catalogo" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Catálogo
            </Link>
            <a 
              href="mailto:contato@iptteixeira.com.br" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Contato
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
