
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerQuotes from './pages/manager/Quotes';
import ManagerClients from './pages/manager/Clients';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              <Routes>
                {/* Página inicial */}
                <Route path="/" element={<Index />} />
                
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
                
                {/* Páginas para Gerentes (ocultas, mas ainda funcionais) */}
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
  );
}

export default App;
