import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faFileInvoice,
  faShoppingCart,
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
  faExclamationTriangle,
  faBox,
  faWarehouse,
  faClipboardList,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import './Compras.css';

// Interfaces para Guia de Entrada
interface ArtigoEntrada {
  id: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  quantidadeRecebida: number;
  precoUnitario: number;
  desconto: number;
  iva: number;
  valorTotal: number;
  loteNumero: string;
  dataValidade: string;
  localizacao: string;
  observacoes: string;
  produto_id?: string;
}

interface InformacoesRececao {
  dataRececao: string;
  horaRececao: string;
  responsavelRececao: string;
  condicoesEmbalagem: string;
  observacoesRececao: string;
  conformidade: boolean;
}

interface GuiaEntradaData {
  id: number | null;
  numero: string;
  serie: string;
  data: string;
  fornecedor: {
    codigo: string;
    nome: string;
    nuit: string;
    email: string;
    morada: string;
  };
  encomendaReferencia: string;
  transportador: string;
  numeroGuiaTransporte: string;
  artigos: ArtigoEntrada[];
  informacoesRececao: InformacoesRececao;
  totais: {
    subtotal: number;
    iva16: number;
    iva5: number;
    total: number;
  };
  observacoes: string;
  estado: string;
}

// Interfaces para documentos de compras
interface DocumentoCompra {
  id?: number;
  document_type: string;
  series: string;
  number: string;
  full_number: string;
  document_date: string;
  due_date?: string;
  supplier_id?: number;
  supplier_name?: string;
  supplier_tax_number?: string;
  supplier_address?: string;
  supplier_email?: string;
  comprador?: string;
  payment_terms?: string;
  currency?: string;
  subtotal?: number;
  vat_amount?: number;
  total_amount?: number;
  notes?: string;
  internal_notes?: string;
  reference?: string;
  status?: string;
  linhas?: LinhaCompra[];
  totais?: {
    subtotal: number;
    iva16: number;
    iva5: number;
    retencao: number;
    total: number;
  };
  // Campos específicos para Guia de Entrada
  motorista?: string;
  matricula_veiculo?: string;
  volumes?: number;
  peso_total?: number;
  volume_total?: number;
  condicoes_transporte?: string;
  // Informações de Receção
  data_rececao?: string;
  hora_rececao?: string;
  observacoes_rececao?: string;
  assinatura_rececionista?: string;
}

interface LinhaCompra {
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

// Interfaces para Stock
interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

interface Preco {
  id: string;
  produto_id: string;
  tipo: 'compra' | 'venda' | 'custo';
  valor: number;
  moeda: string;
  data_inicio: string;
  data_fim?: string;
  ativo: boolean;
}

interface Produto {
  id: string;
  codigo: string;
  codigo_barras?: string;
  nome: string;
  descricao?: string;
  categoria_id: string;
  categoria?: Categoria;
  unidade_medida: string;
  peso?: number;
  dimensoes?: string;
  stock_minimo: number;
  stock_maximo: number;
  stock_atual: number;
  stock_reservado: number;
  stock_disponivel: number;
  localizacao?: string;
  fornecedor_principal?: string;
  observacoes?: string;
  ativo: boolean;
  precos: Preco[];
  created_at: string;
  updated_at: string;
}

const Compras: React.FC = () => {
  const [currentDocumentType, setCurrentDocumentType] = useState<string>('requisicao');
  const [currentTab, setCurrentTab] = useState<string>('lista');
  const [documents, setDocuments] = useState<DocumentoCompra[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentoCompra | null>(null);
  const [showNewDocumentMenu, setShowNewDocumentMenu] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Estados para Stock
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [showProdutoForm, setShowProdutoForm] = useState<boolean>(false);
  const [showCategoriaForm, setShowCategoriaForm] = useState<boolean>(false);
  const [showNovaCategoriaModal, setShowNovaCategoriaModal] = useState<boolean>(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [filtroStatus, setFiltroStatus] = useState<string>('all');
  const [searchProduto, setSearchProduto] = useState<string>('');

  // Estados para Guia de Entrada
  const [guiaEntradaData, setGuiaEntradaData] = useState<GuiaEntradaData>({
    id: null,
    numero: '',
    serie: 'GE',
    data: new Date().toISOString().split('T')[0],
    fornecedor: {
      codigo: '',
      nome: '',
      nuit: '',
      email: '',
      morada: ''
    },
    encomendaReferencia: '',
    transportador: '',
    numeroGuiaTransporte: '',
    artigos: [],
    informacoesRececao: {
      dataRececao: new Date().toISOString().split('T')[0],
      horaRececao: new Date().toTimeString().split(' ')[0].substring(0, 5),
      responsavelRececao: '',
      condicoesEmbalagem: '',
      observacoesRececao: '',
      conformidade: true
    },
    totais: {
      subtotal: 0,
      iva16: 0,
      iva5: 0,
      total: 0
    },
    observacoes: '',
    estado: 'rascunho'
  });
  const [showGuiaEntradaForm, setShowGuiaEntradaForm] = useState<boolean>(false);

  // Carregar dados do backend
  useEffect(() => {
    loadDocuments();
  }, []);

  // Debug: Log das categorias quando mudam
  useEffect(() => {
    console.log('Categorias carregadas:', categorias);
  }, [categorias]);

  // Carregar dados de stock quando a aba stock for selecionada
  useEffect(() => {
    console.log('currentDocumentType mudou para:', currentDocumentType);
    if (currentDocumentType === 'stock') {
      console.log('Carregando dados de stock...');
      loadStockData();
    }
  }, [currentDocumentType]);

  // Carregar categorias sempre que o componente monta
  useEffect(() => {
    console.log('Componente montado, carregando categorias...');
    loadStockData();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/purchases/documents');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend não está disponível');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const convertedDocuments: DocumentoCompra[] = data.data.map((doc: any) => ({
          id: doc.id,
          document_type: doc.document_type || 'REQ',
          series: doc.series || '',
          number: doc.number || '',
          full_number: doc.full_number || `${doc.series || ''} ${doc.number || ''}`,
          document_date: doc.document_date || new Date().toISOString().split('T')[0],
          due_date: doc.due_date,
          supplier_name: doc.supplier_name || '',
          supplier_tax_number: doc.supplier_tax_number,
          supplier_address: doc.supplier_address,
          supplier_email: doc.supplier_email,
          comprador: doc.comprador,
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
          document_type: 'REQ',
          series: 'REQ',
          number: '2024/001',
          full_number: 'REQ 2024/001',
          document_date: '2024-09-30',
          due_date: '2024-10-30',
          supplier_name: 'Fornecedor ABC Lda',
          supplier_tax_number: '123456789',
          supplier_address: 'Maputo, Moçambique',
          supplier_email: 'contato@fornecedorabc.co.mz',
          comprador: 'João Silva',
          payment_terms: '30dias',
          currency: 'MZN',
          subtotal: 15000,
          vat_amount: 2250,
          total_amount: 17250,
          status: 'DRAFT'
        },
        {
          id: 2,
          document_type: 'EA',
          series: 'EA',
          number: '2024/015',
          full_number: 'EA 2024/015',
          document_date: '2024-09-28',
          due_date: '2024-10-28',
          supplier_name: 'Fornecedor XYZ Lda',
          supplier_tax_number: '987654321',
          supplier_address: 'Beira, Moçambique',
          supplier_email: 'vendas@fornecedorxyz.co.mz',
          comprador: 'Maria Santos',
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

  const getDocumentTypeLabel = (type: string): string => {
    switch (type) {
      case 'REQ': return 'Requisição';
      case 'EA': return 'Encomenda Fornecedor';
      case 'GE': return 'Guia Entrada';
      case 'FR': return 'Fatura Fornecedor';
      case 'ST': return 'Gestão Stock';
      case 'NC': return 'Nota Crédito';
      case 'ND': return 'Nota Débito';
      default: return type;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'REQ': return faClipboardList;
      case 'EA': return faShoppingCart;
      case 'GE': return faTruck;
      case 'FR': return faReceipt;
      case 'ST': return faWarehouse;
      case 'NC': return faFileInvoice;
      case 'ND': return faFileAlt;
      default: return faFileAlt;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.full_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = currentDocumentType === 'all' || (doc.document_type || '').toLowerCase() === currentDocumentType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const switchTab = (tabName: string) => {
    setCurrentTab(tabName);
  };

  const createNewDocument = async (type: string) => {
    setShowNewDocumentMenu(false);
    
    // Se for Guia de Entrada, usar o formulário específico
    if (type === 'guia') {
      try {
        const response = await fetch(`http://localhost:3001/api/purchases/document-numbers/GE`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Backend não está disponível');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setGuiaEntradaData({
            id: null,
            numero: data.data.number,
            serie: data.data.series,
            data: new Date().toISOString().split('T')[0],
            fornecedor: {
              codigo: '',
              nome: '',
              nuit: '',
              email: '',
              morada: ''
            },
            encomendaReferencia: '',
            transportador: '',
            numeroGuiaTransporte: '',
            artigos: [],
            informacoesRececao: {
              dataRececao: new Date().toISOString().split('T')[0],
              horaRececao: new Date().toTimeString().split(' ')[0].substring(0, 5),
              responsavelRececao: '',
              condicoesEmbalagem: '',
              observacoesRececao: '',
              conformidade: true
            },
            totais: {
              subtotal: 0,
              iva16: 0,
              iva5: 0,
              total: 0
            },
            observacoes: '',
            estado: 'rascunho'
          });
          setShowGuiaEntradaForm(true);
          return;
        }
      } catch (error) {
        console.error('Erro ao criar Guia de Entrada:', error);
        alert('Erro ao criar Guia de Entrada');
        return;
      }
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/purchases/document-numbers/${type}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend não está disponível');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const documentData: DocumentoCompra = {
          document_type: type.toUpperCase(),
          series: data.data.series,
          number: data.data.number,
          full_number: data.data.full_number,
          document_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          supplier_name: '',
          supplier_tax_number: '',
          supplier_address: '',
          supplier_email: '',
          comprador: 'João Silva',
          payment_terms: '30dias',
          currency: 'MZN',
          subtotal: 0,
          vat_amount: 0,
          total_amount: 0,
          status: 'DRAFT'
        };

        const createResponse = await fetch('http://localhost:3001/api/purchases/documents', {
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
          loadDocuments();
        } else {
          alert('Erro ao criar documento: ' + createData.message);
        }
      }
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      // Criar documento localmente se o backend não estiver disponível
      const newDoc: DocumentoCompra = {
        id: Date.now(),
        document_type: type.toUpperCase(),
        series: type.toUpperCase().substring(0, 3),
        number: '2024/001',
        full_number: `${type.toUpperCase().substring(0, 3)} 2024/001`,
        document_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        supplier_name: '',
        supplier_tax_number: '',
        supplier_address: '',
        supplier_email: '',
        comprador: 'João Silva',
        payment_terms: '30dias',
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

  const editDocument = (document: DocumentoCompra) => {
    setCurrentDocument(document);
    setCurrentTab('editar');
  };

  const deleteDocument = async (id: number) => {
    if (window.confirm('Tem a certeza que deseja eliminar este documento?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/purchases/documents/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadDocuments();
        } else {
          alert('Erro ao eliminar documento');
        }
      } catch (error) {
        console.error('Erro ao eliminar documento:', error);
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    }
  };

  const saveDocument = async () => {
    if (!currentDocument) return;

    try {
      const response = await fetch('http://localhost:3001/api/purchases/documents', {
        method: currentDocument.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentDocument)
      });

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
      
      const updatedDocuments = currentDocument.id 
        ? documents.map(doc => doc.id === currentDocument.id ? currentDocument : doc)
        : [...documents, { ...currentDocument, id: Date.now() }];
      
      setDocuments(updatedDocuments);
      setCurrentDocument(null);
      setCurrentTab('lista');
      alert('Documento guardado localmente (backend não disponível)');
    }
  };

  const cancelDocument = () => {
    if (window.confirm('Tem a certeza que deseja cancelar? Todas as alterações serão perdidas.')) {
      setCurrentDocument(null);
      setCurrentTab('lista');
    }
  };

  // ==================== FUNÇÕES DE STOCK ====================

  // Carregar produtos e categorias
  const loadStockData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento de dados de stock...');
      
      // Carregar categorias
      const categoriasResponse = await fetch('http://localhost:3001/api/stock/categorias');
      console.log('Resposta categorias:', categoriasResponse.status);
      if (categoriasResponse.ok) {
        const categoriasData = await categoriasResponse.json();
        console.log('Dados de categorias recebidos:', categoriasData);
        setCategorias(categoriasData);
      } else {
        console.error('Erro ao carregar categorias:', categoriasResponse.status);
      }
      
      // Carregar produtos
      const produtosResponse = await fetch('http://localhost:3001/api/stock/produtos');
      console.log('Resposta produtos:', produtosResponse.status);
      if (produtosResponse.ok) {
        const produtosData = await produtosResponse.json();
        console.log('Dados de produtos recebidos:', produtosData);
        setProdutos(produtosData);
      } else {
        console.error('Erro ao carregar produtos:', produtosResponse.status);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de stock:', error);
    } finally {
      setLoading(false);
    }
  };

  // Criar novo produto
  const createProduto = async (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/stock/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
      });

      if (response.ok) {
        const novoProduto = await response.json();
        setProdutos([...produtos, novoProduto]);
        setShowProdutoForm(false);
        alert('Produto criado com sucesso!');
      } else {
        alert('Erro ao criar produto');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Erro ao criar produto');
    }
  };

  // Atualizar produto
  const updateProduto = async (id: string, produto: Partial<Produto>) => {
    try {
      const response = await fetch(`http://localhost:3001/api/stock/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
      });

      if (response.ok) {
        const produtoAtualizado = await response.json();
        setProdutos(produtos.map(p => p.id === id ? produtoAtualizado : p));
        setShowProdutoForm(false);
        setProdutoSelecionado(null);
        alert('Produto atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar produto');
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto');
    }
  };

  // Eliminar produto
  const deleteProduto = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este produto?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/stock/produtos/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProdutos(produtos.filter(p => p.id !== id));
          alert('Produto eliminado com sucesso!');
        } else {
          alert('Erro ao eliminar produto');
        }
      } catch (error) {
        console.error('Erro ao eliminar produto:', error);
        alert('Erro ao eliminar produto');
      }
    }
  };

  // Criar nova categoria
  const createCategoria = async (categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/stock/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });

      if (response.ok) {
        const novaCategoria = await response.json();
        setCategorias([...categorias, novaCategoria]);
        setShowCategoriaForm(false);
        alert('Categoria criada com sucesso!');
        return novaCategoria;
      } else {
        alert('Erro ao criar categoria');
        return null;
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria');
      return null;
    }
  };

  // Funções para Guia de Entrada
  const adicionarLinhaGuiaEntrada = () => {
    const novaLinha: ArtigoEntrada = {
      id: `artigo_${Date.now()}`,
      codigo: '',
      descricao: '',
      quantidade: 1,
      quantidadeRecebida: 1,
      precoUnitario: 0,
      desconto: 0,
      iva: 0.16,
      valorTotal: 0,
      loteNumero: '',
      dataValidade: '',
      localizacao: '',
      observacoes: ''
    };

    setGuiaEntradaData({
      ...guiaEntradaData,
      artigos: [...guiaEntradaData.artigos, novaLinha]
    });
  };

  const atualizarLinhaGuiaEntrada = (id: string, campo: string, valor: any) => {
    setGuiaEntradaData({
      ...guiaEntradaData,
      artigos: guiaEntradaData.artigos.map(artigo => {
        if (artigo.id === id) {
          const artigoAtualizado = { ...artigo, [campo]: valor };
          
          // Calcular valor total da linha
          const subtotal = artigoAtualizado.quantidadeRecebida * artigoAtualizado.precoUnitario;
          const desconto = subtotal * (artigoAtualizado.desconto / 100);
          const valorComDesconto = subtotal - desconto;
          const iva = valorComDesconto * artigoAtualizado.iva;
          artigoAtualizado.valorTotal = valorComDesconto + iva;
          
          return artigoAtualizado;
        }
        return artigo;
      })
    });
  };

  const removerLinhaGuiaEntrada = (id: string) => {
    setGuiaEntradaData({
      ...guiaEntradaData,
      artigos: guiaEntradaData.artigos.filter(artigo => artigo.id !== id)
    });
  };

  const calcularTotaisGuiaEntrada = () => {
    const subtotal = guiaEntradaData.artigos.reduce((sum, artigo) => sum + (artigo.quantidadeRecebida * artigo.precoUnitario), 0);
    const iva16 = guiaEntradaData.artigos
      .filter(artigo => artigo.iva === 0.16)
      .reduce((sum, artigo) => sum + (artigo.valorTotal - (artigo.valorTotal / 1.16)), 0);
    const iva5 = guiaEntradaData.artigos
      .filter(artigo => artigo.iva === 0.05)
      .reduce((sum, artigo) => sum + (artigo.valorTotal - (artigo.valorTotal / 1.05)), 0);
    const total = guiaEntradaData.artigos.reduce((sum, artigo) => sum + artigo.valorTotal, 0);

    setGuiaEntradaData({
      ...guiaEntradaData,
      totais: { subtotal, iva16, iva5, total }
    });
  };

  const salvarGuiaEntrada = async () => {
    try {
      setLoading(true);
      
      // Calcular totais antes de salvar
      calcularTotaisGuiaEntrada();
      
      const documento = {
        document_type: 'GE',
        series: guiaEntradaData.serie,
        number: guiaEntradaData.numero,
        full_number: `${guiaEntradaData.serie} ${guiaEntradaData.numero}`,
        document_date: guiaEntradaData.data,
        supplier_name: guiaEntradaData.fornecedor.nome,
        supplier_tax_number: guiaEntradaData.fornecedor.nuit,
        supplier_address: guiaEntradaData.fornecedor.morada,
        supplier_email: guiaEntradaData.fornecedor.email,
        encomenda_referencia: guiaEntradaData.encomendaReferencia,
        transportador: guiaEntradaData.transportador,
        numero_guia_transporte: guiaEntradaData.numeroGuiaTransporte,
        linhas: guiaEntradaData.artigos,
        informacoes_rececao: guiaEntradaData.informacoesRececao,
        totais: guiaEntradaData.totais,
        observacoes: guiaEntradaData.observacoes,
        status: guiaEntradaData.estado.toUpperCase(),
        subtotal: guiaEntradaData.totais.subtotal,
        total_amount: guiaEntradaData.totais.total
      };

      const response = await fetch('http://localhost:3001/api/purchases/documents', {
        method: guiaEntradaData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(documento)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Se o estado for "confirmado", processar entrada no stock
        if (guiaEntradaData.estado === 'confirmado') {
          try {
            const confirmResponse = await fetch(`http://localhost:3001/api/purchases/confirmar-guia-entrada/${data.data.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (confirmResponse.ok) {
              const confirmData = await confirmResponse.json();
              alert(`Guia de Entrada confirmada e ${confirmData.produtos_atualizados?.length || 0} produto(s) adicionado(s) ao stock!`);
            } else {
              alert('Guia de Entrada guardada, mas erro ao processar entrada no stock');
            }
          } catch (error) {
            console.error('Erro ao confirmar Guia de Entrada:', error);
            alert('Guia de Entrada guardada, mas erro ao processar entrada no stock');
          }
        } else {
          alert('Guia de Entrada guardada com sucesso!');
        }
        
        setShowGuiaEntradaForm(false);
        loadDocuments();
      } else {
        alert('Erro ao guardar Guia de Entrada');
      }
    } catch (error) {
      console.error('Erro ao guardar Guia de Entrada:', error);
      alert('Erro ao guardar Guia de Entrada');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const matchSearch = produto.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
                       produto.codigo.toLowerCase().includes(searchProduto.toLowerCase());
    const matchCategoria = filtroCategoria === 'all' || produto.categoria_id === filtroCategoria;
    const matchStatus = filtroStatus === 'all' || 
                       (filtroStatus === 'ativo' && produto.ativo) ||
                       (filtroStatus === 'inativo' && !produto.ativo);
    
    return matchSearch && matchCategoria && matchStatus;
  });

  // Função para salvar produto
  const handleSaveProduto = async () => {
    try {
      setLoading(true);
      
      // Coletar dados do formulário usando IDs únicos
      const form = document.querySelector('.produto-form-content') as HTMLElement;
      if (!form) {
        alert('Formulário não encontrado');
        return;
      }

      const pesoValue = parseFloat((form.querySelector('#produto-peso') as HTMLInputElement)?.value || '0');
      
      const produtoData = {
        codigo: (form.querySelector('#produto-codigo') as HTMLInputElement)?.value || '',
        codigo_barras: (form.querySelector('#produto-codigo-barras') as HTMLInputElement)?.value || '',
        nome: (form.querySelector('#produto-nome') as HTMLInputElement)?.value || '',
        descricao: (form.querySelector('#produto-descricao') as HTMLTextAreaElement)?.value || '',
        categoria_id: (form.querySelector('#produto-categoria') as HTMLSelectElement)?.value || '',
        unidade_medida: (form.querySelector('#produto-unidade') as HTMLSelectElement)?.value || 'un',
        peso: pesoValue > 0 ? pesoValue : undefined,
        dimensoes: (form.querySelector('#produto-dimensoes') as HTMLInputElement)?.value || '',
        stock_minimo: parseInt((form.querySelector('#produto-stock-min') as HTMLInputElement)?.value || '0') || 0,
        stock_maximo: parseInt((form.querySelector('#produto-stock-max') as HTMLInputElement)?.value || '0') || 0,
        stock_atual: parseInt((form.querySelector('#produto-stock-atual') as HTMLInputElement)?.value || '0') || 0,
        stock_reservado: produtoSelecionado?.stock_reservado || 0,
        stock_disponivel: parseInt((form.querySelector('#produto-stock-atual') as HTMLInputElement)?.value || '0') || 0,
        localizacao: (form.querySelector('#produto-localizacao') as HTMLInputElement)?.value || '',
        fornecedor_principal: (form.querySelector('#produto-fornecedor') as HTMLInputElement)?.value || '',
        observacoes: (form.querySelector('#produto-observacoes') as HTMLTextAreaElement)?.value || '',
        ativo: (form.querySelector('#produto-ativo') as HTMLInputElement)?.checked ?? true,
        precos: [] as Preco[]
      };

      // Validações
      if (!produtoData.codigo?.trim()) {
        alert('Código do produto é obrigatório');
        return;
      }
      if (!produtoData.nome?.trim()) {
        alert('Nome do produto é obrigatório');
        return;
      }
      if (!produtoData.categoria_id) {
        alert('Categoria é obrigatória');
        return;
      }

      // Processar preço de venda se fornecido
      const precoVendaValue = parseFloat((form.querySelector('#produto-preco-venda') as HTMLInputElement)?.value || '0');
      if (precoVendaValue > 0) {
        produtoData.precos = [{
          id: `preco_${Date.now()}`,
          produto_id: produtoSelecionado?.id || '',
          tipo: 'venda',
          valor: precoVendaValue,
          moeda: 'MZN',
          data_inicio: new Date().toISOString().split('T')[0],
          ativo: true
        }];
      }

      if (produtoSelecionado) {
        // Atualizar produto existente
        await updateProduto(produtoSelecionado.id, produtoData);
      } else {
        // Criar novo produto
        await createProduto(produtoData as Omit<Produto, "id" | "created_at" | "updated_at">);
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar categoria
  const handleSaveCategoria = async () => {
    try {
      setLoading(true);
      
      // Coletar dados do formulário de categoria
      const form = document.querySelector('.categoria-form-content') as HTMLElement;
      if (!form) {
        alert('Formulário não encontrado');
        return;
      }

      const categoriaData = {
        codigo: (form.querySelector('#categoria-codigo') as HTMLInputElement)?.value || '',
        nome: (form.querySelector('#categoria-nome') as HTMLInputElement)?.value || '',
        descricao: (form.querySelector('#categoria-descricao') as HTMLTextAreaElement)?.value || '',
        ativa: (form.querySelector('#categoria-ativa') as HTMLInputElement)?.checked ?? true
      };

      // Validações
      if (!categoriaData.codigo.trim()) {
        alert('Código da categoria é obrigatório');
        return;
      }
      if (!categoriaData.nome.trim()) {
        alert('Nome da categoria é obrigatório');
        return;
      }

      await createCategoria(categoriaData);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar nova categoria do modal do produto
  const handleSaveNovaCategoria = async () => {
    try {
      setLoading(true);
      
      // Coletar dados do modal de nova categoria
      const categoriaData = {
        codigo: (document.querySelector('#nova-categoria-codigo') as HTMLInputElement)?.value || '',
        nome: (document.querySelector('#nova-categoria-nome') as HTMLInputElement)?.value || '',
        descricao: (document.querySelector('#nova-categoria-descricao') as HTMLTextAreaElement)?.value || '',
        ativa: (document.querySelector('#nova-categoria-ativa') as HTMLInputElement)?.checked ?? true
      };

      // Validações
      if (!categoriaData.codigo.trim()) {
        alert('Código da categoria é obrigatório');
        return;
      }
      if (!categoriaData.nome.trim()) {
        alert('Nome da categoria é obrigatório');
        return;
      }

      // Criar categoria
      const novaCategoria = await createCategoria(categoriaData);
      
      // Atualizar o dropdown de categoria no formulário de produto
      const categoriaSelect = document.querySelector('#produto-categoria') as HTMLSelectElement;
      if (categoriaSelect && novaCategoria) {
        categoriaSelect.value = novaCategoria.id;
      }

      // Fechar modal
      setShowNovaCategoriaModal(false);
      
      alert(`Categoria "${categoriaData.nome}" criada com sucesso e selecionada!`);
    } catch (error) {
      console.error('Erro ao salvar nova categoria:', error);
      alert('Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentList = () => {
    if (loading) {
      return (
        <div className="compras-loading">
          <div className="loading-spinner"></div>
          <p>Carregando documentos...</p>
        </div>
      );
    }

    return (
      <div className="compras-list">
        <div className="compras-list-header">
          <div className="search-filters">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar documentos ou fornecedores..."
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

        <div className="compras-table-container">
          <table className="compras-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Fornecedor</th>
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
                      <div className="document-type">
                        <FontAwesomeIcon icon={getDocumentTypeIcon(doc.document_type)} />
                        {getDocumentTypeLabel(doc.document_type)}
                      </div>
                      <div className="document-number">{doc.full_number}</div>
                    </div>
                  </td>
                  <td>
                    <div className="supplier-info">
                      <div className="supplier-name">{doc.supplier_name}</div>
                      <div className="supplier-tax">{doc.supplier_tax_number}</div>
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
      <div className="compras-form">
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
            <h4>Informações do Documento</h4>
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
              <div className="form-group">
                <label>Estado:</label>
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

          <div className="form-section">
            <h4>Dados do Fornecedor</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Fornecedor:</label>
                <input 
                  type="text" 
                  value={currentDocument.supplier_name || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, supplier_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Número de Contribuinte:</label>
                <input 
                  type="text" 
                  value={currentDocument.supplier_tax_number || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, supplier_tax_number: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={currentDocument.supplier_email || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, supplier_email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Endereço:</label>
                <input 
                  type="text" 
                  value={currentDocument.supplier_address || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, supplier_address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Condições Comerciais</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Comprador:</label>
                <input 
                  type="text" 
                  value={currentDocument.comprador || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, comprador: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Condição de Pagamento:</label>
                <select 
                  value={currentDocument.payment_terms || '30dias'}
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
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDERIZAÇÃO DE GUIA DE ENTRADA ====================

  const renderGuiaEntradaForm = () => {
    return (
      <div className="guia-entrada-form">
        <div className="form-header">
          <h3>Guia de Entrada - {guiaEntradaData.serie} {guiaEntradaData.numero}</h3>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setShowGuiaEntradaForm(false)}>
              <FontAwesomeIcon icon={faTimes} />
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={salvarGuiaEntrada}>
              <FontAwesomeIcon icon={faSave} />
              Guardar
            </button>
            <button 
              className="btn btn-success" 
              onClick={() => {
                setGuiaEntradaData({...guiaEntradaData, estado: 'confirmado'});
                setTimeout(() => salvarGuiaEntrada(), 100);
              }}
              disabled={guiaEntradaData.artigos.length === 0}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              Confirmar e Entrar no Stock
            </button>
          </div>
        </div>

        <div className="form-sections">
          {/* Informações do Documento */}
          <div className="form-section">
            <h4>
              <FontAwesomeIcon icon={faFileInvoice} className="section-icon" />
              Informações do Documento
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Série:</label>
                <input type="text" value={guiaEntradaData.serie} readOnly />
              </div>
              <div className="form-group">
                <label>Número:</label>
                <input type="text" value={guiaEntradaData.numero} readOnly />
              </div>
              <div className="form-group">
                <label>Data do Documento:</label>
                <input 
                  type="date" 
                  value={guiaEntradaData.data}
                  onChange={(e) => setGuiaEntradaData({...guiaEntradaData, data: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <select 
                  value={guiaEntradaData.estado}
                  onChange={(e) => setGuiaEntradaData({...guiaEntradaData, estado: e.target.value})}
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="recebido">Recebido</option>
                  <option value="confirmado">Confirmado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dados do Fornecedor */}
          <div className="form-section">
            <h4>
              <FontAwesomeIcon icon={faBuilding} className="section-icon" />
              Dados do Fornecedor
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Código do Fornecedor:</label>
                <input 
                  type="text" 
                  value={guiaEntradaData.fornecedor.codigo}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    fornecedor: {...guiaEntradaData.fornecedor, codigo: e.target.value}
                  })}
                  placeholder="Ex: FORN001"
                />
              </div>
              <div className="form-group">
                <label>Nome/Nome Comercial:</label>
                <input 
                  type="text" 
                  value={guiaEntradaData.fornecedor.nome}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    fornecedor: {...guiaEntradaData.fornecedor, nome: e.target.value}
                  })}
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div className="form-group">
                <label>NUIT:</label>
                <input 
                  type="text" 
                  value={guiaEntradaData.fornecedor.nuit}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    fornecedor: {...guiaEntradaData.fornecedor, nuit: e.target.value}
                  })}
                  placeholder="Número de identificação fiscal"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={guiaEntradaData.fornecedor.email}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    fornecedor: {...guiaEntradaData.fornecedor, email: e.target.value}
                  })}
                  placeholder="email@fornecedor.co.mz"
                />
              </div>
              <div className="form-group full-width">
                <label>Morada:</label>
                <input 
                  type="text" 
                  value={guiaEntradaData.fornecedor.morada}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    fornecedor: {...guiaEntradaData.fornecedor, morada: e.target.value}
                  })}
                  placeholder="Morada completa do fornecedor"
                />
              </div>
            </div>
          </div>

          {/* Informações de Transporte */}
          <div className="form-section">
            <h4>
              <FontAwesomeIcon icon={faTruck} className="section-icon" />
              Informações de Transporte
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Encomenda de Referência:</label>
                <input 
                  type="text" 
                  value={guiaEntradaData.encomendaReferencia}
                  onChange={(e) => setGuiaEntradaData({...guiaEntradaData, encomendaReferencia: e.target.value})}
                  placeholder="Ex: EA-2025/001"
                />
              </div>
              <div className="form-group">
                <label>Transportador:</label>
                <input 
                  type="text" 
                  value={guiaEntradaData.transportador}
                  onChange={(e) => setGuiaEntradaData({...guiaEntradaData, transportador: e.target.value})}
                  placeholder="Nome do transportador"
                />
              </div>
              <div className="form-group">
                <label>Nº Guia Transporte:</label>
                <input 
                  type="text" 
                  value={guiaEntradaData.numeroGuiaTransporte}
                  onChange={(e) => setGuiaEntradaData({...guiaEntradaData, numeroGuiaTransporte: e.target.value})}
                  placeholder="Número da guia de transporte"
                />
              </div>
            </div>
          </div>

          {/* Artigos a Receber */}
          <div className="form-section">
            <h4>
              <FontAwesomeIcon icon={faBox} className="section-icon" />
              Artigos a Receber
            </h4>
            <div className="section-actions">
              <button className="btn btn-primary" onClick={adicionarLinhaGuiaEntrada}>
                <FontAwesomeIcon icon={faPlus} />
                Adicionar Linha
              </button>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Qtd. Encomendada</th>
                    <th>Qtd. Recebida</th>
                    <th>Preço Unitário</th>
                    <th>% Desconto</th>
                    <th>Taxa IVA</th>
                    <th>Lote/Nº</th>
                    <th>Data Validade</th>
                    <th>Localização</th>
                    <th>Valor Total</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {guiaEntradaData.artigos.map((artigo, index) => (
                    <tr key={artigo.id}>
                      <td>
                        <input 
                          type="text" 
                          value={artigo.codigo}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'codigo', e.target.value)}
                          placeholder="Código"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={artigo.descricao}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'descricao', e.target.value)}
                          placeholder="Descrição"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={artigo.quantidade}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'quantidade', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={artigo.quantidadeRecebida}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'quantidadeRecebida', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={artigo.precoUnitario}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'precoUnitario', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={artigo.desconto}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'desconto', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <select 
                          value={artigo.iva}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'iva', parseFloat(e.target.value))}
                        >
                          <option value={0.16}>16%</option>
                          <option value={0.05}>5%</option>
                          <option value={0}>Isento</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={artigo.loteNumero}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'loteNumero', e.target.value)}
                          placeholder="Lote/Nº"
                        />
                      </td>
                      <td>
                        <input 
                          type="date" 
                          value={artigo.dataValidade}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'dataValidade', e.target.value)}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={artigo.localizacao}
                          onChange={(e) => atualizarLinhaGuiaEntrada(artigo.id, 'localizacao', e.target.value)}
                          placeholder="Localização"
                        />
                      </td>
                      <td>
                        <span className="valor-total">{artigo.valorTotal.toFixed(2)} MZN</span>
                      </td>
                      <td>
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => removerLinhaGuiaEntrada(artigo.id)}
                          title="Remover linha"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Informações de Receção */}
          <div className="form-section">
            <h4>
              <FontAwesomeIcon icon={faCheckCircle} className="section-icon" />
              Informações de Receção
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Data de Receção:</label>
                <input 
                  type="date" 
                  value={guiaEntradaData.informacoesRececao.dataRececao}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    informacoesRececao: {...guiaEntradaData.informacoesRececao, dataRececao: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label>Hora de Receção:</label>
                <input 
                  type="time" 
                  value={guiaEntradaData.informacoesRececao.horaRececao}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    informacoesRececao: {...guiaEntradaData.informacoesRececao, horaRececao: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label>Responsável pela Receção:</label>
                <input 
                  type="text" 
                  value={guiaEntradaData.informacoesRececao.responsavelRececao}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    informacoesRececao: {...guiaEntradaData.informacoesRececao, responsavelRececao: e.target.value}
                  })}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="form-group">
                <label>Conformidade:</label>
                <select 
                  value={guiaEntradaData.informacoesRececao.conformidade ? 'sim' : 'nao'}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    informacoesRececao: {...guiaEntradaData.informacoesRececao, conformidade: e.target.value === 'sim'}
                  })}
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Condições da Embalagem:</label>
                <textarea 
                  value={guiaEntradaData.informacoesRececao.condicoesEmbalagem}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    informacoesRececao: {...guiaEntradaData.informacoesRececao, condicoesEmbalagem: e.target.value}
                  })}
                  placeholder="Descreva o estado da embalagem..."
                  rows={3}
                />
              </div>
              <div className="form-group full-width">
                <label>Observações da Receção:</label>
                <textarea 
                  value={guiaEntradaData.informacoesRececao.observacoesRececao}
                  onChange={(e) => setGuiaEntradaData({
                    ...guiaEntradaData, 
                    informacoesRececao: {...guiaEntradaData.informacoesRececao, observacoesRececao: e.target.value}
                  })}
                  placeholder="Observações sobre a receção..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Totais */}
          <div className="form-section">
            <h4>
              <FontAwesomeIcon icon={faMoneyBillWave} className="section-icon" />
              Totais
            </h4>
            <div className="totals-container">
              <div className="total-row">
                <span>Subtotal (sem IVA):</span>
                <span>{guiaEntradaData.totais.subtotal.toFixed(2)} MZN</span>
              </div>
              <div className="total-row">
                <span>IVA 16%:</span>
                <span>{guiaEntradaData.totais.iva16.toFixed(2)} MZN</span>
              </div>
              <div className="total-row">
                <span>IVA 5%:</span>
                <span>{guiaEntradaData.totais.iva5.toFixed(2)} MZN</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>{guiaEntradaData.totais.total.toFixed(2)} MZN</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="form-section">
            <h4>
              <FontAwesomeIcon icon={faFileAlt} className="section-icon" />
              Observações
            </h4>
            <div className="form-group">
              <textarea 
                value={guiaEntradaData.observacoes}
                onChange={(e) => setGuiaEntradaData({...guiaEntradaData, observacoes: e.target.value})}
                placeholder="Observações gerais sobre a guia de entrada..."
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDERIZAÇÃO DE STOCK ====================

  const renderStockSection = () => {
    if (loading) {
      return (
        <div className="stock-loading">
          <div className="loading-spinner"></div>
          <p>Carregando produtos...</p>
        </div>
      );
    }

    return (
      <div className="stock-section">
        {/* Header da seção Stock */}
        <div className="stock-header">
          <div className="stock-header-content">
            <h2>Gestão de Stock</h2>
            <p>Controle completo de produtos e categorias</p>
          </div>
          <div className="stock-header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                console.log('Categorias atuais:', categorias);
                loadStockData();
              }}
            >
              <FontAwesomeIcon icon={faRefresh} />
              Recarregar Dados
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowCategoriaForm(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Nova Categoria
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowProdutoForm(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Novo Produto
            </button>
          </div>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="stock-filters">
          <div className="stock-search">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar produtos por nome ou código..."
                value={searchProduto}
                onChange={(e) => setSearchProduto(e.target.value)}
              />
            </div>
          </div>
          <div className="stock-filters-row">
            <div className="filter-group">
              <label>Categoria:</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="all">Todas as Categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="stock-table-container">
          <div className="stock-table-header">
            <div className="stock-table-title">
              <h3>Produtos em Stock ({produtosFiltrados.length})</h3>
            </div>
          </div>
          
          <div className="stock-table">
            <div className="stock-table-head">
              <div className="stock-col-codigo">Código</div>
              <div className="stock-col-nome">Nome</div>
              <div className="stock-col-categoria">Categoria</div>
              <div className="stock-col-unidade">Unidade</div>
              <div className="stock-col-stock">Stock Atual</div>
              <div className="stock-col-min">Stock Mín</div>
              <div className="stock-col-max">Stock Máx</div>
              <div className="stock-col-preco">Preço Venda</div>
              <div className="stock-col-status">Status</div>
              <div className="stock-col-acoes">Ações</div>
            </div>
            
            <div className="stock-table-body">
              {produtosFiltrados.map(produto => (
                <div key={produto.id} className="stock-table-row">
                  <div className="stock-col-codigo">
                    <span className="produto-codigo">{produto.codigo}</span>
                    {produto.codigo_barras && (
                      <span className="produto-barras">{produto.codigo_barras}</span>
                    )}
                  </div>
                  <div className="stock-col-nome">
                    <div className="produto-nome">{produto.nome}</div>
                    {produto.descricao && (
                      <div className="produto-descricao">{produto.descricao}</div>
                    )}
                  </div>
                  <div className="stock-col-categoria">
                    <span className="categoria-badge">
                      {produto.categoria?.nome || 'Sem categoria'}
                    </span>
                  </div>
                  <div className="stock-col-unidade">
                    {produto.unidade_medida}
                  </div>
                  <div className="stock-col-stock">
                    <div className="stock-valor">
                      {produto.stock_atual}
                    </div>
                    <div className="stock-disponivel">
                      Disp: {produto.stock_disponivel}
                    </div>
                  </div>
                  <div className="stock-col-min">
                    {produto.stock_minimo}
                  </div>
                  <div className="stock-col-max">
                    {produto.stock_maximo}
                  </div>
                  <div className="stock-col-preco">
                    {produto.precos.find(p => p.tipo === 'venda' && p.ativo)?.valor.toFixed(2) || '0.00'} MZN
                  </div>
                  <div className="stock-col-status">
                    <span className={`status-badge ${produto.ativo ? 'ativo' : 'inativo'}`}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="stock-col-acoes">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => {
                        setProdutoSelecionado(produto);
                        setShowProdutoForm(true);
                      }}
                      title="Editar Produto"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => deleteProduto(produto.id)}
                      title="Eliminar Produto"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulário de Produto */}
        {showProdutoForm && (
          <div className="produto-form-overlay" onClick={() => setShowProdutoForm(false)}>
            <div className="produto-form-container" onClick={(e) => e.stopPropagation()}>
              <div className="produto-form-header">
                <h3>{produtoSelecionado ? 'Editar Produto' : 'Novo Produto'}</h3>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowProdutoForm(false);
                    setProdutoSelecionado(null);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="produto-form-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Código do Produto:</label>
                    <input 
                      id="produto-codigo"
                      type="text" 
                      defaultValue={produtoSelecionado?.codigo || ''}
                      placeholder="Ex: PROD001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Código de Barras:</label>
                    <input 
                      id="produto-codigo-barras"
                      type="text" 
                      defaultValue={produtoSelecionado?.codigo_barras || ''}
                      placeholder="Ex: 1234567890123"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Nome do Produto:</label>
                    <input 
                      id="produto-nome"
                      type="text" 
                      defaultValue={produtoSelecionado?.nome || ''}
                      placeholder="Nome completo do produto"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descrição:</label>
                    <textarea 
                      id="produto-descricao"
                      defaultValue={produtoSelecionado?.descricao || ''}
                      placeholder="Descrição detalhada do produto"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoria:</label>
                    <div className="categoria-select-container">
                      <select 
                        id="produto-categoria" 
                        defaultValue={produtoSelecionado?.categoria_id || ''}
                        onChange={(e) => {
                          if (e.target.value === 'nova_categoria') {
                            setShowNovaCategoriaModal(true);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Selecionar Categoria</option>
                        {categorias.map(categoria => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </option>
                        ))}
                        <option value="nova_categoria" style={{ color: '#667eea', fontWeight: 'bold' }}>
                          + Adicionar Nova Categoria
                        </option>
                      </select>
                      <button 
                        type="button"
                        className="btn btn-small"
                        onClick={() => {
                          console.log('Categorias atuais:', categorias);
                          loadStockData();
                        }}
                        style={{ marginTop: '5px', fontSize: '12px', padding: '5px 10px' }}
                      >
                        Recarregar Categorias
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Unidade de Medida:</label>
                    <select id="produto-unidade" defaultValue={produtoSelecionado?.unidade_medida || 'un'}>
                      <option value="un">Unidade</option>
                      <option value="kg">Quilograma</option>
                      <option value="g">Grama</option>
                      <option value="l">Litro</option>
                      <option value="ml">Mililitro</option>
                      <option value="m">Metro</option>
                      <option value="cm">Centímetro</option>
                      <option value="m²">Metro Quadrado</option>
                      <option value="m³">Metro Cúbico</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Stock Mínimo:</label>
                    <input 
                      id="produto-stock-min"
                      type="number" 
                      defaultValue={produtoSelecionado?.stock_minimo || 0}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Máximo:</label>
                    <input 
                      id="produto-stock-max"
                      type="number" 
                      defaultValue={produtoSelecionado?.stock_maximo || 0}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Atual:</label>
                    <input 
                      id="produto-stock-atual"
                      type="number" 
                      defaultValue={produtoSelecionado?.stock_atual || 0}
                      min="0"
                      placeholder="Quantidade em stock"
                    />
                  </div>
                  <div className="form-group">
                    <label>Preço de Venda (MZN):</label>
                    <input 
                      id="produto-preco-venda"
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      defaultValue={produtoSelecionado?.precos?.find(p => p.tipo === 'venda' && p.ativo)?.valor || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Peso (kg):</label>
                    <input 
                      id="produto-peso"
                      type="number" 
                      defaultValue={produtoSelecionado?.peso || ''}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Dimensões:</label>
                    <input 
                      id="produto-dimensoes"
                      type="text" 
                      defaultValue={produtoSelecionado?.dimensoes || ''}
                      placeholder="Ex: 10x20x30 cm"
                    />
                  </div>
                  <div className="form-group">
                    <label>Localização:</label>
                    <input 
                      id="produto-localizacao"
                      type="text" 
                      defaultValue={produtoSelecionado?.localizacao || ''}
                      placeholder="Ex: Armazém A, Prateleira 1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fornecedor Principal:</label>
                    <input 
                      id="produto-fornecedor"
                      type="text" 
                      defaultValue={produtoSelecionado?.fornecedor_principal || ''}
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Observações:</label>
                    <textarea 
                      id="produto-observacoes"
                      defaultValue={produtoSelecionado?.observacoes || ''}
                      placeholder="Observações adicionais"
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input 
                        id="produto-ativo"
                        type="checkbox" 
                        defaultChecked={produtoSelecionado?.ativo ?? true}
                      />
                      Produto Ativo
                    </label>
                  </div>
                </div>
                
                <div className="produto-form-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowProdutoForm(false);
                      setProdutoSelecionado(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveProduto}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSave} />
                    {loading ? 'Guardando...' : 'Guardar Produto'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Nova Categoria (do formulário de produto) */}
        {showNovaCategoriaModal && (
          <div className="nova-categoria-modal-overlay" onClick={() => setShowNovaCategoriaModal(false)}>
            <div className="nova-categoria-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="nova-categoria-modal-header">
                <h3>Nova Categoria</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowNovaCategoriaModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="nova-categoria-modal-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Código da Categoria:</label>
                    <input 
                      id="nova-categoria-codigo"
                      type="text" 
                      placeholder="Ex: MAT_INF"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nome da Categoria:</label>
                    <input 
                      id="nova-categoria-nome"
                      type="text" 
                      placeholder="Ex: Material Informático"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descrição:</label>
                    <textarea 
                      id="nova-categoria-descricao"
                      placeholder="Descrição da categoria"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input id="nova-categoria-ativa" type="checkbox" defaultChecked />
                      Categoria Ativa
                    </label>
                  </div>
                </div>
                
                <div className="nova-categoria-modal-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowNovaCategoriaModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveNovaCategoria}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSave} />
                    {loading ? 'Guardando...' : 'Guardar e Usar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulário de Categoria */}
        {showCategoriaForm && (
          <div className="categoria-form-overlay" onClick={() => setShowCategoriaForm(false)}>
            <div className="categoria-form-container" onClick={(e) => e.stopPropagation()}>
              <div className="categoria-form-header">
                <h3>Nova Categoria</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowCategoriaForm(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="categoria-form-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Código da Categoria:</label>
                    <input 
                      id="categoria-codigo"
                      type="text" 
                      placeholder="Ex: MAT_INF"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nome da Categoria:</label>
                    <input 
                      id="categoria-nome"
                      type="text" 
                      placeholder="Ex: Material Informático"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descrição:</label>
                    <textarea 
                      id="categoria-descricao"
                      placeholder="Descrição da categoria"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input id="categoria-ativa" type="checkbox" defaultChecked />
                      Categoria Ativa
                    </label>
                  </div>
                </div>
                
                <div className="categoria-form-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowCategoriaForm(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveCategoria}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSave} />
                    {loading ? 'Guardando...' : 'Guardar Categoria'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="compras-container">
      {/* Header */}
      <div className="compras-header">
        <div className="header-content">
          <h1>Módulo de Compras</h1>
          <p>Gestão completa do processo de compras</p>
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
          className={`tab-btn ${currentDocumentType === 'requisicao' ? 'active' : ''}`}
          onClick={() => selectDocumentType('requisicao')}
        >
          <FontAwesomeIcon icon={faClipboardList} />
          Requisições
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'encomenda' ? 'active' : ''}`}
          onClick={() => selectDocumentType('encomenda')}
        >
          <FontAwesomeIcon icon={faShoppingCart} />
          Encomendas
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'guia' ? 'active' : ''}`}
          onClick={() => selectDocumentType('guia')}
        >
          <FontAwesomeIcon icon={faTruck} />
          Guias Entrada
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'fatura' ? 'active' : ''}`}
          onClick={() => selectDocumentType('fatura')}
        >
          <FontAwesomeIcon icon={faReceipt} />
          Faturas
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'stock' ? 'active' : ''}`}
          onClick={() => selectDocumentType('stock')}
        >
          <FontAwesomeIcon icon={faWarehouse} />
          Stock
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'credito' ? 'active' : ''}`}
          onClick={() => selectDocumentType('credito')}
        >
          <FontAwesomeIcon icon={faFileInvoice} />
          Notas Crédito
        </button>
        <button 
          className={`tab-btn ${currentDocumentType === 'debito' ? 'active' : ''}`}
          onClick={() => selectDocumentType('debito')}
        >
          <FontAwesomeIcon icon={faFileAlt} />
          Notas Débito
        </button>
      </div>

      {/* Main Content */}
      <div className="compras-content">
        {currentDocumentType === 'stock' && renderStockSection()}
        {currentDocumentType === 'guia' && showGuiaEntradaForm && renderGuiaEntradaForm()}
        {currentDocumentType === 'guia' && !showGuiaEntradaForm && renderDocumentList()}
        {currentDocumentType !== 'stock' && currentDocumentType !== 'guia' && currentTab === 'lista' && renderDocumentList()}
        {currentDocumentType !== 'stock' && currentDocumentType !== 'guia' && currentTab === 'editar' && renderDocumentForm()}
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
            <div className="menu-item" onClick={() => createNewDocument('requisicao')}>
              <FontAwesomeIcon icon={faClipboardList} />
              <div>
                <div className="item-title">Requisição</div>
                <div className="item-desc">Criar nova requisição</div>
              </div>
            </div>
            <div className="menu-item" onClick={() => createNewDocument('encomenda')}>
              <FontAwesomeIcon icon={faShoppingCart} />
              <div>
                <div className="item-title">Encomenda Fornecedor</div>
                <div className="item-desc">Criar nova encomenda</div>
              </div>
            </div>
            <div className="menu-item" onClick={() => createNewDocument('guia')}>
              <FontAwesomeIcon icon={faTruck} />
              <div>
                <div className="item-title">Guia Entrada</div>
                <div className="item-desc">Criar nova guia</div>
              </div>
            </div>
            <div className="menu-item" onClick={() => createNewDocument('fatura')}>
              <FontAwesomeIcon icon={faReceipt} />
              <div>
                <div className="item-title">Fatura Fornecedor</div>
                <div className="item-desc">Criar nova fatura</div>
              </div>
            </div>
            <div className="menu-item" onClick={() => createNewDocument('stock')}>
              <FontAwesomeIcon icon={faWarehouse} />
              <div>
                <div className="item-title">Gestão Stock</div>
                <div className="item-desc">Gerir stock</div>
              </div>
            </div>
            <div className="menu-item" onClick={() => createNewDocument('credito')}>
              <FontAwesomeIcon icon={faFileInvoice} />
              <div>
                <div className="item-title">Nota Crédito</div>
                <div className="item-desc">Criar nota de crédito</div>
              </div>
            </div>
            <div className="menu-item" onClick={() => createNewDocument('debito')}>
              <FontAwesomeIcon icon={faFileAlt} />
              <div>
                <div className="item-title">Nota Débito</div>
                <div className="item-desc">Criar nota de débito</div>
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
    </div>
  );
};

export default Compras;
