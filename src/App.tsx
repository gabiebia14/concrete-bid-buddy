
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
import ChatAssistant from './pages/ChatAssistant';
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
                  
                  {/* Autenticação */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Páginas para Clientes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/criar-orcamento" 
                    element={
                      <PrivateRoute>
                        <CreateQuote />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/historico" 
                    element={
                      <PrivateRoute>
                        <QuoteHistory />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/catalogo" 
                    element={
                      <PrivateRoute>
                        <Catalog />
                      </PrivateRoute>
                    } 
                  />
                  <Route path="/chat-assistant" element={<ChatAssistant />} />
                  
                  {/* Nova página de chat com vendedor */}
                  <Route path="/vendedor" element={<Vendedor />} />
                  
                  {/* Páginas para Gerentes */}
                  <Route path="/manager/login" element={<ManagerLogin />} />
                  <Route 
                    path="/manager/dashboard" 
                    element={
                      <PrivateRoute requireManager>
                        <ManagerDashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/manager/quotes" 
                    element={
                      <PrivateRoute requireManager>
                        <ManagerQuotes />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/manager/clients" 
                    element={
                      <PrivateRoute requireManager>
                        <ManagerClients />
                      </PrivateRoute>
                    } 
                  />
                  
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
