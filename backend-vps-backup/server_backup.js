const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Caminho para o arquivo de dados
const DATA_FILE = path.join(__dirname, 'data', 'documents.json');

// Garantir que o diretório de dados existe
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Função para ler dados do arquivo
const readData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      if (data.trim() === '') {
        console.log('Arquivo de dados vazio, inicializando...');
        return { documents: [], nextNumbers: {} };
      }
      return JSON.parse(data);
    }
    return { documents: [], nextNumbers: {} };
  } catch (error) {
    console.error('Erro ao ler dados:', error);
    console.log('Inicializando dados padrão...');
    return { documents: [], nextNumbers: {} };
  }
};

// Função para escrever dados no arquivo
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao escrever dados:', error);
    return false;
  }
};

// Inicializar dados se não existirem
const initializeData = () => {
  const data = readData();
  if (data.documents.length === 0) {
    // Dados iniciais
    data.documents = [
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
        status: 'DRAFT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
        status: 'SENT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Números sequenciais iniciais
    data.nextNumbers = {
      'orcamento': { series: 'ORÇ', number: 1 },
      'encomenda': { series: 'EC', number: 1 },
      'fatura': { series: 'FAT', number: 15 },
      'guia': { series: 'GR', number: 1 },
      'credito': { series: 'NC', number: 1 },
      'debito': { series: 'ND', number: 1 }
    };
    
    writeData(data);
  }
};

// Inicializar dados
initializeData();

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'USIMAMIZI Backend API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// ==================== ROTAS DE VENDAS ====================

// GET /api/sales/documents - Listar todos os documentos
app.get('/api/sales/documents', (req, res) => {
  try {
    const data = readData();
    res.json({
      success: true,
      data: data.documents,
      total: data.documents.length
    });
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/sales/produtos - Buscar produtos do stock para vendas
app.get('/api/sales/produtos', (req, res) => {
  try {
    const data = readData();
    const { search, categoria, ativo } = req.query;
    
    let produtos = data.produtos || [];
    
    // Filtros
    if (search) {
      produtos = produtos.filter(produto => 
        produto.nome.toLowerCase().includes(search.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(search.toLowerCase()) ||
        produto.descricao?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (categoria && categoria !== 'all') {
      produtos = produtos.filter(produto => produto.categoria_id === categoria);
    }
    
    if (ativo !== undefined) {
      const isAtivo = ativo === 'true';
      produtos = produtos.filter(produto => produto.ativo === isAtivo);
    }
    
    // Adicionar informações da categoria
    produtos = produtos.map(produto => {
      const categoria = data.categorias?.find(cat => cat.id === produto.categoria_id);
      return {
        ...produto,
        categoria_nome: categoria?.nome || 'Sem categoria'
      };
    });
    
    res.json({
      success: true,
      data: produtos,
      total: produtos.length
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/sales/categorias - Buscar categorias para vendas
app.get('/api/sales/categorias', (req, res) => {
  try {
    const data = readData();
    const categorias = data.categorias?.filter(cat => cat.ativa) || [];
    
    res.json({
      success: true,
      data: categorias,
      total: categorias.length
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/sales/atualizar-stock - Atualizar stock após venda
app.post('/api/sales/atualizar-stock', (req, res) => {
  try {
    const { produtos, tipo_operacao = 'venda' } = req.body;
    const data = readData();
    
    if (!produtos || !Array.isArray(produtos)) {
      return res.status(400).json({
        success: false,
        message: 'Lista de produtos é obrigatória'
      });
    }
    
    // Atualizar stock para cada produto
    produtos.forEach(produtoVendido => {
      const produtoIndex = data.produtos.findIndex(p => p.id === produtoVendido.produto_id);
      if (produtoIndex !== -1) {
        const produto = data.produtos[produtoIndex];
        const quantidade = produtoVendido.quantidade || 0;
        
        // Atualizar stock baseado no tipo de operação
        if (tipo_operacao === 'venda' || tipo_operacao === 'expedicao') {
          // Venda/Expedição: reduzir stock
          produto.stock_atual = Math.max(0, produto.stock_atual - quantidade);
          produto.stock_disponivel = Math.max(0, produto.stock_disponivel - quantidade);
        } else if (tipo_operacao === 'entrada') {
          // Entrada: aumentar stock
          produto.stock_atual = (produto.stock_atual || 0) + quantidade;
          produto.stock_disponivel = (produto.stock_disponivel || 0) + quantidade;
        }
        
        produto.updated_at = new Date().toISOString();
        data.produtos[produtoIndex] = produto;
      }
    });
    
    // Salvar dados atualizados
    writeData(data);
    
    res.json({
      success: true,
      message: 'Stock atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar stock:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/sales/documents/:id - Obter documento específico
app.get('/api/sales/documents/:id', (req, res) => {
  try {
    const data = readData();
    const document = data.documents.find(doc => doc.id === parseInt(req.params.id));
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Erro ao obter documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/sales/documents - Criar novo documento
app.post('/api/sales/documents', (req, res) => {
  try {
    const data = readData();
    const newDocument = {
      id: data.documents.length > 0 ? Math.max(...data.documents.map(d => d.id)) + 1 : 1,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.documents.push(newDocument);
    
    if (writeData(data)) {
      res.status(201).json({
        success: true,
        data: newDocument,
        message: 'Documento criado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar documento'
      });
    }
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/sales/documents/:id - Atualizar documento
app.put('/api/sales/documents/:id', (req, res) => {
  try {
    const data = readData();
    const documentIndex = data.documents.findIndex(doc => doc.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }
    
    data.documents[documentIndex] = {
      ...data.documents[documentIndex],
      ...req.body,
      id: parseInt(req.params.id), // Garantir que o ID não seja alterado
      updated_at: new Date().toISOString()
    };
    
    if (writeData(data)) {
      res.json({
        success: true,
        data: data.documents[documentIndex],
        message: 'Documento atualizado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar documento'
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/sales/documents/:id - Eliminar documento
app.delete('/api/sales/documents/:id', (req, res) => {
  try {
    const data = readData();
    const documentIndex = data.documents.findIndex(doc => doc.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }
    
    data.documents.splice(documentIndex, 1);
    
    if (writeData(data)) {
      res.json({
        success: true,
        message: 'Documento eliminado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar alterações'
      });
    }
  } catch (error) {
    console.error('Erro ao eliminar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/sales/document-numbers/:type - Obter próximo número do documento
app.get('/api/sales/document-numbers/:type', (req, res) => {
  try {
    const data = readData();
    const type = req.params.type.toLowerCase();
    
    if (!data.nextNumbers[type]) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento inválido'
      });
    }
    
    const nextNumber = data.nextNumbers[type];
    const year = new Date().getFullYear();
    const number = `${year}/${nextNumber.number.toString().padStart(3, '0')}`;
    const fullNumber = `${nextNumber.series} ${number}`;
    
    // Incrementar o número para a próxima vez
    data.nextNumbers[type].number += 1;
    writeData(data);
    
    res.json({
      success: true,
      data: {
        series: nextNumber.series,
        number: number,
        full_number: fullNumber
      }
    });
  } catch (error) {
    console.error('Erro ao obter próximo número:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTA PARA PDF DE ORÇAMENTO ====================

// POST /api/sales/export-orc-pdf - Gerar PDF do orçamento (inspirado no CEGID Primavera)
app.post('/api/sales/export-orc-pdf', async (req, res) => {
  try {
    const orcData = req.body;

    if (!orcData || !orcData.full_number) {
      return res.status(400).json({
        success: false,
        message: 'Dados do orçamento são obrigatórios'
      });
    }

    const data = readData();
    const settings = data.settings || {};
    const empresa = settings.empresa || {};
    const companyName = empresa.nomeEmpresa || settings.companyName || 'USIMAMIZI, LDA';
    const logo = empresa.logotipo || settings.logo;

    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Orcamento_${orcData.full_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`);

    doc.pipe(res);

    // ==================== CABEÇALHO DA EMPRESA ====================
    
    // Logo da empresa (se disponível)
    let logoWidth = 0;
    let logoHeight = 0;
    const logoSize = 50;
    const logoX = 30;
    const logoY = 30;
    
    if (logo && logo.startsWith('data:image/')) {
      try {
        const base64Data = logo.split(',')[1];
        const logoBuffer = Buffer.from(base64Data, 'base64');
        
        doc.image(logoBuffer, logoX, logoY, { 
          width: logoSize, 
          height: logoSize,
          fit: [logoSize, logoSize],
          align: 'left'
        });
        
        logoWidth = logoSize;
        logoHeight = logoSize;
      } catch (error) {
        console.error('Erro ao processar logo:', error);
      }
    }
    
    // Nome da empresa
    const textStartX = logoWidth > 0 ? logoX + logoWidth + 15 : 30;
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(companyName, textStartX, logoY + 10);
    
    // Informações de contacto (lado direito)
    const rightX = 400;
    const rightWidth = 150;
    
    const enderecoLinha1 = empresa.ruaAvenida || 'Rua Aníbal Aleluia nº 66 R/C, Bairro da Coop';
    const enderecoLinha2 = empresa.cidade || 'Maputo';
    const enderecoLinha3 = empresa.provincia || 'Moçambique';
    const telefone = `Tel: ${empresa.telefone || '+258 84 123 4567'}`;
    const nuit = `NUIT: ${empresa.nuit || '123456789'}`;
    const email = `Email: ${empresa.emailGeral || 'geral@usimamizi.co.mz'}`;
    
    let contactY = logoY + 10;
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#2c3e50');
    
    const drawTextWithWrap = (text, x, y, width, align = 'right') => {
      if (!text || text.trim() === '') {
        return y + 10;
      }
      
      try {
        const lines = doc.text(text, x, y, { 
          width: width, 
          align: align,
          lineGap: 1
        });
        const lineCount = Array.isArray(lines) ? lines.length : 1;
        return y + (lineCount * 10);
      } catch (error) {
        console.error('Erro ao desenhar texto:', error);
        return y + 10;
      }
    };
    
    contactY = drawTextWithWrap(enderecoLinha1, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(enderecoLinha2, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(enderecoLinha3, rightX, contactY, rightWidth, 'right');
    contactY += 5;
    contactY = drawTextWithWrap(telefone, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(nuit, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(email, rightX, contactY, rightWidth, 'right');
    
    // ==================== TÍTULO E NÚMERO DO ORÇAMENTO ====================
    
    const titleY = Math.max(120, contactY + 20);
    
    // Título "ORÇAMENTO" centralizado
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('ORÇAMENTO', 0, titleY, { align: 'center' });
    
    // Número do orçamento em caixa (estilo CEGID)
    const boxX = 450;
    const boxY = titleY + 25;
    const boxWidth = 100;
    const boxHeight = 30;
    
    // Caixa com fundo cinza
    doc.rect(boxX, boxY, boxWidth, boxHeight)
       .fill('#f0f0f0')
       .stroke('#2c3e50');
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Nº ORÇ', boxX + 5, boxY + 5);
    
    doc.fontSize(12)
       .text(orcData.full_number, boxX + 5, boxY + 15);
    
    // Data
    doc.fontSize(9)
       .font('Helvetica')
       .text(`Data: ${new Date(orcData.document_date).toLocaleDateString('pt-MZ')}`, boxX, boxY + 35);
    
    // ==================== INFORMAÇÕES BÁSICAS ====================
    
    const infoY = titleY + 80;
    
    // Cabeçalho da seção
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('INFORMAÇÕES BÁSICAS:', 30, infoY);
    
    // Linha separadora
    doc.moveTo(30, infoY + 15)
       .lineTo(570, infoY + 15)
       .stroke('#2c3e50');
    
    // Dados básicos
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Série:', 30, infoY + 25)
       .text('Número:', 30, infoY + 45)
       .text('Data Documento:', 30, infoY + 65)
       .text('Data Validade:', 30, infoY + 85)
       .text('Estado:', 30, infoY + 105)
       .text('Cliente:', 30, infoY + 125)
       .text('Vendedor:', 30, infoY + 145)
       .text('Oportunidade:', 30, infoY + 165);
    
    doc.font('Helvetica')
       .text('ORÇ', 120, infoY + 25)
       .text(orcData.full_number, 120, infoY + 45)
       .text(new Date(orcData.document_date).toLocaleDateString('pt-MZ'), 120, infoY + 65)
       .text(orcData.due_date ? new Date(orcData.due_date).toLocaleDateString('pt-MZ') : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-MZ'), 120, infoY + 85)
       .text(orcData.estado || 'Em Elaboração', 120, infoY + 105)
       .text(orcData.client_name || 'Nome do Cliente', 120, infoY + 125)
       .text(orcData.vendedor || 'Nome do Vendedor', 120, infoY + 145)
       .text(orcData.oportunidade || 'OPP-2025-001', 120, infoY + 165);
    
    // ==================== DADOS DO CLIENTE ====================
    
    const clientY = infoY + 200;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('DADOS DO CLIENTE:', 30, clientY);
    
    // Linha separadora
    doc.moveTo(30, clientY + 15)
       .lineTo(570, clientY + 15)
       .stroke('#2c3e50');
    
    // Dados do cliente
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Nome/Nome Comercial:', 30, clientY + 25)
       .text('NUIT:', 30, clientY + 45)
       .text('Email:', 30, clientY + 65)
       .text('Morada:', 30, clientY + 85)
       .text('Contacto:', 30, clientY + 105);
    
    doc.font('Helvetica')
       .text(orcData.client_name || 'Nome do Cliente', 150, clientY + 25)
       .text(orcData.client_tax_number || '123456789', 150, clientY + 45)
       .text(orcData.client_email || 'cliente@email.com', 150, clientY + 65)
       .text(orcData.client_address || 'Endereço do Cliente', 150, clientY + 85)
       .text(orcData.client_phone || '+258 84 123 4567', 150, clientY + 105);
    
    // ==================== TABELA DE ITENS DA COTAÇÃO ====================
    
    const tableY = clientY + 140;
    const tableWidth = 540;
    const colWidths = [50, 200, 60, 80, 60, 90]; // Código, Descrição, Qtd, Preço Unit, Desconto, Total
    
    // Cabeçalho da tabela (estilo CEGID)
    doc.rect(30, tableY, tableWidth, 25)
       .fill('#e8f4fd')
       .stroke('#2c3e50');
    
    const headers = ['Código', 'Descrição Detalhada', 'Qtd', 'Preço Unit.', '% Desc.', 'Total'];
    let currentX = 30;
    
    headers.forEach((header, index) => {
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(header, currentX + 3, tableY + 8, {
           width: colWidths[index] - 6,
           align: 'center'
         });
      currentX += colWidths[index];
    });
    
    // Linhas dos produtos
    let currentRowY = tableY + 25;
    
    // Usar cotacaoItens se disponível
    const cotacaoItens = orcData.cotacaoItens || [];
    
    if (cotacaoItens.length === 0) {
      // Linha vazia se não há itens
      doc.rect(30, currentRowY, tableWidth, 20)
         .stroke('#ddd')
         .fillColor('#000000')
         .fontSize(9)
         .font('Helvetica')
         .text('Nenhum item adicionado', 35, currentRowY + 6);
      currentRowY += 20;
    } else {
      cotacaoItens.forEach((item, index) => {
        // Linha de fundo alternada
        if (index % 2 === 0) {
          doc.rect(30, currentRowY, tableWidth, 20)
             .fill('#f8f9fa');
        }
        
        // Bordas da linha
        doc.rect(30, currentRowY, tableWidth, 20)
           .stroke('#ddd');
        
        // Conteúdo da linha
        currentX = 30;
        
        // Código
        doc.fontSize(7)
           .font('Helvetica')
           .fillColor('#2c3e50')
           .text(item.codigo || '', currentX + 3, currentRowY + 6, {
             width: colWidths[0] - 6,
             align: 'center'
           });
        currentX += colWidths[0];
        
        // Descrição
        doc.text(item.descricao || '', currentX + 3, currentRowY + 6, {
          width: colWidths[1] - 6,
          align: 'left'
        });
        currentX += colWidths[1];
        
        // Quantidade
        doc.text((item.quantidade || 0).toString(), currentX + 3, currentRowY + 6, {
          width: colWidths[2] - 6,
          align: 'center'
        });
        currentX += colWidths[2];
        
        // Preço Unitário
        doc.text((item.precoUnitario || 0).toFixed(2), currentX + 3, currentRowY + 6, {
          width: colWidths[3] - 6,
          align: 'right'
        });
        currentX += colWidths[3];
        
        // Desconto
        doc.text(`${(item.descontoComercial || 0).toFixed(1)}%`, currentX + 3, currentRowY + 6, {
          width: colWidths[4] - 6,
          align: 'center'
        });
        currentX += colWidths[4];
        
        // Total
        doc.text((item.valorTotal || 0).toFixed(2), currentX + 3, currentRowY + 6, {
          width: colWidths[5] - 6,
          align: 'right'
        });
        
        currentRowY += 20;
      });
    }
    
    // ==================== TOTAIS ====================
    
    const totalsY = currentRowY + 20;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('TOTAIS:', 30, totalsY);
    
    // Linha separadora
    doc.moveTo(30, totalsY + 15)
       .lineTo(570, totalsY + 15)
       .stroke('#2c3e50');
    
    // Caixa dos totais (lado direito)
    const totalsBoxX = 350;
    const totalsBoxY = totalsY + 25;
    const totalsBoxWidth = 220;
    const totalsBoxHeight = 120;
    
    // Fundo dos totais
    doc.rect(totalsBoxX, totalsBoxY, totalsBoxWidth, totalsBoxHeight)
       .fill('#f8f9fa')
       .stroke('#2c3e50');
    
    // Títulos dos totais
    doc.fillColor('#000000')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Subtotal (sem IVA):', totalsBoxX + 10, totalsBoxY + 15)
       .text('Descontos comerciais:', totalsBoxX + 10, totalsBoxY + 35)
       .text('Base tributável:', totalsBoxX + 10, totalsBoxY + 55)
       .text('IVA (16%):', totalsBoxX + 10, totalsBoxY + 75)
       .text('IVA (5%):', totalsBoxX + 10, totalsBoxY + 95)
       .text('TOTAL DA PROPOSTA:', totalsBoxX + 10, totalsBoxY + 115);
    
    // Valores dos totais
    const totais = orcData.totais || {};
    doc.font('Helvetica')
       .text(totais.subtotal ? totais.subtotal.toFixed(2) : '0,00', totalsBoxX + 150, totalsBoxY + 15, { align: 'right' })
       .text(totais.descontos ? totais.descontos.toFixed(2) : '0,00', totalsBoxX + 150, totalsBoxY + 35, { align: 'right' })
       .text(totais.baseTributavel ? totais.baseTributavel.toFixed(2) : '0,00', totalsBoxX + 150, totalsBoxY + 55, { align: 'right' })
       .text(totais.iva16 ? totais.iva16.toFixed(2) : '0,00', totalsBoxX + 150, totalsBoxY + 75, { align: 'right' })
       .text(totais.iva5 ? totais.iva5.toFixed(2) : '0,00', totalsBoxX + 150, totalsBoxY + 95, { align: 'right' })
       .font('Helvetica-Bold')
       .text(totais.total ? totais.total.toFixed(2) : '0,00', totalsBoxX + 150, totalsBoxY + 115, { align: 'right' });
    
    // ==================== CONFIGURAÇÕES DE VENDA ====================
    
    const configY = totalsY + 160;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('CONFIGURAÇÕES DE VENDA:', 30, configY);
    
    // Linha separadora
    doc.moveTo(30, configY + 15)
       .lineTo(570, configY + 15)
       .stroke('#2c3e50');
    
    // Dados de configuração
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Condição Pagamento:', 30, configY + 25)
       .text('Moeda:', 30, configY + 45)
       .text('Portes:', 30, configY + 65)
       .text('Validade Proposta:', 30, configY + 85)
       .text('Lista Preços:', 30, configY + 105);
    
    doc.font('Helvetica')
       .text(orcData.payment_terms === 'pronto' ? 'Pronto pagamento' : orcData.payment_terms || '30 dias', 150, configY + 25)
       .text(orcData.currency || 'MZN', 150, configY + 45)
       .text(orcData.portes || 'Incluídos', 150, configY + 65)
       .text(orcData.validade_proposta || '30 dias', 150, configY + 85)
       .text(orcData.lista_precos || 'Padrão', 150, configY + 105);
    
    // ==================== OBSERVAÇÕES ====================
    
    const obsY = configY + 140;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('OBSERVAÇÕES:', 30, obsY);
    
    // Linha separadora
    doc.moveTo(30, obsY + 15)
       .lineTo(570, obsY + 15)
       .stroke('#2c3e50');
    
    // Observações
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Observações Internas:', 30, obsY + 25)
       .text('Observações para Cliente:', 30, obsY + 65)
       .text('Termos e Condições:', 30, obsY + 105)
       .text('Informações de Entrega:', 30, obsY + 145);
    
    doc.font('Helvetica')
       .text(orcData.observacoes_internas || 'Nenhuma observação interna', 30, obsY + 40, { width: 520 })
       .text(orcData.observacoes_cliente || 'Nenhuma observação para o cliente', 30, obsY + 80, { width: 520 })
       .text(orcData.termos_condicoes || 'Termos e condições padrão aplicáveis', 30, obsY + 120, { width: 520 })
       .text(orcData.informacoes_entrega || 'Informações de entrega padrão', 30, obsY + 160, { width: 520 });
    
    // ==================== ASSINATURA ====================
    
    const signatureY = obsY + 200;
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Responsável pela Cotação:', 30, signatureY);
    
    // Campo para assinatura
    doc.rect(30, signatureY + 20, 250, 40)
       .stroke('#2c3e50');
    
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#999')
       .text('Assinatura do Responsável', 35, signatureY + 35);
    
    // Nome do responsável
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(orcData.vendedor || 'Nome do Vendedor', 30, signatureY + 70);
    
    // ==================== RODAPÉ ====================
    
    const footerY = signatureY + 100;
    
    // Texto de processamento
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666')
       .text('Documento Processado por Computador', 30, footerY);
    
    // Dados bancários (se necessário)
    if (empresa.bancoConta) {
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text('Dados Bancários:', 30, footerY + 20);
      
      doc.font('Helvetica')
         .text(`${companyName}`, 30, footerY + 35)
         .text(`Conta nº ${empresa.bancoConta}`, 30, footerY + 50)
         .text(`NIB: ${empresa.bancoNIB || ''}`, 30, footerY + 65)
         .text(empresa.bancoNome || '', 30, footerY + 80);
    }
    
    // Rodapé final
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666')
       .text('Processada por Computador © USIMAMIZI', 300, 750, { align: 'center' })
       .text('Página 1 de 1', 570, 750, { align: 'right' });
    
    // Finalizar o PDF
    doc.end();
    
  } catch (error) {
    console.error('Erro ao gerar PDF do orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar PDF do orçamento: ' + error.message
    });
  }
});

// ==================== ROTAS DE COMPRAS ====================

// GET /api/purchases/documents - Listar todos os documentos de compras
app.get('/api/purchases/documents', (req, res) => {
  try {
    const data = readData();
    res.json({
      success: true,
      data: data.purchaseDocuments || [],
      total: (data.purchaseDocuments || []).length
    });
  } catch (error) {
    console.error('Erro ao listar documentos de compras:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/purchases/documents/:id - Obter documento de compra específico
app.get('/api/purchases/documents/:id', (req, res) => {
  try {
    const data = readData();
    const document = (data.purchaseDocuments || []).find(doc => doc.id === parseInt(req.params.id));
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Erro ao obter documento de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/purchases/documents - Criar novo documento de compra
app.post('/api/purchases/documents', (req, res) => {
  try {
    const data = readData();
    if (!data.purchaseDocuments) {
      data.purchaseDocuments = [];
    }
    
    const newDocument = {
      id: data.purchaseDocuments.length > 0 ? Math.max(...data.purchaseDocuments.map(d => d.id)) + 1 : 1,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.purchaseDocuments.push(newDocument);
    
    if (writeData(data)) {
      res.status(201).json({
        success: true,
        data: newDocument,
        message: 'Documento de compra criado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar documento de compra'
      });
    }
  } catch (error) {
    console.error('Erro ao criar documento de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/purchases/documents/:id - Atualizar documento de compra
app.put('/api/purchases/documents/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.purchaseDocuments) {
      data.purchaseDocuments = [];
    }
    
    const documentIndex = data.purchaseDocuments.findIndex(doc => doc.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }
    
    data.purchaseDocuments[documentIndex] = {
      ...data.purchaseDocuments[documentIndex],
      ...req.body,
      id: parseInt(req.params.id),
      updated_at: new Date().toISOString()
    };
    
    if (writeData(data)) {
      res.json({
        success: true,
        data: data.purchaseDocuments[documentIndex],
        message: 'Documento de compra atualizado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar documento de compra'
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar documento de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/purchases/documents/:id - Eliminar documento de compra
app.delete('/api/purchases/documents/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.purchaseDocuments) {
      data.purchaseDocuments = [];
    }
    
    const documentIndex = data.purchaseDocuments.findIndex(doc => doc.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }
    
    data.purchaseDocuments.splice(documentIndex, 1);
    
    if (writeData(data)) {
      res.json({
        success: true,
        message: 'Documento de compra eliminado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar alterações'
      });
    }
  } catch (error) {
    console.error('Erro ao eliminar documento de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/purchases/document-numbers/:type - Obter próximo número do documento de compra
app.get('/api/purchases/document-numbers/:type', (req, res) => {
  try {
    const data = readData();
    const type = req.params.type.toLowerCase();
    
    // Mapear tipos de compras
    const typeMapping = {
      'requisicao': 'REQ',
      'encomenda': 'EA',
      'guia': 'GE',
      'fatura': 'FR',
      'stock': 'ST',
      'credito': 'NC',
      'debito': 'ND'
    };
    
    const series = typeMapping[type] || type.toUpperCase();
    
    if (!data.nextNumbers) {
      data.nextNumbers = {};
    }
    
    if (!data.nextNumbers[type]) {
      data.nextNumbers[type] = { series: series, number: 1 };
    }
    
    const nextNumber = data.nextNumbers[type];
    const year = new Date().getFullYear();
    const number = `${year}/${nextNumber.number.toString().padStart(3, '0')}`;
    const fullNumber = `${nextNumber.series} ${number}`;
    
    // Incrementar o número para a próxima vez
    data.nextNumbers[type].number += 1;
    writeData(data);
    
    res.json({
      success: true,
      data: {
        series: nextNumber.series,
        number: number,
        full_number: fullNumber
      }
    });
  } catch (error) {
    console.error('Erro ao obter próximo número de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS DO DASHBOARD ====================

// GET /api/dashboard/stats - Estatísticas do dashboard
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const data = readData();
    const documents = data.documents;
    
    const stats = {
      faturasEmitidas: documents.filter(doc => doc.document_type === 'FAT').length,
      vendasMes: documents
        .filter(doc => doc.document_type === 'FAT' && doc.status === 'PAID')
        .reduce((sum, doc) => sum + (doc.total_amount || 0), 0),
      clientesAtivos: new Set(documents.map(doc => doc.client_name)).size,
      recebimentosPendentes: documents
        .filter(doc => doc.document_type === 'FAT' && doc.status !== 'PAID')
        .reduce((sum, doc) => sum + (doc.total_amount || 0), 0)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/dashboard/activities - Atividades recentes
app.get('/api/dashboard/activities', (req, res) => {
  try {
    const data = readData();
    const activities = data.documents
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5)
      .map(doc => ({
        icon: doc.document_type === 'FAT' ? 'fas fa-file-invoice' : 'fas fa-file-alt',
        title: `${doc.document_type} ${doc.full_number} ${doc.status === 'DRAFT' ? 'criado' : 'atualizado'}`,
        time: 'Há poucos minutos',
        color: doc.status === 'PAID' ? '#27ae60' : doc.status === 'SENT' ? '#3498db' : '#f39c12'
      }));
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Erro ao obter atividades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS DE CONFIGURAÇÕES ====================

// GET /api/settings/logo - Obter logo da empresa
app.get('/api/settings/logo', (req, res) => {
  try {
    const data = readData();
    res.json({
      success: true,
      data: {
        logo: data.settings?.logo || null,
        companyName: data.settings?.companyName || 'USIMAMIZI, LDA'
      }
    });
  } catch (error) {
    console.error('Erro ao obter logo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/settings/logo - Upload do logo da empresa
app.post('/api/settings/logo', (req, res) => {
  try {
    const { logo, companyName } = req.body;
    const data = readData();
    
    if (!data.settings) {
      data.settings = {};
    }
    
    data.settings.logo = logo;
    data.settings.companyName = companyName || 'USIMAMIZI, LDA';
    
    if (writeData(data)) {
      res.json({
        success: true,
        message: 'Logo atualizado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar logo'
      });
    }
  } catch (error) {
    console.error('Erro ao salvar logo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/settings/empresa - Obter dados da empresa
app.get('/api/settings/empresa', (req, res) => {
  try {
    const data = readData();
    res.json({
      success: true,
      data: data.settings?.empresa || {
        nomeEmpresa: 'Usimamizi Lda',
        nomeComercial: '',
        nuit: '123456789',
        capitalSocial: '',
        ruaAvenida: 'Av. Julius Nyerere, 1234',
        cidade: 'Maputo',
        provincia: 'Maputo',
        codigoPostal: '1100',
        telefone: '+258 84 123 4567',
        fax: '+258 21 123 456',
        emailGeral: 'geral@usimamizi.co.mz',
        website: 'www.usimamizi.co.mz',
        codigoCAE: '62010',
        descricaoAtividade: 'Desenvolvimento de software e consultoria informática',
        logotipo: '',
        // Dados bancários
        bancoNome: 'Banco BCI',
        bancoConta: '1234567890123456',
        bancoNIB: '0008 0000 12345678901 23',
        bancoIBAN: 'MZ59000800001234567890123',
        modalidadePagamento: 'Numerário, depósito ou Cheque'
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/settings/empresa - Salvar dados da empresa
app.post('/api/settings/empresa', (req, res) => {
  try {
    const empresaData = req.body;
    const data = readData();
    
    if (!data.settings) {
      data.settings = {};
    }
    
    data.settings.empresa = empresaData;
    
    if (writeData(data)) {
      res.json({
        success: true,
        message: 'Dados da empresa salvos com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar dados da empresa'
      });
    }
  } catch (error) {
    console.error('Erro ao salvar dados da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS DE PDF E PAGAMENTOS ====================

// POST /api/sales/export-pdf - Exportar fatura para PDF
app.post('/api/sales/export-pdf', async (req, res) => {
  try {
    const faturaData = req.body;
    
    // Validar dados obrigatórios
    if (!faturaData || !faturaData.numero) {
      return res.status(400).json({
        success: false,
        message: 'Dados da fatura são obrigatórios'
      });
    }
    
    // Obter configurações da empresa (logo, nome, etc.)
    const data = readData();
    const settings = data.settings || {};
    const empresa = settings.empresa || {};
    const companyName = empresa.nomeEmpresa || settings.companyName || 'USIMAMIZI, LDA';
    const logo = empresa.logotipo || settings.logo;
    
    // Criar novo documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Fatura_${faturaData.numero}.pdf"`);
    
    // Pipe do PDF para a resposta
    doc.pipe(res);
    
    // ==================== CABEÇALHO DA EMPRESA ====================
    
    // Logo da empresa (apenas se carregado nas definições)
    let logoWidth = 0;
    let logoHeight = 0;
    const logoSize = 40; // Tamanho do logo
    const logoX = 30; // Posição X do logo
    const logoY = 50; // Posição Y do logo
    
    if (empresa.logotipo && empresa.logotipo.startsWith('data:image/')) {
      try {
        // Extrair dados base64 do logo
        const base64Data = empresa.logotipo.split(',')[1];
        const logoBuffer = Buffer.from(base64Data, 'base64');
        
        // Desenhar logo com tamanho e posição adequados
        doc.image(logoBuffer, logoX, logoY, { 
          width: logoSize, 
          height: logoSize,
          fit: [logoSize, logoSize],
          align: 'left'
        });
        
        logoWidth = logoSize;
        logoHeight = logoSize;
      } catch (error) {
        console.error('Erro ao processar logo:', error);
        // Se houver erro, não desenha nada (sem fallback)
      }
    }
    
    // Nome da empresa principal com quebra de linha inteligente
    // Ajustar posição baseada na presença do logo
    const textStartX = logoWidth > 0 ? logoX + logoWidth + 15 : 80; // 15px de espaçamento após o logo
    const companyNameWidth = 300 - textStartX; // Largura máxima até o meio da folha (300px)
    const maxFontSize = 6; // Reduzido de 8 para 6 (mais 2 pontos a menos)
    const minFontSize = 4; // Reduzido de 6 para 4
    let currentFontSize = maxFontSize;
    let textHeight = 0;
    
    // Função para calcular se o texto cabe na largura
    const calculateTextFit = (text, fontSize, maxWidth) => {
      doc.fontSize(fontSize).font('Helvetica-Bold');
      const textWidth = doc.widthOfString(text);
      return textWidth <= maxWidth;
    };
    
    // Função para quebrar texto em linhas
    const breakTextIntoLines = (text, fontSize, maxWidth) => {
      doc.fontSize(fontSize).font('Helvetica-Bold');
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = doc.widthOfString(testLine);
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Palavra muito longa, quebra no meio
            lines.push(word);
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };
    
    // Ajustar tamanho da fonte se necessário
    while (currentFontSize >= minFontSize) {
      if (calculateTextFit(companyName, currentFontSize, companyNameWidth)) {
        break;
      }
      currentFontSize -= 2;
    }
    
    // Quebrar texto em linhas
    const companyLines = breakTextIntoLines(companyName, currentFontSize, companyNameWidth);
    
    // Desenhar o nome da empresa
    doc.fontSize(currentFontSize)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50');
    
    // Alinhar verticalmente com o logo (ou posição padrão se não houver logo)
    let currentY = logoHeight > 0 ? logoY + (logoHeight - (currentFontSize * companyLines.length)) / 2 : 60;
    
    companyLines.forEach((line, index) => {
      doc.text(line, textStartX, currentY);
      currentY += currentFontSize + 2; // Espaçamento entre linhas
    });
    
    // Nome da empresa secundário removido conforme solicitado
    
    // Informações de contacto (lado direito) - usando dados das definições
    const rightX = 400;
    const rightWidth = 150; // Largura disponível para o texto
    
    // Separar endereço em linhas para melhor controle
    const enderecoLinha1 = empresa.ruaAvenida || 'Rua Aníbal Aleluia nº 66 R/C, Bairro da Coop';
    const enderecoLinha2 = empresa.cidade || 'Maputo';
    const enderecoLinha3 = empresa.provincia || 'Moçambique';
    
    const telefone = `Tel: ${empresa.telefone || '+258 84 123 4567'}`;
    const nuit = `NUIT: ${empresa.nuit || '123456789'}`;
    const email = `Email: ${empresa.emailGeral || 'geral@usimamizi.co.mz'}`;
    
    // Calcular posição Y inicial baseada no tamanho do cabeçalho da empresa
    let contactY = Math.max(60, logoY + logoHeight + 10, currentY + 20);
    
    // Validar se contactY é um número válido
    if (isNaN(contactY)) {
      contactY = 60; // Valor padrão se contactY for inválido
    }
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#2c3e50');
    
    // Função para desenhar texto com quebra de linha automática
    const drawTextWithWrap = (text, x, y, width, align = 'right') => {
      if (!text || text.trim() === '') {
        return y + 12; // Retorna posição Y + uma linha se texto vazio
      }
      
      try {
        const lines = doc.text(text, x, y, { 
          width: width, 
          align: align,
          lineGap: 2
        });
        const lineCount = Array.isArray(lines) ? lines.length : 1;
        return y + (lineCount * 12); // 12px por linha (10px fonte + 2px espaçamento)
      } catch (error) {
        console.error('Erro ao desenhar texto:', error);
        return y + 12; // Fallback para uma linha
      }
    };
    
    // Desenhar informações de contato com quebra automática
    // Endereço em linhas separadas para melhor controle
    contactY = drawTextWithWrap(enderecoLinha1, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(enderecoLinha2, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(enderecoLinha3, rightX, contactY, rightWidth, 'right');
    
    // Espaçamento adicional antes do telefone
    contactY += 8;
    
    contactY = drawTextWithWrap(telefone, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(nuit, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(email, rightX, contactY, rightWidth, 'right');
    
    // ==================== TÍTULO E NÚMERO DA FATURA ====================
    
    // Ajustar posição do título baseado na altura do cabeçalho
    const titleY = Math.max(150, contactY + 20);
    
    // Número da fatura em caixa
    const boxX = 450;
    const boxY = titleY;
    const boxWidth = 60; // Reduzido de 80 para 60
    const boxHeight = 20; // Reduzido de 25 para 20
    
    doc.rect(boxX, boxY, boxWidth, boxHeight)
       .stroke('#2c3e50');
    
    doc.fontSize(4) // Reduzido de 6 para 4 (mais 2 pontos a menos)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(`N°${faturaData.numero.split('/')[1]}`, boxX + 3, boxY + 6); // Ajustado posicionamento
    
    // Data
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Data: ${new Date(faturaData.data).toLocaleDateString('pt-MZ')}`, boxX, boxY + 30, { align: 'right' });
    
    // ==================== INFORMAÇÕES DO CLIENTE ====================
    
    // Ajustar posição baseada na altura do cabeçalho e título
    const clientY = Math.max(180, titleY + 50);
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Para:', 50, clientY)
       .text('Objecto:', 50, clientY + 15)
       .text('Morada:', 50, clientY + 30)
       .text('NUIT:', 50, clientY + 45);
    
    doc.font('Helvetica')
       .text(faturaData.cliente.nome, 100, clientY)
       .text('Material informático', 100, clientY + 15)
       .text(faturaData.cliente.morada.split('\n')[0], 100, clientY + 30)
       .text(faturaData.cliente.nuit, 100, clientY + 45);
    
    // ==================== TABELA DE PRODUTOS ====================
    
    // Ajustar posição baseada na altura do cabeçalho, título e cliente
    const tableY = Math.max(260, clientY + 80);
    const tableWidth = 440; // Reduzido de 480 para 440 (4 pontos a menos)
    const colWidths = [40, 170, 70, 40, 70]; // Reduzido proporcionalmente: Qty, Descrição, Preço, IVA, Total
    
    // Cabeçalho da tabela
    doc.rect(50, tableY, tableWidth, 20) // Reduzido de 25 para 20
       .fill('#f8f9fa')
       .stroke('#2c3e50');
    
    const headers = ['Qty.', 'Descrição', 'Preço Unitário', 'IVA', 'Preço Total'];
    let currentX = 50;
    
    headers.forEach((header, index) => {
      doc.fontSize(5) // Reduzido de 7 para 5 (2 pontos a menos, totalizando 4 com a redução da tabela)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(header, currentX + 5, tableY + 6, { // Ajustado Y de 8 para 6
           width: colWidths[index] - 10,
           align: index === 0 ? 'left' : index === 1 ? 'left' : 'right'
         });
      currentX += colWidths[index];
    });
    
    // Linhas dos produtos
    let currentRowY = tableY + 20; // Ajustado de 25 para 20
    
    faturaData.linhas.forEach((linha, index) => {
      // Linha de fundo alternada
      if (index % 2 === 0) {
        doc.rect(50, currentRowY, tableWidth, 16) // Reduzido de 20 para 16
           .fill('#fafafa');
      }
      
      // Bordas da linha
      doc.rect(50, currentRowY, tableWidth, 16) // Reduzido de 20 para 16
         .stroke('#ddd');
      
      // Conteúdo da linha
      currentX = 50;
      
      // Quantidade
      doc.fontSize(5) // Reduzido de 7 para 5
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text(linha.quantidade.toString(), currentX + 5, currentRowY + 4, { // Ajustado Y de 6 para 4
           width: colWidths[0] - 10,
           align: 'left'
         });
      currentX += colWidths[0];
      
      // Descrição
      doc.text(linha.descricao, currentX + 5, currentRowY + 4, { // Ajustado Y de 6 para 4
        width: colWidths[1] - 10,
        align: 'left'
      });
      currentX += colWidths[1];
      
      // Preço Unitário
      doc.text(`${linha.preco.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`, currentX + 5, currentRowY + 4, { // Ajustado Y de 6 para 4
        width: colWidths[2] - 10,
        align: 'right'
      });
      currentX += colWidths[2];
      
      // IVA
      doc.text(`${(linha.iva * 100).toFixed(0)}%`, currentX + 5, currentRowY + 4, { // Ajustado Y de 6 para 4
        width: colWidths[3] - 10,
        align: 'center'
      });
      currentX += colWidths[3];
      
      // Total
      doc.text(`${linha.total.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`, currentX + 5, currentRowY + 4, { // Ajustado Y de 6 para 4
        width: colWidths[4] - 10,
        align: 'right'
      });
      
      currentRowY += 16; // Reduzido de 20 para 16
    });
    
    // ==================== VALIDADE ====================
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#2c3e50')
       .text('Validade da cotação: 15 dias', 50, currentRowY + 10);
    
    // ==================== TOTAIS ====================
    
    const totalsY = currentRowY + 20;
    const totalsX = 350; // Posição lateral direita como antes
    const totalsWidth = 200; // Largura menor como antes
    const totalsColWidths = [80, 120]; // Descrição, Valor (ajustado para caber melhor)
    
    // Cabeçalho da tabela de totais (simplificado)
    doc.rect(totalsX, totalsY, totalsWidth, 25)
       .fill('#f8f9fa')
       .stroke('#2c3e50');
    
    const totalsHeaders = ['Descrição', 'Valor']; // Simplificado
    let totalsCurrentX = totalsX;
    
    totalsHeaders.forEach((header, index) => {
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(header, totalsCurrentX + 5, totalsY + 8, {
           width: totalsColWidths[index] - 10,
           align: index === 0 ? 'left' : 'right'
         });
      totalsCurrentX += totalsColWidths[index];
    });
    
    // Linhas dos totais (simplificado)
    let totalsCurrentRowY = totalsY + 25;
    
    // Sub-total
    doc.rect(totalsX, totalsCurrentRowY, totalsWidth, 20)
       .fill('#fafafa');
    
    doc.rect(totalsX, totalsCurrentRowY, totalsWidth, 20)
       .stroke('#ddd');
    
    totalsCurrentX = totalsX;
    
    // Descrição
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#2c3e50')
       .text('Sub-total:', totalsCurrentX + 5, totalsCurrentRowY + 6, {
         width: totalsColWidths[0] - 10,
         align: 'left'
       });
    totalsCurrentX += totalsColWidths[0];
    
    // Valor
    doc.text(`${faturaData.totais.subtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`, totalsCurrentX + 5, totalsCurrentRowY + 6, {
      width: totalsColWidths[1] - 10,
      align: 'right'
    });
    
    totalsCurrentRowY += 20;
    
    // IVA 16%
    doc.rect(totalsX, totalsCurrentRowY, totalsWidth, 20)
       .stroke('#ddd');
    
    totalsCurrentX = totalsX;
    
    // Descrição
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#2c3e50')
       .text('IVA 16%:', totalsCurrentX + 5, totalsCurrentRowY + 6, {
         width: totalsColWidths[0] - 10,
         align: 'left'
       });
    totalsCurrentX += totalsColWidths[0];
    
    // Valor
    doc.text(`${faturaData.totais.iva16.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`, totalsCurrentX + 5, totalsCurrentRowY + 6, {
      width: totalsColWidths[1] - 10,
      align: 'right'
    });
    
    totalsCurrentRowY += 20;
    
    // Linha separadora
    doc.moveTo(totalsX + 5, totalsCurrentRowY)
       .lineTo(totalsX + totalsWidth - 5, totalsCurrentRowY)
       .stroke('#2c3e50');
    
    totalsCurrentRowY += 5;
    
    // TOTAL (linha normal na mesma tabela)
    doc.rect(totalsX, totalsCurrentRowY, totalsWidth, 20)
       .stroke('#ddd');
    
    totalsCurrentX = totalsX;
    
    // Descrição
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('TOTAL:', totalsCurrentX + 5, totalsCurrentRowY + 6, {
         width: totalsColWidths[0] - 10,
         align: 'left'
       });
    totalsCurrentX += totalsColWidths[0];
    
    // Valor
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text(`${faturaData.totais.total.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`, totalsCurrentX + 5, totalsCurrentRowY + 6, {
         width: totalsColWidths[1] - 10,
         align: 'right'
       });
    
    // ==================== DADOS BANCÁRIOS ====================
    
    const bankY = totalsY + 80;
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Dados Bancários:', 50, bankY);
    
    doc.font('Helvetica')
       .text(companyName, 50, bankY + 15)
       .text(`Conta nº ${empresa.bancoConta || '1234567890123456'}`, 50, bankY + 30)
       .text(`NIB: ${empresa.bancoNIB || '0008 0000 12345678901 23'}`, 50, bankY + 45)
       .text(empresa.bancoNome || 'Banco BCI', 50, bankY + 60)
       .text(`Modalidade de Pagamento: ${empresa.modalidadePagamento || 'Numerário, depósito ou Cheque'}`, 50, bankY + 75);
    
    // ==================== RODAPÉ ====================
    
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666')
       .text('Processada por Computador © USIMAMIZI /', 250, 750, { align: 'center' });
    
    // Finalizar o PDF
    doc.end();
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar PDF: ' + error.message
    });
  }
});

// POST /api/sales/export-gr-pdf - Exportar Guia de Remessa para PDF (inspirado no CEGID Primavera)
app.post('/api/sales/export-gr-pdf', async (req, res) => {
  try {
    const grData = req.body;
    
    // Validar dados obrigatórios
    if (!grData || !grData.full_number) {
      return res.status(400).json({
        success: false,
        message: 'Dados da Guia de Remessa são obrigatórios'
      });
    }
    
    // Obter configurações da empresa
    const data = readData();
    const settings = data.settings || {};
    const empresa = settings.empresa || {};
    const companyName = empresa.nomeEmpresa || settings.companyName || 'USIMAMIZI, LDA';
    const logo = empresa.logotipo || settings.logo;
    
    // Criar novo documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
      }
    });
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Guia_Remessa_${grData.full_number}.pdf"`);
    
    // Pipe do PDF para a resposta
    doc.pipe(res);
    
    // ==================== CABEÇALHO DA EMPRESA ====================
    
    // Logo da empresa (se disponível)
    let logoWidth = 0;
    let logoHeight = 0;
    const logoSize = 50;
    const logoX = 30;
    const logoY = 30;
    
    if (logo && logo.startsWith('data:image/')) {
      try {
        const base64Data = logo.split(',')[1];
        const logoBuffer = Buffer.from(base64Data, 'base64');
        
        doc.image(logoBuffer, logoX, logoY, { 
          width: logoSize, 
          height: logoSize,
          fit: [logoSize, logoSize],
          align: 'left'
        });
        
        logoWidth = logoSize;
        logoHeight = logoSize;
      } catch (error) {
        console.error('Erro ao processar logo:', error);
      }
    }
    
    // Nome da empresa
    const textStartX = logoWidth > 0 ? logoX + logoWidth + 15 : 30;
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(companyName, textStartX, logoY + 10);
    
    // Informações de contacto (lado direito)
    const rightX = 400;
    const rightWidth = 150;
    
    const enderecoLinha1 = empresa.ruaAvenida || 'Rua Aníbal Aleluia nº 66 R/C, Bairro da Coop';
    const enderecoLinha2 = empresa.cidade || 'Maputo';
    const enderecoLinha3 = empresa.provincia || 'Moçambique';
    const telefone = `Tel: ${empresa.telefone || '+258 84 123 4567'}`;
    const nuit = `NUIT: ${empresa.nuit || '123456789'}`;
    const email = `Email: ${empresa.emailGeral || 'geral@usimamizi.co.mz'}`;
    
    let contactY = logoY + 10;
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#2c3e50');
    
    const drawTextWithWrap = (text, x, y, width, align = 'right') => {
      if (!text || text.trim() === '') {
        return y + 10;
      }
      
      try {
        const lines = doc.text(text, x, y, { 
          width: width, 
          align: align,
          lineGap: 1
        });
        const lineCount = Array.isArray(lines) ? lines.length : 1;
        return y + (lineCount * 10);
      } catch (error) {
        console.error('Erro ao desenhar texto:', error);
        return y + 10;
      }
    };
    
    contactY = drawTextWithWrap(enderecoLinha1, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(enderecoLinha2, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(enderecoLinha3, rightX, contactY, rightWidth, 'right');
    contactY += 5;
    contactY = drawTextWithWrap(telefone, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(nuit, rightX, contactY, rightWidth, 'right');
    contactY = drawTextWithWrap(email, rightX, contactY, rightWidth, 'right');
    
    // ==================== TÍTULO E NÚMERO DA GR ====================
    
    const titleY = Math.max(120, contactY + 20);
    
    // Título "GUIA DE REMESSA" centralizado
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('GUIA DE REMESSA', 0, titleY, { align: 'center' });
    
    // Número da GR em caixa (estilo CEGID)
    const boxX = 450;
    const boxY = titleY + 25;
    const boxWidth = 100;
    const boxHeight = 30;
    
    // Caixa com fundo cinza
    doc.rect(boxX, boxY, boxWidth, boxHeight)
       .fill('#f0f0f0')
       .stroke('#2c3e50');
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Nº GR', boxX + 5, boxY + 5);
    
    doc.fontSize(12)
       .text(grData.full_number, boxX + 5, boxY + 15);
    
    // Data
    doc.fontSize(9)
       .font('Helvetica')
       .text(`Data: ${new Date(grData.document_date).toLocaleDateString('pt-MZ')}`, boxX, boxY + 35);
    
    // ==================== INFORMAÇÕES DO CLIENTE/DESTINO ====================
    
    const clientY = titleY + 80;
    
    // Determinar dados do destino
    let destinoNome = '';
    let destinoEndereco = '';
    let destinoContacto = '';
    
    if (grData.tipo_destino === 'sucursal') {
      destinoNome = grData.sucursal_name || 'Sucursal';
      destinoEndereco = grData.sucursal_address || '';
      destinoContacto = grData.sucursal_telefone || '';
    } else {
      destinoNome = grData.client_name || 'Cliente';
      destinoEndereco = grData.client_address || '';
      destinoContacto = grData.client_phone || '';
    }
    
    // Cabeçalho da seção
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('DADOS DO DESTINO:', 30, clientY);
    
    // Linha separadora
    doc.moveTo(30, clientY + 15)
       .lineTo(570, clientY + 15)
       .stroke('#2c3e50');
    
    // Dados do destino
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Nome:', 30, clientY + 25)
       .text('Endereço:', 30, clientY + 45)
       .text('Contacto:', 30, clientY + 65)
       .text('Nº Contribuinte:', 30, clientY + 85);
    
    doc.font('Helvetica')
       .text(destinoNome, 120, clientY + 25)
       .text(destinoEndereco, 120, clientY + 45)
       .text(destinoContacto, 120, clientY + 65)
       .text(grData.client_tax_number || '', 120, clientY + 85);
    
    // ==================== INFORMAÇÕES DE TRANSPORTE ====================
    
    const transportY = clientY + 120;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('INFORMAÇÕES DE TRANSPORTE:', 30, transportY);
    
    // Linha separadora
    doc.moveTo(30, transportY + 15)
       .lineTo(570, transportY + 15)
       .stroke('#2c3e50');
    
    // Dados de transporte
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Empresa de Transporte:', 30, transportY + 25)
       .text('Transporte Próprio:', 30, transportY + 45)
       .text('Nº Guia Transportador:', 30, transportY + 65)
       .text('Data de Recolha:', 30, transportY + 85)
       .text('Data Prevista de Entrega:', 30, transportY + 105)
       .text('Motorista:', 300, transportY + 25)
       .text('Matrícula:', 300, transportY + 45)
       .text('Nº Volumes:', 300, transportY + 65)
       .text('Peso Total (kg):', 300, transportY + 85)
       .text('Volume Total (m³):', 300, transportY + 105);
    
    doc.font('Helvetica')
       .text(grData.empresa_transporte || '', 150, transportY + 25)
       .text(grData.transporte_proprio ? 'Sim' : 'Não', 150, transportY + 45)
       .text(grData.numero_guia_transportador || '', 150, transportY + 65)
       .text(grData.data_recolha ? new Date(grData.data_recolha).toLocaleDateString('pt-MZ') : '', 150, transportY + 85)
       .text(grData.data_prevista_entrega ? new Date(grData.data_prevista_entrega).toLocaleDateString('pt-MZ') : '', 150, transportY + 105)
       .text(grData.motorista || '', 420, transportY + 25)
       .text(grData.matricula_veiculo || '', 420, transportY + 45)
       .text(grData.numero_volumes || '', 420, transportY + 65)
       .text(grData.peso_total || '', 420, transportY + 85)
       .text(grData.volume_total || '', 420, transportY + 105);
    
    // ==================== TABELA DE PRODUTOS ====================
    
    const tableY = transportY + 140;
    const tableWidth = 540;
    const colWidths = [60, 200, 60, 60, 60, 100]; // Código, Descrição, Qtd Encomendada, Qtd Expedir, Stock, Lote
    
    // Cabeçalho da tabela (estilo CEGID)
    doc.rect(30, tableY, tableWidth, 25)
       .fill('#e8f4fd')
       .stroke('#2c3e50');
    
    const headers = ['Código', 'Descrição', 'Qtd. Encom.', 'Qtd. Expedir', 'Stock Disp.', 'Lote/Nº Série'];
    let currentX = 30;
    
    headers.forEach((header, index) => {
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(header, currentX + 3, tableY + 8, {
           width: colWidths[index] - 6,
           align: 'center'
         });
      currentX += colWidths[index];
    });
    
    // Linhas dos produtos
    let currentRowY = tableY + 25;
    
    // Usar artigosExpedir se disponível
    const produtos = grData.artigosExpedir && grData.artigosExpedir.length > 0 
      ? grData.artigosExpedir 
      : [
          {
            codigo: 'GESB10BRLVGRC010',
            descricao: 'BATATA BRANCA LAVADA',
            qtdEncomendada: 800,
            qtdAExpedir: 700,
            stockDisponivel: 1500,
            loteNumeroSerie: 'LOTE001'
          },
          {
            codigo: 'GESB10RXLVGRC010',
            descricao: 'BATATA VERMELHA LAVADA',
            qtdEncomendada: 1200,
            qtdAExpedir: 1130,
            stockDisponivel: 2000,
            loteNumeroSerie: 'LOTE002'
          }
        ];
    
    produtos.forEach((produto, index) => {
      // Linha de fundo alternada
      if (index % 2 === 0) {
        doc.rect(30, currentRowY, tableWidth, 20)
           .fill('#f8f9fa');
      }
      
      // Bordas da linha
      doc.rect(30, currentRowY, tableWidth, 20)
         .stroke('#ddd');
      
      // Conteúdo da linha
      currentX = 30;
      
      // Código
      doc.fontSize(7)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text(produto.codigo || '', currentX + 3, currentRowY + 6, {
           width: colWidths[0] - 6,
           align: 'center'
         });
      currentX += colWidths[0];
      
      // Descrição
      doc.text(produto.descricao || '', currentX + 3, currentRowY + 6, {
        width: colWidths[1] - 6,
        align: 'left'
      });
      currentX += colWidths[1];
      
      // Qtd Encomendada
      doc.text((produto.qtdEncomendada || 0).toString(), currentX + 3, currentRowY + 6, {
        width: colWidths[2] - 6,
        align: 'center'
      });
      currentX += colWidths[2];
      
      // Qtd Expedir
      doc.text((produto.qtdAExpedir || 0).toString(), currentX + 3, currentRowY + 6, {
        width: colWidths[3] - 6,
        align: 'center'
      });
      currentX += colWidths[3];
      
      // Stock Disponível
      doc.text((produto.stockDisponivel || 0).toString(), currentX + 3, currentRowY + 6, {
        width: colWidths[4] - 6,
        align: 'center'
      });
      currentX += colWidths[4];
      
      // Lote/Nº Série
      doc.text(produto.loteNumeroSerie || '', currentX + 3, currentRowY + 6, {
        width: colWidths[5] - 6,
        align: 'center'
      });
      
      currentRowY += 20;
    });
    
    // ==================== CONFIRMAÇÃO DE ENTREGA ====================
    
    const confirmY = currentRowY + 30;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('CONFIRMAÇÃO DE ENTREGA:', 30, confirmY);
    
    // Linha separadora
    doc.moveTo(30, confirmY + 15)
       .lineTo(570, confirmY + 15)
       .stroke('#2c3e50');
    
    // Dados de confirmação
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Data de Receção:', 30, confirmY + 25)
       .text('Hora de Receção:', 30, confirmY + 45)
       .text('Observações do Motorista:', 30, confirmY + 65);
    
    doc.font('Helvetica')
       .text(grData.data_rececao ? new Date(grData.data_rececao).toLocaleDateString('pt-MZ') : '', 150, confirmY + 25)
       .text(grData.hora_rececao || '', 150, confirmY + 45)
       .text(grData.observacoes_motorista || '', 150, confirmY + 65);
    
    // Campo para assinatura
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Assinatura do Cliente:', 30, confirmY + 90);
    
    doc.rect(30, confirmY + 100, 250, 40)
       .stroke('#2c3e50');
    
    if (grData.assinatura_cliente) {
      doc.fontSize(8)
         .font('Helvetica')
         .text(grData.assinatura_cliente, 35, confirmY + 115);
    } else {
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#999')
         .text('Assinatura do cliente', 35, confirmY + 115);
    }
    
    // ==================== RODAPÉ ====================
    
    const footerY = confirmY + 160;
    
    // Texto de processamento
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666')
       .text('Documento Processado por Computador', 30, footerY);
    
    // Dados bancários (se necessário)
    if (empresa.bancoConta) {
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text('Dados Bancários:', 30, footerY + 20);
      
      doc.font('Helvetica')
         .text(`${companyName}`, 30, footerY + 35)
         .text(`Conta nº ${empresa.bancoConta}`, 30, footerY + 50)
         .text(`NIB: ${empresa.bancoNIB || ''}`, 30, footerY + 65)
         .text(empresa.bancoNome || '', 30, footerY + 80);
    }
    
    // Rodapé final
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666')
       .text('Processada por Computador © USIMAMIZI', 300, 750, { align: 'center' })
       .text('Página 1 de 1', 570, 750, { align: 'right' });
    
    // Finalizar o PDF
    doc.end();
    
  } catch (error) {
    console.error('Erro ao gerar PDF da GR:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar PDF da Guia de Remessa: ' + error.message
    });
  }
});

// POST /api/sales/payments - Registrar pagamento
app.post('/api/sales/payments', (req, res) => {
  try {
    const { document_id, amount, payment_date, payment_method, reference } = req.body;
    
    // Simular processamento de pagamento
    const payment = {
      id: Date.now(),
      document_id,
      amount,
      payment_date,
      payment_method,
      reference,
      created_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: {
        ...payment,
        remaining_amount: 0 // Simular que foi pago completamente
      }
    });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/sales/documents/:id/cancel - Cancelar documento
app.put('/api/sales/documents/:id/cancel', (req, res) => {
  try {
    const data = readData();
    const documentIndex = data.documents.findIndex(doc => doc.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }
    
    data.documents[documentIndex].status = 'CANCELLED';
    data.documents[documentIndex].updated_at = new Date().toISOString();
    
    if (writeData(data)) {
      res.json({
        success: true,
        data: data.documents[documentIndex],
        message: 'Documento cancelado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar alterações'
      });
    }
  } catch (error) {
    console.error('Erro ao cancelar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS DE STOCK ====================

// GET /api/stock/categorias - Listar todas as categorias
app.get('/api/stock/categorias', (req, res) => {
  try {
    const data = readData();
    const categorias = data.categorias || [
      {
        id: 'cat_001',
        codigo: 'MAT_INF',
        nome: 'Material Informático',
        descricao: 'Computadores, impressoras, acessórios',
        ativa: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'cat_002',
        codigo: 'SEG_ELEC',
        nome: 'Segurança Electrónica',
        descricao: 'Câmaras, alarmes, sistemas de segurança',
        ativa: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'cat_003',
        codigo: 'AGR_INT',
        nome: 'Agricultura Inteligente',
        descricao: 'Sensores, sistemas de irrigação, equipamentos agrícolas',
        ativa: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'cat_004',
        codigo: 'SAFETY',
        nome: 'Safety',
        descricao: 'Equipamentos de segurança e proteção',
        ativa: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/stock/categorias - Criar nova categoria
app.post('/api/stock/categorias', (req, res) => {
  try {
    const { codigo, nome, descricao, ativa = true } = req.body;
    
    if (!codigo || !nome) {
      return res.status(400).json({ error: 'Código e nome são obrigatórios' });
    }
    
    const data = readData();
    if (!data.categorias) {
      data.categorias = [];
    }
    
    const novaCategoria = {
      id: `cat_${Date.now()}`,
      codigo,
      nome,
      descricao: descricao || '',
      ativa: ativa === true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.categorias.push(novaCategoria);
    writeData(data);
    
    res.status(201).json(novaCategoria);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/stock/produtos - Listar todos os produtos
app.get('/api/stock/produtos', (req, res) => {
  try {
    const data = readData();
    const produtos = data.produtos || [
      {
        id: 'prod_001',
        codigo: 'LAPTOP001',
        codigo_barras: '1234567890123',
        nome: 'Laptop Dell Inspiron 15',
        descricao: 'Laptop Dell Inspiron 15 3000, Intel Core i5, 8GB RAM, 256GB SSD',
        categoria_id: 'cat_001',
        categoria: {
          id: 'cat_001',
          codigo: 'MAT_INF',
          nome: 'Material Informático'
        },
        unidade_medida: 'un',
        peso: 2.1,
        dimensoes: '35.8 x 24.9 x 1.9 cm',
        stock_minimo: 5,
        stock_maximo: 50,
        stock_atual: 25,
        stock_reservado: 3,
        stock_disponivel: 22,
        localizacao: 'Armazém A, Prateleira 1',
        fornecedor_principal: 'Dell Technologies',
        observacoes: 'Produto com garantia de 2 anos',
        ativo: true,
        precos: [
          {
            id: 'preco_001',
            produto_id: 'prod_001',
            tipo: 'venda',
            valor: 45000,
            moeda: 'MZN',
            data_inicio: new Date().toISOString(),
            ativo: true
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod_002',
        codigo: 'CAM001',
        codigo_barras: '1234567890124',
        nome: 'Câmara IP Hikvision',
        descricao: 'Câmara IP Hikvision DS-2CD2143G0-I, 4MP, Visão Noturna',
        categoria_id: 'cat_002',
        categoria: {
          id: 'cat_002',
          codigo: 'SEG_ELEC',
          nome: 'Segurança Electrónica'
        },
        unidade_medida: 'un',
        peso: 0.8,
        dimensoes: '12 x 7 x 5 cm',
        stock_minimo: 10,
        stock_maximo: 100,
        stock_atual: 45,
        stock_reservado: 5,
        stock_disponivel: 40,
        localizacao: 'Armazém B, Prateleira 3',
        fornecedor_principal: 'Hikvision',
        observacoes: 'Câmara com instalação incluída',
        ativo: true,
        precos: [
          {
            id: 'preco_002',
            produto_id: 'prod_002',
            tipo: 'venda',
            valor: 8500,
            moeda: 'MZN',
            data_inicio: new Date().toISOString(),
            ativo: true
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json(produtos);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/stock/produtos - Criar novo produto
app.post('/api/stock/produtos', (req, res) => {
  try {
    const {
      codigo,
      codigo_barras,
      nome,
      descricao,
      categoria_id,
      unidade_medida = 'un',
      peso,
      dimensoes,
      stock_minimo = 0,
      stock_maximo = 0,
      localizacao,
      fornecedor_principal,
      observacoes,
      ativo = true
    } = req.body;
    
    if (!codigo || !nome || !categoria_id) {
      return res.status(400).json({ error: 'Código, nome e categoria são obrigatórios' });
    }
    
    const data = readData();
    if (!data.produtos) {
      data.produtos = [];
    }
    
    const novoProduto = {
      id: `prod_${Date.now()}`,
      codigo,
      codigo_barras: codigo_barras || '',
      nome,
      descricao: descricao || '',
      categoria_id,
      unidade_medida,
      peso: peso || null,
      dimensoes: dimensoes || '',
      stock_minimo,
      stock_maximo,
      stock_atual: 0,
      stock_reservado: 0,
      stock_disponivel: 0,
      localizacao: localizacao || '',
      fornecedor_principal: fornecedor_principal || '',
      observacoes: observacoes || '',
      ativo: ativo === true,
      precos: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.produtos.push(novoProduto);
    writeData(data);
    
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/stock/produtos/:id - Atualizar produto
app.put('/api/stock/produtos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const data = readData();
    if (!data.produtos) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const produtoIndex = data.produtos.findIndex(p => p.id === id);
    if (produtoIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    data.produtos[produtoIndex] = {
      ...data.produtos[produtoIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    writeData(data);
    res.json(data.produtos[produtoIndex]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/stock/produtos/:id - Eliminar produto
app.delete('/api/stock/produtos/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const data = readData();
    if (!data.produtos) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const produtoIndex = data.produtos.findIndex(p => p.id === id);
    if (produtoIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    data.produtos.splice(produtoIndex, 1);
    writeData(data);
    
    res.json({ message: 'Produto eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS DE STOCK ====================

// GET /api/stock/categorias - Listar todas as categorias
app.get('/api/stock/categorias', (req, res) => {
  try {
    const data = readData();
    res.json(data.categorias || []);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/stock/categorias - Criar nova categoria
app.post('/api/stock/categorias', (req, res) => {
  try {
    const data = readData();
    const { codigo, nome, descricao, ativa = true } = req.body;
    
    const novaCategoria = {
      id: `cat_${Date.now()}`,
      codigo,
      nome,
      descricao,
      ativa,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.categorias.push(novaCategoria);
    writeData(data);
    
    res.status(201).json(novaCategoria);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/stock/produtos - Listar todos os produtos
app.get('/api/stock/produtos', (req, res) => {
  try {
    const data = readData();
    res.json(data.produtos || []);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/stock/produtos - Criar novo produto
app.post('/api/stock/produtos', (req, res) => {
  try {
    const data = readData();
    const produto = req.body;
    
    const novoProduto = {
      id: `prod_${Date.now()}`,
      ...produto,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.produtos.push(novoProduto);
    writeData(data);
    
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/stock/produtos/:id - Atualizar produto
app.put('/api/stock/produtos/:id', (req, res) => {
  try {
    const data = readData();
    const { id } = req.params;
    const produtoAtualizado = req.body;
    
    const index = data.produtos.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    data.produtos[index] = {
      ...data.produtos[index],
      ...produtoAtualizado,
      updated_at: new Date().toISOString()
    };
    
    writeData(data);
    res.json(data.produtos[index]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/stock/produtos/:id - Eliminar produto
app.delete('/api/stock/produtos/:id', (req, res) => {
  try {
    const data = readData();
    const { id } = req.params;
    
    const index = data.produtos.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    data.produtos.splice(index, 1);
    writeData(data);
    
    res.json({ message: 'Produto eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 USIMAMIZI Backend API rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Documentos: http://localhost:${PORT}/api/sales/documents`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`📦 Stock: http://localhost:${PORT}/api/stock/produtos`);
});

module.exports = app;
