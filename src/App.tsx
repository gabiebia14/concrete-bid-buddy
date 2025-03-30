
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import Dashboard from './pages/Dashboard';
import CreateQuote from './pages/CreateQuote';
import QuoteHistory from './pages/QuoteHistory';
import Catalog from './pages/Catalog';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import ManagerLogin from './pages/ManagerLogin';
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerQuotes from './pages/manager/Quotes';
import ManagerClients from './pages/manager/Clients';
import Vendedor from './pages/Vendedor';
import './App.css';

function App() {
  // Criando o queryClient dentro do componente funcional
  const queryClient = new QueryClient();

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                <Routes>
                  {/* Landing Page como página inicial */}
                  <Route path="/" element={<LandingPage />} />
                  
                  {/* A antiga Index agora fica disponível em /area-cliente */}
                  <Route path="/area-cliente" element={<Index />} />
                  
                  {/* Rotas de autenticação */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/manager/login" element={<ManagerLogin />} />
                  
                  {/* Rotas protegidas - requerem autenticação */}
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/criar-orcamento" element={<PrivateRoute><CreateQuote /></PrivateRoute>} />
                  <Route path="/historico-orcamentos" element={<PrivateRoute><QuoteHistory /></PrivateRoute>} />
                  <Route path="/catalogo" element={<Catalog />} />
                  <Route path="/vendedor" element={<PrivateRoute><Vendedor /></PrivateRoute>} />
                  
                  {/* Rotas do gestor */}
                  <Route path="/manager/dashboard" element={<PrivateRoute><ManagerDashboard /></PrivateRoute>} />
                  <Route path="/manager/orcamentos" element={<PrivateRoute><ManagerQuotes /></PrivateRoute>} />
                  <Route path="/manager/clientes" element={<PrivateRoute><ManagerClients /></PrivateRoute>} />
                  
                  {/* Página não encontrada */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
