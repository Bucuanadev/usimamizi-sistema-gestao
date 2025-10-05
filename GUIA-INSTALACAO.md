# 📖 Guia de Instalação - Sistema Usimamizi

## 🖥️ Windows

### Opção 1: Script Automático (Recomendado)
1. **Clique com botão direito** no arquivo `start-system.ps1`
2. **Selecione "Executar com PowerShell"**
3. **Aguarde a instalação automática**
4. **O sistema abrirá automaticamente**

### Opção 2: Arquivo .bat
1. **Clique duplo** no arquivo `start-react.bat`
2. **Aguarde a instalação**
3. **Acesse http://localhost:3000**

### Opção 3: Manual
```cmd
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend (novo cmd)
cd ..
npm install
npm start
```

## 🐧 Linux (Ubuntu/Debian)

### Instalar Node.js (se necessário)
```bash
# Atualizar sistema
sudo apt update

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### Executar o Sistema
```bash
# Clonar repositório
git clone https://github.com/Bucuanadev/usimamizi-sistema-gestao.git
cd usimamizi-sistema-gestao

# Instalar dependências
cd backend && npm install && cd ..
npm install

# Executar (2 terminais)
# Terminal 1:
cd backend && npm start

# Terminal 2:
npm start
```

## 🍎 macOS

### Instalar Node.js (se necessário)
```bash
# Usando Homebrew
brew install node

# Ou baixar de: https://nodejs.org/
```

### Executar o Sistema
```bash
# Clonar repositório
git clone https://github.com/Bucuanadev/usimamizi-sistema-gestao.git
cd usimamizi-sistema-gestao

# Instalar dependências
cd backend && npm install && cd ..
npm install

# Executar (2 terminais)
# Terminal 1:
cd backend && npm start

# Terminal 2:
npm start
```

## 🐳 Docker (Opcional)

### Criar Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalar dependências
RUN npm install
RUN cd backend && npm install

# Copiar código
COPY . .

# Expor portas
EXPOSE 3000 3001

# Script de inicialização
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
```

### Script de inicialização (start.sh)
```bash
#!/bin/bash
cd backend && npm start &
cd .. && npm start
```

### Executar com Docker
```bash
# Construir imagem
docker build -t usimamizi .

# Executar container
docker run -p 3000:3000 -p 3001:3001 usimamizi
```

## 🔧 Solução de Problemas

### Erro: "npm não encontrado"
```bash
# Windows
# Baixar e instalar Node.js de: https://nodejs.org/

# Linux
sudo apt install nodejs npm

# macOS
brew install node
```

### Erro: "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

### Erro: "Permission denied"
```bash
# Linux/macOS
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules
```

### Erro: "Cannot find module"
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📱 Verificação da Instalação

### 1. Verificar Backend
- Acesse: http://localhost:3001
- Deve retornar: "Backend Usimamizi funcionando!"

### 2. Verificar Frontend
- Acesse: http://localhost:3000
- Deve carregar a interface do sistema

### 3. Verificar APIs
```bash
# Testar API de documentos
curl http://localhost:3001/api/sales/documents

# Testar API de estabelecimentos
curl http://localhost:3001/api/settings/estabelecimentos
```

## 🚀 Primeira Execução

### 1. Configurar Empresa
1. Acesse http://localhost:3000
2. Menu → **Definições** → **Empresa**
3. Preencha:
   - Nome da empresa
   - NUIT
   - Endereço
   - Logo (opcional)

### 2. Criar Estabelecimentos
1. **Definições** → **Estabelecimentos**
2. **Novo Estabelecimento**
3. Criar:
   - Matriz (obrigatório)
   - Sucursais
   - Armazéns

### 3. Adicionar Produtos
1. **Compras** → **Stock**
2. **Nova Categoria** (se necessário)
3. **Novo Produto**
4. Preencher:
   - Código único
   - Nome
   - Preço
   - Stock inicial

### 4. Testar Sistema
1. **Vendas** → **Nova Fatura**
2. Adicionar cliente
3. Adicionar produtos
4. Salvar e imprimir

## 📊 Monitoramento

### Logs do Backend
- Verificar terminal do backend
- Logs aparecem em tempo real

### Logs do Frontend
- F12 no navegador
- Aba "Console"
- Verificar erros JavaScript

### Performance
- **Backend:** http://localhost:3001/health
- **Frontend:** Verificar Network tab (F12)

## 🔄 Atualizações

### Atualizar Código
```bash
git pull origin master
npm install
cd backend && npm install
```

### Limpar Cache
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📞 Suporte

### Problemas Comuns
1. **Sistema não inicia:** Verificar Node.js instalado
2. **Erro de porta:** Matar processos existentes
3. **Dependências:** Reinstalar com npm install
4. **Backend não conecta:** Verificar porta 3001

### Logs Importantes
- **Backend:** Terminal onde executou `npm start`
- **Frontend:** Console do navegador (F12)
- **Sistema:** Logs do sistema operacional

### Contato
- **GitHub:** https://github.com/Bucuanadev/usimamizi-sistema-gestao
- **Issues:** Criar issue no GitHub para bugs
- **Documentação:** Consultar README.md

---

## 📄 Licenciamento

**Desenvolvido por:** Bucuanadev  
**Licenciado por:** Pallas Consultoria e Serviços Lda  
**Website:** [pallasmz.online](https://pallasmz.online)  
**Contacto:** [contacto@pallasmz.online](mailto:contacto@pallasmz.online)

© 2024 Pallas Consultoria e Serviços Lda. Todos os direitos reservados.

---

**✅ Sistema pronto para produção!**
