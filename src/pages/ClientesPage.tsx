import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ui/modern-card';
import { Input } from '@/components/ui/input';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Loader2,
  Phone,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { getClientes, deleteCliente, Cliente } from '@/services/clienteService';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ClientesPage = () => {
  const { user, logout } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async (showToast = false) => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data);
      if (showToast) {
        toast({
          title: "Atualizado",
          description: "Lista de clientes atualizada."
        });
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredClientes = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.documento && cliente.documento.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cliente.telefone && cliente.telefone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const confirmDelete = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!clienteToDelete) return;
    
    try {
      setDeleting(true);
      await deleteCliente(clienteToDelete.id);
      setClientes(clientes.filter(c => c.id !== clienteToDelete.id));
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso"
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDocument = (doc: string | null) => {
    if (!doc) return '-';
    
    // CNPJ: 00.000.000/0000-00
    if (doc.length === 14) {
      return doc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }
    
    // CPF: 000.000.000-00
    if (doc.length === 11) {
      return doc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }
    
    return doc;
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    
    // Remove non-numeric characters
    const numericPhone = phone.replace(/\D/g, '');
    
    // Format based on length
    if (numericPhone.length === 11) {
      // Celular: (00) 00000-0000
      return numericPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (numericPhone.length === 10) {
      // Fixo: (00) 0000-0000
      return numericPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }
    
    return phone;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-background/80">
        <UserSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Clientes
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie todos os seus clientes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchClientes(true)}
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </>
                  )}
                </Button>
                <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                  <Link to="/clientes/novo" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Novo Cliente
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6 animate-slide-up">
            <ModernCard variant="glass">
              <div className="space-y-6">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por nome, documento ou telefone..."
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0,1,2,3,4,5].map((i) => (
                      <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <ModernCard variant="default">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-3/4" />
                            </div>
                          </div>
                        </ModernCard>
                      </div>
                    ))}
                  </div>
                ) : filteredClientes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClientes.map((cliente, index) => (
                      <div 
                        key={cliente.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <ModernCard variant="default" className="hover-scale">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                  <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{cliente.nome}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDocument(cliente.documento)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{formatPhone(cliente.telefone) || 'Não informado'}</span>
                              </div>
                              {cliente.uf && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{cliente.uf}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/clientes/editar/${cliente.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => confirmDelete(cliente)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </ModernCard>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 animate-slide-up">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/20 mx-auto mb-4">
                      <Users className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm ? 
                        'Tente ajustar os termos de busca' :
                        'Comece adicionando seu primeiro cliente'}
                    </p>
                    {!searchTerm && (
                      <Button asChild>
                        <Link to="/clientes/novo">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Adicionar Cliente
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ModernCard>
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o cliente "{clienteToDelete?.nome}"?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default ClientesPage;