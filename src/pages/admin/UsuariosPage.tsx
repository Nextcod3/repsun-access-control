import React, { useState, useEffect } from 'react';
import { MoreHorizontal, CheckCircle, XCircle, Trash2, Search } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import SearchInput from '@/components/ui/search-input';
import { formatDate } from '@/utils/format';
import { 
  getUsuarios, 
  aprovarUsuario, 
  desativarUsuario, 
  excluirUsuario 
} from '@/services/usuarioService';
import type { Usuario } from '@/services/usuarioService';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Página de administração de usuários
 */
const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Carregar usuários
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários com base na busca
  const filteredUsuarios = usuarios.filter(usuario => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      usuario.nome.toLowerCase().includes(query) ||
      usuario.email.toLowerCase().includes(query)
    );
  });

  // Ativar usuário
  const handleAtivar = async (id: string) => {
    try {
      await aprovarUsuario(id);
      toast({
        title: 'Sucesso',
        description: 'Usuário ativado com sucesso',
      });
      loadUsuarios();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar o usuário',
        variant: 'destructive',
      });
    }
  };

  // Inativar usuário
  const handleInativar = async (id: string) => {
    try {
      await desativarUsuario(id);
      toast({
        title: 'Sucesso',
        description: 'Usuário inativado com sucesso',
      });
      loadUsuarios();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível inativar o usuário',
        variant: 'destructive',
      });
    }
  };

  // Excluir usuário
  const handleExcluir = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${nome}? Esta ação não pode ser desfeita e todos os orçamentos associados serão excluídos.`)) {
      return;
    }

    try {
      await excluirUsuario(id);
      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso',
      });
      loadUsuarios();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o usuário',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  return (
    <AdminLayout 
      title="Usuários" 
      subtitle="Gerencie os usuários do sistema"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-full max-w-sm">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar usuários..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              {searchQuery ? 'Nenhum usuário encontrado para esta busca' : 'Nenhum usuário cadastrado'}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge variant={usuario.perfil === 'admin' ? 'default' : 'outline'}>
                          {usuario.perfil === 'admin' ? 'Administrador' : 'Usuário'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={usuario.status ? 'success' : 'destructive'}
                          className={usuario.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {usuario.status ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(usuario.created_at)}</TableCell>
                      <TableCell>
                        {/* Não mostrar ações para o próprio usuário logado */}
                        {currentUser?.id !== usuario.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!usuario.status && (
                                <DropdownMenuItem 
                                  onClick={() => handleAtivar(usuario.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Ativar
                                </DropdownMenuItem>
                              )}
                              {usuario.status && (
                                <DropdownMenuItem 
                                  onClick={() => handleInativar(usuario.id)}
                                  className="text-amber-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Inativar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleExcluir(usuario.id, usuario.nome)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsuariosPage;