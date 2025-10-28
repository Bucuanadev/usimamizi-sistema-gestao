# 🚀 Deploy USIMAMIZI na VPS Ubuntu

## 📋 Pré-requisitos
- VPS Ubuntu (155.138.165.212)
- Subdomínio configurado no Cloudflare: `usimamizi.pallasmz.online`
- Acesso SSH à VPS
- Node.js 18+ instalado

## 🔧 Passo 1: Preparar a VPS

### 1.1 Conectar via SSH
```bash
ssh root@155.138.165.212
# ou
ssh usuario@155.138.165.212
```

### 1.2 Atualizar o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Instalar dependências necessárias
```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx -y

# Instalar Git
sudo apt install git -y
```

### 1.4 Verificar instalações
```bash
node --version    # Deve mostrar v18.x.x
npm --version     # Deve mostrar 9.x.x
nginx --version   # Deve mostrar versão do Nginx
pm2 --version     # Deve mostrar versão do PM2
```

## 📁 Passo 2: Preparar o Projeto

### 2.1 Criar diretório do projeto
```bash
sudo mkdir -p /var/www/usimamizi
sudo chown -R $USER:$USER /var/www/usimamizi
cd /var/www/usimamizi
```

### 2.2 Fazer upload do projeto
```bash
# Opção 1: Via Git (se o projeto estiver no GitHub)
git clone https://github.com/seu-usuario/usimamizi-react.git .

# Opção 2: Via SCP (do seu computador local)
# scp -r "C:\Users\User\Downloads\usimamizi 1\usimamizi-react" root@155.138.165.212:/var/www/usimamizi/

# Opção 3: Via rsync (recomendado)
# rsync -avz --progress "C:\Users\User\Downloads\usimamizi 1\usimamizi-react/" root@155.138.165.212:/var/www/usimamizi/
```

### 2.3 Instalar dependências
```bash
# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..
```

## 🔧 Passo 3: Configurar o Backend

### 3.1 Criar arquivo de configuração PM2 para o backend
```bash
nano ecosystem.config.js
```

Conteúdo do arquivo:
```javascript
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
```

### 3.2 Iniciar o backend com PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Passo 4: Configurar o Frontend

### 4.1 Build do frontend para produção
```bash
# Configurar variáveis de ambiente
echo "REACT_APP_API_URL=https://usimamizi.pallasmz.online/api" > .env.production

# Fazer build
npm run build
```

### 4.2 Configurar Nginx para servir o frontend
```bash
sudo nano /etc/nginx/sites-available/usimamizi
```

Conteúdo do arquivo:
```nginx
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
```

### 4.3 Ativar o site
```bash
sudo ln -s /etc/nginx/sites-available/usimamizi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Passo 5: Configurar SSL com Let's Encrypt

### 5.1 Obter certificado SSL
```bash
sudo certbot --nginx -d usimamizi.pallasmz.online
```

### 5.2 Verificar renovação automática
```bash
sudo certbot renew --dry-run
```

## 🔧 Passo 6: Configurar Firewall

### 6.1 Configurar UFW
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001
sudo ufw --force enable
```

## 🚀 Passo 7: Testar o Deploy

### 7.1 Verificar status dos serviços
```bash
# Verificar PM2
pm2 status

# Verificar Nginx
sudo systemctl status nginx

# Verificar logs
pm2 logs usimamizi-backend
sudo tail -f /var/log/nginx/usimamizi.access.log
```

### 7.2 Testar URLs
- Frontend: https://usimamizi.pallasmz.online
- API: https://usimamizi.pallasmz.online/api/health

## 🔄 Passo 8: Script de Deploy Automático

### 8.1 Criar script de deploy
```bash
nano deploy.sh
```

Conteúdo:
```bash
#!/bin/bash

echo "🚀 Iniciando deploy do USIMAMIZI..."

# Parar aplicação
pm2 stop usimamizi-backend

# Fazer backup
cp -r /var/www/usimamizi /var/www/usimamizi-backup-$(date +%Y%m%d-%H%M%S)

# Atualizar código (se usando Git)
# git pull origin main

# Instalar dependências
npm install
cd backend && npm install && cd ..

# Build do frontend
npm run build

# Reiniciar aplicação
pm2 restart usimamizi-backend

# Recarregar Nginx
sudo systemctl reload nginx

echo "✅ Deploy concluído!"
pm2 status
```

### 8.2 Tornar executável
```bash
chmod +x deploy.sh
```

## 📊 Passo 9: Monitoramento

### 9.1 Configurar monitoramento PM2
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 9.2 Verificar logs
```bash
# Logs da aplicação
pm2 logs usimamizi-backend

# Logs do Nginx
sudo tail -f /var/log/nginx/usimamizi.access.log
sudo tail -f /var/log/nginx/usimamizi.error.log
```

## 🔧 Passo 10: Configurações Adicionais

### 10.1 Configurar backup automático
```bash
# Criar script de backup
nano backup.sh
```

Conteúdo:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
tar -czf /var/backups/usimamizi-$DATE.tar.gz /var/www/usimamizi
find /var/backups -name "usimamizi-*.tar.gz" -mtime +7 -delete
```

### 10.2 Configurar cron para backup
```bash
crontab -e
# Adicionar linha:
# 0 2 * * * /var/www/usimamizi/backup.sh
```

## ✅ Verificação Final

### Checklist de Deploy:
- [ ] VPS Ubuntu configurada
- [ ] Node.js 18+ instalado
- [ ] Nginx configurado e rodando
- [ ] PM2 configurado e rodando
- [ ] SSL configurado (Let's Encrypt)
- [ ] Firewall configurado
- [ ] Frontend acessível em https://usimamizi.pallasmz.online
- [ ] API acessível em https://usimamizi.pallasmz.online/api/health
- [ ] Backup automático configurado

## 🆘 Troubleshooting

### Problemas Comuns:

1. **Erro 502 Bad Gateway**
   ```bash
   pm2 restart usimamizi-backend
   sudo systemctl restart nginx
   ```

2. **Erro de CORS**
   - Verificar configuração do Nginx
   - Verificar headers CORS no backend

3. **SSL não funciona**
   ```bash
   sudo certbot --nginx -d usimamizi.pallasmz.online --force-renewal
   ```

4. **Aplicação não inicia**
   ```bash
   pm2 logs usimamizi-backend
   pm2 restart usimamizi-backend
   ```

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs: `pm2 logs usimamizi-backend`
2. Verificar Nginx: `sudo nginx -t`
3. Verificar SSL: `sudo certbot certificates`
4. Verificar firewall: `sudo ufw status`

---

**🎉 Parabéns! Seu sistema USIMAMIZI está online em https://usimamizi.pallasmz.online**






