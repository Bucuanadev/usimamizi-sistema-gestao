# 🚀 Instruções Rápidas - Usimamizi

## ⚡ Execução Rápida (Windows)

### Método 1: Arquivo .bat (Mais Fácil)
1. **Clique duplo no arquivo `start-react.bat`**
2. **Aguarde a instalação automática**
3. **O sistema abrirá no navegador automaticamente**

### Método 2: Manual (2 Terminais)

#### Terminal 1 - Backend:
```cmd
cd backend
npm install
npm start
```

#### Terminal 2 - Frontend:
```cmd
npm install
npm start
```

## 🌐 Acessar o Sistema
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

## 🔧 Primeira Configuração

### 1. Configurar Empresa
- Menu → **Definições** → **Empresa**
- Preencher dados básicos

### 2. Criar Estabelecimentos
- **Definições** → **Estabelecimentos**
- Adicionar Matriz e Sucursais

### 3. Adicionar Produtos
- **Compras** → **Stock**
- Criar categorias e produtos

## 📱 Usar o Sistema

### Criar Fatura:
1. **Vendas** → **Nova Fatura**
2. Preencher cliente e produtos
3. Salvar e imprimir

### Criar Orçamento:
1. **Vendas** → **Novo Orçamento**
2. Adicionar itens
3. Gerar fatura

### Guia de Remessa:
1. **Vendas** → **Nova Guia de Remessa**
2. Escolher Cliente ou Sucursal
3. Adicionar produtos
4. Expedir

## ❗ Problemas Comuns

### "Port already in use"
```cmd
# Matar processos
taskkill /f /im node.exe
```

### "Cannot find module"
```cmd
# Reinstalar dependências
rmdir /s node_modules
del package-lock.json
npm install
```

### Backend não conecta
- Verificar se está rodando na porta 3001
- Reiniciar o terminal do backend

### Frontend não carrega
- Limpar cache: **Ctrl + F5**
- Verificar console: **F12**

## 📞 Ajuda
- Verificar logs no terminal
- Consultar README.md completo
- Verificar console do navegador (F12)

---

## 📄 Licenciamento

**Desenvolvido por:** Bucuanadev  
**Licenciado por:** Pallas Consultoria e Serviços Lda  
**Website:** [pallasmz.online](https://pallasmz.online)  
**Contacto:** [contacto@pallasmz.online](mailto:contacto@pallasmz.online)

© 2024 Pallas Consultoria e Serviços Lda. Todos os direitos reservados.

---
**✅ Sistema pronto para uso!**
