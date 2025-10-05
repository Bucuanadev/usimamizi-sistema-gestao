# 🚀 Resumo do Deploy para VPS Ubuntu

## 📋 Informações da VPS

**IP:** 66.42.86.15  
**Usuário:** root  
**Senha:** U[9cj+vw9{QMsJYK  
**Sistema:** Ubuntu

## 📁 Arquivos de Deploy Criados

### Scripts Automatizados
- `deploy-vps.sh` - Script Bash para Linux/macOS
- `deploy-vps-simple.ps1` - Script PowerShell simplificado
- `install-sshpass.ps1` - Instalador do sshpass para Windows

### Documentação
- `DEPLOY-INSTRUCTIONS.md` - Guia completo de deploy
- `DEPLOY-MANUAL.md` - Passo a passo manual detalhado
- `DEPLOY-SUMMARY.md` - Este resumo

## 🛠️ Pré-requisitos

### Windows
```powershell
# Instalar sshpass
.\install-sshpass.ps1

# Ou manualmente via Chocolatey
choco install sshpass -y
```

### Linux/macOS
```bash
# Ubuntu/Debian
sudo apt install sshpass

# macOS
brew install sshpass
```

## 🚀 Métodos de Deploy

### 1. Deploy Automatizado (Recomendado)

#### Windows
```powershell
.\deploy-vps-simple.ps1
```

#### Linux/macOS
```bash
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### 2. Deploy Manual
Seguir o guia em `DEPLOY-MANUAL.md`

## 🌐 Resultado Final

Após o deploy, o sistema estará disponível em:
- **URL Principal:** http://66.42.86.15
- **API Backend:** http://66.42.86.15/api/
- **Sempre online** com PM2 e Nginx

## 📊 Monitoramento

### Verificar Status
```bash
# Conectar à VPS
ssh root@66.42.86.15

# Status da aplicação
pm2 status

# Status do Nginx
systemctl status nginx

# Logs em tempo real
pm2 logs usimamizi-backend
```

### Comandos Úteis
```bash
# Reiniciar aplicação
pm2 restart usimamizi-backend

# Parar aplicação
pm2 stop usimamizi-backend

# Ver logs
pm2 logs usimamizi-backend --lines 100

# Reiniciar Nginx
systemctl restart nginx
```

## 🔧 Estrutura na VPS

```
/var/www/usimamizi/
├── backend/           # API Node.js
│   ├── server.js
│   ├── package.json
│   └── ecosystem.config.js
├── frontend/          # React App
│   ├── build/         # Build de produção
│   ├── src/
│   └── public/
└── logs/              # Logs da aplicação

/etc/nginx/sites-available/
└── usimamizi          # Configuração Nginx

/var/log/usimamizi/    # Logs PM2
```

## 🚨 Solução de Problemas

### Problema: sshpass não encontrado
**Solução:** Execute `.\install-sshpass.ps1` no Windows

### Problema: Aplicação não inicia
**Solução:** 
```bash
pm2 logs usimamizi-backend
pm2 restart usimamizi-backend
```

### Problema: Nginx não funciona
**Solução:**
```bash
nginx -t
systemctl restart nginx
```

### Problema: Frontend não carrega
**Solução:**
```bash
cd /var/www/usimamizi/frontend
npm run build
```

## 📞 Suporte

**Desenvolvido por:** Bucuanadev  
**Licenciado por:** Pallas Consultoria e Serviços Lda  
**Website:** [pallasmz.online](https://pallasmz.online)  
**Email:** [contacto@pallasmz.online](mailto:contacto@pallasmz.online)

## ✅ Checklist de Deploy

- [ ] Instalar sshpass
- [ ] Executar script de deploy
- [ ] Verificar se aplicação está rodando
- [ ] Testar acesso via navegador
- [ ] Configurar monitoramento
- [ ] Documentar credenciais de acesso

---

**🎉 Sistema Usimamizi - Deploy completo e sempre online!**
