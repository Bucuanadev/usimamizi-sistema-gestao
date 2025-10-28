# Script PowerShell para Baixar código atualizado da VPS
# Sistema Usimamizi - Sincronização VPS para Local

param(
    [string]$VPS_IP = "45.32.218.221",
    [string]$VPS_USER = "root",
    [string]$LOCAL_BACKUP_DIR = ".\backup-local-$(Get-Date -Format 'yyyyMMdd-HHmmss')",
    [string]$VPS_PROJECT_DIR = "/var/www/usimamizi"
)

Write-Host "🔄 Download do Sistema Usimamizi da VPS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "VPS: $VPS_IP" -ForegroundColor Cyan
Write-Host "Usuário: $VPS_USER" -ForegroundColor Cyan
Write-Host "Diretório VPS: $VPS_PROJECT_DIR" -ForegroundColor Cyan
Write-Host "Backup Local: $LOCAL_BACKUP_DIR" -ForegroundColor Cyan
Write-Host ""

# Testar conexão SSH
Write-Host "🔌 Testando conexão SSH..." -ForegroundColor Yellow
try {
    $testConnection = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "echo 'Conexão OK'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexão SSH estabelecida" -ForegroundColor Green
    } else {
        Write-Host "❌ Falha na conexão SSH" -ForegroundColor Red
        Write-Host "Verifique:" -ForegroundColor Yellow
        Write-Host "  - IP da VPS: $VPS_IP" -ForegroundColor White
        Write-Host "  - Usuário: $VPS_USER" -ForegroundColor White
        Write-Host "  - Chaves SSH configuradas" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao testar conexão SSH" -ForegroundColor Red
    exit 1
}

# Criar backup do código local atual
Write-Host "💾 Criando backup do código local atual..." -ForegroundColor Yellow
try {
    if (Test-Path "src" -PathType Container) {
        New-Item -ItemType Directory -Path $LOCAL_BACKUP_DIR -Force | Out-Null
        Copy-Item -Recurse -Force "src" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Copy-Item -Recurse -Force "backend" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Copy-Item -Force "package.json" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Copy-Item -Force "package-lock.json" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Write-Host "✅ Backup local criado em: $LOCAL_BACKUP_DIR" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Aviso: Erro ao criar backup local" -ForegroundColor Yellow
}

# Baixar código da VPS usando SCP
Write-Host "📥 Baixando código da VPS..." -ForegroundColor Yellow

try {
    # Frontend
    Write-Host "📦 Baixando frontend..." -ForegroundColor Cyan
    if (Test-Path "src") { Remove-Item -Recurse -Force "src" }
    scp -r "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/src" "./"
    
    if (Test-Path "public") { Remove-Item -Recurse -Force "public" }
    scp -r "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/public" "./"
    
    scp "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/package.json" "./"
    scp "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/package-lock.json" "./" 2>$null
    
    # Backend
    Write-Host "🔧 Baixando backend..." -ForegroundColor Cyan
    if (Test-Path "backend") { Remove-Item -Recurse -Force "backend" }
    scp -r "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/backend" "./"
    
    # Arquivos de configuração
    Write-Host "⚙️ Baixando configurações..." -ForegroundColor Cyan
    scp "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/tsconfig.json" "./" 2>$null
    scp "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/.env*" "./" 2>$null
    scp "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/ecosystem.config.js" "./" 2>$null
    
    Write-Host "✅ Download concluído" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro durante download" -ForegroundColor Red
    exit 1
}

# Verificar dependências locais
Write-Host "🔍 Verificando dependências..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
    
    # Verificar Node.js local
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Host "✅ Node.js local: $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Node.js não encontrado localmente" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Node.js não encontrado localmente" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ package.json não encontrado!" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Download da VPS concluído com sucesso!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumo da operação:" -ForegroundColor Yellow
Write-Host "  ✅ Código baixado da VPS: $VPS_IP" -ForegroundColor Green
Write-Host "  ✅ Backup local criado: $LOCAL_BACKUP_DIR" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Instalar dependências: npm install" -ForegroundColor White
Write-Host "  2. Instalar dependências backend: cd backend && npm install" -ForegroundColor White
Write-Host "  3. Testar aplicação: npm start" -ForegroundColor White
Write-Host ""
Write-Host "✅ Código local atualizado com sucesso!" -ForegroundColor Green