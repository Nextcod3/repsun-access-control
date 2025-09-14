import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type: 'orcamento_created' | 'orcamento_status_changed' | 'client_added' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

/**
 * Cria uma nova notificação
 */
export const createNotification = async (
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<Notification> => {
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar notificação:', error);
    throw new Error('Erro ao criar notificação');
  }

  return notification;
};

/**
 * Busca todas as notificações do usuário
 */
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar notificações:', error);
    throw new Error('Erro ao buscar notificações');
  }

  return data || [];
};

/**
 * Marca uma notificação como lida
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw new Error('Erro ao marcar notificação como lida');
  }
};

/**
 * Marca todas as notificações como lidas
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    throw new Error('Erro ao marcar todas as notificações como lidas');
  }
};

/**
 * Conta notificações não lidas
 */
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return 0;
  }

  return count || 0;
};

/**
 * Envia e-mail através da edge function
 */
export const sendEmail = async (
  to: string,
  type: 'orcamento_enviado' | 'orcamento_aprovado' | 'orcamento_rejeitado' | 'custom',
  data?: Record<string, any>
): Promise<void> => {
  const { error } = await supabase.functions.invoke('send-email', {
    body: {
      to,
      type,
      data
    }
  });

  if (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Erro ao enviar e-mail');
  }
};

/**
 * Notifica sobre mudança de status do orçamento
 */
export const notifyOrcamentoStatusChange = async (
  userId: string,
  orcamentoId: string,
  numeroOrcamento: string,
  novoStatus: string,
  clienteEmail?: string,
  clienteNome?: string,
  valorTotal?: number
): Promise<void> => {
  // Criar notificação no sistema
  const statusMessages = {
    rascunho: 'foi salvo como rascunho',
    enviado: 'foi enviado para o cliente',
    aprovado: 'foi aprovado pelo cliente',
    rejeitado: 'foi rejeitado pelo cliente',
    cancelado: 'foi cancelado'
  };

  const message = statusMessages[novoStatus as keyof typeof statusMessages] || 'teve seu status alterado';

  await createNotification(
    userId,
    'orcamento_status_changed',
    `Orçamento #${numeroOrcamento}`,
    `O orçamento #${numeroOrcamento} ${message}`,
    {
      orcamentoId,
      status: novoStatus
    }
  );

  // Enviar e-mail para o cliente se aplicável
  if (clienteEmail && clienteNome && (novoStatus === 'enviado' || novoStatus === 'aprovado' || novoStatus === 'rejeitado')) {
    const valorFormatado = valorTotal ? new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valorTotal) : 'N/A';

    await sendEmail(clienteEmail, novoStatus as any, {
      clienteNome,
      orcamentoNumero: numeroOrcamento,
      valorTotal: valorFormatado
    });
  }
};

/**
 * Notifica sobre criação de orçamento
 */
export const notifyOrcamentoCriado = async (
  userId: string,
  orcamentoId: string,
  numeroOrcamento: string
): Promise<void> => {
  await createNotification(
    userId,
    'orcamento_created',
    'Novo Orçamento Criado',
    `O orçamento #${numeroOrcamento} foi criado com sucesso`,
    {
      orcamentoId
    }
  );
};

/**
 * Notifica sobre criação de cliente
 */
export const notifyClienteAdicionado = async (
  userId: string,
  clienteId: string,
  clienteNome: string
): Promise<void> => {
  await createNotification(
    userId,
    'client_added',
    'Novo Cliente Cadastrado',
    `O cliente ${clienteNome} foi adicionado com sucesso`,
    {
      clienteId
    }
  );
};