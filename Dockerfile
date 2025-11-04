FROM node:18-alpine

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Criar diretório da aplicação
WORKDIR /app

# Copiar todos os arquivos package.json primeiro
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalar dependências do frontend
RUN npm install --legacy-peer-deps

# Instalar dependências do backend
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# Voltar para o diretório principal
WORKDIR /app

# Copiar código fonte
COPY . .

# Build do frontend React
RUN npm run build

# Criar diretório de dados
RUN mkdir -p backend/data

# Expor porta
EXPOSE 3001

# Health check simples
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Comando para iniciar o backend
CMD ["node", "backend/server.js"]