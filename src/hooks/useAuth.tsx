
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { verificarCredenciais, createUsuario } from '@/services/usuarioService';
import type { Usuario } from '@/services/usuarioService';

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
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
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
      
      const { valido, usuario } = await verificarCredenciais(email, password);
      
      if (!valido || !usuario) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      // Verificar se o usuário está aprovado (exceto admin)
      if (usuario.perfil !== 'admin' && !usuario.status) {
        return { success: false, message: 'Aguardando aprovação do administrador.' };
      }

      const userToStore: User = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        status: usuario.status
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
      
      try {
        await createUsuario(nome, email, password, 'usuario', false);
        return { success: true, message: 'Cadastro realizado! Aguarde aprovação do administrador.' };
      } catch (error: any) {
        if (error.message === 'Este email já está cadastrado') {
          return { success: false, message: 'Este email já está cadastrado' };
        }
        throw error;
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    // Implementação futura: enviar email com link para redefinir senha
    return { 
      success: true, 
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' 
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('repsun_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
