#!/bin/bash

# Script de Deploy para VPS Ubuntu - Sistema Usimamizi
# VPS: 66.42.86.15
# Desenvolvido por: Bucuanadev
# Licenciado por: Pallas Consultoria e Serviços Lda

echo "🚀 Iniciando Deploy do Sistema Usimamizi para VPS Ubuntu"
echo "=================================================="

# Configurações da VPS
VPS_IP="66.42.86.15"
VPS_USER="root"
VPS_PASSWORD="U[9cj+vw9{QMsJYK"
APP_DIR="/var/www/usimamizi"
DOMAIN="66.42.86.15"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Configurações:${NC}"
echo "VPS IP: $VPS_IP"
echo "Usuário: $VPS_USER"
echo "Diretório: $APP_DIR"
echo ""

# Função para executar comandos na VPS
execute_ssh() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$1"
}

# Função para copiar arquivos para a VPS
copy_to_vps() {
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no -r "$1" "$VPS_USER@$VPS_IP:$2"
}

echo -e "${YELLOW}🔧 Instalando dependências na VPS...${NC}"

# Atualizar sistema e instalar dependências
execute_ssh "
    apt update && apt upgrade -y &&
    apt install -y nodejs npm nginx pm2 git curl wget &&
    npm install -g pm2 &&
    systemctl enable nginx &&
    systemctl start nginx
"

echo -e "${GREEN}✅ Dependências instaladas${NC}"

echo -e "${YELLOW}📁 Criando estrutura de diretórios...${NC}"

# Criar diretório da aplicação
execute_ssh "
    mkdir -p $APP_DIR &&
    mkdir -p $APP_DIR/backend &&
    mkdir -p $APP_DIR/frontend &&
    mkdir -p /var/log/usimamizi
"

echo -e "${GREEN}✅ Diretórios criados${NC}"

echo -e "${YELLOW}📦 Copiando arquivos do projeto...${NC}"

# Copiar arquivos do backend
copy_to_vps "backend/*" "$APP_DIR/backend/"

# Copiar arquivos do frontend
copy_to_vps "src" "$APP_DIR/frontend/"
copy_to_vps "public" "$APP_DIR/frontend/"
copy_to_vps "package.json" "$APP_DIR/frontend/"
copy_to_vps "package-lock.json" "$APP_DIR/frontend/"

echo -e "${GREEN}✅ Arquivos copiados${NC}"

echo -e "${YELLOW}🔧 Configurando Backend...${NC}"

# Instalar dependências do backend
execute_ssh "
    cd $APP_DIR/backend &&
    npm install --production
"

# Criar arquivo de configuração do PM2 para backend
execute_ssh "cat > $APP_DIR/backend/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'usimamizi-backend',
    script: 'server.js',
    cwd: '$APP_DIR/backend',
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
EOF"

echo -e "${GREEN}✅ Backend configurado${NC}"

echo -e "${YELLOW}🌐 Configurando Frontend...${NC}"

# Instalar dependências do frontend
execute_ssh "
    cd $APP_DIR/frontend &&
    npm install --production
"

# Build do frontend
execute_ssh "
    cd $APP_DIR/frontend &&
    npm run build
"

echo -e "${GREEN}✅ Frontend configurado${NC}"

echo -e "${YELLOW}⚙️ Configurando Nginx...${NC}"

# Criar configuração do Nginx
execute_ssh "cat > /etc/nginx/sites-available/usimamizi << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend (React)
    location / {
        root $APP_DIR/frontend/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
        
        # Headers para SPA
        add_header Cache-Control \"no-cache, no-store, must-revalidate\";
        add_header Pragma \"no-cache\";
        add_header Expires \"0\";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/usimamizi.access.log;
    error_log /var/log/nginx/usimamizi.error.log;
}
EOF"

# Ativar site
execute_ssh "
    ln -sf /etc/nginx/sites-available/usimamizi /etc/nginx/sites-enabled/ &&
    rm -f /etc/nginx/sites-enabled/default &&
    nginx -t &&
    systemctl reload nginx
"

echo -e "${GREEN}✅ Nginx configurado${NC}"

echo -e "${YELLOW}🚀 Iniciando aplicação...${NC}"

# Iniciar backend com PM2
execute_ssh "
    cd $APP_DIR/backend &&
    pm2 start ecosystem.config.js &&
    pm2 save &&
    pm2 startup
"

echo -e "${GREEN}✅ Aplicação iniciada${NC}"

echo -e "${YELLOW}🔒 Configurando firewall...${NC}"

# Configurar firewall
execute_ssh "
    ufw allow 22 &&
    ufw allow 80 &&
    ufw allow 443 &&
    ufw --force enable
"

echo -e "${GREEN}✅ Firewall configurado${NC}"

echo -e "${YELLOW}📊 Verificando status...${NC}"

# Verificar status dos serviços
execute_ssh "
    echo '=== Status PM2 ===' &&
    pm2 status &&
    echo '' &&
    echo '=== Status Nginx ===' &&
    systemctl status nginx --no-pager -l &&
    echo '' &&
    echo '=== Portas em uso ===' &&
    netstat -tlnp | grep -E ':(80|3001|22)'
"

echo ""
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo "=================================================="
echo -e "${BLUE}🌐 Acesse o sistema em:${NC}"
echo "   http://$DOMAIN"
echo ""
echo -e "${BLUE}📊 Monitoramento:${NC}"
echo "   PM2 Status: pm2 status"
echo "   Logs Backend: pm2 logs usimamizi-backend"
echo "   Logs Nginx: tail -f /var/log/nginx/usimamizi.error.log"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "   Reiniciar app: pm2 restart usimamizi-backend"
echo "   Parar app: pm2 stop usimamizi-backend"
echo "   Ver logs: pm2 logs usimamizi-backend"
echo ""
echo -e "${YELLOW}📞 Suporte:${NC}"
echo "   Desenvolvido por: Bucuanadev"
echo "   Licenciado por: Pallas Consultoria e Serviços Lda"
echo "   Website: pallasmz.online"
echo "   Email: contacto@pallasmz.online"
echo ""
echo -e "${GREEN}✅ Sistema Usimamizi está online e disponível!${NC}"
