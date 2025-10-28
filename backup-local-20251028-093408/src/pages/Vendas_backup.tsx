import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faFileInvoice,
  faShoppingBag,
  faTruck,
  faReceipt,
  faMoneyBillWave,
  faFileAlt,
  faTimes,
  faSave,
  faPaperPlane,
  faFilePdf,
  faEdit,
  faTrash,
  faEye,
  faCalendar,
  faUser,
  faBuilding,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faChartLine,
  faCheckCircle,
  faClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './Vendas.css';

interface FaturaLinha {
  id: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  preco: number;
  desconto: number;
  iva: number;
  total: number;
}

interface DocumentData {
  id?: number;
  document_type: string;
  series: string;
  number: string;
  full_number: string;
  document_date: string;
  due_date?: string;
  client_id?: number;
  client_name?: string;
  client_tax_number?: string;
  client_address?: string;
  client_email?: string;
  vendedor?: string;
  payment_terms?: string;
  currency?: string;
  subtotal?: number;
  vat_amount?: number;
  total_amount?: number;
  notes?: string;
  internal_notes?: string;
  reference?: string;
  status?: string;
  linhas?: FaturaLinha[];
  totais?: {
    subtotal: number;
    iva16: number;
    iva5: number;
    retencao: number;
    total: number;
  };
}

interface LineData {
  id?: number;
  product_id?: number;
  product_code?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  vat_rate: number;
  line_total: number;
}

interface FaturaData {
  id: number | null;
  numero: string;
  serie: string;
  data: string;
  vencimento: string;
  estado: string;
  tipo: string;
  retencao: boolean;
  percentagemRetencao: number;
  avisoCredito: string;
  cliente: {
    codigo: string;
    nome: string;
    nuit: string;
    email: string;
    morada: string;
  };
  vendedor: string;
  condicaoPagamento: string;
  linhas: FaturaLinha[];
  totais: {
    subtotal: number;
    iva16: number;
    iva5: number;
    retencao: number;
    total: number;
  };
  observacoesInternas: string;
  observacoesCliente: string;
  referenciaInterna: string;
  localExpedicao: string;
  guias: string;
}

const Vendas: React.FC = () => {
  const [currentDocumentType, setCurrentDocumentType] = useState<string>('orcamento');
  const [currentTab, setCurrentTab] = useState<string>('lista');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
  const [showNewDocumentMenu, setShowNewDocumentMenu] = useState<boolean>(false);
  const [workflowStep, setWorkflowStep] = useState<string>('prospeccao');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFaturaForm, setShowFaturaForm] = useState<boolean>(false);
  const [faturaData, setFaturaData] = useState<FaturaData>({
    id: null,
    numero: 'FAT 2024/001',
    serie: 'FAT',
    data: new Date().toISOString().split('T')[0],
    vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'rascunho',
    tipo: 'normal',
    retencao: false,
    percentagemRetencao: 0,
    avisoCredito: '',
    cliente: {
      codigo: 'CLI001',
      nome: 'ACME, Lda',
      nuit: '123456789',
      email: 'geral@acme.co.mz',
      morada: 'Av. Julius Nyerere, 1234\nMaputo, Moçambique'
    },
    vendedor: 'João Silva',
    condicaoPagamento: '30dias',
    linhas: [],
    totais: {
      subtotal: 0,
      iva16: 0,
      iva5: 0,
      retencao: 0,
      total: 0
    },
    observacoesInternas: '',
    observacoesCliente: 'Agradecemos a sua preferência!',
    referenciaInterna: '',
    localExpedicao: 'armazem_central',
    guias: 'GR 2024/001'
  });
  const [faturaCurrentTab, setFaturaCurrentTab] = useState<string>('detalhes');

  // Carregar dados do backend
  useEffect(() => {
    loadDocuments();
  }, []);

  // Recalcular totais quando as linhas mudarem
  useEffect(() => {
    if (faturaData.linhas.length > 0) {
      calcularTotaisFatura();
    }
  }, [faturaData.linhas, faturaData.retencao, faturaData.percentagemRetencao]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/sales/documents');
      
      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend não está disponível');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Converter dados do backend para o formato esperado pelo frontend
        const convertedDocuments: DocumentData[] = data.data.map((doc: any) => ({
          id: doc.id,
          document_type: doc.document_type || 'ORC',
          series: doc.series || '',
          number: doc.number || '',
          full_number: doc.full_number || `${doc.series || ''} ${doc.number || ''}`,
          document_date: doc.document_date || new Date().toISOString().split('T')[0],
          due_date: doc.due_date,
          client_name: doc.client_name || '',
          client_tax_number: doc.client_tax_number,
          client_address: doc.client_address,
          client_email: doc.client_email,
          vendedor: doc.vendedor,
          payment_terms: doc.payment_terms,
          currency: doc.currency || 'MZN',
          subtotal: doc.subtotal || 0,
          vat_amount: doc.vat_amount || 0,
          total_amount: doc.total_amount || 0,
          status: doc.status || 'DRAFT',
          linhas: doc.linhas || [],
          totais: doc.totais || {
            subtotal: doc.subtotal || 0,
            iva16: doc.vat_amount || 0,
            iva5: 0,
            retencao: 0,
            total: doc.total_amount || 0
          }
        }));
        setDocuments(convertedDocuments);
      } else {
        throw new Error('Erro na resposta do backend');
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      
      // Dados simulados se o backend não estiver disponível
      setDocuments([
        {
          id: 1,
          document_type: 'ORC',
          series: 'ORÇ',
          number: '2024/001',
          full_number: 'ORÇ 2024/001',
          document_date: '2024-09-30',
          due_date: '2024-10-30',
          client_name: 'Empresa ABC Lda',
          client_tax_number: '123456789',
          client_address: 'Maputo, Moçambique',
          client_email: 'contato@empresaabc.co.mz',
          vendedor: 'João Silva',
          payment_terms: '30dias',
          currency: 'MZN',
          subtotal: 15000,
          vat_amount: 2250,
          total_amount: 17250,
          status: 'DRAFT'
        },
        {
          id: 2,
          document_type: 'FAT',
          series: 'FAT',
          number: '2024/015',
          full_number: 'FAT 2024/015',
          document_date: '2024-09-28',
          due_date: '2024-10-28',
          client_name: 'Comercial XYZ Lda',
          client_tax_number: '987654321',
          client_address: 'Beira, Moçambique',
          client_email: 'vendas@comercialxyz.co.mz',
          vendedor: 'Maria Santos',
          payment_terms: 'pronto',
          currency: 'MZN',
          subtotal: 25000,
          vat_amount: 3750,
          total_amount: 28750,
          status: 'SENT'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectWorkflowStep = (step: string) => {
    setWorkflowStep(step);
  };

  const selectDocumentType = (type: string) => {
    setCurrentDocumentType(type);
    setCurrentTab('lista');
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
          currency: 'MZN',
      minimumFractionDigits: 2
    }).format(valor);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'DRAFT': return '#f39c12';
      case 'SENT': return '#3498db';
      case 'APPROVED': return '#27ae60';
      case 'REJECTED': return '#e74c3c';
      case 'PAID': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'DRAFT': return 'Rascunho';
      case 'SENT': return 'Enviado';
      case 'APPROVED': return 'Aprovado';
      case 'REJECTED': return 'Rejeitado';
      case 'PAID': return 'Pago';
      default: return 'Desconhecido';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.full_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.client_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = currentDocumentType === 'all' || (doc.document_type || '').toLowerCase() === currentDocumentType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const switchTab = (tabName: string) => {
    setCurrentTab(tabName);
  };

  const createNewDocument = async (type: string) => {
    setShowNewDocumentMenu(false);
    
    try {
      const response = await fetch(`http://localhost:3001/api/sales/document-numbers/${type}`);
      
      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend não está disponível');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const documentData: DocumentData = {
          document_type: type.toUpperCase(),
          series: data.data.series,
          number: data.data.number,
          full_number: data.data.full_number,
          document_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          client_name: '',
          client_tax_number: '',
          client_address: '',
          client_email: '',
          vendedor: 'João Silva',
          payment_terms: 'pronto',
          currency: 'MZN',
          subtotal: 0,
          vat_amount: 0,
          total_amount: 0,
          status: 'DRAFT'
        };

        const createResponse = await fetch('http://localhost:3001/api/sales/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(documentData)
        });

        const createData = await createResponse.json();

        if (createData.success) {
          setCurrentDocument(createData.data);
          setCurrentDocumentType(type);
          setCurrentTab('editar');
          loadDocuments(); // Recarregar lista
        } else {
          alert('Erro ao criar documento: ' + createData.message);
        }
      }
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      // Criar documento localmente se o backend não estiver disponível
      const newDoc: DocumentData = {
        id: Date.now(),
        document_type: type.toUpperCase(),
        series: type.toUpperCase().substring(0, 3),
        number: '2024/001',
        full_number: `${type.toUpperCase().substring(0, 3)} 2024/001`,
        document_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_name: '',
        client_tax_number: '',
        client_address: '',
        client_email: '',
        vendedor: 'João Silva',
        payment_terms: 'pronto',
        currency: 'MZN',
        subtotal: 0,
        vat_amount: 0,
        total_amount: 0,
        status: 'DRAFT'
      };
      setCurrentDocument(newDoc);
      setCurrentDocumentType(type);
      setCurrentTab('editar');
    }
  };

  const editDocument = (document: DocumentData) => {
    // Se for uma fatura, abrir a interface de faturação
    if (document.document_type === 'FAT') {
      // Converter documento para formato de fatura
      const faturaData: FaturaData = {
        id: document.id || null,
        numero: document.full_number || `${document.series} ${document.number}`,
        serie: document.series || 'FAT',
        data: document.document_date || new Date().toISOString().split('T')[0],
        vencimento: document.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estado: document.status === 'DRAFT' ? 'rascunho' :
                document.status === 'SENT' ? 'emitida' :
                document.status === 'PAID' ? 'paga' :
                document.status === 'CANCELLED' ? 'anulada' : 'rascunho',
        tipo: 'normal',
        retencao: false,
        percentagemRetencao: 0,
        avisoCredito: '',
        cliente: {
          codigo: 'CLI001',
          nome: document.client_name || '',
          nuit: document.client_tax_number || '',
          email: document.client_email || '',
          morada: document.client_address || ''
        },
        vendedor: document.vendedor || 'João Silva',
        condicaoPagamento: document.payment_terms || '30dias',
        linhas: document.linhas || [],
        totais: document.totais || {
          subtotal: document.subtotal || 0,
          iva16: 0,
          iva5: 0,
          retencao: 0,
          total: document.total_amount || 0
        },
        observacoesInternas: document.internal_notes || '',
        observacoesCliente: document.notes || 'Agradecemos a sua preferência!',
        referenciaInterna: document.reference || '',
        localExpedicao: 'armazem_central',
        guias: 'GR 2024/001'
      };

      setFaturaData(faturaData);
      setShowFaturaForm(true);
      
      // Se não há linhas, adicionar uma linha inicial
      if (faturaData.linhas.length === 0) {
        adicionarLinhaInicialFatura();
      }
    } else {
      // Para outros tipos de documento, usar o formulário normal
      setCurrentDocument(document);
      setCurrentTab('editar');
    }
  };

  const deleteDocument = async (id: number) => {
    if (window.confirm('Tem a certeza que deseja eliminar este documento?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/sales/documents/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadDocuments();
        } else {
          alert('Erro ao eliminar documento');
        }
      } catch (error) {
        console.error('Erro ao eliminar documento:', error);
        // Remover localmente se o backend não estiver disponível
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    }
  };

  const saveDocument = async () => {
    if (!currentDocument) return;

    try {
      const response = await fetch('http://localhost:3001/api/sales/documents', {
        method: currentDocument.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentDocument)
      });

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend não está disponível. Salvando localmente...');
      }

      const data = await response.json();

      if (data.success) {
        setCurrentDocument(data.data);
        loadDocuments();
        alert('Documento guardado com sucesso!');
      } else {
        alert('Erro ao guardar documento: ' + data.message);
      }
    } catch (error) {
      console.error('Erro ao guardar documento:', error);
      
      // Salvar localmente se o backend não estiver disponível
      const updatedDocuments = currentDocument.id 
        ? documents.map(doc => doc.id === currentDocument.id ? currentDocument : doc)
        : [...documents, { ...currentDocument, id: Date.now() }];
      
      setDocuments(updatedDocuments);
      setCurrentDocument(null);
      setCurrentTab('lista');
      alert('Documento guardado localmente (backend não disponível)');
    }
  };

  const sendToClient = () => {
    alert('Documento enviado ao cliente por email!');
  };

  const exportToPDF = () => {
    alert('Exportando para PDF...');
  };

  const cancelDocument = () => {
    if (window.confirm('Tem a certeza que deseja cancelar? Todas as alterações serão perdidas.')) {
      setCurrentDocument(null);
      setCurrentTab('lista');
    }
  };

  // ==================== FUNÇÕES DO FORMULÁRIO DE FATURAÇÃO ====================
  
  const createNewFatura = () => {
    setShowNewDocumentMenu(false);
    setShowFaturaForm(true);
    adicionarLinhaInicialFatura();
  };

  const adicionarLinhaInicialFatura = () => {
    const novaLinha: FaturaLinha = {
      id: 'linha_' + Date.now(),
      codigo: '',
      descricao: '',
      quantidade: 1,
      preco: 0,
      desconto: 0,
      iva: 0.16,
      total: 0
    };
    
    setFaturaData(prev => ({
      ...prev,
      linhas: [...prev.linhas, novaLinha]
    }));
    
    // Recalcular totais após adicionar linha
    setTimeout(calcularTotaisFatura, 100);
  };

  const adicionarLinhaFatura = () => {
    const novaLinha: FaturaLinha = {
      id: 'linha_' + Date.now(),
      codigo: '',
      descricao: '',
      quantidade: 1,
      preco: 0,
      desconto: 0,
      iva: 0.16,
      total: 0
    };
    
    setFaturaData(prev => ({
      ...prev,
      linhas: [...prev.linhas, novaLinha]
    }));
  };

  const removerLinhaFatura = (linhaId: string) => {
    setFaturaData(prev => ({
      ...prev,
      linhas: prev.linhas.filter(linha => linha.id !== linhaId)
    }));
  };

  const atualizarLinhaFatura = (linhaId: string, campo: keyof FaturaLinha, valor: any) => {
    setFaturaData(prev => {
      const linhasAtualizadas = prev.linhas.map(linha => {
        if (linha.id === linhaId) {
          const linhaAtualizada = { ...linha, [campo]: valor };
          
          // Calcular total da linha imediatamente
          const totalLinha = linhaAtualizada.quantidade * linhaAtualizada.preco;
          const totalComDesconto = totalLinha * (1 - linhaAtualizada.desconto / 100);
          const totalComIVA = totalComDesconto * (1 + linhaAtualizada.iva);
          
          return {
            ...linhaAtualizada,
            total: totalComIVA
          };
        }
        return linha;
      });
      
      return {
        ...prev,
        linhas: linhasAtualizadas
      };
    });
    
    // Recalcular totais da fatura
    setTimeout(calcularTotaisFatura, 0);
  };

  const calcularTotalLinhaFatura = (linhaId: string) => {
    setFaturaData(prev => {
      const linhasAtualizadas = prev.linhas.map(linha => {
        if (linha.id === linhaId) {
          const totalLinha = linha.quantidade * linha.preco;
          const totalComDesconto = totalLinha * (1 - linha.desconto / 100);
          const totalComIVA = totalComDesconto * (1 + linha.iva);
          
          return {
            ...linha,
            total: totalComIVA
          };
        }
        return linha;
      });
      
      return {
        ...prev,
        linhas: linhasAtualizadas
      };
    });
    
    // Recalcular totais da fatura
    setTimeout(calcularTotaisFatura, 0);
  };

  const calcularTotaisFatura = () => {
    setFaturaData(prev => {
      let subtotal = 0;
      let base16 = 0;
      let base5 = 0;
      let iva16 = 0;
      let iva5 = 0;
      
      prev.linhas.forEach(linha => {
        const totalLinha = linha.quantidade * linha.preco * (1 - linha.desconto / 100);
        subtotal += totalLinha;
        
        if (linha.iva === 0.16) {
          base16 += totalLinha;
          iva16 += totalLinha * 0.16;
        } else if (linha.iva === 0.05) {
          base5 += totalLinha;
          iva5 += totalLinha * 0.05;
        }
      });
      
      const totalIVA = iva16 + iva5;
      const retencao = prev.retencao ? subtotal * (prev.percentagemRetencao / 100) : 0;
      const total = subtotal + totalIVA - retencao;
      
      console.log('Calculando totais:', {
        subtotal,
        iva16,
        iva5,
        totalIVA,
        retencao,
        total,
        linhas: prev.linhas
      });
      
      return {
        ...prev,
        totais: {
          subtotal,
          iva16,
          iva5,
          retencao,
          total
        }
      };
    });
  };

  const formatarMoedaFatura = (valor: number): string => {
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor) + ' MT';
  };

  const emitirFatura = async () => {
    if (!validarFatura()) return;

    setLoading(true);
    try {
      // Primeiro guardar como rascunho se não tiver ID
      let documentId = faturaData.id;
      
      if (!documentId) {
        const saveResponse = await fetch('http://localhost:3001/api/sales/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_type: 'FAT',
            series: faturaData.serie,
            number: faturaData.numero,
            full_number: faturaData.numero,
            document_date: faturaData.data,
            due_date: faturaData.vencimento,
            client_name: faturaData.cliente.nome,
            client_tax_number: faturaData.cliente.nuit,
            client_address: faturaData.cliente.morada,
            client_email: faturaData.cliente.email,
            vendedor: faturaData.vendedor,
            payment_terms: faturaData.condicaoPagamento,
            currency: 'MZN',
            subtotal: faturaData.totais.subtotal,
            vat_amount: faturaData.totais.iva16 + faturaData.totais.iva5,
            total_amount: faturaData.totais.total,
            status: 'DRAFT',
            linhas: faturaData.linhas,
            totais: faturaData.totais
          })
        });

        if (!saveResponse.ok) {
          throw new Error('Erro ao guardar fatura');
        }

        const saveData = await saveResponse.json();
        documentId = saveData.data.id;
      }

      // Agora emitir a fatura (atualizar status)
      const emitResponse = await fetch(`http://localhost:3001/api/sales/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SENT',
          estado: 'emitida'
        })
      });

      if (emitResponse.ok) {
        const data = await emitResponse.json();
        setFaturaData(prev => ({
          ...prev,
          id: data.data.id,
          estado: 'emitida'
        }));

        alert('Fatura emitida com sucesso!');
        setShowFaturaForm(false);
        loadDocuments();
      } else {
        throw new Error('Erro ao emitir fatura');
      }
    } catch (error) {
      console.error('Erro ao emitir fatura:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert('Erro ao emitir fatura: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validarFatura = (): boolean => {
    if (!faturaData.cliente.nome.trim()) {
      alert('Nome do cliente é obrigatório');
      return false;
    }
    
    if (!faturaData.cliente.nuit.trim() || faturaData.cliente.nuit.length < 9) {
      alert('NUIT do cliente é obrigatório e deve ter pelo menos 9 dígitos');
      return false;
    }
    
    if (faturaData.linhas.length === 0) {
      alert('Adicione pelo menos uma linha à fatura');
      return false;
    }
    
    const linhasValidas = faturaData.linhas.every(linha => 
      linha.descricao.trim() && linha.quantidade > 0 && linha.preco > 0
    );
    
    if (!linhasValidas) {
      alert('Todas as linhas devem ter descrição, quantidade e preço válidos');
      return false;
    }
    
    if (faturaData.totais.total <= 0) {
      alert('O total da fatura deve ser maior que zero');
      return false;
    }
    
    return true;
  };

  const guardarFatura = async () => {
    if (!faturaData.cliente.nome.trim()) {
      alert('Nome do cliente é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(faturaData.id ? `http://localhost:3001/api/sales/documents/${faturaData.id}` : 'http://localhost:3001/api/sales/documents', {
        method: faturaData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'FAT',
          series: faturaData.serie,
          number: faturaData.numero,
          full_number: faturaData.numero,
          document_date: faturaData.data,
          due_date: faturaData.vencimento,
          client_name: faturaData.cliente.nome,
          client_tax_number: faturaData.cliente.nuit,
          client_address: faturaData.cliente.morada,
          client_email: faturaData.cliente.email,
          vendedor: faturaData.vendedor,
          payment_terms: faturaData.condicaoPagamento,
          currency: 'MZN',
          subtotal: faturaData.totais.subtotal,
          vat_amount: faturaData.totais.iva16 + faturaData.totais.iva5,
          total_amount: faturaData.totais.total,
          status: 'DRAFT',
          linhas: faturaData.linhas,
          totais: faturaData.totais,
          retencao: faturaData.retencao,
          percentagemRetencao: faturaData.percentagemRetencao
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFaturaData(prev => ({
          ...prev,
          id: data.data.id,
          estado: 'rascunho'
        }));

        alert('Fatura guardada como rascunho!');
        loadDocuments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao guardar fatura');
      }
    } catch (error) {
      console.error('Erro ao guardar fatura:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert('Erro ao guardar fatura: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fecharFaturaForm = () => {
    setShowFaturaForm(false);
    setFaturaData({
      id: null,
      numero: 'FAT 2024/001',
      serie: 'FAT',
      data: new Date().toISOString().split('T')[0],
      vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'rascunho',
      tipo: 'normal',
      retencao: false,
      percentagemRetencao: 0,
      avisoCredito: '',
      cliente: {
        codigo: 'CLI001',
        nome: 'ACME, Lda',
        nuit: '123456789',
        email: 'geral@acme.co.mz',
        morada: 'Av. Julius Nyerere, 1234\nMaputo, Moçambique'
      },
      vendedor: 'João Silva',
      condicaoPagamento: '30dias',
      linhas: [],
      totais: {
        subtotal: 0,
        iva16: 0,
        iva5: 0,
        retencao: 0,
        total: 0
      },
      observacoesInternas: '',
      observacoesCliente: 'Agradecemos a sua preferência!',
      referenciaInterna: '',
      localExpedicao: 'armazem_central',
      guias: 'GR 2024/001'
    });
  };

  // ==================== FUNÇÕES DOS BOTÕES DE AÇÃO ====================

  const exportarPDF = async () => {
    if (!validarFatura()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/sales/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faturaData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Fatura_${faturaData.numero}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('PDF exportado com sucesso!');
      } else {
        alert('Erro ao exportar PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const registrarPagamento = async () => {
    if (!faturaData.id) {
      alert('Primeiro guarde a fatura como rascunho');
      return;
    }

    const valorPagamento = prompt('Valor do pagamento:', faturaData.totais.total.toString());
    if (!valorPagamento || isNaN(parseFloat(valorPagamento))) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/sales/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: faturaData.id,
          amount: parseFloat(valorPagamento),
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'transferencia',
          reference: `PAG_${Date.now()}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFaturaData(prev => ({
          ...prev,
          estado: data.data.remaining_amount <= 0 ? 'paga' : 'parcial'
        }));
        alert('Pagamento registrado com sucesso!');
        loadDocuments();
      } else {
        alert('Erro ao registrar pagamento');
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const criarNotaCredito = async () => {
    if (!faturaData.id) {
      alert('Primeiro guarde a fatura como rascunho');
      return;
    }

    if (window.confirm('Criar nota de crédito para esta fatura?')) {
      setLoading(true);
      try {
        const notaCreditoData = {
          ...faturaData,
          id: null,
          numero: `NC ${faturaData.numero}`,
          serie: 'NC',
          estado: 'rascunho',
          tipo: 'nota_credito',
          fatura_original: faturaData.id
        };

        const response = await fetch('http://localhost:3001/api/sales/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notaCreditoData)
        });

        if (response.ok) {
          const data = await response.json();
          setFaturaData(prev => ({
            ...prev,
            ...data.data
          }));
          alert('Nota de crédito criada com sucesso!');
        } else {
          alert('Erro ao criar nota de crédito');
        }
      } catch (error) {
        console.error('Erro ao criar nota de crédito:', error);
        alert('Erro ao criar nota de crédito: ' + error);
      } finally {
        setLoading(false);
      }
    }
  };

  const duplicarFatura = () => {
    if (window.confirm('Duplicar esta fatura?')) {
      const faturaDuplicada = {
        ...faturaData,
        id: null,
        numero: `FAT 2024/${String(Date.now()).slice(-3)}`,
        data: new Date().toISOString().split('T')[0],
        vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estado: 'rascunho'
      };
      
      setFaturaData(faturaDuplicada);
      alert('Fatura duplicada! Pode editar os dados e guardar.');
    }
  };

  const anularFatura = async () => {
    if (!faturaData.id) {
      alert('Esta fatura ainda não foi guardada');
      return;
    }

    if (window.confirm('Tem certeza que deseja anular esta fatura? Esta ação não pode ser desfeita.')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/sales/documents/${faturaData.id}/cancel`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          setFaturaData(prev => ({
            ...prev,
            estado: 'anulada'
          }));
          alert('Fatura anulada com sucesso!');
          loadDocuments();
        } else {
          alert('Erro ao anular fatura');
        }
      } catch (error) {
        console.error('Erro ao anular fatura:', error);
        alert('Erro ao anular fatura: ' + error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderDocumentList = () => {
    if (loading) {
      return (
        <div className="vendas-loading">
          <div className="loading-spinner"></div>
          <p>Carregando documentos...</p>
        </div>
      );
    }

    return (
      <div className="vendas-list">
        <div className="vendas-list-header">
          <div className="search-filters">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar documentos ou clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">Todos os Status</option>
              <option value="DRAFT">Rascunho</option>
              <option value="SENT">Enviado</option>
              <option value="APPROVED">Aprovado</option>
              <option value="REJECTED">Rejeitado</option>
              <option value="PAID">Pago</option>
            </select>
          </div>
        </div>

        <div className="vendas-table-container">
          <table className="vendas-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Vencimento</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="document-info">
                      <div className="document-type">{doc.document_type}</div>
                      <div className="document-number">{doc.full_number}</div>
                    </div>
                  </td>
                  <td>
                    <div className="client-info">
                      <div className="client-name">{doc.client_name}</div>
                      <div className="client-tax">{doc.client_tax_number}</div>
                    </div>
                  </td>
                  <td>{new Date(doc.document_date).toLocaleDateString('pt-MZ')}</td>
                  <td>{doc.due_date ? new Date(doc.due_date).toLocaleDateString('pt-MZ') : '-'}</td>
                  <td className="amount">{formatarMoeda(doc.total_amount || 0)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(doc.status || 'DRAFT') }}
                    >
                      {getStatusLabel(doc.status || 'DRAFT')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-view"
                        onClick={() => editDocument(doc)}
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => deleteDocument(doc.id!)}
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDocumentForm = () => {
    if (!currentDocument) return null;

    return (
      <div className="vendas-form">
        <div className="form-header">
          <h3>Editar Documento - {currentDocument.full_number}</h3>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={cancelDocument}>
              <FontAwesomeIcon icon={faTimes} />
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={saveDocument}>
              <FontAwesomeIcon icon={faSave} />
              Guardar
            </button>
          </div>
        </div>

        <div className="form-sections">
          <div className="form-section">
            <h4>Informações Gerais</h4>
            <div className="form-grid">
              <div className="form-group">
              <label>Série:</label>
              <input type="text" value={currentDocument.series} readOnly />
            </div>
              <div className="form-group">
              <label>Número:</label>
              <input type="text" value={currentDocument.number} readOnly />
            </div>
              <div className="form-group">
              <label>Data do Documento:</label>
                <input 
                  type="date" 
                  value={currentDocument.document_date}
                  onChange={(e) => setCurrentDocument({...currentDocument, document_date: e.target.value})}
                />
              </div>
              <div className="form-group">
              <label>Data de Vencimento:</label>
                <input 
                  type="date" 
                  value={currentDocument.due_date || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, due_date: e.target.value})}
                />
            </div>
          </div>
        </div>

          <div className="form-section">
            <h4>Dados do Cliente</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Cliente:</label>
                <input 
                  type="text" 
                  value={currentDocument.client_name || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, client_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Número de Contribuinte:</label>
                <input 
                  type="text" 
                  value={currentDocument.client_tax_number || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, client_tax_number: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={currentDocument.client_email || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, client_email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Endereço:</label>
                <input 
                  type="text" 
                  value={currentDocument.client_address || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, client_address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Condições Comerciais</h4>
            <div className="form-grid">
              <div className="form-group">
              <label>Vendedor:</label>
              <input 
                type="text" 
                value={currentDocument.vendedor || ''}
                onChange={(e) => setCurrentDocument({...currentDocument, vendedor: e.target.value})}
              />
            </div>
              <div className="form-group">
              <label>Condição de Pagamento:</label>
              <select 
                value={currentDocument.payment_terms || 'pronto'}
                onChange={(e) => setCurrentDocument({...currentDocument, payment_terms: e.target.value})}
              >
                <option value="pronto">Pronto Pagamento</option>
                <option value="30dias">30 Dias</option>
                <option value="60dias">60 Dias</option>
              </select>
            </div>
              <div className="form-group">
              <label>Moeda:</label>
              <select 
                value={currentDocument.currency || 'MZN'}
                onChange={(e) => setCurrentDocument({...currentDocument, currency: e.target.value})}
              >
                <option value="MZN">MZN - Metical</option>
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
              <div className="form-group">
                <label>Status:</label>
                <select 
                  value={currentDocument.status || 'DRAFT'}
                  onChange={(e) => setCurrentDocument({...currentDocument, status: e.target.value})}
                >
                  <option value="DRAFT">Rascunho</option>
                  <option value="SENT">Enviado</option>
                  <option value="APPROVED">Aprovado</option>
                  <option value="REJECTED">Rejeitado</option>
                  <option value="PAID">Pago</option>
              </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vendas-container">
      {/* Header */}
      <div className="vendas-header">
        <div className="header-content">
          <h1>Módulo de Vendas</h1>
          <p>Gestão completa do processo de vendas</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewDocumentMenu(!showNewDocumentMenu)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Novo Documento
          </button>
        </div>
      </div>

      {/* Document Type Tabs */}
      <div className="document-type-tabs">
        <button 
          className={`tab-btn ${currentDocumentType === 'all' ? 'active' : ''}`}
          onClick={() => selectDocumentType('all')}
        >
          Todos
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'orcamento' ? 'active' : ''}`}
          onClick={() => selectDocumentType('orcamento')}
        >
          <FontAwesomeIcon icon={faFileInvoice} />
          Orçamentos
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'encomenda' ? 'active' : ''}`}
          onClick={() => selectDocumentType('encomenda')}
        >
          <FontAwesomeIcon icon={faShoppingBag} />
          Encomendas
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'fatura' ? 'active' : ''}`}
          onClick={() => selectDocumentType('fatura')}
        >
          <FontAwesomeIcon icon={faReceipt} />
          Faturas
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'guia' ? 'active' : ''}`}
          onClick={() => selectDocumentType('guia')}
        >
          <FontAwesomeIcon icon={faTruck} />
          Guias
        </button>
      </div>

      {/* Main Content */}
      <div className="vendas-content">
        {currentTab === 'lista' && renderDocumentList()}
        {currentTab === 'editar' && renderDocumentForm()}
      </div>

      {/* New Document Menu */}
      {showNewDocumentMenu && (
        <div className="new-document-menu">
          <div className="menu-header">
            <h3>Criar Novo Documento</h3>
            <button 
              className="close-btn"
              onClick={() => setShowNewDocumentMenu(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="menu-items">
            <div className="menu-item" onClick={() => createNewDocument('orcamento')}>
              <FontAwesomeIcon icon={faFileInvoice} />
              <div>
                <div className="item-title">Orçamento</div>
                <div className="item-desc">Criar novo orçamento</div>
              </div>
            </div>
            <div className="menu-item" onClick={() => createNewDocument('encomenda')}>
              <FontAwesomeIcon icon={faShoppingBag} />
              <div>
                <div className="item-title">Encomenda</div>
                <div className="item-desc">Criar nova encomenda</div>
              </div>
            </div>
            <div className="menu-item" onClick={createNewFatura}>
              <FontAwesomeIcon icon={faReceipt} />
              <div>
                <div className="item-title">Fatura</div>
                <div className="item-desc">Criar nova fatura</div>
              </div>
            </div>
            <div className="menu-item" onClick={() => createNewDocument('guia')}>
              <FontAwesomeIcon icon={faTruck} />
              <div>
                <div className="item-title">Guia de Remessa</div>
                <div className="item-desc">Criar nova guia</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {showNewDocumentMenu && (
        <div 
          className="menu-overlay"
          onClick={() => setShowNewDocumentMenu(false)}
        />
      )}

      {/* Formulário de Faturação */}
      {showFaturaForm && (
        <div className="fatura-form-overlay" onClick={fecharFaturaForm}>
          <div className="fatura-form-container" onClick={(e) => e.stopPropagation()}>
            <div className="fatura-form-header">
              <h2>Nova Fatura</h2>
              <button 
                className="close-btn"
                onClick={fecharFaturaForm}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="fatura-form-content">
              {/* Cabeçalho Horizontal da Fatura */}
              <div className="fatura-header-horizontal">
                <div className="fatura-header-section">
                  <h3>Dados da Fatura</h3>
                  <div className="fatura-header-grid">
                    <div className="fatura-field">
                      <label>Série:</label>
                      <input type="text" value={faturaData.serie} readOnly />
                    </div>
                    <div className="fatura-field">
                      <label>Número:</label>
                      <input type="text" value={faturaData.numero} readOnly />
                    </div>
                    <div className="fatura-field">
                      <label>Data:</label>
                      <input 
                        type="date" 
                        value={faturaData.data}
                        onChange={(e) => setFaturaData(prev => ({ ...prev, data: e.target.value }))}
                      />
                    </div>
                    <div className="fatura-field">
                      <label>Vencimento:</label>
                      <input 
                        type="date" 
                        value={faturaData.vencimento}
                        onChange={(e) => setFaturaData(prev => ({ ...prev, vencimento: e.target.value }))}
                      />
                    </div>
                    <div className="fatura-field">
                      <label>Estado:</label>
                      <select 
                        value={faturaData.estado}
                        onChange={(e) => setFaturaData(prev => ({ ...prev, estado: e.target.value }))}
                      >
                        <option value="rascunho">Rascunho</option>
                        <option value="emitida">Emitida</option>
                        <option value="paga">Paga</option>
                        <option value="parcial">Parcialmente Paga</option>
                        <option value="incobravel">Incobrável</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="fatura-header-section">
                  <h3>Dados Fiscais (MOZ)</h3>
                  <div className="fatura-header-grid">
                    <div className="fatura-field">
                      <label>Tipo:</label>
                      <select 
                        value={faturaData.tipo}
                        onChange={(e) => setFaturaData(prev => ({ ...prev, tipo: e.target.value }))}
                      >
                        <option value="normal">Normal</option>
                        <option value="simplificada">Simplificada</option>
                        <option value="recibo">Recibo</option>
                      </select>
                    </div>
                    <div className="fatura-field">
                      <label>Retenção:</label>
                      <select 
                        value={faturaData.retencao ? 'sim' : 'nao'}
                        onChange={(e) => setFaturaData(prev => ({ 
                          ...prev, 
                          retencao: e.target.value === 'sim',
                          percentagemRetencao: e.target.value === 'sim' ? 1.0 : 0
                        }))}
                      >
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>
                    <div className="fatura-field">
                      <label>% Retenção:</label>
                      <input 
                        type="number" 
                        value={faturaData.percentagemRetencao}
                        step="0.01"
                        disabled={!faturaData.retencao}
                        onChange={(e) => setFaturaData(prev => ({ 
                          ...prev, 
                          percentagemRetencao: parseFloat(e.target.value) || 0 
                        }))}
                      />
                    </div>
                    <div className="fatura-field">
                      <label>Aviso Crédito:</label>
                      <input 
                        type="text" 
                        value={faturaData.avisoCredito}
                        onChange={(e) => setFaturaData(prev => ({ ...prev, avisoCredito: e.target.value }))}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="fatura-header-section">
                  <h3>Cliente</h3>
                  <div className="fatura-header-grid">
                    <div className="fatura-field">
                      <label>Código:</label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          value={faturaData.cliente.codigo}
                          onChange={(e) => setFaturaData(prev => ({ 
                            ...prev, 
                            cliente: { ...prev.cliente, codigo: e.target.value }
                          }))}
                        />
                        <FontAwesomeIcon icon={faSearch} />
                      </div>
                    </div>
                    <div className="fatura-field">
                      <label>Nome:</label>
                      <input 
                        type="text" 
                        value={faturaData.cliente.nome}
                        onChange={(e) => setFaturaData(prev => ({ 
                          ...prev, 
                          cliente: { ...prev.cliente, nome: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="fatura-field">
                      <label>NUIT:</label>
                      <input 
                        type="text" 
                        value={faturaData.cliente.nuit}
                        onChange={(e) => setFaturaData(prev => ({ 
                          ...prev, 
                          cliente: { ...prev.cliente, nuit: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="fatura-field">
                      <label>Email:</label>
                      <input 
                        type="email" 
                        value={faturaData.cliente.email}
                        onChange={(e) => setFaturaData(prev => ({ 
                          ...prev, 
                          cliente: { ...prev.cliente, email: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Linhas de Produtos */}
              <div className="fatura-linhas-section">
                <div className="fatura-linhas-header">
                  <h3>Artigos Faturados</h3>
                  <div className="fatura-linhas-controls">
                    <button className="btn btn-primary" onClick={adicionarLinhaFatura}>
                      <FontAwesomeIcon icon={faPlus} />
                      Adicionar Linha
                    </button>
                    <button className="btn btn-secondary">
                      <FontAwesomeIcon icon={faSearch} />
                      Pesquisar Artigo
                    </button>
                    <button className="btn btn-secondary">
                      <FontAwesomeIcon icon={faTruck} />
                      Importar da GR
                    </button>
                  </div>
                </div>
                
                {/* Cabeçalho da tabela de linhas */}
                <div className="fatura-linhas-table-header">
                  <div className="fatura-linha-codigo">Código</div>
                  <div className="fatura-linha-descricao">Descrição</div>
                  <div className="fatura-linha-quantidade">Qtd</div>
                  <div className="fatura-linha-preco">Preço</div>
                  <div className="fatura-linha-desconto">Desc%</div>
                  <div className="fatura-linha-iva">IVA</div>
                  <div className="fatura-linha-total">Total</div>
                  <div className="fatura-linha-acoes">Ações</div>
                </div>
                
                <div className="fatura-linhas-container">
                  {faturaData.linhas.map((linha) => (
                    <div key={linha.id} className="fatura-linha">
                      <div className="fatura-linha-codigo">
                        <input 
                          type="text" 
                          value={linha.codigo}
                          onChange={(e) => atualizarLinhaFatura(linha.id, 'codigo', e.target.value)}
                          placeholder="Código"
                        />
                      </div>
                      <div className="fatura-linha-descricao">
                        <input 
                          type="text" 
                          value={linha.descricao}
                          onChange={(e) => atualizarLinhaFatura(linha.id, 'descricao', e.target.value)}
                          placeholder="Descrição"
                        />
                      </div>
                      <div className="fatura-linha-quantidade">
                        <input 
                          type="number" 
                          value={linha.quantidade}
                          min="0"
                          step="0.001"
                          onChange={(e) => atualizarLinhaFatura(linha.id, 'quantidade', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="fatura-linha-preco">
                        <input 
                          type="number" 
                          value={linha.preco}
                          min="0"
                          step="0.01"
                          onChange={(e) => atualizarLinhaFatura(linha.id, 'preco', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="fatura-linha-desconto">
                        <input 
                          type="number" 
                          value={linha.desconto}
                          min="0"
                          max="100"
                          step="0.01"
                          onChange={(e) => atualizarLinhaFatura(linha.id, 'desconto', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="fatura-linha-iva">
                        <select 
                          value={linha.iva}
                          onChange={(e) => atualizarLinhaFatura(linha.id, 'iva', parseFloat(e.target.value))}
                        >
                          <option value={0.16}>16%</option>
                          <option value={0.05}>5%</option>
                          <option value={0}>Isento</option>
                        </select>
                      </div>
                      <div className="fatura-linha-total">
                        <span>{formatarMoedaFatura(linha.total)}</span>
                      </div>
                      <div className="fatura-linha-acoes">
                        <button 
                          type="button" 
                          onClick={() => removerLinhaFatura(linha.id)}
                          className="btn-remove-line"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais e Resumo */}
              <div className="fatura-totais-section">
                <div className="fatura-totais-grid">
                  <div className="fatura-total-item">
                    <label>Subtotal (sem IVA):</label>
                    <span className="fatura-total-value">{formatarMoedaFatura(faturaData.totais.subtotal)}</span>
                  </div>
                  <div className="fatura-total-item">
                    <label>IVA 16%:</label>
                    <span className="fatura-total-value">{formatarMoedaFatura(faturaData.totais.iva16)}</span>
                  </div>
                  <div className="fatura-total-item">
                    <label>IVA 5%:</label>
                    <span className="fatura-total-value">{formatarMoedaFatura(faturaData.totais.iva5)}</span>
                  </div>
                  <div className="fatura-total-item">
                    <label>Total IVA:</label>
                    <span className="fatura-total-value">{formatarMoedaFatura(faturaData.totais.iva16 + faturaData.totais.iva5)}</span>
                  </div>
                  <div className="fatura-total-item">
                    <label>Retenção na Fonte:</label>
                    <span className="fatura-total-value">{formatarMoedaFatura(faturaData.totais.retencao)}</span>
                  </div>
                  <div className="fatura-total-item total-final">
                    <label>Total a Pagar:</label>
                    <span className="fatura-total-value">{formatarMoedaFatura(faturaData.totais.total)}</span>
                  </div>
                </div>
              </div>

                     {/* Botões de Ação */}
                     <div className="fatura-actions">
                       <button
                         className={`fatura-btn fatura-btn-emitir ${loading ? 'loading' : ''}`}
                         onClick={emitirFatura}
                         disabled={loading}
                       >
                         <FontAwesomeIcon icon={faCheckCircle} />
                         Emitir Fatura
                       </button>
                       <button 
                         className="fatura-btn fatura-btn-pdf"
                         onClick={exportarPDF}
                       >
                         <FontAwesomeIcon icon={faFilePdf} />
                         Exportar PDF
                       </button>
                       <button 
                         className={`fatura-btn fatura-btn-guardar ${loading ? 'loading' : ''}`}
                         onClick={guardarFatura} 
                         disabled={loading}
                       >
                         <FontAwesomeIcon icon={faSave} />
                         Guardar Rascunho
                       </button>
                       <button 
                         className="fatura-btn fatura-btn-pagamento"
                         onClick={registrarPagamento}
                       >
                         <FontAwesomeIcon icon={faMoneyBillWave} />
                         Registrar Pagamento
                       </button>
                       <button 
                         className="fatura-btn fatura-btn-credito"
                         onClick={criarNotaCredito}
                       >
                         <FontAwesomeIcon icon={faFileInvoice} />
                         Nota de Crédito
                       </button>
                       <button 
                         className="fatura-btn fatura-btn-duplicar"
                         onClick={duplicarFatura}
                       >
                         <FontAwesomeIcon icon={faFileAlt} />
                         Duplicar
                       </button>
                       <button 
                         className="fatura-btn fatura-btn-anular"
                         onClick={anularFatura}
                       >
                         <FontAwesomeIcon icon={faTimes} />
                         Anular
                       </button>
                     </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Vendas;
