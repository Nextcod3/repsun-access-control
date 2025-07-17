/**
 * Configurações globais da aplicação
 */

export const APP_CONFIG = {
  // Informações da aplicação
  APP_NAME: 'RepSUN',
  APP_DESCRIPTION: 'Sistema de Orçamentos para Representante Comercial',
  APP_VERSION: '1.0.0',
  
  // Configurações de paginação
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100]
  },
  
  // Configurações de cache
  CACHE: {
    STALE_TIME: 5 * 60 * 1000, // 5 minutos
    CACHE_TIME: 10 * 60 * 1000 // 10 minutos
  },
  
  // Configurações de upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  },
  
  // Configurações de formatação
  FORMAT: {
    DATE_FORMAT: 'dd/MM/yyyy',
    CURRENCY_LOCALE: 'pt-BR',
    CURRENCY_CODE: 'BRL'
  }
};