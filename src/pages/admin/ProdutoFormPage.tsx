import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import {
  getProdutoById,
  createProduto,
  updateProduto
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Configuração do formulário com validação Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch
  } = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      imagem_url: '',
      preco_sp: 0,
      preco_sul_sudeste: 0,
      preco_outros: 0,
    },
  });

  // Observar mudanças na URL da imagem
  const imagemUrl = watch('imagem_url');
  
  useEffect(() => {
    if (imagemUrl) {
      setImagePreview(imagemUrl);
    }
  }, [imagemUrl]);

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
          setValue('imagem_url', produto.imagem_url || '');
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

  // Verificar URL da imagem
  const verificarImagem = () => {
    const url = imagemUrl;
    if (!url) return;
    
    // Verificar se a URL é válida
    try {
      new URL(url);
      setImagePreview(url);
    } catch (e) {
      toast({
        title: 'URL inválida',
        description: 'Por favor, insira uma URL de imagem válida',
        variant: 'destructive',
      });
    }
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

      // Criar ou atualizar produto
      if (isEditing && id) {
        await updateProduto(id, {
          nome: data.nome,
          descricao: data.descricao,
          imagem_url: data.imagem_url || null,
          preco_sp: data.preco_sp,
          preco_sul_sudeste: data.preco_sul_sudeste,
          preco_outros: data.preco_outros,
        });
      } else {
        try {
          console.log('Criando produto com usuário:', user);
          await createProduto({
            nome: data.nome,
            descricao: data.descricao,
            imagem_url: data.imagem_url || null,
            usuario_id: user.id,
            preco_sp: data.preco_sp,
            preco_sul_sudeste: data.preco_sul_sudeste,
            preco_outros: data.preco_outros,
          });
          console.log('Produto criado com sucesso');
        } catch (createError: any) {
          console.error('Erro detalhado ao criar produto:', createError);
          toast({
            title: 'Erro',
            description: createError.message || 'Erro ao criar produto',
            variant: 'destructive',
          });
          setLoading(false);
          return; // Interromper o fluxo se houver erro na criação
        }
      }

      toast({
        title: 'Sucesso',
        description: isEditing
          ? 'Produto atualizado com sucesso'
          : 'Produto criado com sucesso',
      });

      navigate('/admin/produtos');
    } catch (error: any) {
      console.error('Erro ao processar formulário:', error);
      toast({
        title: 'Erro',
        description: error.message || (isEditing
          ? 'Erro ao atualizar produto'
          : 'Erro ao criar produto'),
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
                  <Label htmlFor="imagem_url">URL da Imagem do Produto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imagem_url"
                      {...register('imagem_url')}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={verificarImagem}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Cole a URL de uma imagem da web (ex: https://exemplo.com/imagem.jpg)
                  </p>
                  {errors.imagem_url && (
                    <p className="text-sm text-red-500">{errors.imagem_url.message}</p>
                  )}
                  {imagePreview && (
                    <div className="mt-2 border rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 object-contain"
                        onError={() => {
                          setImagePreview(null);
                          toast({
                            title: 'Erro',
                            description: 'Não foi possível carregar a imagem. Verifique a URL.',
                            variant: 'destructive',
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_sp">Preço para SP (R$) *</Label>
                  <Controller
                    name="preco_sp"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="preco_sp"
                        type="text"
                        placeholder="0,00"
                        value={field.value.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\./g, '').replace(',', '.');
                          const numericValue = parseFloat(value) || 0;
                          field.onChange(numericValue);
                        }}
                      />
                    )}
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
                  <Controller
                    name="preco_sul_sudeste"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="preco_sul_sudeste"
                        type="text"
                        placeholder="0,00"
                        value={field.value.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\./g, '').replace(',', '.');
                          const numericValue = parseFloat(value) || 0;
                          field.onChange(numericValue);
                        }}
                      />
                    )}
                  />
                  {errors.preco_sul_sudeste && (
                    <p className="text-sm text-red-500">{errors.preco_sul_sudeste.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_outros">
                    Preço para Demais Estados (R$) *
                  </Label>
                  <Controller
                    name="preco_outros"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="preco_outros"
                        type="text"
                        placeholder="0,00"
                        value={field.value.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\./g, '').replace(',', '.');
                          const numericValue = parseFloat(value) || 0;
                          field.onChange(numericValue);
                        }}
                      />
                    )}
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