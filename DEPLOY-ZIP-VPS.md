# 🚀 Deploy USIMAMIZI via ZIP na VPS Ubuntu

## 📋 Pré-requisitos
- VPS Ubuntu (155.138.165.212)
- Arquivo ZIP do projeto USIMAMIZI
- Subdomínio configurado no Cloudflare: `usimamizi.pallasmz.online`
- Acesso SSH à VPS

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

# Instalar unzip
sudo apt install unzip -y
```

## 📁 Passo 2: Upload e Extração do ZIP

### 2.1 Criar diretório do projeto
```bash
sudo mkdir -p /var/www/usimamizi
sudo chown -R $USER:$USER /var/www/usimamizi
cd /var/www/usimamizi
```

### 2.2 Upload do arquivo ZIP
```bash
# Opção 1: Via SCP (do seu computador Windows)
# scp "C:\Users\User\Downloads\usimamizi 1\usimamizi-project.zip" root@155.138.165.212:/var/www/usimamizi/

# Opção 2: Via WinSCP (interface gráfica)
# Conectar via WinSCP e arrastar o arquivo para /var/www/usimamizi/

# Opção 3: Via rsync (recomendado)
# rsync -avz --progress "C:\Users\User\Downloads\usimamizi 1\usimamizi-project.zip" root@155.138.165.212:/var/www/usimamizi/
```

### 2.3 Extrair o arquivo ZIP
```bash
cd /var/www/usimamizi
unzip usimamizi-project.zip
# Se o zip contém uma pasta, mover o conteúdo para o diretório atual
# mv usimamizi-react/* .
# rmdir usimamizi-react
```

### 2.4 Verificar estrutura do projeto
```bash
ls -la
# Deve mostrar: backend/, build/, src/, package.json, etc.
```

## 🔧 Passo 3: Instalar Dependências

### 3.1 Instalar dependências do frontend
```bash
npm install
```

### 3.2 Instalar dependências do backend
```bash
cd backend
npm install
cd ..
```

## 🔧 Passo 4: Configurar o Backend

### 4.1 Criar arquivo de configuração PM2
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

### 4.2 Iniciar o backend com PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Passo 5: Configurar o Frontend

### 5.1 Verificar se o build existe
```bash
ls -la build/
# Se não existir, fazer build:
# npm run build
```

### 5.2 Configurar Nginx
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

### 5.3 Ativar o site
```bash
sudo ln -s /etc/nginx/sites-available/usimamizi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Passo 6: Configurar SSL

### 6.1 Obter certificado SSL
```bash
sudo certbot --nginx -d usimamizi.pallasmz.online
```

## 🔧 Passo 7: Configurar Firewall

### 7.1 Configurar UFW
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001
sudo ufw --force enable
```

## 🚀 Passo 8: Testar o Deploy

### 8.1 Verificar status dos serviços
```bash
# Verificar PM2
pm2 status

# Verificar Nginx
sudo systemctl status nginx

# Verificar logs
pm2 logs usimamizi-backend
```

### 8.2 Testar URLs
- Frontend: https://usimamizi.pallasmz.online
- API: https://usimamizi.pallasmz.online/api/health

## 🔄 Passo 9: Script de Deploy para Atualizações

### 9.1 Criar script de deploy
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
sudo systemctl reload nginx

echo "✅ Deploy concluído!"
pm2 status
```

### 9.2 Tornar executável
```bash
chmod +x deploy.sh
```

## 📊 Passo 10: Monitoramento

### 10.1 Verificar logs
```bash
# Logs da aplicação
pm2 logs usimamizi-backend

# Logs do Nginx
sudo tail -f /var/log/nginx/usimamizi.access.log
sudo tail -f /var/log/nginx/usimamizi.error.log
```

## 🆘 Troubleshooting

### Problemas Comuns:

1. **Erro 502 Bad Gateway**
   ```bash
   pm2 restart usimamizi-backend
   sudo systemctl restart nginx
   ```

2. **Arquivo ZIP não encontrado**
   ```bash
   ls -la /var/www/usimamizi/
   # Verificar se o arquivo foi extraído corretamente
   ```

3. **Dependências não instaladas**
   ```bash
   cd /var/www/usimamizi
   npm install
   cd backend && npm install && cd ..
   ```

4. **Build não existe**
   ```bash
   npm run build
   ```

## 📋 Checklist Final

- [ ] VPS Ubuntu configurada
- [ ] Node.js 18+ instalado
- [ ] Arquivo ZIP extraído em /var/www/usimamizi
- [ ] Dependências instaladas (frontend e backend)
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado e rodando
- [ ] SSL configurado (Let's Encrypt)
- [ ] Firewall configurado
- [ ] Frontend acessível em https://usimamizi.pallasmz.online
- [ ] API acessível em https://usimamizi.pallasmz.online/api/health

---

**🎉 Seu sistema USIMAMIZI está pronto para ser deployado!**

## 📞 Comandos Rápidos

```bash
# Verificar status
pm2 status
sudo systemctl status nginx

# Reiniciar serviços
pm2 restart usimamizi-backend
sudo systemctl restart nginx

# Ver logs
pm2 logs usimamizi-backend
sudo tail -f /var/log/nginx/usimamizi.access.log
```






