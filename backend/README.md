# USIMAMIZI Backend API

Backend API para o sistema USIMAMIZI ERP.

## 🚀 Início Rápido

### Instalação
```bash
cd backend
npm install
```

### Executar
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📡 Endpoints da API

### Health Check
- `GET /api/health` - Status da API

### Documentos de Vendas
- `GET /api/sales/documents` - Listar todos os documentos
- `GET /api/sales/documents/:id` - Obter documento específico
- `POST /api/sales/documents` - Criar novo documento
- `PUT /api/sales/documents/:id` - Atualizar documento
- `DELETE /api/sales/documents/:id` - Eliminar documento
- `GET /api/sales/document-numbers/:type` - Obter próximo número

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas
- `GET /api/dashboard/activities` - Atividades recentes

## 🗄️ Base de Dados

Os dados são armazenados em `data/documents.json` (criado automaticamente).

## 🔧 Configuração

- **Porta**: 3000 (padrão)
- **CORS**: Habilitado para todas as origens
- **Formato**: JSON

## 📝 Tipos de Documentos Suportados

- `orcamento` - Orçamentos (ORÇ)
- `encomenda` - Encomendas (EC)
- `fatura` - Faturas (FAT)
- `guia` - Guias de Remessa (GR)
- `credito` - Notas de Crédito (NC)
- `debito` - Notas de Débito (ND)
