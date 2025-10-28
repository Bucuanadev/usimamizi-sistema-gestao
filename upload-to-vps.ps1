# Script PowerShell para Upload do USIMAMIZI para VPS
# Execute como: .\upload-to-vps.ps1

param(
    [string]$VPS_IP = "155.138.165.212",
    [string]$VPS_USER = "root",
    [string]$ZIP_FILE = "usimamizi-project.zip"
)

Write-Host "🚀 Upload USIMAMIZI para VPS Ubuntu" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "VPS: $VPS_IP" -ForegroundColor Cyan
Write-Host "Usuário: $VPS_USER" -ForegroundColor Cyan
Write-Host "Arquivo: $ZIP_FILE" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Green

# Verificar se o arquivo ZIP existe
if (-not (Test-Path $ZIP_FILE)) {
    Write-Host "❌ Arquivo $ZIP_FILE não encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de que o arquivo está no diretório atual." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Arquivo $ZIP_FILE encontrado" -ForegroundColor Green

# Verificar se o rsync está disponível (Windows 10+)
try {
    $rsyncVersion = rsync --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ rsync disponível" -ForegroundColor Green
        
        Write-Host "📤 Fazendo upload do arquivo ZIP..." -ForegroundColor Yellow
        rsync -avz --progress $ZIP_FILE ${VPS_USER}@${VPS_IP}:/var/www/usimamizi/
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Upload concluído com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro no upload via rsync" -ForegroundColor Red
            exit 1
        }
    } else {
        throw "rsync não disponível"
    }
} catch {
    Write-Host "⚠️ rsync não disponível, usando SCP..." -ForegroundColor Yellow
    
    # Usar SCP como alternativa
    Write-Host "📤 Fazendo upload via SCP..." -ForegroundColor Yellow
    scp $ZIP_FILE ${VPS_USER}@${VPS_IP}:/var/www/usimamizi/
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Upload concluído com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro no upload via SCP" -ForegroundColor Red
        Write-Host "Tente fazer o upload manualmente via WinSCP ou similar." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "🔧 Próximos passos na VPS:" -ForegroundColor Yellow
Write-Host "1. Conectar via SSH: ssh $VPS_USER@$VPS_IP" -ForegroundColor White
Write-Host "2. Navegar para: cd /var/www/usimamizi" -ForegroundColor White
Write-Host "3. Extrair ZIP: unzip $ZIP_FILE" -ForegroundColor White
Write-Host "4. Instalar dependências: npm install && cd backend && npm install" -ForegroundColor White
Write-Host "5. Configurar PM2 e Nginx conforme o guia" -ForegroundColor White
Write-Host ""
Write-Host "📋 Guia completo: DEPLOY-ZIP-VPS.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Upload concluído! Continue com os próximos passos na VPS." -ForegroundColor Green






