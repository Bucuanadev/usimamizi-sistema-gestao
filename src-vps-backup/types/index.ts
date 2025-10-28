// =====================================================
// TIPOS TYPESCRIPT PARA USIMAMIZI
// =====================================================

// ==================== AUTENTICAÇÃO ====================
export interface User {
  id: number;
  username: string;
  email: string;
  empresa_id: number;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// ==================== EMPRESA ====================
export interface Empresa {
  id: number;
  nome: string;
  nuit: string;
  morada: string;
  telefone: string;
  email: string;
  dadosBancarios: DadosBancarios;
}

export interface DadosBancarios {
  banco: string;
  conta: string;
  nib: string;
  empresa: string;
}

// ==================== CLIENTES ====================
export interface Cliente {
  id: number;
  nome: string;
  nuit: string;
  morada: string;
  telefone: string;
  email: string;
  tipo: 'individual' | 'empresa';
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

// ==================== FORNECEDORES ====================
export interface Fornecedor {
  id: number;
  nome: string;
  nuit: string;
  morada: string;
  telefone: string;
  email: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

// ==================== PRODUTOS ====================
export interface Produto {
  id: number;
  code: string;
  description: string;
  category: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  min_stock: number;
  max_stock: number;
  current_stock: number;
  location: string;
  supplier_id?: number;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

// ==================== FATURAS ====================
export interface Fatura {
  id: number;
  invoice_number: string;
  series: string;
  client_id: number;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  currency: string;
  exchange_rate: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled' | 'processed';
  notes: string;
  internal_notes: string;
  created_at: string;
  updated_at: string;
  items: FaturaItem[];
  payments: FaturaPagamento[];
  cliente?: Cliente;
}

export interface FaturaItem {
  id: number;
  invoice_id: number;
  product_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
  produto?: Produto;
}

export interface FaturaPagamento {
  id: number;
  invoice_id: number;
  payment_date: string;
  amount: number;
  payment_method: string;
  payment_reference: string;
  notes: string;
  created_at: string;
}

// ==================== STOCK ====================
export interface StockMovement {
  id: number;
  product_id: number;
  movement_type: 'entrada' | 'saida';
  quantity: number;
  unit_price: number;
  total_value: number;
  document_number: string;
  document_type: string;
  origin_destination: string;
  location: string;
  batch_number?: string;
  serial_number?: string;
  reason: string;
  movement_date: string;
  created_at: string;
  produto?: Produto;
}

// ==================== GUIAS DE ENTRADA ====================
export interface GuiaEntrada {
  id: number;
  grn_number: string;
  series: string;
  supplier_id: number;
  issue_date: string;
  expected_date: string;
  received_date?: string;
  warehouse: string;
  reference_number: string;
  delivery_note: string;
  status: 'draft' | 'received' | 'completed';
  total_items: number;
  total_quantity: number;
  total_value: number;
  currency: string;
  exchange_rate: number;
  notes: string;
  internal_notes: string;
  received_by: string;
  checked_by: string;
  created_at: string;
  updated_at: string;
  items: GuiaEntradaItem[];
  fornecedor?: Fornecedor;
}

export interface GuiaEntradaItem {
  id: number;
  grn_id: number;
  product_id?: number;
  description: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_damaged: number;
  unit_price: number;
  total_price: number;
  batch_number?: string;
  serial_number?: string;
  expiry_date?: string;
  location: string;
  condition_status: 'good' | 'damaged' | 'expired';
  notes: string;
  produto?: Produto;
}

// ==================== GUIAS DE REMESSA ====================
export interface GuiaRemessa {
  id: number;
  gr_number: string;
  series: string;
  client_id: number;
  issue_date: string;
  delivery_date?: string;
  warehouse: string;
  reference_number: string;
  status: 'draft' | 'prepared' | 'delivered' | 'cancelled';
  total_items: number;
  total_quantity: number;
  total_weight: number;
  driver_name: string;
  vehicle_plate: string;
  notes: string;
  internal_notes: string;
  created_at: string;
  updated_at: string;
  items: GuiaRemessaItem[];
  cliente?: Cliente;
}

export interface GuiaRemessaItem {
  id: number;
  gr_id: number;
  product_id: number;
  description: string;
  quantity: number;
  unit: string;
  weight: number;
  location: string;
  notes: string;
  produto: Produto;
}

// ==================== PROJETOS ====================
export interface Projeto {
  id: number;
  code: string;
  title: string;
  description: string;
  client_id: number;
  manager_id: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'approved' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  budget: number;
  actual_cost: number;
  margin: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  phases: ProjetoFase[];
  resources: ProjetoRecurso[];
  cliente?: Cliente;
}

export interface ProjetoFase {
  id: number;
  project_id: number;
  parent_phase_id?: number;
  name: string;
  description: string;
  order: number;
  planned_hours: number;
  actual_hours: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface ProjetoRecurso {
  id: number;
  project_id: number;
  phase_id?: number;
  user_id: number;
  role: string;
  allocation_percentage: number;
  hourly_rate: number;
  cost_rate: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

// ==================== TIMESHEETS ====================
export interface Timesheet {
  id: number;
  project_id: number;
  user_id: number;
  phase_id?: number;
  date: string;
  hours: number;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================== ORÇAMENTOS ====================
export interface Orcamento {
  id: number;
  project_id: number;
  version: number;
  budget_lines: any; // JSONB
  total_amount: number;
  currency: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================== API RESPONSES ====================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== FILTROS ====================
export interface FiltrosBase {
  page?: number;
  limit?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  empresa_id?: number;
}

export interface FiltrosFaturas extends FiltrosBase {
  status?: string;
  client_id?: number;
}

export interface FiltrosStock extends FiltrosBase {
  category?: string;
  min_stock?: number;
  status?: string;
}

export interface FiltrosProjetos extends FiltrosBase {
  status?: string;
  client_id?: number;
  manager_id?: number;
}

// ==================== FORMULÁRIOS ====================
export interface FormularioFatura {
  client_id: number;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  currency: string;
  exchange_rate: number;
  notes: string;
  internal_notes: string;
  items: Omit<FaturaItem, 'id' | 'invoice_id'>[];
}

export interface FormularioProduto {
  code: string;
  description: string;
  category: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  min_stock: number;
  max_stock: number;
  location: string;
  supplier_id?: number;
}

export interface FormularioGuiaEntrada {
  series: string;
  supplier_id: number;
  issue_date: string;
  expected_date: string;
  warehouse: string;
  reference_number: string;
  delivery_note: string;
  notes: string;
  internal_notes: string;
  items: Omit<GuiaEntradaItem, 'id' | 'grn_id'>[];
}

// ==================== DASHBOARD ====================
export interface DashboardStats {
  total_faturas: number;
  total_vendas: number;
  total_clientes: number;
  total_produtos: number;
  faturas_pendentes: number;
  stock_baixo: number;
  projetos_ativos: number;
  recebimentos_hoje: number;
}

export interface VendasMensais {
  month: string;
  total_invoices: number;
  total_amount: number;
  total_paid: number;
  total_outstanding: number;
}

// ==================== NOTIFICAÇÕES ====================
export interface Notificacao {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: number;
}
