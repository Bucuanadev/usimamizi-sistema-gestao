#!/bin/bash

echo "🚀 Iniciando USIMAMIZI Sistema de Gestão..."

# Verificar se NODE_ENV está definido
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=production
fi

# Verificar se PORT está definido  
if [ -z "$PORT" ]; then
    export PORT=3001
fi

echo "🌍 Ambiente: $NODE_ENV"
echo "🔌 Porta: $PORT"

# Verificar se o diretório de dados existe
if [ ! -d "backend/data" ]; then
    echo "📁 Criando diretório de dados..."
    mkdir -p backend/data
fi

# Verificar se o build do frontend existe
if [ ! -d "build" ]; then
    echo "⚠️  Build do frontend não encontrado. Executando build..."
    npm run build
fi

# Iniciar o servidor
echo "🖥️  Iniciando servidor backend..."
cd backend && node server.js