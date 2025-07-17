
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as bcrypt from 'bcryptjs';

interface User {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'usuario';
  status: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (nome: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('repsun_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      // Buscar usuário no banco de dados
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !userData) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, userData.senha_hash);
      
      if (!isPasswordValid) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      // Verificar se o usuário está aprovado (exceto admin)
      if (userData.perfil !== 'admin' && !userData.status) {
        return { success: false, message: 'Aguardando aprovação do administrador.' };
      }

      const userToStore: User = {
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        perfil: userData.perfil,
        status: userData.status
      };

      setUser(userToStore);
      localStorage.setItem('repsun_user', JSON.stringify(userToStore));
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      // Verificar se o email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, message: 'Este email já está cadastrado' };
      }

      // Criptografar senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Inserir usuário no banco
      const { error } = await supabase
        .from('users')
        .insert({
          nome,
          email,
          senha_hash: hashedPassword,
          perfil: 'usuario',
          status: false
        });

      if (error) {
        console.error('Erro ao cadastrar:', error);
        return { success: false, message: 'Erro ao cadastrar usuário' };
      }

      return { success: true, message: 'Cadastro realizado! Aguarde aprovação do administrador.' };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('repsun_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
