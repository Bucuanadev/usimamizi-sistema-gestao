// Script para testar a conexão entre frontend e backend
const fetch = require('node-fetch');

async function testConnection() {
  console.log('🔍 Testando conexão com o backend...');
  
  try {
    // Testar health check
    console.log('1. Testando health check...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check OK:', healthData);
    
    // Testar documentos
    console.log('2. Testando endpoint de documentos...');
    const docsResponse = await fetch('http://localhost:3001/api/sales/documents');
    const docsData = await docsResponse.json();
    console.log('✅ Documentos OK:', docsData.data.length, 'documentos encontrados');
    
    // Testar números de documento
    console.log('3. Testando endpoint de números...');
    const numbersResponse = await fetch('http://localhost:3001/api/sales/document-numbers/fatura');
    const numbersData = await numbersResponse.json();
    console.log('✅ Números OK:', numbersData);
    
    console.log('🎉 Todos os testes passaram! Backend está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
