# Script para fazer deploy apenas das correções para a VPS
# Arquivos corrigidos: Vendas.tsx, server.js, api.ts (config e services)

param(
    [string]$VpsIp = "155.138.165.212",
    [string]$VpsUser = "root",
    [string]$VpsPath = "/var/www/usim"
)

Write-Host "🚀 Deploy das Correções - USIMAMIZI" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Verificar se os arquivos existem
$files = @(
    "src\pages\Vendas.tsx",
    "backend\server.js", 
    "src\config\api.ts",
    "src\services\api.ts"
)

Write-Host "📋 Verificando arquivos..." -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Criar arquivo temporário com lista de arquivos
$tempList = "files-to-deploy.txt"
$files | Out-File -FilePath $tempList -Encoding UTF8

Write-Host "📤 Enviando arquivos para VPS..." -ForegroundColor Yellow

# Enviar arquivos usando scp
try {
    # Enviar Vendas.tsx
    Write-Host "Enviando Vendas.tsx..." -ForegroundColor Cyan
    scp "src\pages\Vendas.tsx" "${VpsUser}@${VpsIp}:${VpsPath}/usimamizi-react/src/pages/"
    
    # Enviar server.js
    Write-Host "Enviando server.js..." -ForegroundColor Cyan
    scp "backend\server.js" "${VpsUser}@${VpsIp}:${VpsPath}/backend/"
    
    # Enviar api.ts (config)
    Write-Host "Enviando api.ts (config)..." -ForegroundColor Cyan
    scp "src\config\api.ts" "${VpsUser}@${VpsIp}:${VpsPath}/usimamizi-react/src/config/"
    
    # Enviar api.ts (services)
    Write-Host "Enviando api.ts (services)..." -ForegroundColor Cyan
    scp "src\services\api.ts" "${VpsUser}@${VpsIp}:${VpsPath}/usimamizi-react/src/services/"
    
    Write-Host "✅ Arquivos enviados com sucesso!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro ao enviar arquivos: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Conectar via SSH e executar comandos na VPS
Write-Host "🔧 Executando comandos na VPS..." -ForegroundColor Yellow

$sshCommands = @"
echo '🔄 Reiniciando backend...'
cd $VpsPath/backend
pm2 restart server

echo '🏗️ Rebuildando frontend...'
cd $VpsPath/usimamizi-react
npm run build

echo '🔄 Reiniciando Nginx...'
systemctl reload nginx

echo '📊 Status dos serviços:'
pm2 status
echo '✅ Deploy das correções concluído!'
"@

try {
    ssh "${VpsUser}@${VpsIp}" $sshCommands
    Write-Host "🎉 Deploy das correções concluído com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao executar comandos na VPS: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Limpar arquivo temporário
Remove-Item $tempList -ErrorAction SilentlyContinue

Write-Host "🌐 Acesse: https://usimamizi.pallasmz.online" -ForegroundColor Cyan