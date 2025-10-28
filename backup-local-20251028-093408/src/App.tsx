// =====================================================
// APP PRINCIPAL - USIMAMIZI REACT
// =====================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Faturas from './pages/Faturas';
import Vendas from './pages/Vendas';
import Compras from './pages/Compras';
import Definicoes from './pages/Definicoes';
import './App.css';

// Componente de rota protegida - AUTENTICAÇÃO DESATIVADA
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('ProtectedRoute - AUTENTICAÇÃO DESATIVADA - Acesso direto permitido');
  
  // SEMPRE permitir acesso - autenticação desativada
  return <>{children}</>;
};

// Página de login simples
const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('Tentando fazer login com:', { username, password });
    
    const success = await login(username, password);
    console.log('Resultado do login:', success);
    
    if (!success) {
      setError('Credenciais inválidas');
    } else {
      console.log('Login bem-sucedido, redirecionando...');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>USIMAMIZI</h1>
          <p>Sistema de Gestão Empresarial</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Utilizador</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Palavra-passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-btn">
            Entrar
          </button>
        </form>
        
        <div className="login-footer">
          <p>Versão 1.0.0 - React</p>
        </div>
      </div>
    </div>
  );
};

// Componente principal da aplicação - AUTENTICAÇÃO DESATIVADA
const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* AUTENTICAÇÃO DESATIVADA - Acesso direto ao dashboard */}
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/faturas" element={
          <Layout>
            <Faturas />
          </Layout>
        } />
        {/* Redirecionar login para dashboard */}
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/vendas" element={
          <Layout>
            <Vendas />
          </Layout>
        } />
        <Route path="/definicoes" element={
          <Layout>
            <Definicoes />
          </Layout>
        } />
        <Route path="/compras" element={
          <Layout>
            <Compras />
          </Layout>
        } />
        <Route path="/stock" element={
          <Layout>
            <div className="page-placeholder">
              <h1>Stock</h1>
              <p>Módulo de stock em desenvolvimento</p>
            </div>
          </Layout>
        } />
        <Route path="/projetos" element={
          <Layout>
            <div className="page-placeholder">
              <h1>Projetos</h1>
              <p>Módulo de projetos em desenvolvimento</p>
            </div>
          </Layout>
        } />
        <Route path="/guias-remessa" element={
          <Layout>
            <div className="page-placeholder">
              <h1>Guias de Remessa</h1>
              <p>Módulo de guias de remessa em desenvolvimento</p>
            </div>
          </Layout>
        } />
        <Route path="/guias-entrada" element={
          <Layout>
            <div className="page-placeholder">
              <h1>Guias de Entrada</h1>
              <p>Módulo de guias de entrada em desenvolvimento</p>
            </div>
          </Layout>
        } />
        <Route path="/clientes" element={
          <Layout>
            <div className="page-placeholder">
              <h1>Clientes</h1>
              <p>Módulo de clientes em desenvolvimento</p>
            </div>
          </Layout>
        } />
        <Route path="/relatorios" element={
          <Layout>
            <div className="page-placeholder">
              <h1>Relatórios</h1>
              <p>Módulo de relatórios em desenvolvimento</p>
            </div>
          </Layout>
        } />
        <Route path="/configuracoes" element={
          <Layout>
            <div className="page-placeholder">
              <h1>Configurações</h1>
              <p>Módulo de configurações em desenvolvimento</p>
            </div>
          </Layout>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

// App principal com providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;