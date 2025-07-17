import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Layout principal da aplicação
 * Contém o cabeçalho com logo, nome do usuário e botão de logout
 */
const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  actions 
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard">
                <h1 className="text-xl font-semibold text-gray-900">RepSUN</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Bem-vindo, {user?.nome}</span>
              <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {(title || actions) && (
          <div className="flex items-center justify-between mb-6">
            {title && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
              </div>
            )}
            {actions && (
              <div className="flex gap-2">
                {actions}
              </div>
            )}
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default MainLayout;