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

# Verificar se rsync está disponível
$rsyncAvailable = $false
try {
    $rsyncVersion = rsync --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $rsyncAvailable = $true
        Write-Host "✅ rsync disponível" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ rsync não encontrado" -ForegroundColor Yellow
}

# Verificar se SCP está disponível
$scpAvailable = $false
try {
    $scpVersion = scp 2>$null
    if ($LASTEXITCODE -ne 127) {
        $scpAvailable = $true
        Write-Host "✅ scp disponível" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ scp não encontrado" -ForegroundColor Yellow
}

if (-not $rsyncAvailable -and -not $scpAvailable) {
    Write-Host "❌ Erro: Nem rsync nem scp estão disponíveis!" -ForegroundColor Red
    Write-Host "Instale o Windows Subsystem for Linux (WSL) ou Git Bash para ter essas ferramentas." -ForegroundColor Yellow
    exit 1
}

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
    Write-Host "❌ Erro ao testar conexão SSH: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verificar se o diretório existe na VPS
Write-Host "📁 Verificando diretório na VPS..." -ForegroundColor Yellow
try {
    $checkDir = ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "test -d $VPS_PROJECT_DIR && echo 'EXISTS' || echo 'NOT_EXISTS'"
    if ($checkDir -eq "EXISTS") {
        Write-Host "✅ Diretório $VPS_PROJECT_DIR encontrado na VPS" -ForegroundColor Green
    } else {
        Write-Host "❌ Diretório $VPS_PROJECT_DIR não encontrado na VPS" -ForegroundColor Red
        Write-Host "Verificando diretórios alternativos..." -ForegroundColor Yellow
        
        # Tentar encontrar o projeto em outros locais
        $findProject = ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "find / -name 'package.json' -path '*/usimamizi*' 2>/dev/null | head -5"
        if ($findProject) {
            Write-Host "📁 Possíveis localizações do projeto:" -ForegroundColor Cyan
            $findProject -split "`n" | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
            $newDir = Read-Host "Digite o caminho correto do projeto na VPS"
            $VPS_PROJECT_DIR = $newDir
        } else {
            exit 1
        }
    }
} catch {
    Write-Host "❌ Erro ao verificar diretório: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Criar backup do código local atual
Write-Host "💾 Criando backup do código local atual..." -ForegroundColor Yellow
try {
    if (Test-Path "src" -PathType Container) {
        New-Item -ItemType Directory -Path $LOCAL_BACKUP_DIR -Force | Out-Null
        Copy-Item -Recurse -Force "src" "$LOCAL_BACKUP_DIR\"
        Copy-Item -Recurse -Force "backend" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Copy-Item -Force "package.json" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Copy-Item -Force "package-lock.json" "$LOCAL_BACKUP_DIR\" -ErrorAction SilentlyContinue
        Write-Host "✅ Backup local criado em: $LOCAL_BACKUP_DIR" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Aviso: Erro ao criar backup local: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Baixar código da VPS
Write-Host "📥 Baixando código da VPS..." -ForegroundColor Yellow

if ($rsyncAvailable) {
    Write-Host "🔄 Usando rsync para sincronização..." -ForegroundColor Yellow
    
    # Sincronizar arquivos principais
    try {
        # Frontend
        Write-Host "📦 Baixando frontend..." -ForegroundColor Cyan
        rsync -avz --progress --delete "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/src/" "./src/"
        rsync -avz --progress "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/public/" "./public/"
        rsync -avz --progress "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/package.json" "./"
        rsync -avz --progress "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/package-lock.json" "./" 2>$null
        
        # Backend
        Write-Host "🔧 Baixando backend..." -ForegroundColor Cyan
        rsync -avz --progress --delete "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/backend/" "./backend/"
        
        # Arquivos de configuração
        Write-Host "⚙️ Baixando configurações..." -ForegroundColor Cyan
        rsync -avz --progress "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/tsconfig.json" "./" 2>$null
        rsync -avz --progress "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/.env*" "./" 2>$null
        rsync -avz --progress "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/ecosystem.config.js" "./" 2>$null
        
        Write-Host "✅ Sincronização via rsync concluída" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro durante sincronização rsync: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} elseif ($scpAvailable) {
    Write-Host "🔄 Usando scp para download..." -ForegroundColor Yellow
    
    try {
        # Criar diretórios temporários
        New-Item -ItemType Directory -Path ".\temp-download" -Force | Out-Null
        
        # Baixar arquivos principais
        Write-Host "📦 Baixando projeto completo..." -ForegroundColor Cyan
        scp -r "$VPS_USER@${VPS_IP}:$VPS_PROJECT_DIR/*" ".\temp-download\"
        
        # Mover arquivos para posição correta
        if (Test-Path ".\temp-download\src") {
            Remove-Item -Recurse -Force ".\src" -ErrorAction SilentlyContinue
            Move-Item ".\temp-download\src" ".\src"
        }
        
        if (Test-Path ".\temp-download\backend") {
            Remove-Item -Recurse -Force ".\backend" -ErrorAction SilentlyContinue
            Move-Item ".\temp-download\backend" ".\backend"
        }
        
        if (Test-Path ".\temp-download\public") {
            Remove-Item -Recurse -Force ".\public" -ErrorAction SilentlyContinue
            Move-Item ".\temp-download\public" ".\public"
        }
        
        # Arquivos individuais
        Copy-Item ".\temp-download\package.json" ".\" -ErrorAction SilentlyContinue
        Copy-Item ".\temp-download\package-lock.json" ".\" -ErrorAction SilentlyContinue
        Copy-Item ".\temp-download\tsconfig.json" ".\" -ErrorAction SilentlyContinue
        Copy-Item ".\temp-download\.env*" ".\" -ErrorAction SilentlyContinue
        
        # Limpar temporários
        Remove-Item -Recurse -Force ".\temp-download" -ErrorAction SilentlyContinue
        
        Write-Host "✅ Download via scp concluído" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro durante download scp: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Verificar informações da VPS
Write-Host "📊 Obtendo informações da VPS..." -ForegroundColor Yellow
try {
    Write-Host "=== Informações do Sistema VPS ===" -ForegroundColor Cyan
    ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "echo 'Sistema:' && uname -a && echo 'Node.js:' && node --version && echo 'NPM:' && npm --version && echo 'PM2 Status:' && pm2 list 2>/dev/null || echo 'PM2 não instalado'"
} catch {
    Write-Host "⚠️ Não foi possível obter informações da VPS" -ForegroundColor Yellow
}

# Verificar dependências locais
Write-Host "🔍 Verificando dependências..." -ForegroundColor Yellow

# Verificar se package.json foi baixado
if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
    
    # Mostrar versão do Node.js local
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
    
    # Verificar se node_modules precisa ser reinstalado
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
        try {
            npm install
            Write-Host "✅ Dependências do frontend instaladas" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
        }
    }
    
    # Verificar backend
    if (Test-Path "backend\package.json") {
        if (-not (Test-Path "backend\node_modules")) {
            Write-Host "🔧 Instalando dependências do backend..." -ForegroundColor Yellow
            try {
                Set-Location "backend"
                npm install
                Set-Location ".."
                Write-Host "✅ Dependências do backend instaladas" -ForegroundColor Green
            } catch {
                Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
                Set-Location ".."
            }
        }
    }
} else {
    Write-Host "❌ package.json não encontrado!" -ForegroundColor Red
}

# Verificar arquivos de configuração
Write-Host "⚙️ Verificando configurações..." -ForegroundColor Yellow

if (Test-Path "src\config\api.ts") {
    Write-Host "📋 Configuração da API:" -ForegroundColor Cyan
    Get-Content "src\config\api.ts" | Select-String "baseURL|API_URL" | ForEach-Object {
        Write-Host "  $_" -ForegroundColor White
    }
}

if (Test-Path "backend\server.js") {
    Write-Host "📋 Configuração do Backend:" -ForegroundColor Cyan
    Get-Content "backend\server.js" | Select-String "port|PORT|listen" | Select-Object -First 3 | ForEach-Object {
        Write-Host "  $_" -ForegroundColor White
    }
}

# Mostrar estrutura de arquivos atualizada
Write-Host "📁 Estrutura de arquivos atualizada:" -ForegroundColor Yellow
try {
    Get-ChildItem -Directory | ForEach-Object {
        Write-Host "  📁 $($_.Name)" -ForegroundColor Cyan
    }
    Get-ChildItem -File "*.json", "*.js", "*.ts", "*.md" | ForEach-Object {
        Write-Host "  📄 $($_.Name)" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️ Erro ao listar arquivos" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Download da VPS concluído com sucesso!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumo da operação:" -ForegroundColor Yellow
Write-Host "  ✅ Código baixado da VPS: $VPS_IP" -ForegroundColor Green
Write-Host "  ✅ Backup local criado: $LOCAL_BACKUP_DIR" -ForegroundColor Green
Write-Host "  ✅ Dependências verificadas" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Verificar configurações de API em src/config/api.ts" -ForegroundColor White
Write-Host "  2. Testar aplicação: npm start" -ForegroundColor White
Write-Host "  3. Testar backend: cd backend && node server.js" -ForegroundColor White
Write-Host ""
Write-Host "📋 Para restaurar backup em caso de problemas:" -ForegroundColor Yellow
Write-Host "  Copy-Item -Recurse -Force '$LOCAL_BACKUP_DIR\*' '.'" -ForegroundColor White
Write-Host ""
Write-Host "✅ Código local atualizado com sucesso!" -ForegroundColor Green