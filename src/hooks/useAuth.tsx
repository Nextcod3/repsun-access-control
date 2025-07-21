
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface User {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'usuario';
  status: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  register: (nome: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loading: boolean;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados do usuário a partir da sessão
  const fetchUserData = async (session: Session) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        // Usar dados básicos do auth
        return {
          id: session.user.id,
          nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          perfil: session.user.user_metadata?.perfil || 'usuario',
          status: true
        };
      }
      
      return userData as User;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  // Inicializar autenticação e escutar mudanças de sessão
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Verificar sessão atual
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        const userData = await fetchUserData(currentSession);
        setUser(userData);
      }
      
      // Configurar listener para mudanças de autenticação
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession);
          
          if (event === 'SIGNED_IN' && newSession) {
            const userData = await fetchUserData(newSession);
            setUser(userData);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );
      
      setLoading(false);
      
      // Limpar subscription quando o componente for desmontado
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);

  // Atualizar dados do usuário
  const refreshUser = async () => {
    if (!session) return;
    const userData = await fetchUserData(session);
    setUser(userData);
  };

  // Login com Supabase Auth
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, message: error.message || 'Email ou senha incorretos' };
      }
      
      if (!data.session) {
        return { success: false, message: 'Erro de autenticação desconhecido' };
      }
      
      // Verificar status do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        console.error('Erro ao verificar status do usuário:', userError);
      } else if (userData.perfil !== 'admin' && !userData.status) {
        // Fazer logout se não estiver aprovado
        await supabase.auth.signOut();
        return { success: false, message: 'Aguardando aprovação do administrador.' };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  // Registro com Supabase Auth
  const register = async (nome: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      // Registrar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            perfil: 'usuario'
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, message: 'Este email já está cadastrado' };
        }
        throw error;
      }
      
      // Inserir na tabela users com status false (aguardando aprovação)
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            nome,
            email,
            perfil: 'usuario',
            status: false,
            senha_hash: '' // Não usado para Supabase Auth, mas requerido pelo schema
          });
        
        if (insertError) {
          console.error('Erro ao inserir usuário na tabela users:', insertError);
        }
      }
      
      // Fazer logout após registro (usuário precisa ser aprovado)
      await supabase.auth.signOut();
      
      return { success: true, message: 'Cadastro realizado! Aguarde aprovação do administrador.' };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return { success: false, message: error.message || 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  // Recuperação de senha
  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) {
        console.error('Erro ao enviar email de recuperação:', error);
        // Não informar ao usuário se o email existe ou não (segurança)
        return { 
          success: true, 
          message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' 
        };
      }
      
      return { 
        success: true, 
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' 
      };
    } catch (error) {
      console.error('Erro ao processar recuperação de senha:', error);
      return { 
        success: true, 
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' 
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      logout, 
      register, 
      loading, 
      forgotPassword,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
