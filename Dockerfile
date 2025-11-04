FROM node:18-alpine

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json e instalar dependências do frontend
COPY package*.json ./
RUN npm ci --only=production

# Copiar package.json do backend e instalar dependências
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Voltar para o diretório principal e copiar código fonte
WORKDIR /app
COPY . .

# Build do frontend React
RUN npm run build

# Criar diretório de dados para persistência
RUN mkdir -p /app/backend/data

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Comando para iniciar o backend
CMD ["node", "backend/server.js"]