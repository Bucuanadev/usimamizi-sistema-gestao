FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json dos dois projetos
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalar dependências do frontend
RUN npm install

# Instalar dependências do backend
WORKDIR /app/backend
RUN npm install

# Voltar para o diretório principal
WORKDIR /app

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando para iniciar o backend
CMD ["node", "backend/server.js"]