# 🏢 Usimamizi - Sistema de Gestão Empresarial

Sistema completo de gestão empresarial com módulos de vendas, compras, stock e estabelecimentos, inspirado no CEGID Primavera.

## 📄 Licenciamento

**Desenvolvido por:** Bucuanadev  
**Licenciado por:** Pallas Consultoria e Serviços Lda  
**Website:** [pallasmz.online](https://pallasmz.online)  
**Contacto:** [contacto@pallasmz.online](mailto:contacto@pallasmz.online)

© 2024 Pallas Consultoria e Serviços Lda. Todos os direitos reservados.

## 📋 Funcionalidades

### 🛒 Módulo de Vendas
- **Faturas** - Criação e gestão de faturas
- **Orçamentos** - Criação de orçamentos com conversão para fatura
- **Guias de Remessa** - Gestão de entregas e transferências internas
- **Geração de PDFs** - Documentos profissionais com logo da empresa

### 📦 Módulo de Compras
- **Gestão de Stock** - Controle completo de produtos e categorias
- **Guias de Entrada** - Receção de mercadorias
- **Integração com Vendas** - Stock automático entre módulos

### 🏢 Sistema de Estabelecimentos
- **Gestão de Sucursais** - CRUD completo de estabelecimentos
- **Transferências Internas** - Seleção de sucursais para envios
- **Configurações por Estabelecimento** - Permissões e séries de documentos

### 📊 Dashboard
- **Estatísticas em Tempo Real** - Vendas, stock, atividades
- **Atividades Recentes** - Histórico de ações do sistema
- **Métricas de Performance** - Crescimento e tendências

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- **Node.js** (versão 16 ou superior)
- **npm** (vem com Node.js)
- **Git** (para clonar o repositório)

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/Bucuanadev/usimamizi-sistema-gestao.git
cd usimamizi-sistema-gestao
```

### Passo 2: Instalar Dependências do Backend
```bash
cd backend
npm install
```

### Passo 3: Instalar Dependências do Frontend
```bash
cd ..
npm install
```

### Passo 4: Executar o Backend
```bash
cd backend
npm start
```
O backend estará disponível em: **http://localhost:3001**

### Passo 5: Executar o Frontend (em novo terminal)
```bash
cd usimamizi-sistema-gestao
npm start
```
O frontend estará disponível em: **http://localhost:3000**

## 🖥️ Instruções Detalhadas por Sistema Operacional

### Windows

#### Opção 1: Usando PowerShell
1. **Abrir PowerShell como Administrador**
2. **Navegar para a pasta do projeto:**
   ```powershell
   cd "C:\caminho\para\usimamizi-sistema-gestao"
   ```

3. **Instalar dependências do backend:**
   ```powershell
   cd backend
   npm install
   ```

4. **Instalar dependências do frontend:**
   ```powershell
   cd ..
   npm install
   ```

5. **Executar backend (Terminal 1):**
   ```powershell
   cd backend
   npm start
   ```

6. **Executar frontend (Terminal 2 - novo PowerShell):**
   ```powershell
   cd "C:\caminho\para\usimamizi-sistema-gestao"
   npm start
   ```

#### Opção 2: Usando o arquivo .bat (Windows)
1. **Executar o arquivo `start-react.bat`** (já incluído no projeto)
2. **Aguardar a instalação automática das dependências**
3. **O sistema abrirá automaticamente no navegador**

### Linux/macOS

1. **Abrir Terminal**
2. **Navegar para a pasta do projeto:**
   ```bash
   cd /caminho/para/usimamizi-sistema-gestao
   ```

3. **Instalar dependências do backend:**
   ```bash
   cd backend
   npm install
   ```

4. **Instalar dependências do frontend:**
   ```bash
   cd ..
   npm install
   ```

5. **Executar backend (Terminal 1):**
   ```bash
   cd backend
   npm start
   ```

6. **Executar frontend (Terminal 2 - novo terminal):**
   ```bash
   cd /caminho/para/usimamizi-sistema-gestao
   npm start
   ```

## 🔧 Configuração Inicial

### 1. Acessar o Sistema
- Abrir navegador em: **http://localhost:3000**
- O sistema carregará automaticamente

### 2. Configurar Empresa
1. **Ir para "Definições"** no menu lateral
2. **Preencher dados da empresa:**
   - Nome da empresa
   - NUIT
   - Endereço completo
   - Logo da empresa (opcional)

### 3. Configurar Estabelecimentos
1. **Na seção "Definições" → "Estabelecimentos"**
2. **Criar estabelecimentos:**
   - Matriz (obrigatório)
   - Sucursais
   - Armazéns
   - Lojas

### 4. Configurar Produtos
1. **Ir para "Compras" → "Stock"**
2. **Criar categorias de produtos:**
   - Material Informático
   - Segurança Eletrônica
   - Agricultura Inteligente
   - Safety
3. **Adicionar produtos com:**
   - Código único
   - Nome e descrição
   - Preço de venda
   - Stock inicial

## 📱 Como Usar o Sistema

### Criar uma Fatura
1. **Vendas → Nova Fatura**
2. **Preencher dados do cliente**
3. **Adicionar produtos:**
   - Clicar em "Pesquisar Artigo"
   - Selecionar produtos do stock
   - Ajustar quantidades
4. **Salvar e imprimir**

### Criar um Orçamento
1. **Vendas → Novo Orçamento**
2. **Preencher informações básicas**
3. **Adicionar itens da cotação**
4. **Configurar condições comerciais**
5. **Gerar fatura a partir do orçamento**

### Criar Guia de Remessa
1. **Vendas → Nova Guia de Remessa**
2. **Escolher destino:**
   - Cliente (preencher dados do cliente)
   - Sucursal (selecionar da lista)
3. **Adicionar artigos a expedir**
4. **Configurar informações de transporte**
5. **Expedir e imprimir**

### Gestão de Stock
1. **Compras → Stock**
2. **Adicionar novos produtos**
3. **Criar categorias**
4. **Ajustar stock manualmente**

### Guia de Entrada
1. **Compras → Guia de Entrada**
2. **Preencher dados do fornecedor**
3. **Adicionar produtos recebidos**
4. **Confirmar entrada no stock**

## 🛠️ Solução de Problemas

### Erro: "Cannot find module"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port already in use"
```bash
# Encontrar processo usando a porta
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Matar processo (Windows)
taskkill /PID <PID_NUMBER> /F

# Matar processo (Linux/macOS)
kill -9 <PID_NUMBER>
```

### Backend não conecta
1. **Verificar se o backend está rodando em http://localhost:3001**
2. **Verificar logs do backend no terminal**
3. **Reiniciar o backend**

### Frontend não carrega
1. **Verificar se está rodando em http://localhost:3000**
2. **Limpar cache do navegador (Ctrl+F5)**
3. **Verificar console do navegador (F12)**

## 📊 Estrutura do Projeto

```
usimamizi-sistema-gestao/
├── backend/                 # Servidor Node.js
│   ├── server.js           # Servidor principal
│   ├── data/               # Dados JSON (banco de dados)
│   └── package.json        # Dependências do backend
├── src/                    # Código React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas principais
│   ├── services/          # Serviços de API
│   └── types/             # Definições TypeScript
├── public/                # Arquivos estáticos
└── package.json           # Dependências do frontend
```

## 🔐 Segurança

- **Token de acesso:** O token GitHub usado para upload está incluído no histórico
- **Dados locais:** Todos os dados são armazenados localmente em JSON
- **Sem autenticação:** Sistema atual não possui login (desenvolvimento)

## 📞 Suporte

Para problemas ou dúvidas:
1. **Verificar logs do console** (F12 no navegador)
2. **Verificar logs do backend** no terminal
3. **Consultar este README** para soluções comuns

## 🚀 Próximos Passos

- [ ] Implementar sistema de autenticação
- [ ] Adicionar banco de dados real (PostgreSQL/MySQL)
- [ ] Implementar backup automático
- [ ] Adicionar relatórios avançados
- [ ] Implementar notificações em tempo real

---

## 📞 Suporte e Contacto

**Desenvolvido por:** Bucuanadev  
**Licenciado por:** Pallas Consultoria e Serviços Lda  
**Website:** [pallasmz.online](https://pallasmz.online)  
**Email:** [contacto@pallasmz.online](mailto:contacto@pallasmz.online)

Para suporte técnico, licenciamento ou consultoria, contacte-nos através do email acima.

---

**Desenvolvido com ❤️ para a Usimamizi**

*Sistema inspirado no CEGID Primavera com interface moderna e funcionalidades completas de gestão empresarial.*

© 2024 Pallas Consultoria e Serviços Lda. Todos os direitos reservados.