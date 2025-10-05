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
  faExclamationTriangle,
  faCalculator,
  faLock,
  faFileContract,
  faCog,
  faBox,
  faDownload,
  faStore,
  faWarehouse
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
  produto_id?: string;
  stock_disponivel?: number;
}

interface ProdutoStock {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  categoria_id: string;
  categoria_nome: string;
  unidade_medida: string;
  stock_atual: number;
  stock_disponivel: number;
  stock_minimo: number;
  stock_maximo: number;
  preco_venda?: number;
  ativo: boolean;
}

interface CategoriaStock {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
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

interface ArtigoExpedir {
  id: string;
  codigo: string;
  descricao: string;
  qtdEncomendada: number;
  qtdAExpedir: number;
  stockDisponivel: number;
  stockReservado: number;
  loteNumeroSerie: string;
  produto_id?: string;
}

interface InformacoesTransporte {
  empresaTransporte: string;
  transporteProprio: boolean;
  numeroGuiaTransportador: string;
  dataRecolha: string;
  dataPrevistaEntrega: string;
  instrucoesEspeciais: string;
  observacoesEmbalagem: string;
}



interface CotacaoItem {
  id: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  descontoComercial: number;
  taxaIva: number;
  valorTotal: number;
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
  client_phone?: string;
  client_email_secundario?: string;
  contacto_emergencia?: string;
  desconto_especial?: number;
  observacoes_comerciais?: string;
  ultima_compra?: string;
  valor_total_compras?: number;
  numero_encomendas?: number;
  status_cliente?: string;
  usar_morada_fiscal?: boolean;
  morada_entrega?: string;
  instrucoes_entrega?: string;
  horario_entrega?: string;
  vendedor?: string;
  payment_terms?: string;
  currency?: string;
  portes?: string;
  validade_proposta?: string;
  lista_precos?: string;
  observacoes_internas?: string;
  observacoes_cliente?: string;
  termos_condicoes?: string;
  informacoes_entrega?: string;
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
  // Campos específicos para Guia de Remessa
  driver?: string;
  vehicle_plate?: string;
  volumes?: number;
  total_weight?: number;
  total_volume?: number;
  transport_conditions?: string;
  // Informações de Transporte
  empresa_transporte?: string;
  transporte_proprio?: boolean;
  numero_guia_transportador?: string;
  data_recolha?: string;
  data_prevista_entrega?: string;
  instrucoes_especiais?: string;
  observacoes_embalagem?: string;
  // Dados da Expedição (apenas para Guias de Remessa)
  motorista?: string;
  matricula_veiculo?: string;
  numero_volumes?: string;
  peso_total?: string;
  volume_total?: string;
  condicoes_transporte?: string;
  // Dados do Cliente (apenas para Guias de Remessa)
  client_code?: string;
  contacto_local?: string;
  horario_entrega_preferencial?: string;
  pessoa_contacto?: string;
  // Confirmação de Entrega (apenas para Guias de Remessa)
  assinatura_cliente?: string;
  data_rececao?: string;
  hora_rececao?: string;
  observacoes_motorista?: string;
  // Destino da Expedição (apenas para Guias de Remessa)
  tipo_destino?: 'cliente' | 'sucursal';
  // Dados da Sucursal (apenas para Guias de Remessa quando destino é sucursal)
  sucursal_code?: string;
  sucursal_name?: string;
  sucursal_responsavel?: string;
  sucursal_telefone?: string;
  sucursal_address?: string;
  sucursal_horario?: string;
  sucursal_email?: string;
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
  
  // Estados para integração com stock
  const [produtosStock, setProdutosStock] = useState<ProdutoStock[]>([]);
  const [categoriasStock, setCategoriasStock] = useState<CategoriaStock[]>([]);
  const [showProdutoModal, setShowProdutoModal] = useState<boolean>(false);
  const [searchProduto, setSearchProduto] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoStock | null>(null);
  
  // Estados para Sucursais na Guia de Remessa
  const [sucursais, setSucursais] = useState<Estabelecimento[]>([]);
  const [showSucursalSelector, setShowSucursalSelector] = useState<boolean>(false);
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
  const [artigosExpedir, setArtigosExpedir] = useState<ArtigoExpedir[]>([]);
  const [informacoesTransporte, setInformacoesTransporte] = useState<InformacoesTransporte>({
    empresaTransporte: '',
    transporteProprio: false,
    numeroGuiaTransportador: '',
    dataRecolha: '',
    dataPrevistaEntrega: '',
    instrucoesEspeciais: '',
    observacoesEmbalagem: ''
  });
  const [cotacaoItens, setCotacaoItens] = useState<CotacaoItem[]>([]);

  // Carregar dados do backend
  useEffect(() => {
    loadDocuments();
    loadProdutosStock();
    loadCategoriasStock();
    loadSucursais();
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
          document_type: doc.document_type || (doc.series === 'ORÇ' ? 'ORC' : doc.series === 'GR' ? 'GUIA' : 'ORC'),
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

  // Carregar produtos do stock
  const loadProdutosStock = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sales/produtos');
      if (response.ok) {
        const data = await response.json();
        setProdutosStock(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos do stock:', error);
    }
  };

  // Carregar categorias do stock
  const loadCategoriasStock = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sales/categorias');
      if (response.ok) {
        const data = await response.json();
        setCategoriasStock(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias do stock:', error);
    }
  };

  // Carregar sucursais para Guia de Remessa
  const loadSucursais = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings/estabelecimentos');
      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas sucursais ativas
        const sucursaisAtivas = (data.data || []).filter((estab: Estabelecimento) => 
          estab.configuracoes.ativo && (estab.tipo === 'sucursal' || estab.tipo === 'armazem' || estab.tipo === 'loja')
        );
        setSucursais(sucursaisAtivas);
      }
    } catch (error) {
      console.error('Erro ao carregar sucursais:', error);
    }
  };

  // Selecionar sucursal para Guia de Remessa
  const selecionarSucursal = (sucursal: Estabelecimento) => {
    if (currentDocument) {
      setCurrentDocument({
        ...currentDocument,
        sucursal_code: sucursal.codigo,
        sucursal_name: sucursal.nome,
        sucursal_responsavel: sucursal.responsavel.nome,
        sucursal_telefone: sucursal.contactos.telefone,
        sucursal_address: `${sucursal.endereco.rua}, ${sucursal.endereco.cidade}, ${sucursal.endereco.provincia}`,
        sucursal_horario: '8h-17h, Seg-Sex', // Horário padrão
        sucursal_email: sucursal.contactos.email
      });
    }
    setShowSucursalSelector(false);
  };

  // Buscar produtos com filtros
  const buscarProdutos = async () => {
    try {
      const params = new URLSearchParams();
      if (searchProduto) params.append('search', searchProduto);
      if (filtroCategoria !== 'all') params.append('categoria', filtroCategoria);
      params.append('ativo', 'true');

      const response = await fetch(`http://localhost:3001/api/sales/produtos?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProdutosStock(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  // Adicionar produto à linha da fatura/orçamento
  const adicionarProduto = (produto: ProdutoStock) => {
    const novaLinha: FaturaLinha = {
      id: `linha_${Date.now()}`,
      codigo: produto.codigo,
      descricao: produto.nome,
      quantidade: 1,
      preco: produto.preco_venda || 0,
      desconto: 0,
      iva: 0.16,
      total: produto.preco_venda || 0,
      produto_id: produto.id,
      stock_disponivel: produto.stock_disponivel
    };

    if (currentDocumentType === 'orcamento') {
      setCotacaoItens([...cotacaoItens, {
        id: novaLinha.id,
        codigo: novaLinha.codigo,
        descricao: novaLinha.descricao,
        quantidade: novaLinha.quantidade,
        precoUnitario: novaLinha.preco,
        descontoComercial: novaLinha.desconto,
        taxaIva: novaLinha.iva,
        valorTotal: novaLinha.total
      }]);
    } else {
      setFaturaData({
        ...faturaData,
        linhas: [...faturaData.linhas, novaLinha]
      });
    }

    setShowProdutoModal(false);
    setProdutoSelecionado(null);
  };

  // Buscar produto por código para preenchimento automático
  const buscarProdutoPorCodigo = async (codigo: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/sales/produto-por-codigo/${encodeURIComponent(codigo)}`);
      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        console.error('Produto não encontrado');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  };

  // Preencher linha automaticamente quando código é inserido
  const preencherLinhaAutomaticamente = async (codigo: string, linhaIndex: number) => {
    if (!codigo.trim()) return;
    
    console.log('Preenchendo linha automaticamente para código:', codigo);
    const produto = await buscarProdutoPorCodigo(codigo);
    console.log('Produto encontrado:', produto);
    
    if (produto) {
      if (currentDocumentType === 'orcamento') {
        const novosItens = [...cotacaoItens];
        novosItens[linhaIndex] = {
          id: novosItens[linhaIndex]?.id || `linha_${Date.now()}`,
          codigo: produto.codigo,
          descricao: produto.descricao,
          quantidade: produto.quantidade,
          precoUnitario: produto.preco,
          descontoComercial: produto.desconto,
          taxaIva: produto.iva,
          valorTotal: produto.total
        };
        setCotacaoItens(novosItens);
      } else if (currentDocumentType === 'guia') {
        const novosArtigos = [...artigosExpedir];
        novosArtigos[linhaIndex] = {
          id: novosArtigos[linhaIndex]?.id || `artigo_${Date.now()}`,
          codigo: produto.codigo,
          descricao: produto.descricao,
          qtdEncomendada: produto.quantidade,
          qtdAExpedir: produto.quantidade,
          stockDisponivel: produto.stock_disponivel,
          stockReservado: 0,
          loteNumeroSerie: '',
          produto_id: produto.produto_id
        };
        setArtigosExpedir(novosArtigos);
      } else {
        const novasLinhas = [...faturaData.linhas];
        novasLinhas[linhaIndex] = {
          id: novasLinhas[linhaIndex]?.id || `linha_${Date.now()}`,
          codigo: produto.codigo,
          descricao: produto.descricao,
          quantidade: produto.quantidade,
          preco: produto.preco,
          desconto: produto.desconto,
          iva: produto.iva,
          total: produto.total,
          produto_id: produto.produto_id,
          stock_disponivel: produto.stock_disponivel
        };
        setFaturaData({
          ...faturaData,
          linhas: novasLinhas
        });
      }
    }
  };

  // Atualizar stock após venda/expedição
  const atualizarStock = async (produtos: any[], tipoOperacao: string = 'venda') => {
    try {
      const response = await fetch('http://localhost:3001/api/sales/atualizar-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produtos,
          tipo_operacao: tipoOperacao
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Stock atualizado:', data.message);
        console.log('Produtos atualizados:', data.produtos_atualizados);
        
        // Recarregar produtos para refletir mudanças no stock
        loadProdutosStock();
        
        // Mostrar notificação de sucesso
        alert(`Stock atualizado com sucesso! ${data.produtos_atualizados} produto(s) atualizado(s).`);
      } else {
        console.error('Erro ao atualizar stock');
        alert('Erro ao atualizar stock');
      }
    } catch (error) {
      console.error('Erro ao atualizar stock:', error);
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
          document_type: type === 'orcamento' ? 'ORC' : type === 'guia' ? 'GUIA' : type.toUpperCase(),
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
        document_type: type === 'orcamento' ? 'ORC' : type === 'guia' ? 'GUIA' : type.toUpperCase(),
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
    console.log('Editando documento:', document);
    console.log('Tipo do documento:', document.document_type);
    
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
    } else if (document.document_type === 'ORC') {
      // Para orçamentos, carregar os itens da cotação se existirem
      if (document.linhas && document.linhas.length > 0) {
        const cotacaoItens = document.linhas.map(linha => ({
          id: linha.id || `item_${Date.now()}`,
          codigo: linha.codigo || '',
          descricao: linha.descricao || '',
          quantidade: linha.quantidade || 1,
          precoUnitario: linha.preco || 0,
          descontoComercial: linha.desconto || 0,
          taxaIva: linha.iva || 0.16,
          valorTotal: linha.total || 0
        }));
        setCotacaoItens(cotacaoItens);
      }
      
      setCurrentDocument(document);
      setCurrentTab('editar');
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
        
        // Atualizar stock se o documento for confirmado (fatura ou guia de remessa)
        if (currentDocument.status === 'confirmado' || currentDocument.status === 'expedido') {
          let produtosParaAtualizar: { produto_id: string; quantidade: number }[] = [];
          let tipoOperacao = 'venda';
          
          if (currentDocumentType === 'fatura') {
            produtosParaAtualizar = faturaData.linhas
              .filter(linha => linha.produto_id) // Filtrar apenas linhas com produto_id
              .map(linha => ({
                produto_id: linha.produto_id!,
                quantidade: linha.quantidade
              }));
            tipoOperacao = 'venda';
          } else if (currentDocumentType === 'guia') {
            produtosParaAtualizar = artigosExpedir
              .filter(artigo => artigo.produto_id) // Filtrar apenas artigos com produto_id
              .map(artigo => ({
                produto_id: artigo.produto_id!,
                quantidade: artigo.qtdAExpedir
              }));
            tipoOperacao = 'expedicao';
          }
          
          if (produtosParaAtualizar.length > 0) {
            await atualizarStock(produtosParaAtualizar, tipoOperacao);
          }
        }
        
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

  // ==================== FUNÇÕES DOS ARTIGOS A EXPEDIR ====================

  const adicionarLinhaArtigoExpedir = () => {
    const novoArtigo: ArtigoExpedir = {
      id: 'artigo_' + Date.now(),
      codigo: '',
      descricao: '',
      qtdEncomendada: 0,
      qtdAExpedir: 0,
      stockDisponivel: 0,
      stockReservado: 0,
      loteNumeroSerie: ''
    };
    
    setArtigosExpedir(prev => [...prev, novoArtigo]);
  };

  const removerLinhaArtigoExpedir = (artigoId: string) => {
    setArtigosExpedir(prev => prev.filter(artigo => artigo.id !== artigoId));
  };

  const atualizarLinhaArtigoExpedir = (artigoId: string, campo: keyof ArtigoExpedir, valor: any) => {
    setArtigosExpedir(prev => 
      prev.map(artigo => 
        artigo.id === artigoId 
          ? { ...artigo, [campo]: valor }
          : artigo
      )
    );
  };

  const importarDaEncomenda = () => {
    alert('Funcionalidade de importar da encomenda será implementada em breve!');
  };

  const pesquisarProduto = () => {
    alert('Funcionalidade de pesquisar produto será implementada em breve!');
  };

  // ==================== FUNÇÕES DE CONFIRMAÇÃO DE ENTREGA ====================

  const limparAssinatura = () => {
    if (currentDocument) {
      setCurrentDocument({
        ...currentDocument,
        assinatura_cliente: ''
      });
    }
  };

  const guardarAssinatura = () => {
    if (currentDocument) {
      // Simular captura de assinatura
      const assinaturaSimulada = `Assinatura capturada em ${new Date().toLocaleString('pt-MZ')}`;
      setCurrentDocument({
        ...currentDocument,
        assinatura_cliente: assinaturaSimulada
      });
      alert('Assinatura guardada com sucesso!');
    }
  };

  // ==================== FUNÇÕES DOS BOTÕES DE AÇÃO DA GR ====================

  const expedirGR = async () => {
    if (!currentDocument) return;

    if (window.confirm('Tem certeza que deseja expedir esta Guia de Remessa?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/sales/documents/${currentDocument.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'SENT',
            document_date: new Date().toISOString().split('T')[0]
          })
        });

        if (response.ok) {
          setCurrentDocument(prev => prev ? { ...prev, status: 'SENT' } : null);
          alert('Guia de Remessa expedida com sucesso!');
          loadDocuments();
        } else {
          alert('Erro ao expedir Guia de Remessa');
        }
      } catch (error) {
        console.error('Erro ao expedir GR:', error);
        alert('Erro ao expedir Guia de Remessa: ' + error);
      } finally {
        setLoading(false);
      }
    }
  };

  const imprimirGR = async () => {
    if (!currentDocument) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/sales/export-gr-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentDocument,
          artigosExpedir,
          informacoesTransporte
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Guia_Remessa_${currentDocument.full_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('PDF da Guia de Remessa gerado com sucesso!');
      } else {
        alert('Erro ao gerar PDF da Guia de Remessa');
      }
    } catch (error) {
      console.error('Erro ao imprimir GR:', error);
      alert('Erro ao gerar PDF: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const regularizarGR = async () => {
    if (!currentDocument) return;

    if (window.confirm('Tem certeza que deseja regularizar esta Guia de Remessa?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/sales/documents/${currentDocument.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'DELIVERED'
          })
        });

        if (response.ok) {
          setCurrentDocument(prev => prev ? { 
            ...prev, 
            status: 'DELIVERED'
          } : null);
          alert('Guia de Remessa regularizada com sucesso!');
          loadDocuments();
        } else {
          alert('Erro ao regularizar Guia de Remessa');
        }
      } catch (error) {
        console.error('Erro ao regularizar GR:', error);
        alert('Erro ao regularizar Guia de Remessa: ' + error);
      } finally {
        setLoading(false);
      }
    }
  };

  const gerarFaturaGR = () => {
    if (!currentDocument) return;

    if (window.confirm('Gerar Fatura a partir desta Guia de Remessa?')) {
      // Converter GR para formato de fatura
      const faturaData: FaturaData = {
        id: null,
        numero: `FAT ${new Date().getFullYear()}/${String(Date.now()).slice(-3)}`,
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
          nome: currentDocument.client_name || '',
          nuit: currentDocument.client_tax_number || '',
          email: currentDocument.client_email || '',
          morada: currentDocument.client_address || ''
        },
        vendedor: currentDocument.vendedor || 'João Silva',
        condicaoPagamento: currentDocument.payment_terms || '30dias',
        linhas: artigosExpedir.map(artigo => ({
          id: 'linha_' + Date.now() + Math.random(),
          codigo: artigo.codigo,
          descricao: artigo.descricao,
          quantidade: artigo.qtdAExpedir,
          preco: 0, // Será preenchido pelo usuário
          desconto: 0,
          iva: 0.16,
          total: 0
        })),
        totais: {
          subtotal: 0,
          iva16: 0,
          iva5: 0,
          retencao: 0,
          total: 0
        },
        observacoesInternas: `Gerada a partir da GR ${currentDocument.full_number}`,
        observacoesCliente: 'Agradecemos a sua preferência!',
        referenciaInterna: currentDocument.full_number,
        localExpedicao: 'armazem_central',
        guias: currentDocument.full_number || ''
      };

      setFaturaData(faturaData);
      setShowFaturaForm(true);
      setCurrentTab('lista'); // Voltar para a lista
      
      alert('Fatura criada a partir da Guia de Remessa! Pode editar os preços e emitir.');
    }
  };

  // Funções para orçamentos
  const imprimirOrcamento = async () => {
    if (!currentDocument) return;

    try {
      const response = await fetch('http://localhost:3001/api/sales/export-orc-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentDocument,
          cotacaoItens: cotacaoItens,
          totais: {
            subtotal: calcularSubtotal(),
            descontos: calcularDescontosComerciais(),
            baseTributavel: calcularBaseTributavel(),
            iva16: calcularIVA16(),
            iva5: calcularIVA5(),
            total: calcularTotalProposta(),
            margemBruta: calcularMargemBruta()
          }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Orcamento_${currentDocument.full_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Erro ao gerar PDF do orçamento');
      }
    } catch (error) {
      console.error('Erro ao imprimir orçamento:', error);
      alert('Erro ao gerar PDF do orçamento');
    }
  };

  const gerarFaturaOrcamento = () => {
    if (!currentDocument) return;

    if (cotacaoItens.length === 0) {
      alert('Adicione pelo menos um item na cotação antes de gerar a fatura.');
      return;
    }

    if (window.confirm(`Gerar Fatura a partir do Orçamento ${currentDocument.full_number}?\n\nTotal: ${formatarMoeda(calcularTotalProposta())}`)) {
      // Converter orçamento para formato de fatura
      const faturaData: FaturaData = {
        id: null,
        numero: `FAT ${new Date().getFullYear()}/${String(Date.now()).slice(-3)}`,
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
          nome: currentDocument.client_name || '',
          nuit: currentDocument.client_tax_number || '',
          email: currentDocument.client_email || '',
          morada: currentDocument.client_address || ''
        },
        vendedor: currentDocument.vendedor || 'João Silva',
        condicaoPagamento: currentDocument.payment_terms || '30dias',
        linhas: cotacaoItens.map((item, index) => ({
          id: `linha_${Date.now()}_${index}`,
          codigo: item.codigo || `ITEM${index + 1}`,
          descricao: item.descricao || 'Item sem descrição',
          quantidade: item.quantidade || 1,
          preco: item.precoUnitario || 0,
          desconto: item.descontoComercial || 0,
          iva: item.taxaIva || 0.16,
          total: item.valorTotal || 0
        })),
        totais: {
          subtotal: calcularSubtotal(),
          iva16: calcularIVA16(),
          iva5: calcularIVA5(),
          retencao: 0,
          total: calcularTotalProposta()
        },
        observacoesInternas: `Gerada a partir do Orçamento ${currentDocument.full_number}\nData de conversão: ${new Date().toLocaleString('pt-MZ')}`,
        observacoesCliente: currentDocument.observacoes_cliente || 'Agradecemos a sua preferência!',
        referenciaInterna: currentDocument.full_number,
        localExpedicao: 'armazem_central',
        guias: ''
      };

      setFaturaData(faturaData);
      setShowFaturaForm(true);
      setCurrentTab('lista'); // Voltar para a lista
      
      alert(`Fatura criada com sucesso!\n\nOrçamento: ${currentDocument.full_number}\nTotal: ${formatarMoeda(calcularTotalProposta())}\n\nPode editar os preços e emitir a fatura.`);
    }
  };

  // Funções para gestão de itens da cotação
  const adicionarLinhaCotacao = () => {
    const novoItem: CotacaoItem = {
      id: `item_${Date.now()}`,
      codigo: '',
      descricao: '',
      quantidade: 1,
      precoUnitario: 0,
      descontoComercial: 0,
      taxaIva: 0.16,
      valorTotal: 0
    };
    setCotacaoItens([...cotacaoItens, novoItem]);
  };

  const removerLinhaCotacao = (itemId: string) => {
    setCotacaoItens(cotacaoItens.filter(item => item.id !== itemId));
  };

  const atualizarLinhaCotacao = (itemId: string, campo: keyof CotacaoItem, valor: any) => {
    setCotacaoItens(cotacaoItens.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = { ...item, [campo]: valor };
        
        // Calcular valor total da linha
        const subtotal = itemAtualizado.quantidade * itemAtualizado.precoUnitario;
        const desconto = subtotal * (itemAtualizado.descontoComercial / 100);
        const valorComDesconto = subtotal - desconto;
        const iva = valorComDesconto * itemAtualizado.taxaIva;
        itemAtualizado.valorTotal = valorComDesconto + iva;
        
        return itemAtualizado;
      }
      return item;
    }));
  };

  // Funções de cálculo para totais
  const calcularSubtotal = () => {
    return cotacaoItens.reduce((total, item) => {
      return total + (item.quantidade * item.precoUnitario);
    }, 0);
  };

  const calcularDescontosComerciais = () => {
    return cotacaoItens.reduce((total, item) => {
      const subtotal = item.quantidade * item.precoUnitario;
      return total + (subtotal * (item.descontoComercial / 100));
    }, 0);
  };

  const calcularBaseTributavel = () => {
    return calcularSubtotal() - calcularDescontosComerciais();
  };

  const calcularIVA16 = () => {
    return cotacaoItens.reduce((total, item) => {
      if (item.taxaIva === 0.16) {
        const subtotal = item.quantidade * item.precoUnitario;
        const desconto = subtotal * (item.descontoComercial / 100);
        const valorComDesconto = subtotal - desconto;
        return total + (valorComDesconto * 0.16);
      }
      return total;
    }, 0);
  };

  const calcularIVA5 = () => {
    return cotacaoItens.reduce((total, item) => {
      if (item.taxaIva === 0.05) {
        const subtotal = item.quantidade * item.precoUnitario;
        const desconto = subtotal * (item.descontoComercial / 100);
        const valorComDesconto = subtotal - desconto;
        return total + (valorComDesconto * 0.05);
      }
      return total;
    }, 0);
  };

  const calcularTotalProposta = () => {
    return calcularBaseTributavel() + calcularIVA16() + calcularIVA5();
  };

  const calcularMargemBruta = () => {
    // Assumindo um custo médio de 60% do preço de venda
    const custoEstimado = calcularSubtotal() * 0.6;
    return calcularTotalProposta() - custoEstimado;
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
    if (!currentDocument) {
      console.log('Nenhum documento atual para editar');
      return null;
    }

    console.log('Renderizando formulário para documento:', currentDocument);
    console.log('Tipo do documento atual:', currentDocument.document_type);

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
          {/* Seção de Informações Básicas - apenas para orçamentos */}
          {currentDocument.document_type === 'ORC' && (
          <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faFileInvoice} className="section-icon" />
                Informações Básicas
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Série:</label>
                  <input type="text" value="ORÇ" readOnly />
                </div>
                <div className="form-group">
                  <label>Número:</label>
                  <input type="text" value={currentDocument.number} readOnly />
                </div>
                <div className="form-group">
                  <label>Data Documento:</label>
                  <input 
                    type="date" 
                    value={currentDocument.document_date}
                    onChange={(e) => setCurrentDocument({...currentDocument, document_date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Data Validade:</label>
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
                    <option value="DRAFT">Em Elaboração</option>
                    <option value="SENT">Aprovado</option>
                    <option value="REJECTED">Rejeitado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cliente:</label>
                  <select 
                    value={currentDocument.client_name || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_name: e.target.value})}
                  >
                    <option value="">Selecionar Cliente</option>
                    <option value="Empresa ABC Lda">Empresa ABC Lda</option>
                    <option value="Comercial XYZ Lda">Comercial XYZ Lda</option>
                    <option value="Cliente Teste Lda">Cliente Teste Lda</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Vendedor:</label>
                  <select 
                    value={currentDocument.vendedor || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, vendedor: e.target.value})}
                  >
                    <option value="">Selecionar Vendedor</option>
                    <option value="João Silva">João Silva</option>
                    <option value="Maria Santos">Maria Santos</option>
                    <option value="Pedro Costa">Pedro Costa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Oportunidade:</label>
                  <input 
                    type="text" 
                    value={`OPP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`}
                    readOnly
                    placeholder="OPP-2025-001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Seção de Gestão de Itens da Cotação - apenas para orçamentos */}
          {currentDocument.document_type === 'ORC' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faShoppingBag} className="section-icon" />
                Gestão de Itens da Cotação
              </h4>
              <div className="cotacao-itens-controls">
                <button 
                  className="btn btn-primary" 
                  onClick={adicionarLinhaCotacao}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Adicionar Item
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowProdutoModal(true)}
                >
                  <FontAwesomeIcon icon={faSearch} />
                  Pesquisar Produto
                </button>
              </div>
              
              <div className="cotacao-itens-table-container">
                <table className="cotacao-itens-table">
                  <thead>
                    <tr>
                      <th>Código do Artigo/Serviço</th>
                      <th>Descrição Detalhada</th>
                      <th>Quantidade</th>
                      <th>Preço Unitário</th>
                      <th>% Desconto Comercial</th>
                      <th>Taxa de IVA</th>
                      <th>Valor Total da Linha</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cotacaoItens.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input 
                            type="text" 
                            value={item.codigo}
                            onChange={(e) => {
                              atualizarLinhaCotacao(item.id, 'codigo', e.target.value);
                              // Preenchimento automático após 500ms de pausa na digitação
                              setTimeout(() => {
                                const itemIndex = cotacaoItens.findIndex(i => i.id === item.id);
                                if (itemIndex !== -1) {
                                  preencherLinhaAutomaticamente(e.target.value, itemIndex);
                                }
                              }, 500);
                            }}
                            placeholder="Código do artigo"
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={item.descricao}
                            onChange={(e) => atualizarLinhaCotacao(item.id, 'descricao', e.target.value)}
                            placeholder="Descrição detalhada"
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            value={item.quantidade}
                            min="0"
                            step="0.001"
                            onChange={(e) => atualizarLinhaCotacao(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            value={item.precoUnitario}
                            min="0"
                            step="0.01"
                            onChange={(e) => atualizarLinhaCotacao(item.id, 'precoUnitario', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            value={item.descontoComercial}
                            min="0"
                            max="100"
                            step="0.01"
                            onChange={(e) => atualizarLinhaCotacao(item.id, 'descontoComercial', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <select 
                            value={item.taxaIva}
                            onChange={(e) => atualizarLinhaCotacao(item.id, 'taxaIva', parseFloat(e.target.value))}
                          >
                            <option value={0.16}>16%</option>
                            <option value={0.05}>5%</option>
                            <option value={0}>Isento</option>
                          </select>
                        </td>
                        <td>
                          <span className="valor-total-linha">
                            {formatarMoeda(item.valorTotal)}
                          </span>
                        </td>
                        <td>
                          <button 
                            type="button" 
                            onClick={() => removerLinhaCotacao(item.id)}
                            className="btn-remove-line"
                            title="Remover item"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cotacaoItens.length === 0 && (
                      <tr>
                        <td colSpan={8} className="empty-table-message">
                          Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Seção de Informações da Guia de Remessa - apenas para guias */}
          {currentDocument.document_type === 'GUIA' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faTruck} className="section-icon" />
                Informações da Guia de Remessa
              </h4>
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
                <label>Data de Expedição:</label>
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
                  <option value="SENT">Expedida</option>
                  <option value="DELIVERED">Entregue</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>
              <div className="form-group">
                <label>Encomenda de Origem:</label>
                <input 
                  type="text" 
                  value={currentDocument.reference || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, reference: e.target.value})}
                  placeholder="Ex: EC 2025/001"
                />
              </div>
            </div>
          </div>
          )}

          {/* Dados da Expedição - apenas para Guias de Remessa */}
          {currentDocument.document_type === 'GUIA' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faTruck} className="section-icon" />
                Dados da Expedição
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Motorista/Transportador:</label>
                  <input 
                    type="text" 
                    value={currentDocument.motorista || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, motorista: e.target.value})}
                    placeholder="Ex: Carlos Mendes"
                  />
                </div>
                <div className="form-group">
                  <label>Matrícula do Veículo:</label>
                  <input 
                    type="text" 
                    value={currentDocument.matricula_veiculo || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, matricula_veiculo: e.target.value})}
                    placeholder="Ex: AB-12-CD"
                  />
                </div>
                <div className="form-group">
                  <label>Número de Volumes:</label>
                  <input 
                    type="number" 
                    value={currentDocument.numero_volumes || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, numero_volumes: e.target.value})}
                    placeholder="Ex: 5"
                  />
                </div>
                <div className="form-group">
                  <label>Peso Total (kg):</label>
                  <input 
                    type="number" 
                    value={currentDocument.peso_total || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, peso_total: e.target.value})}
                    placeholder="Ex: 150.5"
                  />
                </div>
                <div className="form-group">
                  <label>Volume Total (m³):</label>
                  <input 
                    type="number" 
                    value={currentDocument.volume_total || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, volume_total: e.target.value})}
                    placeholder="Ex: 2.5"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Condições de Transporte:</label>
                  <textarea 
                    value={currentDocument.condicoes_transporte || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, condicoes_transporte: e.target.value})}
                    placeholder="Condições especiais de transporte, cuidados especiais, etc."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Seção de Cliente - apenas para orçamentos */}
          {currentDocument.document_type === 'ORC' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faUser} className="section-icon" />
                Cliente
              </h4>
            
            {/* Informações Fiscais */}
            <div className="form-subsection">
              <h5>Informações Fiscais</h5>
            <div className="form-grid">
              <div className="form-group">
                  <label>Nome do Cliente:</label>
                <input 
                  type="text" 
                    value={currentDocument.client_name || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_name: e.target.value})}
                    placeholder="Nome da empresa ou pessoa"
                />
              </div>
              <div className="form-group">
                  <label>NUIT:</label>
                <input 
                  type="text" 
                    value={currentDocument.client_tax_number || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_tax_number: e.target.value})}
                    placeholder="Número de identificação fiscal"
                />
              </div>
                <div className="form-group full-width">
                  <label>Morada:</label>
                  <textarea 
                    value={currentDocument.client_address || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_address: e.target.value})}
                    placeholder="Endereço completo da empresa"
                    rows={3}
                />
              </div>
              </div>
            </div>

            {/* Condições Comerciais Específicas */}
            <div className="form-subsection">
              <h5>Condições Comerciais Específicas</h5>
              <div className="form-grid">
              <div className="form-group">
                  <label>Desconto Especial (%):</label>
                <input 
                  type="number" 
                    value={currentDocument.desconto_especial || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, desconto_especial: parseFloat(e.target.value) || 0})}
                    min="0"
                    max="100"
                  step="0.01"
                    placeholder="0.00"
                />
              </div>
              <div className="form-group">
                  <label>Prazo de Pagamento:</label>
                  <select 
                    value={currentDocument.payment_terms || 'pronto'}
                    onChange={(e) => setCurrentDocument({...currentDocument, payment_terms: e.target.value})}
                  >
                    <option value="pronto">Pronto Pagamento</option>
                    <option value="15_dias">15 Dias</option>
                    <option value="30_dias">30 Dias</option>
                    <option value="45_dias">45 Dias</option>
                    <option value="60_dias">60 Dias</option>
                    <option value="90_dias">90 Dias</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Moeda:</label>
                  <select 
                    value={currentDocument.currency || 'MZN'}
                    onChange={(e) => setCurrentDocument({...currentDocument, currency: e.target.value})}
                  >
                    <option value="MZN">MZN (Metical)</option>
                    <option value="USD">USD (Dólar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
              </div>
              <div className="form-group full-width">
                  <label>Observações Comerciais:</label>
                <textarea 
                    value={currentDocument.observacoes_comerciais || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, observacoes_comerciais: e.target.value})}
                    placeholder="Condições especiais, acordos comerciais, etc."
                    rows={2}
                />
              </div>
            </div>
          </div>

            {/* Histórico de Compras */}
            <div className="form-subsection">
              <h5>Histórico de Compras</h5>
            <div className="form-grid">
              <div className="form-group">
                  <label>Última Compra:</label>
                <input 
                    type="date" 
                    value={currentDocument.ultima_compra || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, ultima_compra: e.target.value})}
                    readOnly
                    className="readonly-input"
                />
              </div>
              <div className="form-group">
                  <label>Valor Total Compras:</label>
                <input 
                  type="text" 
                    value={formatarMoeda(currentDocument.valor_total_compras || 0)}
                    readOnly
                    className="readonly-input"
                    placeholder="0,00 MZN"
                />
              </div>
              <div className="form-group">
                  <label>Número de Encomendas:</label>
                  <input 
                    type="number" 
                    value={currentDocument.numero_encomendas || 0}
                    readOnly
                    className="readonly-input"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Status do Cliente:</label>
                  <select 
                    value={currentDocument.status_cliente || 'ativo'}
                    onChange={(e) => setCurrentDocument({...currentDocument, status_cliente: e.target.value})}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="suspenso">Suspenso</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contactos Principais */}
            <div className="form-subsection">
              <h5>Contactos Principais</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label>Email Principal:</label>
                <input 
                  type="email" 
                  value={currentDocument.client_email || ''}
                  onChange={(e) => setCurrentDocument({...currentDocument, client_email: e.target.value})}
                    placeholder="email@empresa.co.mz"
                />
              </div>
              <div className="form-group">
                  <label>Telefone:</label>
                <input 
                    type="tel" 
                    value={currentDocument.client_phone || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_phone: e.target.value})}
                    placeholder="+258 XX XXX XXXX"
                />
              </div>
                <div className="form-group">
                  <label>Email Secundário:</label>
                  <input 
                    type="email" 
                    value={currentDocument.client_email_secundario || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_email_secundario: e.target.value})}
                    placeholder="email2@empresa.co.mz"
                  />
                </div>
                <div className="form-group">
                  <label>Contacto de Emergência:</label>
                  <input 
                    type="tel" 
                    value={currentDocument.contacto_emergencia || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, contacto_emergencia: e.target.value})}
                    placeholder="+258 XX XXX XXXX"
                  />
                </div>
            </div>
          </div>

            {/* Morada de Entrega */}
            <div className="form-subsection">
              <h5>Morada de Entrega</h5>
            <div className="form-grid">
              <div className="form-group">
                  <label>Usar Morada Fiscal:</label>
                  <select 
                    value={currentDocument.usar_morada_fiscal ? 'sim' : 'nao'}
                    onChange={(e) => setCurrentDocument({...currentDocument, usar_morada_fiscal: e.target.value === 'sim'})}
                  >
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Morada de Entrega:</label>
                  <textarea 
                    value={currentDocument.morada_entrega || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, morada_entrega: e.target.value})}
                    placeholder="Endereço específico para entrega (se diferente da morada fiscal)"
                    rows={3}
                    disabled={currentDocument.usar_morada_fiscal}
                  />
                </div>
                <div className="form-group">
                  <label>Instruções de Entrega:</label>
              <input 
                type="text" 
                    value={currentDocument.instrucoes_entrega || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, instrucoes_entrega: e.target.value})}
                    placeholder="Ex: Portão azul, tocar à campainha"
              />
            </div>
              <div className="form-group">
                  <label>Horário de Entrega:</label>
                  <input 
                    type="text" 
                    value={currentDocument.horario_entrega || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, horario_entrega: e.target.value})}
                    placeholder="Ex: 8h-17h, Seg-Sex"
                  />
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Artigos a Expedir - apenas para Guias de Remessa */}
          {currentDocument.document_type === 'GUIA' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faBox} className="section-icon" />
                Artigos a Expedir
              </h4>
              
              {/* Controles dos Artigos */}
              <div className="artigos-expedir-controls">
                <button 
                  className="btn btn-primary"
                  onClick={adicionarLinhaArtigoExpedir}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Adicionar Linha
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={importarDaEncomenda}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Importar da Encomenda
                </button>
                <button 
                  className="btn btn-info"
                  onClick={() => setShowProdutoModal(true)}
                >
                  <FontAwesomeIcon icon={faSearch} />
                  Pesquisar Produto
                </button>
              </div>

              {/* Tabela de Artigos a Expedir */}
              <div className="artigos-expedir-table-container">
                <table className="artigos-expedir-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descrição</th>
                      <th>Qtd. Encomendada</th>
                      <th>Qtd. a Expedir</th>
                      <th>Stock Disponível</th>
                      <th>Stock Reservado</th>
                      <th>Lote/Nº Série</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artigosExpedir.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="no-data">
                          Nenhum artigo adicionado. Clique em "Adicionar Linha" para começar.
                        </td>
                      </tr>
                    ) : (
                      artigosExpedir.map((artigo) => (
                        <tr key={artigo.id}>
                          <td>
                            <input
                              type="text"
                              value={artigo.codigo}
                              onChange={(e) => {
                                atualizarLinhaArtigoExpedir(artigo.id, 'codigo', e.target.value);
                                // Preenchimento automático após 500ms de pausa na digitação
                                setTimeout(() => {
                                  const artigoIndex = artigosExpedir.findIndex(a => a.id === artigo.id);
                                  if (artigoIndex !== -1) {
                                    preencherLinhaAutomaticamente(e.target.value, artigoIndex);
                                  }
                                }, 500);
                              }}
                              placeholder="Código"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={artigo.descricao}
                              onChange={(e) => atualizarLinhaArtigoExpedir(artigo.id, 'descricao', e.target.value)}
                              placeholder="Descrição"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={artigo.qtdEncomendada}
                              onChange={(e) => atualizarLinhaArtigoExpedir(artigo.id, 'qtdEncomendada', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={artigo.qtdAExpedir}
                              onChange={(e) => atualizarLinhaArtigoExpedir(artigo.id, 'qtdAExpedir', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={artigo.stockDisponivel}
                              onChange={(e) => atualizarLinhaArtigoExpedir(artigo.id, 'stockDisponivel', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              readOnly
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={artigo.stockReservado}
                              onChange={(e) => atualizarLinhaArtigoExpedir(artigo.id, 'stockReservado', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              readOnly
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={artigo.loteNumeroSerie}
                              onChange={(e) => atualizarLinhaArtigoExpedir(artigo.id, 'loteNumeroSerie', e.target.value)}
                              placeholder="Lote/Nº Série"
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => removerLinhaArtigoExpedir(artigo.id)}
                              title="Remover linha"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Seleção de Destino - apenas para Guias de Remessa */}
          {currentDocument.document_type === 'GUIA' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="section-icon" />
                Destino da Expedição
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tipo de Destino:</label>
                  <select 
                    value={currentDocument.tipo_destino || 'cliente'}
                    onChange={(e) => setCurrentDocument({...currentDocument, tipo_destino: e.target.value as 'cliente' | 'sucursal'})}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="sucursal">Sucursal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Dados do Cliente - apenas para Guias de Remessa quando destino é cliente */}
          {currentDocument.document_type === 'GUIA' && currentDocument.tipo_destino === 'cliente' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faUser} className="section-icon" />
                Dados do Cliente
              </h4>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Código do Cliente:</label>
                  <input 
                    type="text" 
                    value={currentDocument.client_code || 'CLI001'}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_code: e.target.value})}
                    placeholder="CLI001"
                  />
                </div>
                <div className="form-group">
                  <label>Nome/Nome Comercial:</label>
                  <input 
                    type="text" 
                    value={currentDocument.client_name || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_name: e.target.value})}
                    placeholder="ACME, Lda"
                  />
                </div>
                <div className="form-group">
                  <label>NUIT:</label>
                  <input 
                    type="text" 
                    value={currentDocument.client_tax_number || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_tax_number: e.target.value})}
                    placeholder="123456789"
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input 
                    type="email" 
                    value={currentDocument.client_email || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, client_email: e.target.value})}
                    placeholder="geral@acme.co.mz"
                  />
                </div>
              </div>

              {/* Morada de Entrega */}
              <div className="form-subsection">
                <h5>Morada de Entrega</h5>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Morada Completa:</label>
                    <textarea 
                      value={currentDocument.client_address || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, client_address: e.target.value})}
                      placeholder="Av. Julius Nyerere, 1234&#10;Maputo, Moçambique"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contacto no Local:</label>
                    <input 
                      type="text" 
                      value={currentDocument.contacto_local || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, contacto_local: e.target.value})}
                      placeholder="Nome do contacto no local"
                    />
                  </div>
                  <div className="form-group">
                    <label>Horário de Entrega Preferencial:</label>
                    <input 
                      type="text" 
                      value={currentDocument.horario_entrega_preferencial || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, horario_entrega_preferencial: e.target.value})}
                      placeholder="Ex: 8h-17h, Seg-Sex"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pessoa de Contacto:</label>
                    <input 
                      type="text" 
                      value={currentDocument.pessoa_contacto || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, pessoa_contacto: e.target.value})}
                      placeholder="Nome da pessoa de contacto"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dados da Sucursal - apenas para Guias de Remessa quando destino é sucursal */}
          {currentDocument.document_type === 'GUIA' && currentDocument.tipo_destino === 'sucursal' && (
            <div className="form-section">
              <div className="section-header">
                <h4>
                  <FontAwesomeIcon icon={faBuilding} className="section-icon" />
                  Dados da Sucursal
                </h4>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowSucursalSelector(true)}
                >
                  <FontAwesomeIcon icon={faSearch} />
                  Selecionar Sucursal
                </button>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Código da Sucursal:</label>
                  <input 
                    type="text" 
                    value={currentDocument.sucursal_code || 'SUC001'}
                    onChange={(e) => setCurrentDocument({...currentDocument, sucursal_code: e.target.value})}
                    placeholder="SUC001"
                  />
                </div>
                <div className="form-group">
                  <label>Nome da Sucursal:</label>
                  <input 
                    type="text" 
                    value={currentDocument.sucursal_name || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, sucursal_name: e.target.value})}
                    placeholder="Sucursal Maputo Centro"
                  />
                </div>
                <div className="form-group">
                  <label>Responsável:</label>
                  <input 
                    type="text" 
                    value={currentDocument.sucursal_responsavel || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, sucursal_responsavel: e.target.value})}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="form-group">
                  <label>Telefone:</label>
                  <input 
                    type="tel" 
                    value={currentDocument.sucursal_telefone || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, sucursal_telefone: e.target.value})}
                    placeholder="+258 84 123 4567"
                  />
                </div>
              </div>

              {/* Morada da Sucursal */}
              <div className="form-subsection">
                <h5>Morada da Sucursal</h5>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Morada Completa:</label>
                    <textarea 
                      value={currentDocument.sucursal_address || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, sucursal_address: e.target.value})}
                      placeholder="Av. 25 de Setembro, 1234&#10;Maputo, Moçambique"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Horário de Funcionamento:</label>
                    <input 
                      type="text" 
                      value={currentDocument.sucursal_horario || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, sucursal_horario: e.target.value})}
                      placeholder="Ex: 8h-17h, Seg-Sex"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input 
                      type="email" 
                      value={currentDocument.sucursal_email || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, sucursal_email: e.target.value})}
                      placeholder="sucursal@empresa.co.mz"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Totais - apenas para Orçamentos */}
          {currentDocument.document_type === 'ORC' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faCalculator} className="section-icon" />
                Totais
              </h4>
            <div className="totais-container">
              <div className="totais-grid">
                <div className="total-item">
                  <label>Subtotal (sem IVA):</label>
                  <span className="total-value">
                    {formatarMoeda(calcularSubtotal())}
                  </span>
                </div>
                <div className="total-item">
                  <label>Descontos Comerciais:</label>
                  <span className="total-value discount">
                    -{formatarMoeda(calcularDescontosComerciais())}
                  </span>
                </div>
                <div className="total-item">
                  <label>Base Tributável:</label>
                  <span className="total-value">
                    {formatarMoeda(calcularBaseTributavel())}
                  </span>
                </div>
                <div className="total-item">
                  <label>IVA 16%:</label>
                  <span className="total-value">
                    {formatarMoeda(calcularIVA16())}
                  </span>
                </div>
                <div className="total-item">
                  <label>IVA 5%:</label>
                  <span className="total-value">
                    {formatarMoeda(calcularIVA5())}
                  </span>
                </div>
                <div className="total-item total-final">
                  <label>Total da Proposta:</label>
                  <span className="total-value final">
                    {formatarMoeda(calcularTotalProposta())}
                  </span>
                </div>
                <div className="total-item">
                  <label>Margem Bruta Estimada:</label>
                  <span className="total-value margin">
                    {formatarMoeda(calcularMargemBruta())}
                  </span>
                </div>
              </div>
            </div>
          </div>
          )}


          {/* Informações de Transporte - apenas para Guias de Remessa */}
          {currentDocument.document_type === 'GUIA' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faTruck} className="section-icon" />
                Informações de Transporte
              </h4>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Empresa de Transporte:</label>
                  <input 
                    type="text" 
                    value={currentDocument.empresa_transporte || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, empresa_transporte: e.target.value})}
                    placeholder="Nome da empresa de transporte"
                  />
                </div>
                <div className="form-group">
                  <label>Transporte Próprio:</label>
                  <div className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={currentDocument.transporte_proprio || false}
                      onChange={(e) => setCurrentDocument({...currentDocument, transporte_proprio: e.target.checked})}
                    />
                    <span>Sim, é transporte próprio</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Nº Guia Transportador:</label>
                  <input 
                    type="text" 
                    value={currentDocument.numero_guia_transportador || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, numero_guia_transportador: e.target.value})}
                    placeholder="Número da guia do transportador"
                  />
                </div>
                <div className="form-group">
                  <label>Data de Recolha:</label>
                  <input 
                    type="date" 
                    value={currentDocument.data_recolha || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, data_recolha: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Data Prevista de Entrega:</label>
                  <input 
                    type="date" 
                    value={currentDocument.data_prevista_entrega || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, data_prevista_entrega: e.target.value})}
                  />
                </div>
              </div>

              {/* Instruções de Entrega */}
              <div className="form-subsection">
                <h5>Instruções de Entrega</h5>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Instruções Especiais:</label>
                    <textarea 
                      value={currentDocument.instrucoes_especiais || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, instrucoes_especiais: e.target.value})}
                      placeholder="Contactar antes da entrega. Entregar apenas de manhã."
                      rows={3}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Observações de Embalagem:</label>
                    <textarea 
                      value={currentDocument.observacoes_embalagem || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, observacoes_embalagem: e.target.value})}
                      placeholder="Instruções especiais de embalagem, cuidados, etc."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmação de Entrega - apenas para Guias de Remessa */}
          {currentDocument.document_type === 'GUIA' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faCheckCircle} className="section-icon" />
                Confirmação de Entrega
              </h4>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Data de Receção:</label>
                  <input 
                    type="date" 
                    value={currentDocument.data_rececao || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, data_rececao: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Hora de Receção:</label>
                  <input 
                    type="time" 
                    value={currentDocument.hora_rececao || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, hora_rececao: e.target.value})}
                  />
                </div>
              </div>
              
              {/* Assinatura do Cliente */}
              <div className="form-subsection">
                <h5>Assinatura do Cliente</h5>
                <div className="signature-container">
                  <div className="signature-pad">
                    {currentDocument.assinatura_cliente ? (
                      <div className="signature-display">
                        <div className="signature-text">
                          <FontAwesomeIcon icon={faCheckCircle} className="signature-icon" />
                          <span>{currentDocument.assinatura_cliente}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="signature-placeholder">
                        <FontAwesomeIcon icon={faEdit} className="signature-placeholder-icon" />
                        <span>Clique em "Guardar Assinatura" para capturar a assinatura do cliente</span>
                      </div>
                    )}
                  </div>
                  <div className="signature-controls">
                    <button 
                      className="btn btn-secondary" 
                      onClick={limparAssinatura}
                      disabled={!currentDocument.assinatura_cliente}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Limpar Assinatura
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={guardarAssinatura}
                    >
                      <FontAwesomeIcon icon={faSave} />
                      Guardar Assinatura
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Observações da Entrega */}
              <div className="form-subsection">
                <h5>Observações da Entrega</h5>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Observações do Motorista:</label>
                    <textarea 
                      value={currentDocument.observacoes_motorista || ''}
                      onChange={(e) => setCurrentDocument({...currentDocument, observacoes_motorista: e.target.value})}
                      placeholder="Observações sobre a entrega, estado dos produtos, etc."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Observações - apenas para Orçamentos */}
          {currentDocument.document_type === 'ORC' && (
            <div className="form-section">
              <h4>
                <FontAwesomeIcon icon={faFileAlt} className="section-icon" />
                Observações
              </h4>
              
              {/* Observações Internas */}
              <div className="form-subsection">
                <h5>
                  <FontAwesomeIcon icon={faLock} className="subsection-icon" />
                  Observações Internas
                </h5>
                <div className="form-group full-width">
                  <label>Observações Internas (não visíveis ao cliente):</label>
                  <textarea 
                    value={currentDocument.observacoes_internas || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, observacoes_internas: e.target.value})}
                    placeholder="Notas internas, comentários da equipa, instruções especiais..."
                    rows={4}
                    className="observacoes-textarea"
                  />
                </div>
              </div>

              {/* Observações para Cliente */}
              <div className="form-subsection">
                <h5>
                  <FontAwesomeIcon icon={faUser} className="subsection-icon" />
                  Observações para Cliente
                </h5>
                <div className="form-group full-width">
                  <label>Observações para Cliente (incluídas no documento):</label>
                  <textarea 
                    value={currentDocument.observacoes_cliente || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, observacoes_cliente: e.target.value})}
                    placeholder="Mensagem personalizada para o cliente, agradecimentos, próximos passos..."
                    rows={4}
                    className="observacoes-textarea"
                  />
                </div>
              </div>

              {/* Termos e Condições */}
              <div className="form-subsection">
                <h5>
                  <FontAwesomeIcon icon={faFileContract} className="subsection-icon" />
                  Termos e Condições Específicos
                </h5>
                <div className="form-group full-width">
                  <label>Termos e Condições específicos:</label>
                  <textarea 
                    value={currentDocument.termos_condicoes || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, termos_condicoes: e.target.value})}
                    placeholder="Condições especiais de pagamento, garantias, prazos de entrega, etc."
                    rows={4}
                    className="observacoes-textarea"
                  />
                </div>
              </div>

              {/* Informações de Entrega */}
              <div className="form-subsection">
                <h5>
                  <FontAwesomeIcon icon={faTruck} className="subsection-icon" />
                  Informações de Entrega
                </h5>
                <div className="form-group full-width">
                  <label>Informações de Entrega:</label>
                  <textarea 
                    value={currentDocument.informacoes_entrega || ''}
                    onChange={(e) => setCurrentDocument({...currentDocument, informacoes_entrega: e.target.value})}
                    placeholder="Instruções específicas de entrega, horários, contactos, localização..."
                    rows={4}
                    className="observacoes-textarea"
                  />
                </div>
              </div>
            </div>
          )}


          {/* Botões de Ação */}
          <div className="form-section actions-section">
            <h4>
              <FontAwesomeIcon icon={faCog} className="section-icon" />
              Ações do Documento
            </h4>
            <div className="actions-buttons">
              {/* Botões para Orçamentos */}
              {currentDocument.document_type === 'ORC' && (
                <>
                  <button 
                    className="btn btn-primary action-btn"
                    onClick={imprimirOrcamento}
                    title="Imprimir Orçamento"
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                    Imprimir Orçamento
                  </button>
                  <button 
                    className="btn btn-success action-btn"
                    onClick={gerarFaturaOrcamento}
                    title="Gerar Fatura a partir do Orçamento"
                  >
                    <FontAwesomeIcon icon={faReceipt} />
                    Gerar Fatura a partir do Orçamento
                  </button>
                </>
              )}

              {/* Botões para Guias de Remessa */}
              {currentDocument.document_type === 'GUIA' && (
                <>
                  <button 
                    className="btn btn-primary action-btn"
                    onClick={expedirGR}
                    title="Expedir a Guia de Remessa"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Expedir GR
                  </button>
                  <button 
                    className="btn btn-secondary action-btn"
                    onClick={imprimirGR}
                    title="Imprimir a Guia de Remessa"
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                    Imprimir GR
                  </button>
                  <button 
                    className="btn btn-warning action-btn"
                    onClick={regularizarGR}
                    title="Regularizar a Guia de Remessa"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Regularizar
                  </button>
                  <button 
                    className="btn btn-success action-btn"
                    onClick={gerarFaturaGR}
                    title="Gerar Fatura a partir da Guia de Remessa"
                  >
                    <FontAwesomeIcon icon={faReceipt} />
                    Gerar Fatura...
                  </button>
                </>
              )}
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
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowProdutoModal(true)}
                    >
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
                          onChange={(e) => {
                            atualizarLinhaFatura(linha.id, 'codigo', e.target.value);
                            // Preenchimento automático após 500ms de pausa na digitação
                            setTimeout(() => {
                              const linhaIndex = faturaData.linhas.findIndex(l => l.id === linha.id);
                              if (linhaIndex !== -1) {
                                preencherLinhaAutomaticamente(e.target.value, linhaIndex);
                              }
                            }, 500);
                          }}
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

      {/* Modal de Seleção de Produtos */}
      {showProdutoModal && (
        <div className="produto-modal-overlay" onClick={() => setShowProdutoModal(false)}>
          <div className="produto-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="produto-modal-header">
              <h3>Selecionar Produto</h3>
              <button 
                className="close-btn"
                onClick={() => setShowProdutoModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="produto-modal-content">
              {/* Filtros de busca */}
              <div className="produto-filters">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} />
                  <input
                    type="text"
                    placeholder="Pesquisar por código, nome ou descrição..."
                    value={searchProduto}
                    onChange={(e) => setSearchProduto(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarProdutos()}
                  />
                  <button onClick={buscarProdutos}>
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
                
                <div className="categoria-filter">
                  <label>Categoria:</label>
                  <select 
                    value={filtroCategoria} 
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="all">Todas as Categorias</option>
                    {categoriasStock.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de produtos */}
              <div className="produto-list">
                {produtosStock.map(produto => (
                  <div 
                    key={produto.id} 
                    className={`produto-item ${produtoSelecionado?.id === produto.id ? 'selected' : ''}`}
                    onClick={() => setProdutoSelecionado(produto)}
                  >
                    <div className="produto-info">
                      <div className="produto-codigo">{produto.codigo}</div>
                      <div className="produto-nome">{produto.nome}</div>
                      <div className="produto-categoria">{produto.categoria_nome}</div>
                      <div className="produto-stock">
                        Stock: {produto.stock_disponivel} {produto.unidade_medida}
                      </div>
                      {produto.preco_venda && (
                        <div className="produto-preco">
                          Preço: {formatarMoeda(produto.preco_venda)}
                        </div>
                      )}
                    </div>
                    <div className="produto-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => adicionarProduto(produto)}
                        disabled={produto.stock_disponivel <= 0}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Adicionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {produtosStock.length === 0 && (
                <div className="no-products">
                  <FontAwesomeIcon icon={faBox} />
                  <p>Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Sucursais */}
      {showSucursalSelector && (
        <div className="modal-overlay" onClick={() => setShowSucursalSelector(false)}>
          <div className="modal-container sucursal-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Selecionar Sucursal</h3>
              <button 
                className="btn-close"
                onClick={() => setShowSucursalSelector(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="sucursal-list">
                {sucursais.length === 0 ? (
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faBuilding} className="empty-icon" />
                    <h3>Nenhuma sucursal disponível</h3>
                    <p>Não há sucursais ativas cadastradas no sistema.</p>
                  </div>
                ) : (
                  sucursais.map(sucursal => (
                    <div 
                      key={sucursal.id} 
                      className="sucursal-item"
                      onClick={() => selecionarSucursal(sucursal)}
                    >
                      <div className="sucursal-info">
                        <div className="sucursal-header">
                          <h4>{sucursal.nome}</h4>
                          <span className={`tipo-badge ${sucursal.tipo}`}>
                            {sucursal.tipo === 'sucursal' && <FontAwesomeIcon icon={faStore} />}
                            {sucursal.tipo === 'armazem' && <FontAwesomeIcon icon={faWarehouse} />}
                            {sucursal.tipo === 'loja' && <FontAwesomeIcon icon={faStore} />}
                            {sucursal.tipo.charAt(0).toUpperCase() + sucursal.tipo.slice(1)}
                          </span>
                        </div>
                        <div className="sucursal-details">
                          <div className="detail-row">
                            <FontAwesomeIcon icon={faBuilding} />
                            <span>{sucursal.codigo}</span>
                          </div>
                          <div className="detail-row">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <span>{sucursal.endereco.cidade}, {sucursal.endereco.provincia}</span>
                          </div>
                          <div className="detail-row">
                            <FontAwesomeIcon icon={faPhone} />
                            <span>{sucursal.contactos.telefone}</span>
                          </div>
                          <div className="detail-row">
                            <FontAwesomeIcon icon={faUser} />
                            <span>{sucursal.responsavel.nome} - {sucursal.responsavel.cargo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="sucursal-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => selecionarSucursal(sucursal)}
                        >
                          Selecionar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Vendas;
