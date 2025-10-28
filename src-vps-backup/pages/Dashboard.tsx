import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine,
  faReceipt,
  faFileInvoice,
  faTruck,
  faBox,
  faUsers,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faArrowUp,
  faArrowDown,
  faRefresh,
  faEye,
  faShoppingCart,
  faWarehouse,
  faBell,
  faArrowTrendUp,
  faArrowTrendDown,
  faMinus
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

interface DashboardData {
  resumo: {
    totalVendas: number;
    totalOrcamentos: number;
    totalGuias: number;
    crescimentoVendas: number;
    totalClientes: number;
    totalProdutos: number;
  };
  vendas: {
    total: number;
    valor: number;
    crescimento: number;
    mesAtual: number;
    mesAnterior: number;
  };
  orcamentos: {
    total: number;
    valor: number;
    pendentes: number;
    aprovados: number;
  };
  stock: {
    totalProdutos: number;
    baixoStock: number;
    semStock: number;
    valorTotal: number;
  };
  atividades: Array<{
    id: string;
    tipo: string;
    titulo: string;
    descricao: string;
    data: string;
    status: string;
    icone: string;
  }>;
}

interface ChartData {
  mes: string;
  vendas: number;
  valor: number;
}

interface TopProduto {
  codigo: string;
  descricao: string;
  quantidade: number;
  valor: number;
}

interface Alerta {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  data: string;
  acao: string;
  prioridade: string;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topProdutos, setTopProdutos] = useState<TopProduto[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados principais
      const overviewResponse = await fetch('http://localhost:3001/api/dashboard/overview');
      const overviewData = await overviewResponse.json();
      
      if (overviewData.success) {
        setDashboardData(overviewData.data);
      }

      // Carregar dados do gráfico
      const chartResponse = await fetch('http://localhost:3001/api/dashboard/vendas-chart');
      const chartData = await chartResponse.json();
      
      if (chartData.success) {
        setChartData(chartData.data);
      }

      // Carregar top produtos
      const produtosResponse = await fetch('http://localhost:3001/api/dashboard/produtos-top');
      const produtosData = await produtosResponse.json();
      
      if (produtosData.success) {
        setTopProdutos(produtosData.data);
      }

      // Carregar alertas
      const alertasResponse = await fetch('http://localhost:3001/api/dashboard/alertas');
      const alertasData = await alertasResponse.json();
      
      if (alertasData.success) {
        setAlertas(alertasData.data);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    loadDashboardData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Formatar moeda
  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Formatar data
  const formatarData = (data: string): string => {
    return new Date(data).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter ícone por tipo
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'venda': return faReceipt;
      case 'orcamento': return faFileInvoice;
      case 'alerta': return faExclamationTriangle;
      case 'guia': return faTruck;
      default: return faCheckCircle;
    }
  };

  // Obter cor por status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  // Obter cor por prioridade
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return '#dc3545';
      case 'media': return '#ffc107';
      case 'baixa': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faRefresh} spin />
          <p>Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header do Dashboard */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>
            <FontAwesomeIcon icon={faChartLine} />
            Dashboard Executivo
          </h1>
          <p>Visão geral da empresa em tempo real</p>
        </div>
        <div className="dashboard-actions">
          <button 
            className="btn btn-primary"
            onClick={loadDashboardData}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faRefresh} />
            Atualizar
          </button>
          <div className="last-update">
            <FontAwesomeIcon icon={faClock} />
            Última atualização: {formatarData(lastUpdate.toISOString())}
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="dashboard-cards">
        <div className="dashboard-card vendas-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faReceipt} />
            <h3>Vendas</h3>
          </div>
          <div className="card-content">
            <div className="card-value">
              {formatarMoeda(dashboardData?.resumo.totalVendas || 0)}
            </div>
            <div className="card-subtitle">
              {dashboardData?.vendas.total || 0} faturas emitidas
            </div>
            <div className="card-trend">
              {(dashboardData?.vendas.crescimento || 0) >= 0 ? (
                <FontAwesomeIcon icon={faArrowUp} className="trend-up" />
              ) : (
                <FontAwesomeIcon icon={faArrowDown} className="trend-down" />
              )}
              <span className={(dashboardData?.vendas.crescimento || 0) >= 0 ? 'trend-up' : 'trend-down'}>
                {Math.abs(dashboardData?.vendas.crescimento || 0)}%
              </span>
              vs mês anterior
            </div>
          </div>
        </div>

        <div className="dashboard-card orcamentos-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faFileInvoice} />
            <h3>Orçamentos</h3>
          </div>
          <div className="card-content">
            <div className="card-value">
              {formatarMoeda(dashboardData?.resumo.totalOrcamentos || 0)}
            </div>
            <div className="card-subtitle">
              {dashboardData?.orcamentos.total || 0} orçamentos criados
            </div>
            <div className="card-details">
              <span className="pendentes">{dashboardData?.orcamentos.pendentes || 0} pendentes</span>
              <span className="aprovados">{dashboardData?.orcamentos.aprovados || 0} aprovados</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card guias-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faTruck} />
            <h3>Guias de Remessa</h3>
          </div>
          <div className="card-content">
            <div className="card-value">
              {formatarMoeda(dashboardData?.resumo.totalGuias || 0)}
            </div>
            <div className="card-subtitle">
              {dashboardData?.resumo.totalGuias || 0} guias processadas
            </div>
          </div>
        </div>

        <div className="dashboard-card stock-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faBox} />
            <h3>Stock</h3>
          </div>
          <div className="card-content">
            <div className="card-value">
              {dashboardData?.stock.totalProdutos || 0}
            </div>
            <div className="card-subtitle">
              produtos em stock
            </div>
            <div className="card-details">
              <span className="baixo-stock">{dashboardData?.stock.baixoStock || 0} baixo stock</span>
              <span className="sem-stock">{dashboardData?.stock.semStock || 0} sem stock</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card clientes-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faUsers} />
            <h3>Clientes</h3>
          </div>
          <div className="card-content">
            <div className="card-value">
              {dashboardData?.resumo.totalClientes || 0}
            </div>
            <div className="card-subtitle">
              clientes ativos
            </div>
          </div>
        </div>

        <div className="dashboard-card alertas-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faBell} />
            <h3>Alertas</h3>
          </div>
          <div className="card-content">
            <div className="card-value">
              {alertas.length}
            </div>
            <div className="card-subtitle">
              notificações ativas
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Vendas */}
      <div className="dashboard-chart">
        <div className="chart-header">
          <h3>
            <FontAwesomeIcon icon={faArrowTrendUp} />
            Evolução das Vendas (12 meses)
          </h3>
        </div>
        <div className="chart-content">
          <div className="chart-bars">
            {chartData.map((item, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${Math.max(10, (item.vendas / Math.max(...chartData.map(d => d.vendas))) * 100)}%` 
                  }}
                ></div>
                <div className="bar-label">{item.mes.split('-')[1]}</div>
                <div className="bar-value">{item.vendas}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Produtos e Atividades Recentes */}
      <div className="dashboard-bottom">
        <div className="top-produtos">
          <div className="section-header">
            <h3>
              <FontAwesomeIcon icon={faShoppingCart} />
              Top Produtos Mais Vendidos
            </h3>
          </div>
          <div className="produtos-list">
            {topProdutos.map((produto, index) => (
              <div key={index} className="produto-item">
                <div className="produto-rank">#{index + 1}</div>
                <div className="produto-info">
                  <div className="produto-codigo">{produto.codigo}</div>
                  <div className="produto-descricao">{produto.descricao}</div>
                </div>
                <div className="produto-stats">
                  <div className="produto-quantidade">{produto.quantidade} vendidos</div>
                  <div className="produto-valor">{formatarMoeda(produto.valor)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="atividades-recentes">
          <div className="section-header">
            <h3>
              <FontAwesomeIcon icon={faClock} />
              Atividades Recentes
            </h3>
          </div>
          <div className="atividades-list">
            {dashboardData?.atividades?.map((atividade) => (
              <div key={atividade.id} className="atividade-item">
                <div className="atividade-icon">
                  <FontAwesomeIcon 
                    icon={getIcon(atividade.tipo)} 
                    style={{ color: getStatusColor(atividade.status) }}
                  />
                </div>
                <div className="atividade-content">
                  <div className="atividade-titulo">{atividade.titulo}</div>
                  <div className="atividade-descricao">{atividade.descricao}</div>
                  <div className="atividade-data">{formatarData(atividade.data)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="dashboard-alertas">
          <div className="section-header">
            <h3>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              Alertas e Notificações
            </h3>
          </div>
          <div className="alertas-list">
            {alertas.map((alerta) => (
              <div 
                key={alerta.id} 
                className={`alerta-item ${alerta.tipo}`}
              >
                <div className="alerta-icon">
                  <FontAwesomeIcon 
                    icon={faExclamationTriangle}
                    style={{ color: getPrioridadeColor(alerta.prioridade) }}
                  />
                </div>
                <div className="alerta-content">
                  <div className="alerta-titulo">{alerta.titulo}</div>
                  <div className="alerta-mensagem">{alerta.mensagem}</div>
                  <div className="alerta-acoes">
                    <button className="btn btn-sm btn-primary">
                      {alerta.acao}
                    </button>
                    <span className="alerta-data">{formatarData(alerta.data)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;