// =====================================================
// SERVIÇO DE API PARA USIMAMIZI
// =====================================================

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  Fatura, 
  FiltrosFaturas, 
  Cliente, 
  Produto, 
  FiltrosStock,
  StockMovement,
  GuiaEntrada,
  GuiaRemessa,
  Projeto,
  FiltrosProjetos,
  FormularioFatura,
  FormularioProduto,
  FormularioGuiaEntrada,
  DashboardStats
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTENTICAÇÃO ====================
  async login(username: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.api.post('/auth/login', { username, password });
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
  }

  // ==================== FATURAS ====================
  async getFaturas(filtros: FiltrosFaturas = {}): Promise<ApiResponse<Fatura[]>> {
    const response = await this.api.get('/invoices', { params: filtros });
    return response.data;
  }

  async getFatura(id: number): Promise<ApiResponse<Fatura>> {
    const response = await this.api.get(`/invoices/${id}`);
    return response.data;
  }

  async createFatura(fatura: FormularioFatura): Promise<ApiResponse<Fatura>> {
    const response = await this.api.post('/invoices', fatura);
    return response.data;
  }

  async updateFatura(id: number, fatura: Partial<FormularioFatura>): Promise<ApiResponse<Fatura>> {
    const response = await this.api.put(`/invoices/${id}`, fatura);
    return response.data;
  }

  async deleteFatura(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/invoices/${id}`);
    return response.data;
  }

  async updateFaturaStatus(id: number, status: string): Promise<ApiResponse<Fatura>> {
    const response = await this.api.put(`/invoices/${id}/status`, { status });
    return response.data;
  }

  async addFaturaPagamento(id: number, pagamento: any): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/invoices/${id}/payments`, pagamento);
    return response.data;
  }

  // ==================== INTEGRAÇÃO STOCK ====================
  async getStockProducts(filtros: FiltrosStock = {}): Promise<ApiResponse<Produto[]>> {
    const response = await this.api.get('/invoices/stock-products', { params: filtros });
    return response.data;
  }

  async processFaturaStock(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/invoices/${id}/process-stock`);
    return response.data;
  }

  async reverseFaturaStock(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/invoices/${id}/reverse-stock`);
    return response.data;
  }

  // ==================== CLIENTES ====================
  async getClientes(filtros: any = {}): Promise<ApiResponse<Cliente[]>> {
    const response = await this.api.get('/clients', { params: filtros });
    return response.data;
  }

  async getCliente(id: number): Promise<ApiResponse<Cliente>> {
    const response = await this.api.get(`/clients/${id}`);
    return response.data;
  }

  async createCliente(cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    const response = await this.api.post('/clients', cliente);
    return response.data;
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    const response = await this.api.put(`/clients/${id}`, cliente);
    return response.data;
  }

  async deleteCliente(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/clients/${id}`);
    return response.data;
  }

  // ==================== PRODUTOS ====================
  async getProdutos(filtros: FiltrosStock = {}): Promise<ApiResponse<Produto[]>> {
    const response = await this.api.get('/products', { params: filtros });
    return response.data;
  }

  async getProduto(id: number): Promise<ApiResponse<Produto>> {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async createProduto(produto: FormularioProduto): Promise<ApiResponse<Produto>> {
    const response = await this.api.post('/products', produto);
    return response.data;
  }

  async updateProduto(id: number, produto: Partial<FormularioProduto>): Promise<ApiResponse<Produto>> {
    const response = await this.api.put(`/products/${id}`, produto);
    return response.data;
  }

  async deleteProduto(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/products/${id}`);
    return response.data;
  }

  async updateProdutoStock(id: number, quantity: number, operation: string = 'set'): Promise<ApiResponse<Produto>> {
    const response = await this.api.patch(`/products/${id}/stock`, { quantity, operation });
    return response.data;
  }

  // ==================== STOCK ====================
  async getStockMovements(filtros: any = {}): Promise<ApiResponse<StockMovement[]>> {
    const response = await this.api.get('/stock/movements', { params: filtros });
    return response.data;
  }

  async createStockMovement(movement: Partial<StockMovement>): Promise<ApiResponse<StockMovement>> {
    const response = await this.api.post('/stock/movements', movement);
    return response.data;
  }

  async getStockDashboard(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/stock/dashboard');
    return response.data;
  }

  // ==================== GUIAS DE ENTRADA ====================
  async getGuiasEntrada(filtros: any = {}): Promise<ApiResponse<GuiaEntrada[]>> {
    const response = await this.api.get('/goods-receipt-notes', { params: filtros });
    return response.data;
  }

  async getGuiaEntrada(id: number): Promise<ApiResponse<GuiaEntrada>> {
    const response = await this.api.get(`/goods-receipt-notes/${id}`);
    return response.data;
  }

  async createGuiaEntrada(guia: FormularioGuiaEntrada): Promise<ApiResponse<GuiaEntrada>> {
    const response = await this.api.post('/goods-receipt-notes', guia);
    return response.data;
  }

  async updateGuiaEntrada(id: number, guia: Partial<FormularioGuiaEntrada>): Promise<ApiResponse<GuiaEntrada>> {
    const response = await this.api.put(`/goods-receipt-notes/${id}`, guia);
    return response.data;
  }

  async regularizeGuiaEntrada(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/goods-receipt-notes/${id}/regularize`);
    return response.data;
  }

  // ==================== GUIAS DE REMESSA ====================
  async getGuiasRemessa(filtros: any = {}): Promise<ApiResponse<GuiaRemessa[]>> {
    const response = await this.api.get('/delivery-notes', { params: filtros });
    return response.data;
  }

  async getGuiaRemessa(id: number): Promise<ApiResponse<GuiaRemessa>> {
    const response = await this.api.get(`/delivery-notes/${id}`);
    return response.data;
  }

  async createGuiaRemessa(guia: Partial<GuiaRemessa>): Promise<ApiResponse<GuiaRemessa>> {
    const response = await this.api.post('/delivery-notes', guia);
    return response.data;
  }

  async updateGuiaRemessa(id: number, guia: Partial<GuiaRemessa>): Promise<ApiResponse<GuiaRemessa>> {
    const response = await this.api.put(`/delivery-notes/${id}`, guia);
    return response.data;
  }

  async processGuiaRemessa(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/delivery-notes/${id}/process-delivery`);
    return response.data;
  }

  // ==================== PROJETOS ====================
  async getProjetos(filtros: FiltrosProjetos = {}): Promise<ApiResponse<Projeto[]>> {
    const response = await this.api.get('/projects', { params: filtros });
    return response.data;
  }

  async getProjeto(id: number): Promise<ApiResponse<Projeto>> {
    const response = await this.api.get(`/projects/${id}`);
    return response.data;
  }

  async createProjeto(projeto: Partial<Projeto>): Promise<ApiResponse<Projeto>> {
    const response = await this.api.post('/projects', projeto);
    return response.data;
  }

  async updateProjeto(id: number, projeto: Partial<Projeto>): Promise<ApiResponse<Projeto>> {
    const response = await this.api.put(`/projects/${id}`, projeto);
    return response.data;
  }

  async deleteProjeto(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/projects/${id}`);
    return response.data;
  }

  async updateProjetoStatus(id: number, status: string): Promise<ApiResponse<Projeto>> {
    const response = await this.api.put(`/projects/${id}/status`, { status });
    return response.data;
  }

  // ==================== DASHBOARD ====================
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await this.api.get('/dashboard');
    return response.data;
  }

  async getVendasMensais(): Promise<ApiResponse<any[]>> {
    const response = await this.api.get('/reports/sales-monthly');
    return response.data;
  }

  // ==================== RELATÓRIOS ====================
  async getRelatorioVendas(filtros: any = {}): Promise<ApiResponse<any>> {
    const response = await this.api.get('/reports/sales', { params: filtros });
    return response.data;
  }

  async getRelatorioStock(filtros: any = {}): Promise<ApiResponse<any>> {
    const response = await this.api.get('/stock/reports/position', { params: filtros });
    return response.data;
  }

  async getRelatorioProjetos(filtros: any = {}): Promise<ApiResponse<any>> {
    const response = await this.api.get('/projects/reports', { params: filtros });
    return response.data;
  }

  // ==================== UTILITÁRIOS ====================
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
}

// Instância singleton do serviço de API
export const apiService = new ApiService();
export default apiService;
