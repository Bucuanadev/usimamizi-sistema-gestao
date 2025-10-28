# Diagramas Técnicos - Sistema USIMAMIZI

Este documento complementa o Software Design Document (SDD) com diagramas técnicos da arquitetura do sistema.

## 1. Arquitetura Geral

```mermaid
graph TB
    subgraph "Cliente/Browser"
        UI[React SPA<br/>TypeScript]
    end
    
    subgraph "Servidor de Aplicação"
        API[Express.js API<br/>Node.js]
        PDF[PDFKit<br/>Geração de PDF]
    end
    
    subgraph "Camada de Dados"
        JSON[JSON Files<br/>File System]
    end
    
    subgraph "Infraestrutura"
        PM2[PM2<br/>Process Manager]
        NGINX[Nginx<br/>Proxy/Web Server]
    end
    
    UI -.->|HTTP/HTTPS| NGINX
    NGINX -->|/api/*| API
    NGINX -->|/*| UI
    API --> JSON
    API --> PDF
    PM2 --> API
```

## 2. Fluxo de Dados - Vendas

```mermaid
sequenceDiagram
    participant U as Utilizador
    participant F as Frontend
    participant A as API
    participant D as Data Layer
    participant P as PDF Service

    U->>F: Criar Orçamento
    F->>A: POST /api/sales/documents
    A->>D: Ler dados existentes
    A->>A: Gerar número sequencial
    A->>D: Salvar novo documento
    A->>F: Retorna documento criado
    F->>U: Exibe confirmação

    U->>F: Gerar PDF
    F->>A: POST /api/sales/export-orc-pdf
    A->>P: Criar PDF
    P->>A: Stream PDF
    A->>F: Download PDF
    F->>U: Arquivo baixado
```

## 3. Fluxo de Stock - Compras

```mermaid
sequenceDiagram
    participant U as Utilizador
    participant F as Frontend
    participant A as API
    participant D as Data Layer

    U->>F: Criar Guia de Entrada
    F->>A: POST /api/purchases/documents
    A->>D: Salvar guia (status: PENDENTE)
    A->>F: Guia criada

    U->>F: Confirmar Entrada
    F->>A: POST /api/purchases/confirmar-guia-entrada/:id
    A->>D: Ler produtos em stock
    A->>A: Atualizar quantidades
    A->>D: Salvar stock atualizado
    A->>D: Atualizar status guia (CONFIRMADO)
    A->>D: Registrar atividade
    A->>F: Confirmação com detalhes
```

## 4. Estrutura de Componentes Frontend

```mermaid
graph TD
    App[App.tsx<br/>Router Principal]
    
    subgraph "Layout"
        Layout[Layout.tsx<br/>Sidebar + Header]
        Sidebar[Sidebar<br/>Menu Navegação]
        Header[Header<br/>Ações Globais]
    end
    
    subgraph "Páginas"
        Dashboard[Dashboard.tsx<br/>KPIs + Gráficos]
        Vendas[Vendas.tsx<br/>Gestão Documentos]
        Compras[Compras.tsx<br/>Guias + Fornecedores]
        Faturas[Faturas.tsx<br/>Faturação]
        Definicoes[Definicoes.tsx<br/>Configurações]
    end
    
    subgraph "Hooks"
        useAuth[useAuth.tsx<br/>Autenticação]
    end
    
    subgraph "Services"
        API[api.ts<br/>Cliente HTTP]
        Config[config/api.ts<br/>Endpoints]
    end
    
    App --> Layout
    Layout --> Sidebar
    Layout --> Header
    Layout --> Dashboard
    Layout --> Vendas
    Layout --> Compras
    Layout --> Faturas
    Layout --> Definicoes
    
    Dashboard --> useAuth
    Vendas --> useAuth
    Compras --> useAuth
    
    Dashboard --> API
    Vendas --> API
    Compras --> API
    
    API --> Config
```

## 5. Arquitetura de APIs

```mermaid
graph LR
    subgraph "Frontend Requests"
        GET[GET Requests]
        POST[POST Requests]
        PUT[PUT Requests]
        DELETE[DELETE Requests]
    end
    
    subgraph "API Middleware"
        CORS[CORS Policy]
        Parser[Body Parser]
        Logger[Request Logger]
    end
    
    subgraph "Route Handlers"
        Sales[/api/sales/*<br/>Vendas]
        Purchases[/api/purchases/*<br/>Compras]
        Dashboard[/api/dashboard/*<br/>KPIs]
        Settings[/api/settings/*<br/>Configurações]
        Health[/api/health<br/>Status]
    end
    
    subgraph "Business Logic"
        DocGen[Document Generation]
        StockMgmt[Stock Management]
        PDFGen[PDF Generation]
        DataValidation[Data Validation]
    end
    
    subgraph "Data Operations"
        ReadData[readData()]
        WriteData[writeData()]
        FileOps[File Operations]
    end
    
    GET --> CORS
    POST --> CORS
    PUT --> CORS
    DELETE --> CORS
    
    CORS --> Parser
    Parser --> Logger
    
    Logger --> Sales
    Logger --> Purchases
    Logger --> Dashboard
    Logger --> Settings
    Logger --> Health
    
    Sales --> DocGen
    Sales --> PDFGen
    Purchases --> StockMgmt
    Dashboard --> DataValidation
    
    DocGen --> ReadData
    DocGen --> WriteData
    StockMgmt --> ReadData
    StockMgmt --> WriteData
    
    ReadData --> FileOps
    WriteData --> FileOps
```

## 6. Modelo de Dados

```mermaid
erDiagram
    DOCUMENTS {
        number id PK
        string document_type
        string series
        string number
        string full_number
        date document_date
        date due_date
        string client_name
        string client_tax_number
        string status
        number total_amount
        timestamp created_at
        timestamp updated_at
    }
    
    PURCHASE_DOCUMENTS {
        number id PK
        string document_type
        string supplier_name
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUTOS {
        string id PK
        string codigo UK
        string nome
        string categoria_id FK
        string unidade_medida
        number stock_atual
        number stock_disponivel
        number stock_minimo
        boolean ativo
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORIAS {
        string id PK
        string codigo UK
        string nome
        boolean ativa
    }
    
    PRECOS {
        string id PK
        string produto_id FK
        string tipo
        number valor
        string moeda
        date data_inicio
        boolean ativo
    }
    
    LINHAS_COMPRA {
        string guia_id FK
        string codigo
        string descricao
        number quantidadeRecebida
        number precoUnitario
    }
    
    ESTABELECIMENTOS {
        string id PK
        string codigo UK
        string nome
        string tipo
        string nuit
        json endereco
        json contactos
        boolean ativo
    }
    
    ATIVIDADES {
        string id PK
        string tipo
        string descricao
        json detalhes
        timestamp data
        string status
    }
    
    PRODUTOS ||--o{ PRECOS : "tem preços"
    PRODUTOS }o--|| CATEGORIAS : "pertence a"
    PURCHASE_DOCUMENTS ||--o{ LINHAS_COMPRA : "contém linhas"
```

## 7. Fluxo de Deploy

```mermaid
flowchart TD
    Dev[Desenvolvimento Local]
    
    subgraph "Build Process"
        Build[npm run build]
        Test[npm test]
        Package[Criar pacote]
    end
    
    subgraph "Deploy para VPS"
        Upload[Upload via SCP/rsync]
        Install[npm install]
        PM2Start[PM2 restart]
        NginxReload[Nginx reload]
    end
    
    subgraph "Verificação"
        HealthCheck[Health Check]
        Monitor[Monitorização]
        Logs[Verificar Logs]
    end
    
    Dev --> Build
    Build --> Test
    Test --> Package
    Package --> Upload
    Upload --> Install
    Install --> PM2Start
    PM2Start --> NginxReload
    NginxReload --> HealthCheck
    HealthCheck --> Monitor
    HealthCheck --> Logs
    
    Monitor -.->|Problema| Logs
    Logs -.->|Correção| Dev
```

## 8. Estados de Documentos

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Criar Documento
    
    DRAFT --> SENT: Enviar Cliente
    DRAFT --> CANCELLED: Cancelar
    
    SENT --> PAID: Receber Pagamento
    SENT --> CANCELLED: Cancelar
    SENT --> DRAFT: Voltar para Rascunho
    
    PAID --> [*]: Processo Completo
    CANCELLED --> [*]: Processo Cancelado
    
    state DRAFT {
        [*] --> Editando
        Editando --> Validando
        Validando --> Pronto: Válido
        Validando --> Editando: Erro
    }
    
    state SENT {
        [*] --> Aguardando
        Aguardando --> Vencido: Prazo Expirado
        Vencido --> Aguardando: Prorrogar
    }
```

## 9. Fluxo de Stock

```mermaid
flowchart TD
    subgraph "Entrada de Stock"
        GE[Guia de Entrada]
        ValidarGE[Validar Produtos]
        ConfirmarGE[Confirmar Entrada]
        AtualizarStock[Atualizar Quantidades]
        LogEntrada[Log Atividade]
    end
    
    subgraph "Saída de Stock"
        Venda[Documento de Venda]
        ValidarDisp[Verificar Disponibilidade]
        BaixarStock[Baixar Quantidades]
        LogSaida[Log Movimentação]
    end
    
    subgraph "Alertas"
        VerificarMin[Verificar Stock Mínimo]
        AlertaBaixo[Alerta Stock Baixo]
        AlertaZero[Alerta Ruptura]
    end
    
    GE --> ValidarGE
    ValidarGE --> ConfirmarGE
    ConfirmarGE --> AtualizarStock
    AtualizarStock --> LogEntrada
    
    Venda --> ValidarDisp
    ValidarDisp --> BaixarStock
    BaixarStock --> LogSaida
    
    AtualizarStock --> VerificarMin
    BaixarStock --> VerificarMin
    VerificarMin --> AlertaBaixo
    VerificarMin --> AlertaZero
    
    LogEntrada -.-> Dashboard
    LogSaida -.-> Dashboard
    AlertaBaixo -.-> Dashboard
    AlertaZero -.-> Dashboard
```

## 10. Arquitetura de Segurança (Futura)

```mermaid
flowchart TB
    subgraph "Client Layer"
        Browser[Browser/SPA]
        Token[JWT Token Storage]
    end
    
    subgraph "Security Layer"
        AuthMiddleware[Auth Middleware]
        RoleCheck[Role Verification]
        PermCheck[Permission Check]
    end
    
    subgraph "Application Layer"
        API[API Endpoints]
        BusinessLogic[Business Logic]
    end
    
    subgraph "Data Layer"
        Database[(Database)]
        Sessions[(Session Store)]
    end
    
    Browser --> AuthMiddleware
    Token -.-> AuthMiddleware
    
    AuthMiddleware --> RoleCheck
    RoleCheck --> PermCheck
    PermCheck --> API
    
    API --> BusinessLogic
    BusinessLogic --> Database
    
    AuthMiddleware -.-> Sessions
```

## 11. Performance e Caching (Futuro)

```mermaid
flowchart LR
    subgraph "Client"
        Browser[Browser]
        LocalCache[Local Storage]
    end
    
    subgraph "CDN Layer"
        CDN[CDN<br/>Static Assets]
    end
    
    subgraph "Application Layer"
        LoadBalancer[Load Balancer]
        Server1[Server Instance 1]
        Server2[Server Instance 2]
    end
    
    subgraph "Cache Layer"
        Redis[(Redis Cache)]
        Memory[In-Memory Cache]
    end
    
    subgraph "Database Layer"
        DB[(PostgreSQL)]
        ReadReplica[(Read Replica)]
    end
    
    Browser --> CDN
    Browser --> LoadBalancer
    Browser -.-> LocalCache
    
    LoadBalancer --> Server1
    LoadBalancer --> Server2
    
    Server1 --> Redis
    Server1 --> Memory
    Server1 --> DB
    
    Server2 --> Redis
    Server2 --> Memory
    Server2 --> ReadReplica
    
    Redis -.-> DB
```

## 12. Monitorização e Observabilidade

```mermaid
flowchart TD
    subgraph "Application"
        Frontend[React App]
        Backend[Node.js API]
        Database[(JSON Files)]
    end
    
    subgraph "Monitoring"
        Logs[Application Logs]
        Metrics[Business Metrics]
        Alerts[Alert System]
    end
    
    subgraph "Analytics"
        Dashboard[Monitoring Dashboard]
        Reports[Performance Reports]
        Trends[Usage Trends]
    end
    
    Frontend --> Logs
    Backend --> Logs
    Backend --> Metrics
    
    Logs --> Dashboard
    Metrics --> Dashboard
    Metrics --> Alerts
    
    Dashboard --> Reports
    Metrics --> Trends
    
    Alerts -.->|Notification| Email[Email/SMS]
    Alerts -.->|Webhook| Slack[Slack/Teams]
```

---

## Como visualizar os diagramas

Os diagramas neste documento estão em formato Mermaid. Para visualizá-los:

1. **GitHub/GitLab**: Renderização automática
2. **VS Code**: Extensão "Mermaid Preview"
3. **Online**: [mermaid.live](https://mermaid.live)
4. **Documentação**: Integração com GitBook, Notion, etc.

---

**Sistema USIMAMIZI - Diagramas Técnicos**  
**© 2025 Pallas Consultoria e Serviços Lda**