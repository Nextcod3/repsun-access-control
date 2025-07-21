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
  LogOut,
  BarChart3,
  User,
  Building,
  Zap,
  Plus
} from "lucide-react";

interface UserSidebarProps {
  className?: string;
}

export function UserSidebar({ className }: UserSidebarProps) {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();

  const userItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Orçamentos",
      url: "/orcamentos",
      icon: FileText,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: Users,
    },
    {
      title: "Produtos",
      url: "/produtos",
      icon: Package,
    },
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: BarChart3,
    }
  ];

  const quickActions = [
    {
      title: "Novo Orçamento",
      url: "/orcamentos/novo",
      icon: Plus,
    },
    {
      title: "Novo Cliente",
      url: "/clientes/novo",
      icon: Plus,
    }
  ];

  const isActive = (path: string) => location.pathname === path;
  const isExpanded = userItems.some((item) => isActive(item.url));

  return (
    <Sidebar className={`${state === 'collapsed' ? "w-14" : "w-64"} transition-all duration-300 ${className}`}>
      <SidebarHeader className="border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-cyan-500">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {(!state || state === 'expanded') && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
                RepSUN
              </span>
              <span className="text-xs text-muted-foreground">Orçamentos</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={state === 'collapsed' ? "sr-only" : ""}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`transition-all duration-200 ${
                      isActive(item.url) 
                        ? "bg-gradient-to-r from-green-500/10 to-cyan-500/10 text-green-600 border-l-2 border-green-500" 
                        : "hover:bg-muted/50 hover:translate-x-1"
                    }`}
                  >
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 px-3 py-2 rounded-md"
                    >
                      <item.icon className={`h-4 w-4 ${isActive(item.url) ? "text-green-600" : ""}`} />
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
            Ações Rápidas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={action.url} 
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 hover:translate-x-1"
                    >
                      <action.icon className="h-4 w-4" />
                      {(!state || state === 'expanded') && <span>{action.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="space-y-3">
          {(!state || state === 'expanded') && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-cyan-500">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.nome}</span>
                <span className="text-xs text-muted-foreground">Usuário</span>
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