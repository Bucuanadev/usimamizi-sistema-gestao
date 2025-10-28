# Script PowerShell para Baixar codigo atualizado da VPS
# Sistema Usimamizi - Sincronizacao VPS para Local

param(
    [string]$VPS_IP = "45.32.218.221",
    [string]$VPS_USER = "root",
    [string]$LOCAL_BACKUP_DIR = ".\backup-local-$(Get-Date -Format 'yyyyMMdd-HHmmss')",
    [string]$VPS_PROJECT_DIR = "/var/www/usimamizi"
)

Write-Host "Download do Sistema Usimamizi da VPS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "VPS: $VPS_IP" -ForegroundColor Cyan
Write-Host "Usuario: $VPS_USER" -ForegroundColor Cyan
Write-Host "Diretorio VPS: $VPS_PROJECT_DIR" -ForegroundColor Cyan
Write-Host "Backup Local: $LOCAL_BACKUP_DIR" -ForegroundColor Cyan
Write-Host ""

# Testar conexao SSH
Write-Host "Testando conexao SSH..." -ForegroundColor Yellow
try {
    ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "echo 'OK'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Conexao SSH estabelecida" -ForegroundColor Green
    } else {
        Write-Host "Falha na conexao SSH" -ForegroundColor Red
        Write-Host "Verifique:" -ForegroundColor Yellow
        Write-Host "  - IP da VPS: $VPS_IP" -ForegroundColor White
        Write-Host "  - Usuario: $VPS_USER" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "Erro ao testar conexao SSH" -ForegroundColor Red
    exit 1
}

# Criar backup do codigo local atual
Write-Host "Criando backup do codigo local atual..." -ForegroundColor Yellow
try {
    if (Test-Path "src" -PathType Container) {
        New-Item -ItemType Directory -Path $LOCAL_BACKUP_DIR -Force | Out-Null
        Copy-Item -Recurse -Force "src" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Copy-Item -Recurse -Force "backend" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Copy-Item -Force "package.json" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Write-Host "Backup local criado em: $LOCAL_BACKUP_DIR" -ForegroundColor Green
    }
} catch {
    Write-Host "Aviso: Erro ao criar backup local" -ForegroundColor Yellow
}

# Baixar codigo da VPS usando SCP
Write-Host "Baixando codigo da VPS..." -ForegroundColor Yellow

try {
    # Frontend
    Write-Host "Baixando frontend..." -ForegroundColor Cyan
    if (Test-Path "src") { Remove-Item -Recurse -Force "src" }
    scp -r "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/src" "./"
    
    if (Test-Path "public") { Remove-Item -Recurse -Force "public" }
    scp -r "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/public" "./"
    
    scp "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/package.json" "./"
    
    # Backend
    Write-Host "Baixando backend..." -ForegroundColor Cyan
    if (Test-Path "backend") { Remove-Item -Recurse -Force "backend" }
    scp -r "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/backend" "./"
    
    Write-Host "Download concluido" -ForegroundColor Green
} catch {
    Write-Host "Erro durante download" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Download da VPS concluido com sucesso!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. Instalar dependencias: npm install" -ForegroundColor White
Write-Host "  2. Instalar dependencias backend: cd backend && npm install" -ForegroundColor White
Write-Host "  3. Testar aplicacao: npm start" -ForegroundColor White
Write-Host ""
Write-Host "Codigo local atualizado com sucesso!" -ForegroundColor Green