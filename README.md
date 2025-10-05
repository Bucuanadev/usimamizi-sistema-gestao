# USIMAMIZI - Sistema de Gestão Empresarial (React)

Sistema completo de gestão empresarial desenvolvido em React com TypeScript, conectado ao backend Node.js.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard** - Visão geral do sistema
- **Faturas** - Gestão completa de faturação
- **Autenticação** - Sistema de login seguro
- **Layout Responsivo** - Interface adaptável
- **Integração com Backend** - API completa

### 🔄 Em Desenvolvimento
- **Stock** - Gestão de inventário
- **Projetos** - Gestão de projetos
- **Guias** - Entrada e remessa
- **Clientes** - Gestão de clientes
- **Relatórios** - Análises e dashboards

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **React Router** - Navegação
- **Axios** - Cliente HTTP
- **FontAwesome** - Ícones
- **CSS3** - Estilização

## 📦 Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar ambiente:**
```bash
cp env.example .env
```

3. **Iniciar desenvolvimento:**
```bash
npm start
```

4. **Acessar aplicação:**
```
http://localhost:3000
```

## 🔧 Scripts Disponíveis

- `npm start` - Inicia servidor de desenvolvimento
- `npm build` - Cria build de produção
- `npm test` - Executa testes
- `npm run eject` - Ejecta configurações

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal
│   └── Layout.css      # Estilos do layout
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Página inicial
│   ├── Faturas.tsx     # Gestão de faturas
│   └── *.css          # Estilos das páginas
├── services/           # Serviços e APIs
│   └── api.ts         # Cliente da API
├── hooks/             # Hooks customizados
│   └── useAuth.tsx    # Hook de autenticação
├── types/             # Definições TypeScript
│   └── index.ts       # Tipos principais
├── config/            # Configurações
│   └── api.ts         # Configuração da API
├── utils/             # Utilitários
├── styles/            # Estilos globais
└── App.tsx            # Componente principal
```

## 🔌 Integração com Backend

O frontend React se conecta ao backend Node.js através de:

- **Base URL:** `http://localhost:3000/api`
- **Autenticação:** JWT Bearer Token
- **Formato:** JSON
- **Timeout:** 10 segundos

### Endpoints Principais

- `GET /invoices` - Listar faturas
- `POST /invoices` - Criar fatura
- `GET /invoices/stock-products` - Produtos do stock
- `POST /invoices/:id/process-stock` - Processar fatura

## 🎨 Design System

### Cores
- **Primária:** #3498db (Azul)
- **Sucesso:** #27ae60 (Verde)
- **Aviso:** #f39c12 (Laranja)
- **Erro:** #e74c3c (Vermelho)
- **Neutro:** #2c3e50 (Escuro)

### Componentes
- **Botões:** Padronizados com hover e focus
- **Formulários:** Validação visual
- **Tabelas:** Responsivas e interativas
- **Cards:** Sombras e bordas arredondadas

## 📱 Responsividade

- **Desktop:** Layout completo com sidebar
- **Tablet:** Sidebar colapsável
- **Mobile:** Menu hambúrguer

## 🔐 Autenticação

- **Login:** Formulário simples
- **Token:** Armazenado no localStorage
- **Proteção:** Rotas protegidas
- **Logout:** Limpeza de dados

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Servir Build
```bash
npx serve -s build
```

## 📊 Status do Projeto

- ✅ **Estrutura Base** - 100%
- ✅ **Autenticação** - 100%
- ✅ **Dashboard** - 100%
- ✅ **Faturas** - 90%
- 🔄 **Stock** - 0%
- 🔄 **Projetos** - 0%
- 🔄 **Guias** - 0%

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- **Email:** suporte@usimamizi.co.mz
- **Telefone:** +258 21 123456

---

**USIMAMIZI** - Sistema de Gestão Empresarial v1.0.0