# Script PowerShell Simples para Deploy na VPS
# Sistema Usimamizi - Bucuanadev / Pallas Consultoria e Serviços Lda

$VPS_IP = "66.42.86.15"
$VPS_USER = "root"
$VPS_PASSWORD = "U[9cj+vw9{QMsJYK"

Write-Host "🚀 Deploy do Sistema Usimamizi para VPS Ubuntu" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "VPS: $VPS_IP" -ForegroundColor Cyan
Write-Host "Usuário: $VPS_USER" -ForegroundColor Cyan
Write-Host ""

# Verificar se sshpass está disponível
try {
    sshpass -V | Out-Null
    Write-Host "✅ sshpass encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ sshpass não encontrado. Instale primeiro:" -ForegroundColor Red
    Write-Host "   choco install sshpass -y" -ForegroundColor Yellow
    Write-Host "   Ou baixe de: https://github.com/keimpx/sshpass-windows" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Instalando dependências na VPS..." -ForegroundColor Yellow

# Instalar dependências
$installCmd = "apt update; apt upgrade -y; apt install -y nodejs npm nginx pm2 git curl wget; npm install -g pm2; systemctl enable nginx; systemctl start nginx"
sshpass -p $VPS_PASSWORD ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $installCmd

Write-Host "✅ Dependências instaladas" -ForegroundColor Green

Write-Host "📁 Criando diretórios..." -ForegroundColor Yellow

# Criar diretórios
$mkdirCmd = "mkdir -p /var/www/usimamizi/backend; mkdir -p /var/www/usimamizi/frontend; mkdir -p /var/log/usimamizi"
sshpass -p $VPS_PASSWORD ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $mkdirCmd

Write-Host "✅ Diretórios criados" -ForegroundColor Green

Write-Host "📦 Copiando arquivos..." -ForegroundColor Yellow

# Copiar backend
sshpass -p $VPS_PASSWORD scp -o StrictHostKeyChecking=no -r "backend/*" "$VPS_USER@$VPS_IP:/var/www/usimamizi/backend/"

# Copiar frontend
sshpass -p $VPS_PASSWORD scp -o StrictHostKeyChecking=no -r "src" "$VPS_USER@$VPS_IP:/var/www/usimamizi/frontend/"
sshpass -p $VPS_PASSWORD scp -o StrictHostKeyChecking=no -r "public" "$VPS_USER@$VPS_IP:/var/www/usimamizi/frontend/"
sshpass -p $VPS_PASSWORD scp -o StrictHostKeyChecking=no "package.json" "$VPS_USER@$VPS_IP:/var/www/usimamizi/frontend/"
sshpass -p $VPS_PASSWORD scp -o StrictHostKeyChecking=no "package-lock.json" "$VPS_USER@$VPS_IP:/var/www/usimamizi/frontend/"

Write-Host "✅ Arquivos copiados" -ForegroundColor Green

Write-Host "🔧 Configurando backend..." -ForegroundColor Yellow

# Instalar dependências do backend
$backendCmd = "cd /var/www/usimamizi/backend; npm install --production"
sshpass -p $VPS_PASSWORD ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $backendCmd

Write-Host "✅ Backend configurado" -ForegroundColor Green

Write-Host "🌐 Configurando frontend..." -ForegroundColor Yellow

# Instalar dependências e build do frontend
$frontendCmd = "cd /var/www/usimamizi/frontend; npm install --production; npm run build"
sshpass -p $VPS_PASSWORD ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $frontendCmd

Write-Host "✅ Frontend configurado" -ForegroundColor Green

Write-Host "⚙️ Configurando Nginx..." -ForegroundColor Yellow

# Configuração do Nginx
$nginxConfig = @"
server {
    listen 80;
    server_name $VPS_IP;

    location / {
        root /var/www/usimamizi/frontend/build;
        index index.html index.htm;
        try_files `$uri `$uri/ /index.html;
    }

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
}
"@

# Salvar configuração do Nginx
sshpass -p $VPS_PASSWORD ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "echo '$nginxConfig' > /etc/nginx/sites-available/usimamizi"

# Ativar site
$nginxCmd = "ln -sf /etc/nginx/sites-available/usimamizi /etc/nginx/sites-enabled/; rm -f /etc/nginx/sites-enabled/default; nginx -t; systemctl reload nginx"
sshpass -p $VPS_PASSWORD ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $nginxCmd

Write-Host "✅ Nginx configurado" -ForegroundColor Green

Write-Host "🚀 Iniciando aplicação..." -ForegroundColor Yellow

# Iniciar backend com PM2
$pm2Cmd = "cd /var/www/usimamizi/backend; pm2 start server.js --name usimamizi-backend; pm2 save; pm2 startup"
sshpass -p $VPS_PASSWORD ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $pm2Cmd

Write-Host "✅ Aplicação iniciada" -ForegroundColor Green

Write-Host "🔒 Configurando firewall..." -ForegroundColor Yellow

# Configurar firewall
$firewallCmd = "ufw allow 22; ufw allow 80; ufw allow 443; ufw --force enable"
sshpass -p $VPS_PASSWORD ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $firewallCmd

Write-Host "✅ Firewall configurado" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "🌐 Acesse o sistema em: http://$VPS_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Verificar status:" -ForegroundColor Yellow
Write-Host "   ssh $VPS_USER@$VPS_IP 'pm2 status'" -ForegroundColor White
Write-Host ""
Write-Host "📞 Suporte:" -ForegroundColor Yellow
Write-Host "   Desenvolvido por: Bucuanadev" -ForegroundColor White
Write-Host "   Licenciado por: Pallas Consultoria e Serviços Lda" -ForegroundColor White
Write-Host "   Website: pallasmz.online" -ForegroundColor White
Write-Host "   Email: contacto@pallasmz.online" -ForegroundColor White
Write-Host ""
Write-Host "✅ Sistema Usimamizi está online!" -ForegroundColor Green
