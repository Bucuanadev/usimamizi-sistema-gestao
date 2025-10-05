# Script PowerShell para Deploy na VPS Ubuntu
# Sistema Usimamizi - Bucuanadev / Pallas Consultoria e Serviços Lda

param(
    [string]$VPS_IP = "66.42.86.15",
    [string]$VPS_USER = "root",
    [string]$VPS_PASSWORD = "U[9cj+vw9{QMsJYK"
)

Write-Host "🚀 Deploy do Sistema Usimamizi para VPS Ubuntu" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "VPS: $VPS_IP" -ForegroundColor Cyan
Write-Host "Usuário: $VPS_USER" -ForegroundColor Cyan
Write-Host ""

# Verificar se sshpass está disponível (Windows)
$sshpassAvailable = $false
try {
    sshpass -V | Out-Null
    $sshpassAvailable = $true
    Write-Host "✅ sshpass encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ sshpass não encontrado. Instalando..." -ForegroundColor Yellow
    
    # Tentar instalar via chocolatey
    try {
        choco install sshpass -y
        $sshpassAvailable = $true
        Write-Host "✅ sshpass instalado via Chocolatey" -ForegroundColor Green
    } catch {
        Write-Host "❌ Falha ao instalar sshpass. Instale manualmente:" -ForegroundColor Red
        Write-Host "   1. Baixe de: https://github.com/keimpx/sshpass-windows" -ForegroundColor Yellow
        Write-Host "   2. Adicione ao PATH do sistema" -ForegroundColor Yellow
        Write-Host "   3. Execute novamente este script" -ForegroundColor Yellow
        exit 1
    }
}

# Função para executar comandos SSH
function Invoke-SSHCommand {
    param([string]$Command)
    sshpass -p $VPS_PASSWORD ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $Command
}

# Função para copiar arquivos
function Copy-ToVPS {
    param([string]$LocalPath, [string]$RemotePath)
    sshpass -p $VPS_PASSWORD scp -o StrictHostKeyChecking=no -r $LocalPath "$VPS_USER@$VPS_IP`:$RemotePath"
}

Write-Host "🔧 Instalando dependências na VPS..." -ForegroundColor Yellow

# Atualizar sistema e instalar dependências
$installCommand = @"
apt update && apt upgrade -y &&
apt install -y nodejs npm nginx pm2 git curl wget &&
npm install -g pm2 &&
systemctl enable nginx &&
systemctl start nginx
"@

try {
    Invoke-SSHCommand $installCommand
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Criando estrutura de diretórios..." -ForegroundColor Yellow

# Criar diretórios
$createDirsCommand = @"
mkdir -p /var/www/usimamizi &&
mkdir -p /var/www/usimamizi/backend &&
mkdir -p /var/www/usimamizi/frontend &&
mkdir -p /var/log/usimamizi
"@

try {
    Invoke-SSHCommand $createDirsCommand
    Write-Host "✅ Diretórios criados" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao criar diretórios: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Copiando arquivos do projeto..." -ForegroundColor Yellow

# Copiar arquivos do backend
try {
    Copy-ToVPS "backend/*" "/var/www/usimamizi/backend/"
    Write-Host "✅ Backend copiado" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao copiar backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Copiar arquivos do frontend
try {
    Copy-ToVPS "src" "/var/www/usimamizi/frontend/"
    Copy-ToVPS "public" "/var/www/usimamizi/frontend/"
    Copy-ToVPS "package.json" "/var/www/usimamizi/frontend/"
    Copy-ToVPS "package-lock.json" "/var/www/usimamizi/frontend/"
    Write-Host "✅ Frontend copiado" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao copiar frontend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Configurando Backend..." -ForegroundColor Yellow

# Instalar dependências do backend
try {
    Invoke-SSHCommand "cd /var/www/usimamizi/backend && npm install --production"
    Write-Host "✅ Dependências do backend instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências do backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Criar configuração do PM2
$pm2Config = @"
module.exports = {
  apps: [{
    name: 'usimamizi-backend',
    script: 'server.js',
    cwd: '/var/www/usimamizi/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/usimamizi/backend-error.log',
    out_file: '/var/log/usimamizi/backend-out.log',
    log_file: '/var/log/usimamizi/backend-combined.log',
    time: true
  }]
};
"@

try {
    Invoke-SSHCommand "echo '$pm2Config' > /var/www/usimamizi/backend/ecosystem.config.js"
    Write-Host "✅ Configuração PM2 criada" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao criar configuração PM2: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🌐 Configurando Frontend..." -ForegroundColor Yellow

# Instalar dependências e build do frontend
try {
    Invoke-SSHCommand "cd /var/www/usimamizi/frontend && npm install --production"
    Invoke-SSHCommand "cd /var/www/usimamizi/frontend && npm run build"
    Write-Host "✅ Frontend configurado" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao configurar frontend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "⚙️ Configurando Nginx..." -ForegroundColor Yellow

# Configuração do Nginx
$nginxConfig = @"
server {
    listen 80;
    server_name $VPS_IP;

    # Frontend (React)
    location / {
        root /var/www/usimamizi/frontend/build;
        index index.html index.htm;
        try_files `$uri `$uri/ /index.html;
        
        # Headers para SPA
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/usimamizi.access.log;
    error_log /var/log/nginx/usimamizi.error.log;
}
"@

try {
    Invoke-SSHCommand "echo '$nginxConfig' > /etc/nginx/sites-available/usimamizi"
    Invoke-SSHCommand "ln -sf /etc/nginx/sites-available/usimamizi /etc/nginx/sites-enabled/"
    Invoke-SSHCommand "rm -f /etc/nginx/sites-enabled/default"
    Invoke-SSHCommand "nginx -t"
    Invoke-SSHCommand "systemctl reload nginx"
    Write-Host "✅ Nginx configurado" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao configurar Nginx: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Iniciando aplicação..." -ForegroundColor Yellow

# Iniciar aplicação
try {
    Invoke-SSHCommand "cd /var/www/usimamizi/backend && pm2 start ecosystem.config.js"
    Invoke-SSHCommand "pm2 save"
    Invoke-SSHCommand "pm2 startup"
    Write-Host "✅ Aplicação iniciada" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao iniciar aplicação: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🔒 Configurando firewall..." -ForegroundColor Yellow

# Configurar firewall
try {
    Invoke-SSHCommand "ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable"
    Write-Host "✅ Firewall configurado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Aviso: Erro ao configurar firewall (pode ser normal)" -ForegroundColor Yellow
}

Write-Host "📊 Verificando status..." -ForegroundColor Yellow

# Verificar status
try {
    Write-Host "=== Status PM2 ===" -ForegroundColor Cyan
    Invoke-SSHCommand "pm2 status"
    Write-Host ""
    Write-Host "=== Status Nginx ===" -ForegroundColor Cyan
    Invoke-SSHCommand "systemctl status nginx --no-pager -l"
} catch {
    Write-Host "⚠️ Aviso: Erro ao verificar status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "🌐 Acesse o sistema em: http://$VPS_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Monitoramento:" -ForegroundColor Yellow
Write-Host "   PM2 Status: ssh $VPS_USER@$VPS_IP 'pm2 status'" -ForegroundColor White
Write-Host "   Logs Backend: ssh $VPS_USER@$VPS_IP 'pm2 logs usimamizi-backend'" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Comandos úteis:" -ForegroundColor Yellow
Write-Host "   Reiniciar: ssh $VPS_USER@$VPS_IP 'pm2 restart usimamizi-backend'" -ForegroundColor White
Write-Host "   Parar: ssh $VPS_USER@$VPS_IP 'pm2 stop usimamizi-backend'" -ForegroundColor White
Write-Host ""
Write-Host "📞 Suporte:" -ForegroundColor Yellow
Write-Host "   Desenvolvido por: Bucuanadev" -ForegroundColor White
Write-Host "   Licenciado por: Pallas Consultoria e Serviços Lda" -ForegroundColor White
Write-Host "   Website: pallasmz.online" -ForegroundColor White
Write-Host "   Email: contacto@pallasmz.online" -ForegroundColor White
Write-Host ""
Write-Host "✅ Sistema Usimamizi está online e disponível!" -ForegroundColor Green
