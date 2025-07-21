import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  UserCheck,
  Building,
  Zap
} from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Usuários",
      url: "/admin/usuarios",
      icon: Users,
    },
    {
      title: "Produtos",
      url: "/admin/produtos", 
      icon: Package,
    },
    {
      title: "Orçamentos",
      url: "/admin/orcamentos",
      icon: FileText,
    },
    {
      title: "Relatórios",
      url: "/admin/relatorios",
      icon: BarChart3,
    }
  ];

  const isActive = (path: string) => location.pathname === path;
  const isExpanded = adminItems.some((item) => isActive(item.url));

  return (
    <Sidebar className={`${state === 'collapsed' ? "w-14" : "w-64"} transition-all duration-300 ${className}`}>
      <SidebarHeader className="border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {(!state || state === 'expanded') && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                RepSUN
              </span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={state === 'collapsed' ? "sr-only" : ""}>
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`transition-all duration-200 ${
                      isActive(item.url) 
                        ? "bg-gradient-to-r from-primary/10 to-primary-glow/10 text-primary border-l-2 border-primary" 
                        : "hover:bg-muted/50 hover:translate-x-1"
                    }`}
                  >
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 px-3 py-2 rounded-md"
                    >
                      <item.icon className={`h-4 w-4 ${isActive(item.url) ? "text-primary" : ""}`} />
                      {(!state || state === 'expanded') && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={state === 'collapsed' ? "sr-only" : ""}>
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/admin/configuracoes" 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                      isActive("/admin/configuracoes")
                        ? "bg-gradient-to-r from-primary/10 to-primary-glow/10 text-primary"
                        : "hover:bg-muted/50 hover:translate-x-1"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    {(!state || state === 'expanded') && <span>Configurações</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="space-y-3">
          {(!state || state === 'expanded') && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow">
                <UserCheck className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.nome}</span>
                <span className="text-xs text-muted-foreground">Administrador</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex-1 justify-start gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {(!state || state === 'expanded') && <span>Sair</span>}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}