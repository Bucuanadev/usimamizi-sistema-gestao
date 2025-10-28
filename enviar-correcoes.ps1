# Script simples para enviar apenas os arquivos corrigidos
param(
    [string]$VpsIp = "155.138.165.212",
    [string]$VpsUser = "root"
)

Write-Host "📤 Enviando correções para VPS..." -ForegroundColor Green

# Enviar arquivos corrigidos
Write-Host "1. Enviando Vendas.tsx..." -ForegroundColor Yellow
scp "src\pages\Vendas.tsx" "${VpsUser}@${VpsIp}:/var/www/usim/usimamizi-react/src/pages/"

Write-Host "2. Enviando server.js..." -ForegroundColor Yellow  
scp "backend\server.js" "${VpsUser}@${VpsIp}:/var/www/usim/backend/"

Write-Host "3. Enviando api.ts (config)..." -ForegroundColor Yellow
scp "src\config\api.ts" "${VpsUser}@${VpsIp}:/var/www/usim/usimamizi-react/src/config/"

Write-Host "4. Enviando api.ts (services)..." -ForegroundColor Yellow
scp "src\services\api.ts" "${VpsUser}@${VpsIp}:/var/www/usim/usimamizi-react/src/services/"

Write-Host "✅ Arquivos enviados!" -ForegroundColor Green
Write-Host "Agora execute na VPS: bash deploy-correcoes.sh" -ForegroundColor Cyan






