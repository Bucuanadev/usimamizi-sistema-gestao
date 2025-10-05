import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCog,
  faFileAlt,
  faPrint,
  faUsers,
  faUpload,
  faSave,
  faEdit,
  faPlus,
  faTrash,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faStore,
  faWarehouse,
  faCheckCircle,
  faTimes,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import './Definicoes.css';

interface EmpresaData {
  nomeEmpresa: string;
  nomeComercial: string;
  nuit: string;
  capitalSocial: string;
  ruaAvenida: string;
  cidade: string;
  provincia: string;
  codigoPostal: string;
  telefone: string;
  fax: string;
  emailGeral: string;
  website: string;
  codigoCAE: string;
  descricaoAtividade: string;
  logotipo: string;
  // Dados bancários
  bancoNome: string;
  bancoConta: string;
  bancoNIB: string;
  bancoIBAN: string;
  modalidadePagamento: string;
}

interface Estabelecimento {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'matriz' | 'sucursal' | 'armazem' | 'loja';
  nuit: string;
  endereco: {
    rua: string;
    cidade: string;
    provincia: string;
    codigoPostal: string;
    pais: string;
  };
  contactos: {
    telefone: string;
    fax: string;
    email: string;
    website: string;
  };
  responsavel: {
    nome: string;
    cargo: string;
    telefone: string;
    email: string;
  };
  configuracoes: {
    ativo: boolean;
    permiteVendas: boolean;
    permiteCompras: boolean;
    permiteStock: boolean;
    serieDocumentos: string;
  };
  observacoes: string;
  created_at: string;
  updated_at: string;
}

const Definicoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState('empresa');
  
  // Estados para Estabelecimentos
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [showEstabelecimentoForm, setShowEstabelecimentoForm] = useState<boolean>(false);
  const [estabelecimentoEditando, setEstabelecimentoEditando] = useState<Estabelecimento | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [empresaData, setEmpresaData] = useState<EmpresaData>({
    nomeEmpresa: 'Usimamizi Lda',
    nomeComercial: '',
    nuit: '123456789',
    capitalSocial: '',
    ruaAvenida: '',
    cidade: '',
    provincia: '',
    codigoPostal: '',
    telefone: '',
    fax: '',
    emailGeral: '',
    website: '',
    codigoCAE: '',
    descricaoAtividade: '',
    logotipo: '',
    // Dados bancários
    bancoNome: '',
    bancoConta: '',
    bancoNIB: '',
    bancoIBAN: '',
    modalidadePagamento: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEmpresaData();
    if (activeTab === 'estabelecimentos') {
      loadEstabelecimentos();
    }
  }, [activeTab]);

  const loadEmpresaData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings/empresa');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setEmpresaData(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    }
  };

  const handleInputChange = (field: keyof EmpresaData, value: string) => {
    setEmpresaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEmpresaData(prev => ({
          ...prev,
          logotipo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Funções para Estabelecimentos
  const loadEstabelecimentos = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings/estabelecimentos');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEstabelecimentos(data.data || []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
    }
  };

  const criarNovoEstabelecimento = () => {
    const novoEstabelecimento: Estabelecimento = {
      id: `estab_${Date.now()}`,
      codigo: '',
      nome: '',
      tipo: 'sucursal',
      nuit: '',
      endereco: {
        rua: '',
        cidade: '',
        provincia: '',
        codigoPostal: '',
        pais: 'Moçambique'
      },
      contactos: {
        telefone: '',
        fax: '',
        email: '',
        website: ''
      },
      responsavel: {
        nome: '',
        cargo: '',
        telefone: '',
        email: ''
      },
      configuracoes: {
        ativo: true,
        permiteVendas: true,
        permiteCompras: true,
        permiteStock: true,
        serieDocumentos: ''
      },
      observacoes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEstabelecimentoEditando(novoEstabelecimento);
    setShowEstabelecimentoForm(true);
  };

  const editarEstabelecimento = (estabelecimento: Estabelecimento) => {
    setEstabelecimentoEditando(estabelecimento);
    setShowEstabelecimentoForm(true);
  };

  const salvarEstabelecimento = async () => {
    if (!estabelecimentoEditando) return;

    try {
      const response = await fetch('http://localhost:3001/api/settings/estabelecimentos', {
        method: estabelecimentoEditando.id.startsWith('estab_') ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(estabelecimentoEditando)
      });

      if (response.ok) {
        alert('Estabelecimento salvo com sucesso!');
        setShowEstabelecimentoForm(false);
        setEstabelecimentoEditando(null);
        loadEstabelecimentos();
      } else {
        alert('Erro ao salvar estabelecimento');
      }
    } catch (error) {
      console.error('Erro ao salvar estabelecimento:', error);
      alert('Erro ao salvar estabelecimento');
    }
  };

  const eliminarEstabelecimento = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este estabelecimento?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/settings/estabelecimentos/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Estabelecimento eliminado com sucesso!');
          loadEstabelecimentos();
        } else {
          alert('Erro ao eliminar estabelecimento');
        }
      } catch (error) {
        console.error('Erro ao eliminar estabelecimento:', error);
        alert('Erro ao eliminar estabelecimento');
      }
    }
  };

  const estabelecimentosFiltrados = estabelecimentos.filter(estab => {
    const matchSearch = estab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       estab.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filtroTipo === 'all' || estab.tipo === filtroTipo;
    return matchSearch && matchTipo;
  });

  const saveEmpresaData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('Enviando dados:', empresaData);
      
      const response = await fetch('http://localhost:3001/api/settings/empresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(empresaData)
      });

      console.log('Resposta do servidor:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Resultado:', result);
        setMessage('Dados da empresa salvos com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('Erro do servidor:', errorData);
        setMessage(`Erro ao salvar dados da empresa: ${errorData.message || 'Erro desconhecido'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage(`Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: faBuilding },
    { id: 'estabelecimentos', label: 'Estabelecimentos', icon: faBuilding },
    { id: 'series', label: 'Séries', icon: faFileAlt },
    { id: 'modelos', label: 'Modelos', icon: faPrint },
    { id: 'utilizadores', label: 'Utilizadores', icon: faUsers },
    { id: 'sistema', label: 'Sistema', icon: faCog }
  ];

  return (
    <div className="definicoes-container">
      <div className="definicoes-header">
        <h1>
          <FontAwesomeIcon icon={faCog} className="header-icon" />
          Módulo de Definições - Configurações da Empresa
        </h1>
        <div className="idioma-selector">
          <label>Idioma:</label>
          <select>
            <option value="pt">Português</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="definicoes-content">
        <div className="definicoes-sidebar">
          <div className="dados-empresa-section">
            <h3>Dados da Empresa</h3>
            <ul>
              <li>Estabelecimentos</li>
              <li>Séries de Documentos</li>
              <li>Modelos de Impressão</li>
              <li>Utilizadores</li>
              <li>Sistema</li>
            </ul>
          </div>

          <div className="tabs-navigation">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <FontAwesomeIcon icon={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="definicoes-main">
          {activeTab === 'empresa' && (
            <div className="empresa-form">
              <h2>Dados Legais da Empresa</h2>
              
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome da Empresa (Razão Social):</label>
                    <input
                      type="text"
                      value={empresaData.nomeEmpresa}
                      onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                      placeholder="Usimamizi Lda"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nome Comercial:</label>
                    <input
                      type="text"
                      value={empresaData.nomeComercial}
                      onChange={(e) => handleInputChange('nomeComercial', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>NUIT:</label>
                    <input
                      type="text"
                      value={empresaData.nuit}
                      onChange={(e) => handleInputChange('nuit', e.target.value)}
                      placeholder="123456789"
                    />
                  </div>
                  <div className="form-group">
                    <label>Capital Social:</label>
                    <input
                      type="text"
                      value={empresaData.capitalSocial}
                      onChange={(e) => handleInputChange('capitalSocial', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Morada Fiscal</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rua/Avenida:</label>
                    <input
                      type="text"
                      value={empresaData.ruaAvenida}
                      onChange={(e) => handleInputChange('ruaAvenida', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cidade:</label>
                    <input
                      type="text"
                      value={empresaData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Província:</label>
                    <input
                      type="text"
                      value={empresaData.provincia}
                      onChange={(e) => handleInputChange('provincia', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Código Postal:</label>
                    <input
                      type="text"
                      value={empresaData.codigoPostal}
                      onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Contactos</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Telefone:</label>
                    <input
                      type="text"
                      value={empresaData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fax:</label>
                    <input
                      type="text"
                      value={empresaData.fax}
                      onChange={(e) => handleInputChange('fax', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Geral:</label>
                    <input
                      type="email"
                      value={empresaData.emailGeral}
                      onChange={(e) => handleInputChange('emailGeral', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Website:</label>
                    <input
                      type="url"
                      value={empresaData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Atividade Principal (CAE)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Código CAE:</label>
                    <input
                      type="text"
                      value={empresaData.codigoCAE}
                      onChange={(e) => handleInputChange('codigoCAE', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Descrição da Atividade:</label>
                  <textarea
                    value={empresaData.descricaoAtividade}
                    onChange={(e) => handleInputChange('descricaoAtividade', e.target.value)}
                    rows={3}
                    placeholder="Descreva a atividade principal da empresa..."
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Dados Bancários</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome do Banco:</label>
                    <input
                      type="text"
                      value={empresaData.bancoNome}
                      onChange={(e) => handleInputChange('bancoNome', e.target.value)}
                      placeholder="Banco BCI"
                    />
                  </div>
                  <div className="form-group">
                    <label>Número da Conta:</label>
                    <input
                      type="text"
                      value={empresaData.bancoConta}
                      onChange={(e) => handleInputChange('bancoConta', e.target.value)}
                      placeholder="1234567890123456"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>NIB:</label>
                    <input
                      type="text"
                      value={empresaData.bancoNIB}
                      onChange={(e) => handleInputChange('bancoNIB', e.target.value)}
                      placeholder="0008 0000 12345678901 23"
                    />
                  </div>
                  <div className="form-group">
                    <label>IBAN:</label>
                    <input
                      type="text"
                      value={empresaData.bancoIBAN}
                      onChange={(e) => handleInputChange('bancoIBAN', e.target.value)}
                      placeholder="MZ59000800001234567890123"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Modalidade de Pagamento:</label>
                  <input
                    type="text"
                    value={empresaData.modalidadePagamento}
                    onChange={(e) => handleInputChange('modalidadePagamento', e.target.value)}
                    placeholder="Numerário, depósito ou Cheque"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Logotipo da Empresa</h3>
                <div className="logo-upload">
                  <div className="logo-preview">
                    {empresaData.logotipo ? (
                      <img src={empresaData.logotipo} alt="Logo da empresa" />
                    ) : (
                      <div className="logo-placeholder">
                        <FontAwesomeIcon icon={faBuilding} />
                        <span>Nenhum logotipo carregado</span>
                      </div>
                    )}
                  </div>
                  <div className="logo-upload-controls">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="logo-upload" className="upload-button">
                      <FontAwesomeIcon icon={faUpload} />
                      Carregar Logotipo
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="save-button"
                  onClick={saveEmpresaData}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSave} />
                  {loading ? 'Salvando...' : 'Guardar Alterações'}
                </button>
                {message && (
                  <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'estabelecimentos' && (
            <div className="estabelecimentos-section">
              <div className="section-header">
                <h2>Gestão de Estabelecimentos</h2>
                <button className="btn btn-primary" onClick={criarNovoEstabelecimento}>
                  <FontAwesomeIcon icon={faPlus} />
                  Novo Estabelecimento
                </button>
              </div>

              <div className="filters-section">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Pesquisar estabelecimentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-select">
                  <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                    <option value="all">Todos os Tipos</option>
                    <option value="matriz">Matriz</option>
                    <option value="sucursal">Sucursal</option>
                    <option value="armazem">Armazém</option>
                    <option value="loja">Loja</option>
                  </select>
                </div>
              </div>

              <div className="estabelecimentos-grid">
                {estabelecimentosFiltrados.map(estab => (
                  <div key={estab.id} className="estabelecimento-card">
                    <div className="card-header">
                      <div className="estabelecimento-info">
                        <h3>{estab.nome}</h3>
                        <span className={`tipo-badge ${estab.tipo}`}>
                          {estab.tipo === 'matriz' && <FontAwesomeIcon icon={faBuilding} />}
                          {estab.tipo === 'sucursal' && <FontAwesomeIcon icon={faStore} />}
                          {estab.tipo === 'armazem' && <FontAwesomeIcon icon={faWarehouse} />}
                          {estab.tipo === 'loja' && <FontAwesomeIcon icon={faStore} />}
                          {estab.tipo.charAt(0).toUpperCase() + estab.tipo.slice(1)}
                        </span>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn-action btn-edit"
                          onClick={() => editarEstabelecimento(estab)}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => eliminarEstabelecimento(estab.id)}
                          title="Eliminar"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <div className="info-row">
                        <FontAwesomeIcon icon={faBuilding} />
                        <span>{estab.codigo}</span>
                      </div>
                      <div className="info-row">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{estab.endereco.cidade}, {estab.endereco.provincia}</span>
                      </div>
                      <div className="info-row">
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{estab.contactos.telefone}</span>
                      </div>
                      <div className="info-row">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{estab.contactos.email}</span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="status-indicators">
                        {estab.configuracoes.ativo && (
                          <span className="status active">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Ativo
                          </span>
                        )}
                        {!estab.configuracoes.ativo && (
                          <span className="status inactive">
                            <FontAwesomeIcon icon={faTimes} />
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {estabelecimentosFiltrados.length === 0 && (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faBuilding} className="empty-icon" />
                  <h3>Nenhum estabelecimento encontrado</h3>
                  <p>Clique em "Novo Estabelecimento" para adicionar o primeiro estabelecimento.</p>
                </div>
              )}
            </div>
          )}

          {activeTab !== 'empresa' && activeTab !== 'estabelecimentos' && (
            <div className="coming-soon">
              <FontAwesomeIcon icon={faCog} className="coming-soon-icon" />
              <h2>Em Desenvolvimento</h2>
              <p>Esta funcionalidade estará disponível em breve.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Estabelecimento */}
      {showEstabelecimentoForm && estabelecimentoEditando && (
        <div className="modal-overlay">
          <div className="modal-container estabelecimento-modal">
            <div className="modal-header">
              <h3>
                {estabelecimentoEditando.id.startsWith('estab_') ? 'Novo Estabelecimento' : 'Editar Estabelecimento'}
              </h3>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowEstabelecimentoForm(false);
                  setEstabelecimentoEditando(null);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-sections">
                {/* Informações Básicas */}
                <div className="form-section">
                  <h4>Informações Básicas</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Código:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.codigo}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          codigo: e.target.value
                        })}
                        placeholder="Ex: MAT001, SUC001"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nome:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.nome}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          nome: e.target.value
                        })}
                        placeholder="Nome do estabelecimento"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tipo:</label>
                      <select
                        value={estabelecimentoEditando.tipo}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          tipo: e.target.value as 'matriz' | 'sucursal' | 'armazem' | 'loja'
                        })}
                      >
                        <option value="matriz">Matriz</option>
                        <option value="sucursal">Sucursal</option>
                        <option value="armazem">Armazém</option>
                        <option value="loja">Loja</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>NUIT:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.nuit}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          nuit: e.target.value
                        })}
                        placeholder="Número de identificação fiscal"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="form-section">
                  <h4>Endereço</h4>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Rua/Avenida:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.endereco.rua}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          endereco: { ...estabelecimentoEditando.endereco, rua: e.target.value }
                        })}
                        placeholder="Rua ou Avenida"
                      />
                    </div>
                    <div className="form-group">
                      <label>Cidade:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.endereco.cidade}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          endereco: { ...estabelecimentoEditando.endereco, cidade: e.target.value }
                        })}
                        placeholder="Cidade"
                      />
                    </div>
                    <div className="form-group">
                      <label>Província:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.endereco.provincia}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          endereco: { ...estabelecimentoEditando.endereco, provincia: e.target.value }
                        })}
                        placeholder="Província"
                      />
                    </div>
                    <div className="form-group">
                      <label>Código Postal:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.endereco.codigoPostal}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          endereco: { ...estabelecimentoEditando.endereco, codigoPostal: e.target.value }
                        })}
                        placeholder="Código Postal"
                      />
                    </div>
                    <div className="form-group">
                      <label>País:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.endereco.pais}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          endereco: { ...estabelecimentoEditando.endereco, pais: e.target.value }
                        })}
                        placeholder="País"
                      />
                    </div>
                  </div>
                </div>

                {/* Contactos */}
                <div className="form-section">
                  <h4>Contactos</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Telefone:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.contactos.telefone}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          contactos: { ...estabelecimentoEditando.contactos, telefone: e.target.value }
                        })}
                        placeholder="+258 XX XXX XXXX"
                      />
                    </div>
                    <div className="form-group">
                      <label>Fax:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.contactos.fax}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          contactos: { ...estabelecimentoEditando.contactos, fax: e.target.value }
                        })}
                        placeholder="Fax"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        value={estabelecimentoEditando.contactos.email}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          contactos: { ...estabelecimentoEditando.contactos, email: e.target.value }
                        })}
                        placeholder="email@estabelecimento.co.mz"
                      />
                    </div>
                    <div className="form-group">
                      <label>Website:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.contactos.website}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          contactos: { ...estabelecimentoEditando.contactos, website: e.target.value }
                        })}
                        placeholder="www.website.co.mz"
                      />
                    </div>
                  </div>
                </div>

                {/* Responsável */}
                <div className="form-section">
                  <h4>Responsável</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.responsavel.nome}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          responsavel: { ...estabelecimentoEditando.responsavel, nome: e.target.value }
                        })}
                        placeholder="Nome do responsável"
                      />
                    </div>
                    <div className="form-group">
                      <label>Cargo:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.responsavel.cargo}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          responsavel: { ...estabelecimentoEditando.responsavel, cargo: e.target.value }
                        })}
                        placeholder="Gerente, Diretor, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefone:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.responsavel.telefone}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          responsavel: { ...estabelecimentoEditando.responsavel, telefone: e.target.value }
                        })}
                        placeholder="+258 XX XXX XXXX"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        value={estabelecimentoEditando.responsavel.email}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          responsavel: { ...estabelecimentoEditando.responsavel, email: e.target.value }
                        })}
                        placeholder="responsavel@estabelecimento.co.mz"
                      />
                    </div>
                  </div>
                </div>

                {/* Configurações */}
                <div className="form-section">
                  <h4>Configurações</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Série de Documentos:</label>
                      <input
                        type="text"
                        value={estabelecimentoEditando.configuracoes.serieDocumentos}
                        onChange={(e) => setEstabelecimentoEditando({
                          ...estabelecimentoEditando,
                          configuracoes: { ...estabelecimentoEditando.configuracoes, serieDocumentos: e.target.value }
                        })}
                        placeholder="Ex: MAT, SUC, ARM"
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={estabelecimentoEditando.configuracoes.ativo}
                          onChange={(e) => setEstabelecimentoEditando({
                            ...estabelecimentoEditando,
                            configuracoes: { ...estabelecimentoEditando.configuracoes, ativo: e.target.checked }
                          })}
                        />
                        Estabelecimento Ativo
                      </label>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={estabelecimentoEditando.configuracoes.permiteVendas}
                          onChange={(e) => setEstabelecimentoEditando({
                            ...estabelecimentoEditando,
                            configuracoes: { ...estabelecimentoEditando.configuracoes, permiteVendas: e.target.checked }
                          })}
                        />
                        Permite Vendas
                      </label>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={estabelecimentoEditando.configuracoes.permiteCompras}
                          onChange={(e) => setEstabelecimentoEditando({
                            ...estabelecimentoEditando,
                            configuracoes: { ...estabelecimentoEditando.configuracoes, permiteCompras: e.target.checked }
                          })}
                        />
                        Permite Compras
                      </label>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={estabelecimentoEditando.configuracoes.permiteStock}
                          onChange={(e) => setEstabelecimentoEditando({
                            ...estabelecimentoEditando,
                            configuracoes: { ...estabelecimentoEditando.configuracoes, permiteStock: e.target.checked }
                          })}
                        />
                        Permite Gestão de Stock
                      </label>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="form-section">
                  <h4>Observações</h4>
                  <div className="form-group">
                    <textarea
                      value={estabelecimentoEditando.observacoes}
                      onChange={(e) => setEstabelecimentoEditando({
                        ...estabelecimentoEditando,
                        observacoes: e.target.value
                      })}
                      placeholder="Observações sobre o estabelecimento..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowEstabelecimentoForm(false);
                  setEstabelecimentoEditando(null);
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={salvarEstabelecimento}
              >
                <FontAwesomeIcon icon={faSave} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Definicoes;
