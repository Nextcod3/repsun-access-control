import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Package, FileText, Settings, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Layout para páginas administrativas com barra lateral retrátil
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  actions 
}) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white border-r shadow-sm transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && (
            <Link to="/admin" className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">RepSUN</h1>
              <p className="text-xs text-gray-500">Painel Admin</p>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="p-2 space-y-1 flex-1">
          <Link 
            to="/admin" 
            className={cn(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100",
              isActive("/admin") && !isActive("/admin/usuarios") && !isActive("/admin/produtos") && !isActive("/admin/configuracoes") && "bg-blue-50 text-blue-600",
              collapsed && "justify-center"
            )}
          >
            <FileText className="h-5 w-5" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
          
          <Link 
            to="/admin/usuarios" 
            className={cn(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100",
              isActive("/admin/usuarios") && "bg-blue-50 text-blue-600",
              collapsed && "justify-center"
            )}
          >
            <Users className="h-5 w-5" />
            {!collapsed && <span>Usuários</span>}
          </Link>
          
          <Link 
            to="/admin/produtos" 
            className={cn(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100",
              isActive("/admin/produtos") && "bg-blue-50 text-blue-600",
              collapsed && "justify-center"
            )}
          >
            <Package className="h-5 w-5" />
            {!collapsed && <span>Produtos</span>}
          </Link>
          
          <Link 
            to="/admin/configuracoes" 
            className={cn(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100",
              isActive("/admin/configuracoes") && "bg-blue-50 text-blue-600",
              collapsed && "justify-center"
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Configurações</span>}
          </Link>
        </nav>
        
        <div className={cn(
          "border-t p-4",
          collapsed ? "flex justify-center" : "flex items-center justify-between"
        )}>
          {!collapsed ? (
            <>
              <div className="text-sm">
                <div className="font-medium">{user?.nome}</div>
                <div className="text-xs text-gray-500">Administrador</div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar}
                  className="mr-4 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  {title && (
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                  )}
                </div>
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