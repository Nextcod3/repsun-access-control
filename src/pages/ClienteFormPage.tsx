import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  LogOut, 
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react';
import { 
  getClienteById, 
  createCliente, 
  updateCliente, 
  Cliente 
} from '@/services/clienteService';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ESTADOS_BRASILEIROS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

const ClienteFormPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    telefone: '',
    email: '',
    documento: '',
    endereco: '',
    uf: '',
    usuario_id: user?.id || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) {
      fetchCliente();
    }
  }, [id]);

  const fetchCliente = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const cliente = await getClienteById(id);
      if (cliente) {
        setFormData({
          ...cliente,
          usuario_id: user?.id || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, uf: value }));
    
    // Clear error when field is edited
    if (errors.uf) {
      setErrors(prev => ({ ...prev, uf: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.telefone?.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (formData.documento) {
      const numericDoc = formData.documento.replace(/\D/g, '');
      
      // Validate CPF (11 digits)
      if (numericDoc.length === 11) {
        // Simple validation - in a real app, use a proper CPF validation algorithm
        if (!/^\d{11}$/.test(numericDoc)) {
          newErrors.documento = 'CPF inválido';
        }
      } 
      // Validate CNPJ (14 digits)
      else if (numericDoc.length === 14) {
        // Simple validation - in a real app, use a proper CNPJ validation algorithm
        if (!/^\d{14}$/.test(numericDoc)) {
          newErrors.documento = 'CNPJ inválido';
        }
      } 
      // Invalid length
      else if (numericDoc.length > 0) {
        newErrors.documento = 'Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)';
      }
    }
    
    if (!formData.uf) {
      newErrors.uf = 'Estado é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format document to remove non-numeric characters
      const formattedData = {
        ...formData,
        documento: formData.documento ? formData.documento.replace(/\D/g, '') : null
      };
      
      if (isEditMode && id) {
        await updateCliente(id, formattedData);
        toast({
          title: "Sucesso",
          description: "Cliente atualizado com sucesso"
        });
      } else {
        await createCliente(formattedData as Omit<Cliente, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: "Sucesso",
          description: "Cliente cadastrado com sucesso"
        });
      }
      
      navigate('/clientes');
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      
      if (error.message === 'Já existe um cliente com este documento') {
        setErrors(prev => ({ ...prev, documento: 'Já existe um cliente com este documento' }));
      } else {
        toast({
          title: "Erro",
          description: `Não foi possível ${isEditMode ? 'atualizar' : 'cadastrar'} o cliente`,
          variant: "destructive"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDocument = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length <= 11) {
      // CPF: 000.000.000-00
      return numericValue
        .replace(/^(\d{3})/, '$1.')
        .replace(/^(\d{3})\.(\d{3})/, '$1.$2.')
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '$1.$2.$3-')
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2}).*/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numericValue
        .replace(/^(\d{2})/, '$1.')
        .replace(/^(\d{2})\.(\d{3})/, '$1.$2.')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})/, '$1.$2.$3/')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})/, '$1.$2.$3/$4-')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})-(\d{2}).*/, '$1.$2.$3/$4-$5');
    }
  };

  const formatPhone = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return numericValue
        .replace(/^(\d{2})/, '($1) ')
        .replace(/^(\(\d{2}\))[ ](\d{4})/, '$1 $2-')
        .replace(/^(\(\d{2}\))[ ](\d{4})-(\d{4}).*/, '$1 $2-$3');
    } else {
      // Celular: (00) 00000-0000
      return numericValue
        .replace(/^(\d{2})/, '($1) ')
        .replace(/^(\(\d{2}\))[ ](\d{5})/, '$1 $2-')
        .replace(/^(\(\d{2}\))[ ](\d{5})-(\d{4}).*/, '$1 $2-$3');
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatDocument(value);
    setFormData(prev => ({ ...prev, documento: formattedValue }));
    
    // Clear error when field is edited
    if (errors.documento) {
      setErrors(prev => ({ ...prev, documento: '' }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatPhone(value);
    setFormData(prev => ({ ...prev, telefone: formattedValue }));
    
    // Clear error when field is edited
    if (errors.telefone) {
      setErrors(prev => ({ ...prev, telefone: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p>Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center mb-6">
          <Link to="/clientes" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <p className="text-gray-600">
              {isEditMode ? 'Atualize os dados do cliente' : 'Cadastre um novo cliente'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Editar Cliente' : 'Dados do Cliente'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className={errors.nome ? 'text-red-500' : ''}>
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome || ''}
                    onChange={handleChange}
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento" className={errors.documento ? 'text-red-500' : ''}>
                    CPF/CNPJ
                  </Label>
                  <Input
                    id="documento"
                    name="documento"
                    value={formData.documento || ''}
                    onChange={handleDocumentChange}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    className={errors.documento ? 'border-red-500' : ''}
                  />
                  {errors.documento && <p className="text-red-500 text-sm">{errors.documento}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className={errors.telefone ? 'text-red-500' : ''}>
                    Telefone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone || ''}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    className={errors.telefone ? 'border-red-500' : ''}
                  />
                  {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={errors.email ? 'text-red-500' : ''}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uf" className={errors.uf ? 'text-red-500' : ''}>
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.uf || ''} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className={errors.uf ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASILEIROS.map(estado => (
                        <SelectItem key={estado.sigla} value={estado.sigla}>
                          {estado.nome} ({estado.sigla})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.uf && <p className="text-red-500 text-sm">{errors.uf}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">
                    Endereço
                  </Label>
                  <Textarea
                    id="endereco"
                    name="endereco"
                    value={formData.endereco || ''}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>

              <CardFooter className="flex justify-between px-0 pb-0">
                <Link to="/clientes">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Atualizando...' : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditMode ? 'Atualizar' : 'Salvar'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClienteFormPage;