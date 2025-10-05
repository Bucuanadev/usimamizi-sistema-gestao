# Script para instalar sshpass no Windows
# Necessário para o deploy automatizado

Write-Host "🔧 Instalando sshpass para Windows..." -ForegroundColor Green

# Verificar se Chocolatey está instalado
try {
    choco --version | Out-Null
    Write-Host "✅ Chocolatey encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Chocolatey não encontrado. Instalando..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Instalar sshpass
try {
    choco install sshpass -y
    Write-Host "✅ sshpass instalado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar sshpass via Chocolatey" -ForegroundColor Red
    Write-Host "📥 Instale manualmente:" -ForegroundColor Yellow
    Write-Host "   1. Baixe de: https://github.com/keimpx/sshpass-windows" -ForegroundColor White
    Write-Host "   2. Extraia para uma pasta" -ForegroundColor White
    Write-Host "   3. Adicione ao PATH do sistema" -ForegroundColor White
}

Write-Host ""
Write-Host "🚀 Agora você pode executar o deploy:" -ForegroundColor Cyan
Write-Host "   .\deploy-vps-simple.ps1" -ForegroundColor White
