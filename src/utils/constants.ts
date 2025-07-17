/**
 * Constantes utilizadas no sistema
 */

// Tabelas do Supabase
export const TABLES = {
  USERS: 'users',
  CLIENTES: 'clientes',
  PRODUTOS: 'produtos',
  ORCAMENTOS: 'orcamentos',
  ITENS_ORCAMENTO: 'itens_orcamento',
  CONDICOES_PAGAMENTO: 'condicoes_pagamento',
  OPCOES_PAGAMENTO: 'opcoes_pagamento',
  ORCAMENTOS_PDF: 'orcamentos_pdf'
};

// Status de orçamento
export const ORCAMENTO_STATUS = {
  RASCUNHO: 'rascunho',
  ENVIADO: 'enviado',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado',
  CANCELADO: 'cancelado'
};

// Métodos de pagamento
export const METODO_PAGAMENTO = {
  CARTAO: 'cartao',
  BOLETO: 'boleto',
  PIX: 'pix'
};

// Perfis de usuário
export const USER_PROFILE = {
  ADMIN: 'admin',
  USUARIO: 'usuario'
};

// Regiões para preços
export const REGIOES = {
  SP: 'SP',
  SUL_SUDESTE: ['MG', 'RJ', 'PR', 'RS', 'SC'],
  OUTROS: 'outros'
};

// Mensagens de erro
export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Email ou senha incorretos',
  AGUARDANDO_APROVACAO: 'Aguardando aprovação do administrador',
  EMAIL_JA_CADASTRADO: 'Este email já está cadastrado',
  DOCUMENTO_JA_CADASTRADO: 'Já existe um cliente com este documento',
  ERRO_INTERNO: 'Erro interno. Tente novamente.',
  ERRO_CARREGAR_DADOS: 'Não foi possível carregar os dados',
  ERRO_SALVAR: 'Não foi possível salvar os dados',
  ERRO_EXCLUIR: 'Não foi possível excluir o registro',
  ERRO_GERAR_PDF: 'Não foi possível gerar o PDF',
  ERRO_COMPARTILHAR: 'Não foi possível compartilhar o orçamento'
};

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  CADASTRO_SUCESSO: 'Cadastro realizado com sucesso!',
  CADASTRO_AGUARDANDO: 'Cadastro realizado! Aguarde aprovação do administrador.',
  DADOS_SALVOS: 'Dados salvos com sucesso!',
  REGISTRO_EXCLUIDO: 'Registro excluído com sucesso!',
  PDF_GERADO: 'PDF gerado com sucesso!',
  LINK_COPIADO: 'Link copiado para a área de transferência'
};

// Estados brasileiros
export const ESTADOS_BRASILEIROS = [
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