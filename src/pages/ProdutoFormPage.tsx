import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Placeholder - será substituído por implementação real
const ProdutoFormPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco_sp: 0,
    preco_sul_sudeste: 0,
    preco_outros: 0,
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Placeholder - implementação real virá depois
      toast({
        title: "Sucesso",
        description: `Produto ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`,
      });
      navigate('/admin/produtos');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/produtos">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <h1 className="text-3xl font-urbanist font-bold">
              {isEditMode ? 'Editar Produto' : 'Novo Produto'}
            </h1>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Digite o nome do produto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Digite a descrição do produto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_sp">Preço SP</Label>
                  <Input
                    id="preco_sp"
                    type="number"
                    step="0.01"
                    value={formData.preco_sp}
                    onChange={(e) => setFormData({...formData, preco_sp: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_sul_sudeste">Preço Sul/Sudeste</Label>
                  <Input
                    id="preco_sul_sudeste"
                    type="number"
                    step="0.01"
                    value={formData.preco_sul_sudeste}
                    onChange={(e) => setFormData({...formData, preco_sul_sudeste: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_outros">Preço Outros</Label>
                  <Input
                    id="preco_outros"
                    type="number"
                    step="0.01"
                    value={formData.preco_outros}
                    onChange={(e) => setFormData({...formData, preco_outros: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/admin/produtos">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Atualizar' : 'Criar'} Produto
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProdutoFormPage;