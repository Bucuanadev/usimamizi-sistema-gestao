# Software Design Document (SDD)
## Sistema USIMAMIZI - ERP/Sistema de Gestão Empresarial

**Versão:** 1.0  
**Data:** 28 de Outubro de 2025  
**Autor:** Bucuanadev  
**Empresa:** Pallas Consultoria e Serviços Lda  

---

## Índice

1. [Introdução](#1-introdução)
2. [Arquitetura Geral do Sistema](#2-arquitetura-geral-do-sistema)
3. [Tecnologias Utilizadas](#3-tecnologias-utilizadas)
4. [Arquitetura Frontend](#4-arquitetura-frontend)
5. [Arquitetura Backend](#5-arquitetura-backend)
6. [Modelo de Dados](#6-modelo-de-dados)
7. [APIs e Endpoints](#7-apis-e-endpoints)
8. [Módulos e Funcionalidades](#8-módulos-e-funcionalidades)
9. [Segurança](#9-segurança)
10. [Performance e Escalabilidade](#10-performance-e-escalabilidade)
11. [Deploy e DevOps](#11-deploy-e-devops)
12. [Padrões de Desenvolvimento](#12-padrões-de-desenvolvimento)
13. [Testes](#13-testes)
14. [Documentação de Interface](#14-documentação-de-interface)
15. [Considerações Futuras](#15-considerações-futuras)

---

## 1. Introdução

### 1.1 Propósito
O USIMAMIZI é um sistema ERP (Enterprise Resource Planning) desenvolvido especificamente para empresas moçambicanas, focando em gestão de vendas, compras, stock, faturação e dashboard executivo.

### 1.2 Escopo
Este documento descreve a arquitetura técnica, padrões de design, estrutura de dados e componentes do sistema USIMAMIZI.

### 1.3 Objetivos do Sistema
- **Gestão de Vendas**: Criar orçamentos, faturas e guias de remessa
- **Gestão de Compras**: Processar requisições, encomendas e guias de entrada
- **Controle de Stock**: Monitorização em tempo real dos níveis de inventário
- **Dashboard Executivo**: Visualização de KPIs e métricas de negócio
- **Conformidade Local**: Atendimento às normas fiscais de Moçambique

### 1.4 Audiência
- Desenvolvedores
- Arquitetos de Software
- Administradores de Sistema
- Stakeholders Técnicos

---

## 2. Arquitetura Geral do Sistema

### 2.1 Padrão Arquitetural
O sistema segue uma **arquitetura em camadas (Layered Architecture)** com separação clara entre frontend e backend:

```
┌─────────────────────────────────────┐
│           PRESENTATION LAYER        │
│        (React TypeScript SPA)       │
├─────────────────────────────────────┤
│          APPLICATION LAYER          │
│         (Express.js REST API)       │
├─────────────────────────────────────┤
│           BUSINESS LAYER            │
│      (Lógica de Negócio - Node.js)  │
├─────────────────────────────────────┤
│            DATA LAYER               │
│        (JSON File Storage)          │
└─────────────────────────────────────┘
```

### 2.2 Princípios de Design
- **Separation of Concerns**: Clara separação entre UI, lógica de negócio e dados
- **Single Responsibility**: Cada componente tem uma responsabilidade específica
- **DRY (Don't Repeat Yourself)**: Reutilização de componentes e funções
- **Modularidade**: Sistema dividido em módulos independentes
- **Responsividade**: Interface adaptável a diferentes dispositivos

### 2.3 Comunicação entre Camadas
- **Frontend ↔ Backend**: REST API com JSON
- **Cliente ↔ Servidor**: HTTP/HTTPS
- **Autenticação**: JWT (planejado) / Atualmente desabilitada para desenvolvimento

---

## 3. Tecnologias Utilizadas

### 3.1 Stack Tecnológico

#### Frontend
- **React 19.1.1**: Framework principal
- **TypeScript 4.9.5**: Tipagem estática
- **React Router DOM 7.9.3**: Roteamento SPA
- **FontAwesome**: Ícones
- **CSS3**: Estilização customizada

#### Backend
- **Node.js**: Runtime JavaScript
- **Express.js 4.18.2**: Framework web
- **CORS**: Cross-Origin Resource Sharing
- **Body-Parser**: Parsing de requisições
- **PDFKit**: Geração de documentos PDF

#### Dados
- **JSON**: Armazenamento em arquivos
- **File System (fs)**: Operações de I/O

#### DevOps & Deploy
- **PM2**: Gerenciador de processos
- **Nginx**: Proxy reverso e servidor web
- **SSH/SCP**: Deploy e sincronização
- **PowerShell**: Scripts de automação

### 3.2 Dependências Principais

```json
{
  "frontend": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1", 
    "react-router-dom": "^7.9.3",
    "typescript": "^4.9.5",
    "@fortawesome/react-fontawesome": "^3.0.2",
    "axios": "^1.12.2"
  },
  "backend": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "pdfkit": "^0.17.2",
    "uuid": "^9.0.1"
  }
}
```

---

## 4. Arquitetura Frontend

### 4.1 Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal com sidebar
│   └── Layout.css      # Estilos do layout
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Dashboard executivo
│   ├── Vendas.tsx      # Módulo de vendas
│   ├── Compras.tsx     # Módulo de compras
│   ├── Faturas.tsx     # Gestão de faturas
│   └── Definicoes.tsx  # Configurações
├── hooks/              # Custom hooks
│   └── useAuth.tsx     # Hook de autenticação
├── services/           # Serviços de API
│   └── api.ts          # Cliente API
├── config/             # Configurações
│   └── api.ts          # Config de endpoints
├── types/              # Definições TypeScript
│   └── index.ts        # Tipos globais
├── styles/             # Estilos globais
├── utils/              # Utilitários
├── App.tsx             # Componente raiz
└── index.tsx           # Entry point
```

### 4.2 Padrões de Componentes

#### 4.2.1 Functional Components com Hooks
```typescript
const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  return (
    <div className="dashboard-container">
      {/* JSX content */}
    </div>
  );
};
```

#### 4.2.2 Interface TypeScript
```typescript
interface DashboardData {
  resumo: {
    totalVendas: number;
    totalOrcamentos: number;
    crescimentoVendas: number;
  };
  vendas: {
    total: number;
    valor: number;
    crescimento: number;
  };
}
```

### 4.3 Sistema de Roteamento

```typescript
// App.tsx - Configuração de rotas
<Router>
  <Routes>
    <Route path="/" element={<Layout><Dashboard /></Layout>} />
    <Route path="/vendas" element={<Layout><Vendas /></Layout>} />
    <Route path="/compras" element={<Layout><Compras /></Layout>} />
    <Route path="/faturas" element={<Layout><Faturas /></Layout>} />
    <Route path="/definicoes" element={<Layout><Definicoes /></Layout>} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
</Router>
```

### 4.4 Gerenciamento de Estado

#### 4.4.1 Estado Local (useState)
- Dados específicos de componente
- Estados de loading e erro
- Formulários e inputs

#### 4.4.2 Custom Hooks
```typescript
// useAuth.tsx
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const login = async (username: string, password: string) => {
    // Lógica de autenticação
  };
  
  return { user, isAuthenticated, login, logout };
};
```

### 4.5 Comunicação com API

```typescript
// services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

---

## 5. Arquitetura Backend

### 5.1 Estrutura do Servidor

```
backend/
├── server.js           # Entry point principal
├── data/              # Armazenamento de dados
│   └── documents.json # Base de dados JSON
├── package.json       # Dependências
└── README.md          # Documentação
```

### 5.2 Configuração do Express

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
```

### 5.3 Padrão de Roteamento

#### 5.3.1 Estrutura de Rotas por Módulo
```javascript
// Vendas
app.get('/api/sales/documents', (req, res) => { /* Lista documentos */ });
app.post('/api/sales/documents', (req, res) => { /* Cria documento */ });
app.put('/api/sales/documents/:id', (req, res) => { /* Atualiza documento */ });
app.delete('/api/sales/documents/:id', (req, res) => { /* Remove documento */ });

// Compras
app.get('/api/purchases/documents', (req, res) => { /* Lista compras */ });
app.post('/api/purchases/confirmar-guia-entrada/:id', (req, res) => { /* Confirma entrada */ });

// Dashboard
app.get('/api/dashboard/stats', (req, res) => { /* Estatísticas */ });
app.get('/api/dashboard/activities', (req, res) => { /* Atividades */ });
```

### 5.4 Camada de Dados

#### 5.4.1 Operações de Arquivo
```javascript
const readData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return { documents: [], nextNumbers: {} };
  } catch (error) {
    console.error('Erro ao ler dados:', error);
    return { documents: [], nextNumbers: {} };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao escrever dados:', error);
    return false;
  }
};
```

### 5.5 Geração de PDF

```javascript
app.post('/api/sales/export-orc-pdf', async (req, res) => {
  try {
    const orcData = req.body;
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 30, bottom: 30, left: 30, right: 30 }
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 
      `attachment; filename="Orcamento_${orcData.full_number}.pdf"`);
    
    doc.pipe(res);
    
    // Conteúdo do PDF...
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar PDF'
    });
  }
});
```

---

## 6. Modelo de Dados

### 6.1 Estrutura Principal

```json
{
  "documents": [
    {
      "id": "number",
      "document_type": "string", // ORC, FAT, GR, etc.
      "series": "string",
      "number": "string", 
      "full_number": "string",
      "document_date": "string",
      "due_date": "string",
      "client_name": "string",
      "client_tax_number": "string",
      "client_address": "string",
      "client_email": "string",
      "vendedor": "string",
      "payment_terms": "string",
      "currency": "string",
      "subtotal": "number",
      "vat_amount": "number", 
      "total_amount": "number",
      "status": "string", // DRAFT, SENT, PAID, etc.
      "created_at": "string",
      "updated_at": "string"
    }
  ],
  "purchaseDocuments": [
    {
      "id": "number",
      "document_type": "string", // REQ, EA, GE, etc.
      "supplier_name": "string",
      "linhas": [
        {
          "codigo": "string",
          "descricao": "string", 
          "quantidadeRecebida": "number",
          "precoUnitario": "number"
        }
      ],
      "status": "string"
    }
  ],
  "produtos": [
    {
      "id": "string",
      "codigo": "string",
      "nome": "string",
      "descricao": "string",
      "categoria_id": "string",
      "unidade_medida": "string",
      "stock_atual": "number",
      "stock_disponivel": "number",
      "stock_minimo": "number",
      "precos": [
        {
          "tipo": "string", // venda, compra
          "valor": "number",
          "ativo": "boolean"
        }
      ]
    }
  ],
  "nextNumbers": {
    "orcamento": { "series": "ORÇ", "number": 1 },
    "fatura": { "series": "FAT", "number": 1 }
  },
  "settings": {
    "empresa": {
      "nomeEmpresa": "string",
      "nuit": "string",
      "telefone": "string"
    }
  }
}
```

### 6.2 Relacionamentos

```
Documents (1:N) → LinhasDocumento
Produtos (1:N) → Precos  
Produtos (N:1) → Categorias
PurchaseDocuments (1:N) → LinhasCompra
```

### 6.3 Estados de Documentos

#### Vendas
- **DRAFT**: Rascunho
- **SENT**: Enviado
- **PAID**: Pago
- **CANCELLED**: Cancelado

#### Compras
- **PENDENTE**: Aguardando confirmação
- **CONFIRMADO**: Processado no stock
- **CANCELADO**: Cancelado

---

## 7. APIs e Endpoints

### 7.1 Vendas (`/api/sales`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/documents` | Lista todos os documentos |
| GET | `/documents/:id` | Obtém documento específico |
| POST | `/documents` | Cria novo documento |
| PUT | `/documents/:id` | Atualiza documento |
| DELETE | `/documents/:id` | Remove documento |
| GET | `/produtos` | Lista produtos para venda |
| GET | `/produto-por-codigo/:codigo` | Busca produto por código |
| POST | `/atualizar-stock` | Atualiza stock após venda |
| GET | `/document-numbers/:type` | Próximo número de documento |
| POST | `/export-orc-pdf` | Gera PDF de orçamento |

### 7.2 Compras (`/api/purchases`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/documents` | Lista documentos de compra |
| GET | `/documents/:id` | Obtém documento específico |
| POST | `/documents` | Cria documento de compra |
| PUT | `/documents/:id` | Atualiza documento |
| DELETE | `/documents/:id` | Remove documento |
| POST | `/confirmar-guia-entrada/:id` | Confirma entrada no stock |
| GET | `/document-numbers/:type` | Próximo número |

### 7.3 Dashboard (`/api/dashboard`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/stats` | Estatísticas gerais |
| GET | `/activities` | Atividades recentes |
| GET | `/overview` | Visão geral |
| GET | `/vendas-chart` | Dados para gráfico |
| GET | `/produtos-top` | Top produtos |
| GET | `/alertas` | Alertas do sistema |

### 7.4 Configurações (`/api/settings`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/logo` | Obtém logo da empresa |
| POST | `/logo` | Upload de logo |
| GET | `/empresa` | Dados da empresa |
| POST | `/empresa` | Salva dados da empresa |
| GET | `/estabelecimentos` | Lista estabelecimentos |
| POST | `/estabelecimentos` | Cria estabelecimento |
| PUT | `/estabelecimentos/:id` | Atualiza estabelecimento |

### 7.5 Sistema (`/api`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |

---

## 8. Módulos e Funcionalidades

### 8.1 Dashboard Executivo

#### Funcionalidades
- **KPIs Principais**: Vendas, orçamentos, stock, clientes
- **Gráficos**: Evolução de vendas (12 meses)
- **Top Produtos**: Produtos mais vendidos
- **Atividades Recentes**: Log de ações no sistema
- **Alertas**: Notificações de stock baixo, faturas vencidas

#### Componentes Técnicos
```typescript
interface DashboardData {
  resumo: {
    totalVendas: number;
    totalOrcamentos: number;
    totalGuias: number;
    crescimentoVendas: number;
  };
  stock: {
    totalProdutos: number;
    baixoStock: number;
    semStock: number;
  };
  atividades: Activity[];
}
```

### 8.2 Módulo de Vendas

#### Funcionalidades
- **Criação de Orçamentos**: Com produtos, preços e descontos
- **Faturação**: Conversão de orçamentos em faturas
- **Guias de Remessa**: Controle de entregas
- **Gestão de Produtos**: Busca e seleção de stock
- **Atualização de Stock**: Baixa automática após venda
- **Geração de PDF**: Documentos formatados

#### Tipos de Documento
- **ORÇ**: Orçamentos
- **FAT**: Faturas
- **GR**: Guias de Remessa
- **NC**: Notas de Crédito
- **ND**: Notas de Débito

### 8.3 Módulo de Compras

#### Funcionalidades
- **Requisições**: Solicitações de compra
- **Encomendas**: Pedidos a fornecedores
- **Guias de Entrada**: Receção de mercadorias
- **Controle de Stock**: Entrada automática no stock
- **Gestão de Fornecedores**: Dados de contacto e histórico

#### Tipos de Documento
- **REQ**: Requisições
- **EA**: Encomendas de Aquisição
- **GE**: Guias de Entrada
- **FR**: Faturas de Fornecedor

### 8.4 Gestão de Stock

#### Funcionalidades
- **Produtos**: CRUD completo
- **Categorias**: Organização por tipo
- **Preços**: Múltiplos preços por produto
- **Movimentações**: Entrada e saída
- **Alertas**: Stock mínimo e ruptura
- **Localizações**: Múltiplos armazéns

### 8.5 Configurações

#### Funcionalidades
- **Dados da Empresa**: Informações fiscais
- **Estabelecimentos**: Múltiplas localizações
- **Numeração**: Sequências de documentos
- **Logo**: Upload e gestão de imagem
- **Utilizadores**: Gestão de acessos (planejado)

---

## 9. Segurança

### 9.1 Estado Atual
- **Autenticação**: Desabilitada para desenvolvimento
- **CORS**: Configurado para localhost
- **Validação**: Básica no backend
- **HTTPS**: Configurado para produção

### 9.2 Planos de Segurança
```typescript
// Autenticação JWT (planejado)
interface AuthContext {
  user: User | null;
  token: string | null;
  login: (credentials: Credentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Middleware de validação (planejado)
const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validação com Joi ou similar
  };
};
```

### 9.3 Validações

#### Frontend
```typescript
const validateDocument = (data: DocumentData): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.client_name) errors.push('Nome do cliente é obrigatório');
  if (!data.document_date) errors.push('Data do documento é obrigatória');
  if (data.total_amount <= 0) errors.push('Total deve ser maior que zero');
  
  return { valid: errors.length === 0, errors };
};
```

#### Backend
```javascript
// Validação de entrada
app.post('/api/sales/documents', (req, res) => {
  const { client_name, total_amount } = req.body;
  
  if (!client_name || !total_amount) {
    return res.status(400).json({
      success: false,
      message: 'Dados obrigatórios em falta'
    });
  }
  
  // Processar...
});
```

---

## 10. Performance e Escalabilidade

### 10.1 Otimizações Frontend
- **Code Splitting**: Carregamento lazy de rotas
- **Memoização**: React.memo para componentes
- **Virtual Scrolling**: Para listas grandes
- **Debounce**: Em pesquisas e filtros

```typescript
// Exemplo de otimização
const Dashboard = React.memo(() => {
  const [data, setData] = useState(null);
  
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      // Pesquisar...
    }, 300),
    []
  );
  
  return <div>...</div>;
});
```

### 10.2 Otimizações Backend
- **Caching**: Dados frequentemente acessados
- **Paginação**: Para listas grandes
- **Indexação**: Para pesquisas rápidas
- **Compressão**: Gzip para respostas

```javascript
// Paginação
app.get('/api/sales/documents', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const data = readData();
  const documents = data.documents.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: documents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: data.documents.length
    }
  });
});
```

### 10.3 Escalabilidade Futura
- **Base de Dados**: Migração para PostgreSQL/MongoDB
- **Microserviços**: Separação por domínio
- **Load Balancer**: Para múltiplas instâncias
- **CDN**: Para assets estáticos

---

## 11. Deploy e DevOps

### 11.1 Estrutura de Deploy

```
Servidor VPS (Ubuntu)
├── /var/www/usimamizi/
│   ├── frontend/build/     # Build do React
│   ├── backend/           # Código do Node.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── data/
│   └── ecosystem.config.js # Config do PM2
```

### 11.2 Configuração PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'usimamizi-backend',
    script: './backend/server.js',
    cwd: '/var/www/usimamizi',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/usimamizi-backend-error.log',
    out_file: '/var/log/pm2/usimamizi-backend-out.log',
    log_file: '/var/log/pm2/usimamizi-backend.log',
    time: true
  }]
};
```

### 11.3 Configuração Nginx

```nginx
server {
    listen 80;
    server_name 45.32.218.221;
    
    # Frontend (React)
    location / {
        root /var/www/usimamizi/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 11.4 Scripts de Deploy

```powershell
# sync-from-vps.ps1
param(
    [string]$VPS_IP = "45.32.218.221",
    [string]$VPS_USER = "root"
)

# Baixar código da VPS
scp -r "$VPS_USER@${VPS_IP}:/var/www/usimamizi/src" "./"
scp -r "$VPS_USER@${VPS_IP}:/var/www/usimamizi/backend" "./"
scp "$VPS_USER@${VPS_IP}:/var/www/usimamizi/package.json" "./"

# Instalar dependências
npm install
cd backend && npm install
```

---

## 12. Padrões de Desenvolvimento

### 12.1 Convenções de Código

#### TypeScript/React
```typescript
// Naming conventions
interface UserData { }  // PascalCase para interfaces
const userData = { };   // camelCase para variáveis
const API_URL = '';     // UPPER_CASE para constantes

// Component structure
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Effects
  useEffect(() => {}, []);
  
  // 3. Functions
  const handleClick = () => {};
  
  // 4. Render
  return <div>...</div>;
};
```

#### Node.js/Express
```javascript
// Route structure
app.get('/api/resource', async (req, res) => {
  try {
    // 1. Validação
    if (!req.body.required) {
      return res.status(400).json({
        success: false,
        message: 'Campo obrigatório'
      });
    }
    
    // 2. Lógica de negócio
    const data = await processData(req.body);
    
    // 3. Resposta
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});
```

### 12.2 Estrutura de Resposta API

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "total": number,     // Para listas
  "pagination": {      // Para paginação
    "page": number,
    "limit": number,
    "total": number
  },
  "errors": string[]   // Para validações
}
```

### 12.3 Tratamento de Erros

```typescript
// Frontend
const handleApiCall = async () => {
  try {
    setLoading(true);
    const response = await apiClient.get('/endpoint');
    
    if (response.success) {
      setData(response.data);
    } else {
      setError(response.message);
    }
  } catch (error) {
    setError('Erro de conexão');
    console.error('API Error:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 13. Testes

### 13.1 Estratégia de Testes

#### Frontend (Planejado)
```typescript
// Unit tests com Jest e React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../Dashboard';

test('renders dashboard with correct data', () => {
  render(<Dashboard />);
  
  expect(screen.getByText('Dashboard Executivo')).toBeInTheDocument();
  expect(screen.getByText('Vendas')).toBeInTheDocument();
});

test('loads data on mount', async () => {
  // Mock API
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: () => Promise.resolve({ success: true, data: mockData })
  });
  
  render(<Dashboard />);
  
  await waitFor(() => {
    expect(screen.getByText('Total Vendas')).toBeInTheDocument();
  });
});
```

#### Backend (Planejado)
```javascript
// Tests com Jest e Supertest
const request = require('supertest');
const app = require('../server');

describe('Sales API', () => {
  test('GET /api/sales/documents', async () => {
    const response = await request(app)
      .get('/api/sales/documents')
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  test('POST /api/sales/documents', async () => {
    const newDocument = {
      client_name: 'Test Client',
      total_amount: 1000
    };
    
    const response = await request(app)
      .post('/api/sales/documents')
      .send(newDocument)
      .expect(201);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.client_name).toBe('Test Client');
  });
});
```

### 13.2 Cenários de Teste

#### Funcionalidades Críticas
1. **Criação de Documentos**: Orçamentos, faturas, guias
2. **Atualização de Stock**: Entrada e saída
3. **Geração de PDF**: Formatação correta
4. **Numeração Sequencial**: Sem duplicatas
5. **Validações**: Dados obrigatórios

#### Testes de Integração
1. **Frontend ↔ Backend**: APIs funcionais
2. **Stock ↔ Vendas**: Baixa automática
3. **Compras ↔ Stock**: Entrada automática

---

## 14. Documentação de Interface

### 14.1 Design System

#### Cores Principais
```css
:root {
  --primary-color: #2c3e50;    /* Azul escuro */
  --secondary-color: #3498db;  /* Azul */
  --success-color: #27ae60;    /* Verde */
  --warning-color: #f39c12;    /* Laranja */
  --error-color: #e74c3c;      /* Vermelho */
  --background-color: #f8f9fa; /* Cinza claro */
  --text-color: #2c3e50;       /* Texto principal */
  --border-color: #dee2e6;     /* Bordas */
}
```

#### Tipografia
```css
/* Hierarquia de títulos */
.h1 { font-size: 2.5rem; font-weight: bold; }
.h2 { font-size: 2rem; font-weight: bold; }
.h3 { font-size: 1.75rem; font-weight: bold; }
.h4 { font-size: 1.5rem; font-weight: 600; }
.h5 { font-size: 1.25rem; font-weight: 600; }

/* Texto corporativo */
.text-primary { color: var(--primary-color); }
.text-secondary { color: var(--secondary-color); }
```

#### Componentes Base
```css
/* Botões */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--secondary-color);
}

/* Cards */
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

/* Formulários */
.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 1rem;
}
```

### 14.2 Layout Responsivo

#### Breakpoints
```css
/* Mobile first approach */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 0 2rem; }
  .dashboard-cards { 
    grid-template-columns: repeat(2, 1fr); 
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .sidebar { width: 250px; }
  .main-content { margin-left: 250px; }
  .dashboard-cards { 
    grid-template-columns: repeat(3, 1fr); 
  }
}
```

#### Sidebar Responsiva
```css
.sidebar {
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100vh;
  background: var(--primary-color);
  transition: left 0.3s ease;
  z-index: 1000;
}

.sidebar.open {
  left: 0;
}

@media (min-width: 1024px) {
  .sidebar {
    left: 0;
    position: relative;
  }
}
```

### 14.3 Componentes de Interface

#### Dashboard Cards
```typescript
interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: IconDefinition;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title, value, icon, trend, color = 'primary'
}) => (
  <div className={`dashboard-card ${color}-card`}>
    <div className="card-header">
      <FontAwesomeIcon icon={icon} />
      <h3>{title}</h3>
    </div>
    <div className="card-content">
      <div className="card-value">{value}</div>
      {trend && (
        <div className={`card-trend ${trend.direction}`}>
          <FontAwesomeIcon 
            icon={trend.direction === 'up' ? faArrowUp : faArrowDown} 
          />
          {trend.value}%
        </div>
      )}
    </div>
  </div>
);
```

#### Tabelas de Dados
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: PaginationProps;
}

const DataTable = <T,>({ 
  data, columns, loading, onRowClick, pagination 
}: DataTableProps<T>) => (
  <div className="data-table-container">
    {loading && <div className="table-loading">Carregando...</div>}
    <table className="data-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr 
            key={index} 
            onClick={() => onRowClick?.(row)}
            className={onRowClick ? 'clickable' : ''}
          >
            {columns.map(col => (
              <td key={col.key}>
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {pagination && <Pagination {...pagination} />}
  </div>
);
```

---

## 15. Considerações Futuras

### 15.1 Evoluções Técnicas

#### Migração de Base de Dados
```typescript
// Atual: JSON File Storage
const currentStorage = {
  type: 'file',
  location: './data/documents.json',
  pros: ['Simplicidade', 'Sem dependências'],
  cons: ['Performance', 'Concorrência', 'Backup']
};

// Futuro: PostgreSQL/MongoDB
const futureStorage = {
  type: 'database',
  options: ['PostgreSQL', 'MongoDB', 'MySQL'],
  benefits: [
    'Performance melhorada',
    'ACID compliance', 
    'Backup automático',
    'Escalabilidade',
    'Queries complexas'
  ]
};
```

#### Autenticação e Autorização
```typescript
// Sistema de roles e permissões
interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
  establishments: string[]; // Multi-estabelecimento
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  resource: string;  // 'vendas', 'compras', 'stock'
  actions: string[]; // 'read', 'write', 'delete'
}
```

#### Microserviços
```typescript
// Arquitetura futura
const microservices = {
  'auth-service': {
    port: 3001,
    responsibilities: ['Autenticação', 'Autorização', 'Users']
  },
  'sales-service': {
    port: 3002,
    responsibilities: ['Vendas', 'Orçamentos', 'Faturas']
  },
  'inventory-service': {
    port: 3003,
    responsibilities: ['Stock', 'Produtos', 'Movimentações']
  },
  'purchase-service': {
    port: 3004,
    responsibilities: ['Compras', 'Fornecedores', 'Guias']
  }
};
```

### 15.2 Funcionalidades Planeadas

#### Módulos Adicionais
1. **Contabilidade**
   - Plano de contas
   - Lançamentos contabilísticos
   - Balanços e demonstrações

2. **Recursos Humanos**
   - Gestão de colaboradores
   - Folha de pagamento
   - Avaliações de desempenho

3. **CRM (Customer Relationship Management)**
   - Gestão de clientes
   - Histórico de interações
   - Pipeline de vendas

4. **Projetos**
   - Gestão de projetos
   - Controle de horas
   - Faturação por projeto

#### Integrações
```typescript
// APIs externas
const integrations = {
  'AT-Mocambique': {
    purpose: 'Submissão automática de faturas',
    endpoint: 'https://at.gov.mz/api',
    status: 'planned'
  },
  'Banking': {
    purpose: 'Reconciliação bancária',
    providers: ['BCI', 'Standard Bank', 'Millennium'],
    status: 'planned'
  },
  'E-commerce': {
    purpose: 'Integração com lojas online',
    platforms: ['WooCommerce', 'Shopify'],
    status: 'future'
  }
};
```

### 15.3 Melhorias de Performance

#### Caching Strategy
```typescript
// Redis para cache distribuído
const cacheStrategy = {
  'dashboard-stats': { ttl: '5 minutes', type: 'memory' },
  'product-catalog': { ttl: '1 hour', type: 'redis' },
  'user-sessions': { ttl: '24 hours', type: 'redis' },
  'reports': { ttl: '30 minutes', type: 'file' }
};
```

#### Database Optimization
```sql
-- Índices para queries frequentes
CREATE INDEX idx_documents_date ON documents (document_date);
CREATE INDEX idx_documents_client ON documents (client_name);
CREATE INDEX idx_products_code ON products (codigo);
CREATE INDEX idx_stock_movements_date ON stock_movements (created_at);

-- Particionamento por data
CREATE TABLE documents_2025 PARTITION OF documents 
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 15.4 Monitorização e Observabilidade

#### Logging
```typescript
// Estrutured logging
const logger = {
  info: (message: string, context?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      context,
      service: 'usimamizi-backend'
    }));
  },
  error: (message: string, error?: Error, context?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.stack,
      context,
      service: 'usimamizi-backend'
    }));
  }
};
```

#### Métricas
```typescript
// Business metrics
const metrics = {
  'sales.total': { type: 'counter', description: 'Total sales amount' },
  'orders.created': { type: 'counter', description: 'Orders created' },
  'api.response_time': { type: 'histogram', description: 'API response time' },
  'stock.low_alerts': { type: 'gauge', description: 'Low stock alerts' }
};
```

---

## Conclusão

O sistema USIMAMIZI representa uma solução ERP moderna e adaptada às necessidades específicas do mercado moçambicano. A arquitetura escolhida oferece:

### Vantagens da Arquitetura Atual
- **Simplicidade**: Fácil de desenvolver e manter
- **Rapidez**: Deploy e desenvolvimento ágil
- **Baixo Custo**: Sem dependências de base de dados
- **Flexibilidade**: Fácil customização

### Preparação para o Futuro
- **Escalabilidade**: Arquitetura preparada para crescimento
- **Modularidade**: Facilita adição de novos módulos
- **Tecnologias Modernas**: Stack atual e suportado
- **Padrões**: Seguimento de best practices

### Próximos Passos Recomendados
1. **Implementar Autenticação**: Sistema de login seguro
2. **Testes Automatizados**: Cobertura de código
3. **Monitorização**: Logs e métricas de produção
4. **Base de Dados**: Migração para PostgreSQL
5. **Mobile**: Versão responsiva ou app nativo

Este documento serve como guia técnico para o desenvolvimento contínuo e evolução do sistema USIMAMIZI, garantindo que a arquitetura possa suportar o crescimento e as necessidades futuras da plataforma.

---

**Documento gerado automaticamente**  
**Sistema USIMAMIZI v1.0**  
**© 2025 Pallas Consultoria e Serviços Lda**