import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Package, FileText, Settings } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Layout para páginas administrativas
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  actions 
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b">
          <Link to="/admin">
            <h1 className="text-xl font-semibold text-gray-900">RepSUN</h1>
            <p className="text-xs text-gray-500">Painel Administrativo</p>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link to="/admin" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
            <FileText className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          
          <Link to="/admin/usuarios" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
            <Users className="h-4 w-4" />
            <span>Usuários</span>
          </Link>
          
          <Link to="/admin/produtos" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
            <Package className="h-4 w-4" />
            <span>Produtos</span>
          </Link>
          
          <Link to="/admin/configuracoes" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">{user?.nome}</div>
              <div className="text-xs text-gray-500">Administrador</div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                {title && (
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
              
              {actions && (
                <div className="flex gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;