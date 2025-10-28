# Script para corrigir URLs da API em produção
Write-Host "🔧 Corrigindo URLs da API para produção..." -ForegroundColor Yellow

# Função para substituir URLs hardcoded
function Fix-HardcodedUrls {
    param($FilePath)
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        $originalContent = $content
        
        # Substituir URLs hardcoded
        $content = $content -replace "http://localhost:3001/api", "/api"
        $content = $content -replace "'http://localhost:3001/api'", "'/api'"
        $content = $content -replace '"http://localhost:3001/api"', '"/api"'
        
        if ($content -ne $originalContent) {
            Set-Content $FilePath $content -NoNewline
            Write-Host "✅ Corrigido: $FilePath" -ForegroundColor Green
        } else {
            Write-Host "ℹ️ Nenhuma alteração necessária: $FilePath" -ForegroundColor Blue
        }
    } else {
        Write-Host "❌ Arquivo não encontrado: $FilePath" -ForegroundColor Red
    }
}

# Corrigir arquivos principais
$files = @(
    "src/pages/Vendas.tsx",
    "src/pages/Faturas.tsx", 
    "src/pages/Compras.tsx",
    "src/pages/Dashboard.tsx",
    "src/pages/Definicoes.tsx"
)

foreach ($file in $files) {
    Fix-HardcodedUrls $file
}

Write-Host "🎉 Correção de URLs concluída!" -ForegroundColor Green
Write-Host "📝 Agora você pode fazer o build e deploy para a VPS" -ForegroundColor Cyan




