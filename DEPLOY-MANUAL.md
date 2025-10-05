# 🚀 Deploy Manual para VPS Ubuntu

## 📋 Informações da VPS

**IP:** 66.42.86.15  
**Usuário:** root  
**Senha:** U[9cj+vw9{QMsJYK  
**Sistema:** Ubuntu

## 🛠️ Passo a Passo Manual

### 1. Conectar à VPS
```bash
ssh root@66.42.86.15
# Senha: U[9cj+vw9{QMsJYK
```

### 2. Instalar Dependências
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js, Nginx, PM2
apt install -y nodejs npm nginx pm2 git curl wget
npm install -g pm2

# Iniciar Nginx
systemctl enable nginx
systemctl start nginx
```

### 3. Criar Estrutura de Diretórios
```bash
mkdir -p /var/www/usimamizi
mkdir -p /var/www/usimamizi/backend
mkdir -p /var/www/usimamizi/frontend
mkdir -p /var/log/usimamizi
```

### 4. Copiar Arquivos (do seu computador local)

#### Windows (PowerShell)
```powershell
# Instalar sshpass primeiro
choco install sshpass -y

# Copiar backend
sshpass -p "U[9cj+vw9{QMsJYK" scp -r backend/* root@66.42.86.15:/var/www/usimamizi/backend/

# Copiar frontend
sshpass -p "U[9cj+vw9{QMsJYK" scp -r src root@66.42.86.15:/var/www/usimamizi/frontend/
sshpass -p "U[9cj+vw9{QMsJYK" scp -r public root@66.42.86.15:/var/www/usimamizi/frontend/
sshpass -p "U[9cj+vw9{QMsJYK" scp package.json root@66.42.86.15:/var/www/usimamizi/frontend/
sshpass -p "U[9cj+vw9{QMsJYK" scp package-lock.json root@66.42.86.15:/var/www/usimamizi/frontend/
```

#### Linux/macOS
```bash
# Copiar backend
scp -r backend/* root@66.42.86.15:/var/www/usimamizi/backend/

# Copiar frontend
scp -r src root@66.42.86.15:/var/www/usimamizi/frontend/
scp -r public root@66.42.86.15:/var/www/usimamizi/frontend/
scp package.json root@66.42.86.15:/var/www/usimamizi/frontend/
scp package-lock.json root@66.42.86.15:/var/www/usimamizi/frontend/
```

### 5. Configurar Backend (na VPS)
```bash
cd /var/www/usimamizi/backend
npm install --production

# Criar configuração PM2
cat > ecosystem.config.js << 'EOF'
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
EOF
```

### 6. Configurar Frontend (na VPS)
```bash
cd /var/www/usimamizi/frontend
npm install --production
npm run build
```

### 7. Configurar Nginx (na VPS)
```bash
# Criar configuração do site
cat > /etc/nginx/sites-available/usimamizi << 'EOF'
server {
    listen 80;
    server_name 66.42.86.15;

    # Frontend (React)
    location / {
        root /var/www/usimamizi/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Headers para SPA
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/usimamizi.access.log;
    error_log /var/log/nginx/usimamizi.error.log;
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/usimamizi /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 8. Iniciar Aplicação (na VPS)
```bash
# Iniciar backend com PM2
cd /var/www/usimamizi/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 9. Configurar Firewall (na VPS)
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

## 🌐 Acesso ao Sistema

Após completar todos os passos, o sistema estará disponível em:
- **URL:** http://66.42.86.15
- **API:** http://66.42.86.15/api/

## 📊 Verificar Status

```bash
# Conectar à VPS
ssh root@66.42.86.15

# Verificar status PM2
pm2 status

# Verificar status Nginx
systemctl status nginx

# Ver logs do backend
pm2 logs usimamizi-backend

# Ver logs do Nginx
tail -f /var/log/nginx/usimamizi.error.log
```

## 🔧 Comandos Úteis

```bash
# Reiniciar aplicação
pm2 restart usimamizi-backend

# Parar aplicação
pm2 stop usimamizi-backend

# Ver logs em tempo real
pm2 logs usimamizi-backend --lines 100

# Reiniciar Nginx
systemctl restart nginx

# Verificar portas em uso
netstat -tlnp | grep -E ':(80|3001|22)'
```

## 🚨 Solução de Problemas

### Aplicação não inicia
```bash
# Verificar logs
pm2 logs usimamizi-backend

# Verificar se a porta está em uso
netstat -tlnp | grep 3001

# Reiniciar PM2
pm2 kill
pm2 start /var/www/usimamizi/backend/ecosystem.config.js
```

### Nginx não funciona
```bash
# Verificar configuração
nginx -t

# Verificar logs
tail -f /var/log/nginx/error.log

# Reiniciar Nginx
systemctl restart nginx
```

### Frontend não carrega
```bash
# Verificar se o build existe
ls -la /var/www/usimamizi/frontend/build/

# Rebuild se necessário
cd /var/www/usimamizi/frontend
npm run build
```

## 📞 Suporte

**Desenvolvido por:** Bucuanadev  
**Licenciado por:** Pallas Consultoria e Serviços Lda  
**Website:** [pallasmz.online](https://pallasmz.online)  
**Email:** [contacto@pallasmz.online](mailto:contacto@pallasmz.online)

---

**✅ Sistema Usimamizi - Sempre online e disponível!**
