// =====================================================
// CONFIGURAÇÃO DA API
// =====================================================

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  
  // Faturas
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    GET: (id: number) => `/invoices/${id}`,
    UPDATE: (id: number) => `/invoices/${id}`,
    DELETE: (id: number) => `/invoices/${id}`,
    STATUS: (id: number) => `/invoices/${id}/status`,
    PAYMENTS: (id: number) => `/invoices/${id}/payments`,
    STOCK_PRODUCTS: '/invoices/stock-products',
    PROCESS_STOCK: (id: number) => `/invoices/${id}/process-stock`,
    REVERSE_STOCK: (id: number) => `/invoices/${id}/reverse-stock`,
  },
  
  // Clientes
  CLIENTS: {
    LIST: '/clients',
    CREATE: '/clients',
    GET: (id: number) => `/clients/${id}`,
    UPDATE: (id: number) => `/clients/${id}`,
    DELETE: (id: number) => `/clients/${id}`,
  },
  
  // Produtos
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    GET: (id: number) => `/products/${id}`,
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
    STOCK: (id: number) => `/products/${id}/stock`,
    LOW_STOCK: '/products/low-stock',
  },
  
  // Stock
  STOCK: {
    MOVEMENTS: '/stock/movements',
    DASHBOARD: '/stock/dashboard',
    REPORTS: {
      POSITION: '/stock/reports/position',
      MOVEMENTS: '/stock/reports/movements',
      OUT_OF_STOCK: '/stock/reports/out-of-stock',
      OBSOLETE: '/stock/reports/obsolete',
      ROTATION: '/stock/reports/rotation',
      VALUATION: '/stock/reports/valuation',
      TRENDS: '/stock/reports/trends',
    },
  },
  
  // Guias de Entrada
  GOODS_RECEIPT: {
    LIST: '/goods-receipt-notes',
    CREATE: '/goods-receipt-notes',
    GET: (id: number) => `/goods-receipt-notes/${id}`,
    UPDATE: (id: number) => `/goods-receipt-notes/${id}`,
    DELETE: (id: number) => `/goods-receipt-notes/${id}`,
    REGULARIZE: (id: number) => `/goods-receipt-notes/${id}/regularize`,
  },
  
  // Guias de Remessa
  DELIVERY_NOTES: {
    LIST: '/delivery-notes',
    CREATE: '/delivery-notes',
    GET: (id: number) => `/delivery-notes/${id}`,
    UPDATE: (id: number) => `/delivery-notes/${id}`,
    DELETE: (id: number) => `/delivery-notes/${id}`,
    PROCESS: (id: number) => `/delivery-notes/${id}/process-delivery`,
  },
  
  // Projetos
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: (id: number) => `/projects/${id}`,
    UPDATE: (id: number) => `/projects/${id}`,
    DELETE: (id: number) => `/projects/${id}`,
    STATUS: (id: number) => `/projects/${id}/status`,
    PROGRESS: (id: number) => `/projects/${id}/progress`,
    PHASES: (id: number) => `/projects/${id}/phases`,
    RESOURCES: (id: number) => `/projects/${id}/resources`,
    INVOICES: (id: number) => `/projects/${id}/invoices`,
    FINANCIAL_SUMMARY: (id: number) => `/projects/${id}/financial-summary`,
    DASHBOARD: (id: number) => `/projects/${id}/dashboard`,
    REPORTS: {
      COSTS: (id: number) => `/projects/${id}/reports/costs`,
      HOURS: '/projects/reports/hours',
      MARGIN: (id: number) => `/projects/${id}/reports/margin`,
    },
    OPPORTUNITIES: {
      LIST: '/projects/oportunidades',
      CONVERT: (id: number) => `/projects/oportunidades/${id}/converter-projeto`,
    },
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard',
    SALES_MONTHLY: '/reports/sales-monthly',
  },
  
  // Relatórios
  REPORTS: {
    SALES: '/reports/sales',
    PROJECTS: '/projects/reports',
  },
  
  // Sistema
  SYSTEM: {
    HEALTH: '/health',
    VERSION: '/version',
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão com o servidor',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Acesso negado',
  NOT_FOUND: 'Recurso não encontrado',
  SERVER_ERROR: 'Erro interno do servidor',
  VALIDATION_ERROR: 'Dados inválidos',
  TIMEOUT: 'Tempo limite excedido',
} as const;
