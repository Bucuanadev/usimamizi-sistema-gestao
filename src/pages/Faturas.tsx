// =====================================================
// PÁGINA DE FATURAS
// =====================================================

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faEdit, 
  faTrash, 
  faEye,
  faFileInvoice,
  faWarehouse,
  faFilter,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { Fatura, FiltrosFaturas } from '../types';
import apiService from '../services/api';
import './Faturas.css';

const Faturas: React.FC = () => {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosFaturas>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    client_id: undefined
  });
  const [showFiltros, setShowFiltros] = useState(false);

  useEffect(() => {
    loadFaturas();
  }, [filtros]);

  const loadFaturas = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFaturas(filtros);
      if (response.success && response.data) {
        setFaturas(response.data);
      } else {
        setError('Erro ao carregar faturas');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao carregar faturas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFiltros(prev => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFiltros(prev => ({ ...prev, status, page: 1 }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', class: 'status-draft' },
      sent: { label: 'Enviada', class: 'status-sent' },
      paid: { label: 'Paga', class: 'status-paid' },
      cancelled: { label: 'Cancelada', class: 'status-cancelled' },
      processed: { label: 'Processada', class: 'status-processed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-MZ');
  };

  if (loading) {
    return (
      <div className="faturas-loading">
        <div className="loading-spinner"></div>
        <p>Carregando faturas...</p>
      </div>
    );
  }

  return (
    <div className="faturas">
      <div className="faturas-header">
        <div className="header-title">
          <h1>Faturas</h1>
          <p>Gestão de faturas e faturação</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => {/* TODO: Nova fatura */}}>
            <FontAwesomeIcon icon={faPlus} />
            Nova Fatura
          </button>
        </div>
      </div>

      <div className="faturas-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Pesquisar faturas..."
            value={filtros.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <button 
          className="btn btn-secondary"
          onClick={() => setShowFiltros(!showFiltros)}
        >
          <FontAwesomeIcon icon={faFilter} />
          Filtros
        </button>

        <button className="btn btn-outline">
          <FontAwesomeIcon icon={faDownload} />
          Exportar
        </button>
      </div>

      {showFiltros && (
        <div className="filtros-panel">
          <div className="filtro-group">
            <label>Status:</label>
            <select 
              value={filtros.status || ''} 
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="sent">Enviada</option>
              <option value="paid">Paga</option>
              <option value="cancelled">Cancelada</option>
              <option value="processed">Processada</option>
            </select>
          </div>
          
          <div className="filtro-group">
            <label>Data Início:</label>
            <input
              type="date"
              value={filtros.date_from || ''}
              onChange={(e) => setFiltros(prev => ({ ...prev, date_from: e.target.value, page: 1 }))}
            />
          </div>
          
          <div className="filtro-group">
            <label>Data Fim:</label>
            <input
              type="date"
              value={filtros.date_to || ''}
              onChange={(e) => setFiltros(prev => ({ ...prev, date_to: e.target.value, page: 1 }))}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faFileInvoice} />
          <p>{error}</p>
          <button onClick={loadFaturas} className="retry-btn">
            Tentar Novamente
          </button>
        </div>
      )}

      <div className="faturas-content">
        <div className="faturas-table">
          <div className="table-header">
            <div className="col-numero">Número</div>
            <div className="col-cliente">Cliente</div>
            <div className="col-data">Data</div>
            <div className="col-valor">Valor</div>
            <div className="col-status">Status</div>
            <div className="col-acoes">Ações</div>
          </div>
          
          <div className="table-body">
            {faturas.length === 0 ? (
              <div className="empty-state">
                <FontAwesomeIcon icon={faFileInvoice} />
                <h3>Nenhuma fatura encontrada</h3>
                <p>Crie sua primeira fatura para começar</p>
              </div>
            ) : (
              faturas.map((fatura) => (
                <div key={fatura.id} className="table-row">
                  <div className="col-numero">
                    <strong>{fatura.invoice_number}</strong>
                    <small>{fatura.series}</small>
                  </div>
                  <div className="col-cliente">
                    <div className="cliente-info">
                      <strong>{fatura.cliente?.nome || 'Cliente não encontrado'}</strong>
                      <small>{fatura.cliente?.nuit || ''}</small>
                    </div>
                  </div>
                  <div className="col-data">
                    <div className="data-info">
                      <span>Emissão: {formatDate(fatura.issue_date)}</span>
                      <small>Vencimento: {formatDate(fatura.due_date)}</small>
                    </div>
                  </div>
                  <div className="col-valor">
                    <div className="valor-info">
                      <strong>{formatCurrency(fatura.total_amount)}</strong>
                      {fatura.paid_amount > 0 && (
                        <small>Pago: {formatCurrency(fatura.paid_amount)}</small>
                      )}
                    </div>
                  </div>
                  <div className="col-status">
                    {getStatusBadge(fatura.status)}
                  </div>
                  <div className="col-acoes">
                    <div className="action-buttons">
                      <button className="btn-icon" title="Visualizar">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className="btn-icon" title="Editar">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="btn-icon" title="Importar do Stock">
                        <FontAwesomeIcon icon={faWarehouse} />
                      </button>
                      <button className="btn-icon btn-danger" title="Eliminar">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faturas;
