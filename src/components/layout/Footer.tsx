
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">IPT Teixeira</h3>
            <p className="text-sm text-muted-foreground">
              Especialistas em produtos de concreto de alta qualidade para suas construções.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/criar-orcamento" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Solicitar Orçamento
                </Link>
              </li>
              <li>
                <Link 
                  to="/catalogo" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Catálogo de Produtos
                </Link>
              </li>
              <li>
                <Link 
                  to="/historico" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Meus Orçamentos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <address className="not-italic">
              <p className="text-sm text-muted-foreground mb-1">
                contato@iptteixeira.com.br
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                (00) 1234-5678
              </p>
              <p className="text-sm text-muted-foreground">
                Av. Exemplo, 123 - Cidade, Estado
              </p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} IPT Teixeira. Todos os direitos reservados.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              Facebook
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              Instagram
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
