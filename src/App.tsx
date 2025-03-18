
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import CreateQuote from './pages/CreateQuote';
import QuoteHistory from './pages/QuoteHistory';
import Catalog from './pages/Catalog';
import NotFound from './pages/NotFound';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerQuotes from './pages/manager/Quotes';
import ManagerClients from './pages/manager/Clients';
import { ChatInterface } from './components/ui/chat-interface';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Routes>
              {/* Página inicial agora mostra o componente Index */}
              <Route path="/" element={<Index />} />
              
              {/* Páginas para Clientes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/criar-orcamento" element={<CreateQuote />} />
              <Route path="/historico" element={<QuoteHistory />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/chat-assistant" element={<ChatInterface standalone={true} />} />
              
              {/* Páginas para Gerentes */}
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/quotes" element={<ManagerQuotes />} />
              <Route path="/manager/clients" element={<ManagerClients />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
