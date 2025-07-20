import React, { useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SearchInput from '@/components/ui/search-input';
import { formatCurrency } from '@/utils/format';
import { useProdutos } from '@/hooks/useProdutos';

/**
 * Página de administração de produtos
 */
const ProdutosPage: React.FC = () => {
    const {
        produtos,
        loading,
        searchQuery,
        loadProdutos,
        handleSearch,
        handleDelete,
        handleEdit,
        handleAdd
    } = useProdutos();

    useEffect(() => {
        loadProdutos();
    }, []);

    return (
        <AdminLayout
            title="Produtos"
            subtitle="Gerencie os produtos do sistema"
            actions={
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                </Button>
            }
        >
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="w-full max-w-sm">
                        <SearchInput
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Buscar produtos..."
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : produtos.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-gray-500">
                            {searchQuery ? 'Nenhum produto encontrado para esta busca' : 'Nenhum produto cadastrado'}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {produtos.map((produto) => (
                            <Card key={produto.id} className="overflow-hidden">
                                <div className="h-40 bg-gray-100 flex items-center justify-center">
                                    {produto.imagem_url ? (
                                        <img
                                            src={produto.imagem_url}
                                            alt={produto.nome}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-gray-400">Sem imagem</div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-medium text-lg">{produto.nome}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 h-10">
                                        {produto.descricao || 'Sem descrição'}
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>SP:</span>
                                            <span className="font-medium">{formatCurrency(produto.preco_sp)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Sul/Sudeste:</span>
                                            <span className="font-medium">{formatCurrency(produto.preco_sul_sudeste)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Outros:</span>
                                            <span className="font-medium">{formatCurrency(produto.preco_outros)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(produto.id)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(produto.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ProdutosPage;