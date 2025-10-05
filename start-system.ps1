# Script PowerShell para iniciar o Sistema Usimamizi
# Execute como: .\start-system.ps1

Write-Host "🏢 Iniciando Sistema Usimamizi..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Desenvolvido por: Bucuanadev" -ForegroundColor Cyan
Write-Host "Licenciado por: Pallas Consultoria e Serviços Lda" -ForegroundColor Cyan
Write-Host "Website: pallasmz.online" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Green

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js primeiro!" -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar se npm está disponível
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Instalando dependências do Backend..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "node_modules") {
    Write-Host "✅ Dependências do backend já instaladas" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependências do backend instaladas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao instalar dependências do backend!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Instalando dependências do Frontend..." -ForegroundColor Yellow
Set-Location ..
if (Test-Path "node_modules") {
    Write-Host "✅ Dependências do frontend já instaladas" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependências do frontend instaladas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao instalar dependências do frontend!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Usimamizi - Porta 3001' -ForegroundColor Cyan; npm start"

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🚀 Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🌐 Frontend Usimamizi - Porta 3000' -ForegroundColor Cyan; npm start"

Write-Host ""
Write-Host "✅ Sistema iniciado com sucesso!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Aguarde o frontend carregar (pode demorar alguns segundos)" -ForegroundColor White
Write-Host "2. Acesse http://localhost:3000 no seu navegador" -ForegroundColor White
Write-Host "3. Configure a empresa em 'Definições'" -ForegroundColor White
Write-Host "4. Adicione produtos em 'Compras → Stock'" -ForegroundColor White
Write-Host ""
Write-Host "❌ Para parar o sistema, feche as janelas do PowerShell" -ForegroundColor Red
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
