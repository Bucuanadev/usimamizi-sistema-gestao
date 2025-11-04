# 🚀 Deploy do Usimamizi no Railway

## Pré-requisitos Completos
- ✅ Projeto preparado para deploy
- ✅ Token GitHub: `ghp_[SEU_TOKEN_AQUI]`
- ✅ Arquivos de configuração criados

## Configurações Adicionadas

### 1. **Dockerfile**
- Configurado para build multi-stage
- Instala dependências do frontend e backend
- Serve arquivos estáticos em produção

### 2. **railway.json**
- Configuração específica para Railway
- Build automático com Nixpacks
- Healthcheck configurado

### 3. **package.json modificado**
- Script `start` aponta para o backend
- Script `postinstall` instala dependências do backend
- Scripts de build otimizados

### 4. **server.js modificado**
- CORS dinâmico (desenvolvimento vs produção)
- Serve arquivos estáticos do React em produção
- Fallback para SPA (Single Page Application)

### 5. **Arquivos de Environment**
- `.env.production` para configurações de produção
- URLs de API relativas para Railway

## Próximos Passos para Deploy

### Passo 1: Commit e Push das Alterações
```bash
git add .
git commit -m "feat: Configurar projeto para deploy no Railway"
git push origin main
```

### Passo 2: Acessar Railway
1. Ir para [railway.app](https://railway.app)
2. Fazer login/signup
3. Clicar em "New Project"

### Passo 3: Conectar ao GitHub
1. Selecionar "Deploy from GitHub repo"
2. Autorizar Railway no GitHub
3. Selecionar `Bucuanadev/usimamizi-sistema-gestao`

### Passo 4: Configurar Variáveis de Ambiente
No Railway Dashboard, adicionar:
```
NODE_ENV=production
PORT=3001
```

### Passo 5: Deploy Automático
- Railway detectará automaticamente o projeto Node.js
- Usará o Dockerfile para build
- Deploy automático será iniciado

## URLs Finais
- **Frontend**: https://[seu-projeto].railway.app
- **API**: https://[seu-projeto].railway.app/api
- **Health Check**: https://[seu-projeto].railway.app/api/health

## Monitoramento
- Railway fornece logs em tempo real
- Métricas de CPU/RAM/Network
- SSL automático com certificado

## Troubleshooting
- Verificar logs no Railway Dashboard
- Testar API endpoints individualmente
- Verificar variáveis de ambiente

## Características do Deploy
- ✅ Frontend React servido estaticamente
- ✅ Backend Node.js/Express
- ✅ Banco de dados JSON (arquivo local)
- ✅ SSL/HTTPS automático
- ✅ CI/CD automático do GitHub
- ✅ Escalabilidade automática