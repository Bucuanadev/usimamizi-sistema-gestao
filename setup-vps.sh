#!/bin/bash

# Script de Configuração Automática USIMAMIZI na VPS Ubuntu
# Execute como: bash setup-vps.sh

echo "🚀 Configurando USIMAMIZI na VPS Ubuntu"
echo "========================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    print_error "Execute como root ou com sudo"
    exit 1
fi

# Atualizar sistema
print_info "Atualizando sistema..."
apt update && apt upgrade -y
print_status "Sistema atualizado"

# Instalar dependências
print_info "Instalando dependências..."

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Nginx
apt install nginx -y

# PM2
npm install -g pm2

# Certbot
apt install certbot python3-certbot-nginx -y

# Unzip
apt install unzip -y

# UFW
apt install ufw -y

print_status "Dependências instaladas"

# Verificar instalações
print_info "Verificando instalações..."
node --version
npm --version
nginx --version
pm2 --version

# Navegar para diretório do projeto
cd /var/www/usimamizi

# Verificar se o ZIP existe
if [ ! -f "usimamizi-project.zip" ]; then
    print_error "Arquivo usimamizi-project.zip não encontrado!"
    print_info "Faça o upload do arquivo ZIP primeiro"
    exit 1
fi

# Extrair ZIP
print_info "Extraindo arquivo ZIP..."
unzip -o usimamizi-project.zip

# Se o ZIP contém uma pasta, mover conteúdo
if [ -d "usimamizi-react" ]; then
    print_info "Movendo conteúdo da pasta usimamizi-react..."
    mv usimamizi-react/* .
    rmdir usimamizi-react
fi

print_status "Arquivo ZIP extraído"

# Instalar dependências do frontend
print_info "Instalando dependências do frontend..."
npm install
print_status "Dependências do frontend instaladas"

# Instalar dependências do backend
print_info "Instalando dependências do backend..."
cd backend
npm install
cd ..
print_status "Dependências do backend instaladas"

# Criar arquivo de configuração PM2
print_info "Criando configuração PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'usimamizi-backend',
      script: './backend/server.js',
      cwd: '/var/www/usimamizi',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/usimamizi-backend-error.log',
      out_file: '/var/log/pm2/usimamizi-backend-out.log',
      log_file: '/var/log/pm2/usimamizi-backend.log',
      time: true
    }
  ]
};
EOF

print_status "Configuração PM2 criada"

# Iniciar backend com PM2
print_info "Iniciando backend com PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup
print_status "Backend iniciado com PM2"

# Configurar Nginx
print_info "Configurando Nginx..."
cat > /etc/nginx/sites-available/usimamizi << 'EOF'
server {
    listen 80;
    server_name usimamizi.pallasmz.online;
    
    # Frontend (React)
    location / {
        root /var/www/usimamizi/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Headers para SPA
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # Logs
    access_log /var/log/nginx/usimamizi.access.log;
    error_log /var/log/nginx/usimamizi.error.log;
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/usimamizi /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
print_status "Nginx configurado"

# Configurar firewall
print_info "Configurando firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3001
ufw --force enable
print_status "Firewall configurado"

# Obter certificado SSL
print_info "Obtendo certificado SSL..."
certbot --nginx -d usimamizi.pallasmz.online --non-interactive --agree-tos --email admin@pallasmz.online
print_status "Certificado SSL configurado"

# Criar script de deploy
print_info "Criando script de deploy..."
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando deploy do USIMAMIZI..."

# Parar aplicação
pm2 stop usimamizi-backend

# Fazer backup
cp -r /var/www/usimamizi /var/www/usimamizi-backup-$(date +%Y%m%d-%H%M%S)

# Extrair novo ZIP (quando houver atualizações)
# unzip -o usimamizi-project.zip

# Instalar dependências
npm install
cd backend && npm install && cd ..

# Build do frontend (se necessário)
# npm run build

# Reiniciar aplicação
pm2 restart usimamizi-backend

# Recarregar Nginx
systemctl reload nginx

echo "✅ Deploy concluído!"
pm2 status
EOF

chmod +x deploy.sh
print_status "Script de deploy criado"

# Verificar status final
print_info "Verificando status dos serviços..."
pm2 status
systemctl status nginx --no-pager

print_info "Testando conectividade..."
curl -s http://localhost:3001/api/health || print_warning "Backend não está respondendo"
curl -s http://localhost:80 || print_warning "Nginx não está respondendo"

echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
echo "=========================="
echo "Frontend: https://usimamizi.pallasmz.online"
echo "API: https://usimamizi.pallasmz.online/api/health"
echo ""
echo "Comandos úteis:"
echo "- Ver logs: pm2 logs usimamizi-backend"
echo "- Reiniciar: pm2 restart usimamizi-backend"
echo "- Status: pm2 status"
echo "- Deploy: ./deploy.sh"
echo ""
print_status "Sistema USIMAMIZI configurado com sucesso!"





