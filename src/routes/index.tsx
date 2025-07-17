import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Páginas públicas
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

// Páginas de administrador
import AdminDashboard from '@/pages/AdminDashboard';
import ProdutosPage from '@/pages/admin/ProdutosPage';
import ProdutoFormPage from '@/pages/admin/ProdutoFormPage';

// Páginas de usuário
import UserDashboard from '@/pages/UserDashboard';

// Páginas de cliente
import ClientesPage from '@/pages/ClientesPage';
import ClienteFormPage from '@/pages/ClienteFormPage';

// Páginas de orçamento
import OrcamentosPage from '@/pages/OrcamentosPage';
import OrcamentoFormPage from '@/pages/OrcamentoFormPage';
import OrcamentoDetailPage from '@/pages/OrcamentoDetailPage';
import OrcamentoPagamentoPage from '@/pages/OrcamentoPagamentoPage';

/**
 * Componente de rotas da aplicação
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Rotas de administrador */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/produtos" 
        element={
          <ProtectedRoute requiredRole="admin">
            <ProdutosPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/produtos/novo" 
        element={
          <ProtectedRoute requiredRole="admin">
            <ProdutoFormPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/produtos/editar/:id" 
        element={
          <ProtectedRoute requiredRole="admin">
            <ProdutoFormPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de usuário */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole="usuario">
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de cliente */}
      <Route 
        path="/clientes" 
        element={
          <ProtectedRoute requiredRole="usuario">
            <ClientesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clientes/novo" 
        element={
          <ProtectedRoute requiredRole="usuario">
            <ClienteFormPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clientes/editar/:id" 
        element={
          <ProtectedRoute requiredRole="usuario">
            <ClienteFormPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de orçamento */}
      <Route 
        path="/orcamentos" 
        element={
          <ProtectedRoute requiredRole="usuario">
            <OrcamentosPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orcamentos/novo" 
        element={
          <ProtectedRoute requiredRole="usuario">
            <OrcamentoFormPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orcamentos/:id" 
        element={
          <ProtectedRoute requiredRole="usuario">
            <OrcamentoDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orcamentos/editar/:id" 
        element={
          <ProtectedRoute requiredRole="usuario">
            <OrcamentoFormPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orcamentos/:id/pagamento" 
        element={
          <ProtectedRoute requiredRole="usuario">
            <OrcamentoPagamentoPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;