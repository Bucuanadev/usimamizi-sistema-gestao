#!/bin/bash

# Script para aplicar as correções na VPS
# Execute este script na VPS após enviar os arquivos

echo "🚀 Aplicando Correções - USIMAMIZI"
echo "================================="

# Definir diretórios
VPS_PATH="/var/www/usim"
BACKEND_PATH="$VPS_PATH/backend"
FRONTEND_PATH="$VPS_PATH/usimamizi-react"

echo "📋 Verificando arquivos recebidos..."

# Verificar se os arquivos foram enviados
if [ -f "$FRONTEND_PATH/src/pages/Vendas.tsx" ]; then
    echo "✅ Vendas.tsx encontrado"
else
    echo "❌ Vendas.tsx não encontrado!"
    exit 1
fi

if [ -f "$BACKEND_PATH/server.js" ]; then
    echo "✅ server.js encontrado"
else
    echo "❌ server.js não encontrado!"
    exit 1
fi

if [ -f "$FRONTEND_PATH/src/config/api.ts" ]; then
    echo "✅ api.ts (config) encontrado"
else
    echo "❌ api.ts (config) não encontrado!"
    exit 1
fi

if [ -f "$FRONTEND_PATH/src/services/api.ts" ]; then
    echo "✅ api.ts (services) encontrado"
else
    echo "❌ api.ts (services) não encontrado!"
    exit 1
fi

echo ""
echo "🔄 Reiniciando backend..."
cd $BACKEND_PATH
pm2 restart server

echo ""
echo "🏗️ Rebuildando frontend..."
cd $FRONTEND_PATH

# Corrigir permissões se necessário
echo "🔧 Corrigindo permissões..."
chmod -R 755 .
chown -R root:root .

# Rebuildar
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend rebuildado com sucesso!"
else
    echo "❌ Erro ao rebuildar frontend"
    exit 1
fi

echo ""
echo "🔄 Reiniciando Nginx..."
systemctl reload nginx

echo ""
echo "📊 Status dos serviços:"
pm2 status

echo ""
echo "🎉 Correções aplicadas com sucesso!"
echo "🌐 Acesse: https://usimamizi.pallasmz.online"