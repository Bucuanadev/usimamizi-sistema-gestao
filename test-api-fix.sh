#!/bin/bash

echo "🔧 Testando correções da API na VPS..."

# Navegar para o diretório do projeto
cd /var/www/usim/usimamizi-react

echo "📦 Fazendo build do frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    echo "🔄 Reiniciando serviços..."
    pm2 restart usimamizi-backend
    systemctl reload nginx
    
    echo "🧪 Testando API..."
    echo "Testando health check:"
    curl -s http://localhost:3001/api/health | head -1
    
    echo ""
    echo "Testando via Nginx:"
    curl -s http://localhost/api/health | head -1
    
    echo ""
    echo "🎉 Correções aplicadas!"
    echo "🌐 Teste o sistema em: https://usimamizi.pallasmz.online/"
    echo ""
    echo "📋 Para testar a geração de PDF:"
    echo "1. Acesse https://usimamizi.pallasmz.online/"
    echo "2. Vá para Vendas"
    echo "3. Crie um orçamento"
    echo "4. Tente gerar PDF"
    
else
    echo "❌ Erro no build!"
    echo "Verifique os logs acima para identificar o problema."
fi




