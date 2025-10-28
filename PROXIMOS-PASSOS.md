# 🚀 Próximos Passos - Deploy USIMAMIZI

## ✅ Status Atual
- [x] Arquivo ZIP enviado para VPS
- [x] Scripts de configuração criados

## 🔧 Passo 1: Conectar à VPS

```bash
ssh root@155.138.165.212
```

## 🔧 Passo 2: Executar Configuração Automática

```bash
# Navegar para o diretório do projeto
cd /var/www/usimamizi

# Baixar e executar o script de configuração
wget https://raw.githubusercontent.com/seu-repo/setup-vps.sh
# ou copiar o conteúdo do arquivo setup-vps.sh

# Tornar executável e executar
chmod +x setup-vps.sh
bash setup-vps.sh
```

## 🔧 Passo 3: Verificar Deploy

### 3.1 Testar URLs
- **Frontend**: https://usimamizi.pallasmz.online
- **API**: https://usimamizi.pallasmz.online/api/health

### 3.2 Verificar Status dos Serviços
```bash
# Verificar PM2
pm2 status

# Verificar Nginx
systemctl status nginx

# Ver logs
pm2 logs usimamizi-backend
```

## 🔧 Passo 4: Configurar Cloudflare (se necessário)

### 4.1 Verificar DNS
- A record: `usimamizi.pallasmz.online` → `155.138.165.212`
- CNAME: `www.usimamizi.pallasmz.online` → `usimamizi.pallasmz.online`

### 4.2 Configurar SSL
- Ativar "Full (strict)" no Cloudflare
- Verificar se o certificado Let's Encrypt está funcionando

## 🆘 Troubleshooting

### Problema: Erro 502 Bad Gateway
```bash
pm2 restart usimamizi-backend
systemctl restart nginx
```

### Problema: SSL não funciona
```bash
certbot --nginx -d usimamizi.pallasmz.online --force-renewal
```

### Problema: CORS errors
- Verificar configuração do Nginx
- Verificar headers CORS no backend

## 📊 Monitoramento

### Logs Importantes
```bash
# Logs da aplicação
pm2 logs usimamizi-backend

# Logs do Nginx
tail -f /var/log/nginx/usimamizi.access.log
tail -f /var/log/nginx/usimamizi.error.log
```

### Comandos Úteis
```bash
# Reiniciar serviços
pm2 restart usimamizi-backend
systemctl restart nginx

# Ver status
pm2 status
systemctl status nginx

# Fazer deploy de atualizações
./deploy.sh
```

## ✅ Checklist Final

- [ ] VPS configurada
- [ ] Node.js instalado
- [ ] Nginx configurado
- [ ] PM2 rodando
- [ ] SSL configurado
- [ ] Firewall configurado
- [ ] Frontend acessível
- [ ] API funcionando
- [ ] Cloudflare configurado

---

**🎉 Seu sistema USIMAMIZI estará online em https://usimamizi.pallasmz.online**






