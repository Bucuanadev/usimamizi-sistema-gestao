# Script para fazer deploy das correções da API para a VPS
param(
    [string]$VPS_IP = "155.138.165.212",
    [string]$VPS_USER = "root"
)

Write-Host "🚀 Fazendo deploy das correções da API para a VPS..." -ForegroundColor Yellow

# Arquivos que foram corrigidos
$files = @(
    "src/config/api.ts",
    "src/services/api.ts", 
    "src/pages/Vendas.tsx"
)

Write-Host "📦 Fazendo build do frontend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build do frontend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green

Write-Host "📤 Enviando arquivos corrigidos para a VPS..." -ForegroundColor Cyan

# Enviar arquivos corrigidos
foreach ($file in $files) {
    Write-Host "Enviando: $file" -ForegroundColor Blue
    scp $file "${VPS_USER}@${VPS_IP}:/var/www/usim/usimamizi-react/$file"
}

# Enviar build atualizado
Write-Host "Enviando build atualizado..." -ForegroundColor Blue
scp -r build/* "${VPS_USER}@${VPS_IP}:/var/www/usim/usimamizi-react/build/"

Write-Host "🔄 Reiniciando serviços na VPS..." -ForegroundColor Cyan

# Comandos para executar na VPS
$commands = @(
    "cd /var/www/usim/usimamizi-react && npm run build",
    "pm2 restart usimamizi-backend",
    "systemctl reload nginx"
)

foreach ($cmd in $commands) {
    Write-Host "Executando: $cmd" -ForegroundColor Blue
    ssh "${VPS_USER}@${VPS_IP}" $cmd
}

Write-Host "🎉 Deploy das correções concluído!" -ForegroundColor Green
Write-Host "🌐 Teste o sistema em: https://usimamizi.pallasmz.online/" -ForegroundColor Cyan




