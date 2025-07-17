import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { 
  getProdutoById, 
  createProduto, 
  updateProduto, 
  uploadProdutoImagem 
} from '@/services/produtoService';
import { 
  produtoSchema, 
  type ProdutoFormValues 
} from '@/schemas/produtoSchema';

/**
 * Página de formulário para adicionar/editar produtos
 */
const ProdutoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Configuração do formulário com validação Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      imagem_url: null,
      preco_sp: 0,
      preco_sul_sudeste: 0,
      preco_outros: 0,
    },
  });

  // Carregar dados do produto para edição
  useEffect(() => {
    const loadProduto = async () => {
      if (!isEditing || !id) return;
      
      try {
        setLoading(true);
        const produto = await getProdutoById(id);
        if (produto) {
          setValue('nome', produto.nome);
          setValue('descricao', produto.descricao || '');
          setValue('imagem_url', produto.imagem_url);
          setValue('preco_sp', produto.preco_sp || 0);
          setValue('preco_sul_sudeste', produto.preco_sul_sudeste || 0);
          setValue('preco_outros', produto.preco_outros || 0);
          
          if (produto.imagem_url) {
            setImagePreview(produto.imagem_url);
          }
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do produto',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduto();
  }, [id, isEditing, setValue, toast]);

  // Manipular upload de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    
    // Criar preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Enviar formulário
  const onSubmit = async (data: ProdutoFormValues) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para realizar esta ação',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      let produtoId = id;
      let imagemUrl = data.imagem_url;
      
      // Criar ou atualizar produto
      if (isEditing && id) {
        await updateProduto(id, {
          nome: data.nome,
          descricao: data.descricao,
          preco_sp: data.preco_sp,
          preco_sul_sudeste: data.preco_sul_sudeste,
          preco_outros: data.preco_outros,
        });
      } else {
        const novoProduto = await createProduto({
          nome: data.nome,
          descricao: data.descricao,
          imagem_url: null, // Será atualizado após o upload
          usuario_id: user.id,
          preco_sp: data.preco_sp,
          preco_sul_sudeste: data.preco_sul_sudeste,
          preco_outros: data.preco_outros,
        });
        produtoId = novoProduto.id;
      }
      
      // Upload de imagem se houver
      if (imageFile && produtoId) {
        imagemUrl = await uploadProdutoImagem(imageFile, produtoId);
        
        // Atualizar URL da imagem no produto
        if (imagemUrl) {
          await updateProduto(produtoId, { imagem_url: imagemUrl });
        }
      }
      
      toast({
        title: 'Sucesso',
        description: isEditing 
          ? 'Produto atualizado com sucesso' 
          : 'Produto criado com sucesso',
      });
      
      navigate('/admin/produtos');
    } catch (error) {
      toast({
        title: 'Erro',
        description: isEditing 
          ? 'Erro ao atualizar produto' 
          : 'Erro ao criar produto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? 'Editar Produto' : 'Novo Produto'}
      subtitle={isEditing ? 'Atualize os dados do produto' : 'Cadastre um novo produto'}
      actions={
        <Button variant="outline" onClick={() => navigate('/admin/produtos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      }
    >
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    {...register('nome')}
                    placeholder="Nome do produto"
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-500">{errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    {...register('descricao')}
                    placeholder="Descrição do produto"
                    rows={4}
                  />
                  {errors.descricao && (
                    <p className="text-sm text-red-500">{errors.descricao.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem">Imagem do Produto</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('imagem')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Imagem
                    </Button>
                    <Input
                      id="imagem"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="h-10 w-10 rounded overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_sp">Preço para SP (R$) *</Label>
                  <Input
                    id="preco_sp"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('preco_sp', { valueAsNumber: true })}
                  />
                  {errors.preco_sp && (
                    <p className="text-sm text-red-500">{errors.preco_sp.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_sul_sudeste">
                    Preço para Sul/Sudeste (R$) *
                    <span className="text-xs text-gray-500 ml-2">(MG, RJ, PR, RS, SC)</span>
                  </Label>
                  <Input
                    id="preco_sul_sudeste"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('preco_sul_sudeste', { valueAsNumber: true })}
                  />
                  {errors.preco_sul_sudeste && (
                    <p className="text-sm text-red-500">{errors.preco_sul_sudeste.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_outros">
                    Preço para Demais Estados (R$) *
                  </Label>
                  <Input
                    id="preco_outros"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('preco_outros', { valueAsNumber: true })}
                  />
                  {errors.preco_outros && (
                    <p className="text-sm text-red-500">{errors.preco_outros.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default ProdutoFormPage;