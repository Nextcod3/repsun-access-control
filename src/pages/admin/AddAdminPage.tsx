import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import * as bcrypt from 'bcryptjs';

/**
 * Página para adicionar um usuário administrador
 * Esta página deve ser removida após o uso
 */
const AddAdminPage: React.FC = () => {
  const [nome, setNome] = useState('Administrador');
  const [email, setEmail] = useState('admin@repsun.com');
  const [senha, setSenha] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Verificar se o usuário já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Erro ao verificar usuário existente: ${checkError.message}`);
      }

      if (existingUser) {
        setMessage({ type: 'error', text: 'Este email já está cadastrado' });
        return;
      }

      // Gerar hash da senha
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      // Inserir usuário administrador
      const { data, error } = await supabase
        .from('users')
        .insert({
          nome,
          email,
          senha_hash: senhaHash,
          perfil: 'admin',
          status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar usuário administrador: ${error.message}`);
      }

      setMessage({ 
        type: 'success', 
        text: `Usuário administrador criado com sucesso! ID: ${data.id}` 
      });
    } catch (error: any) {
      console.error('Erro:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Adicionar Usuário Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`p-4 mb-4 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Administrador'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAdminPage;