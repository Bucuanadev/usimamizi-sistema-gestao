// =====================================================
// COMPONENTE DE LAYOUT PRINCIPAL
// =====================================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faShoppingCart, 
  faFileInvoice, 
  faProjectDiagram, 
  faWarehouse,
  faTruck,
  faBoxOpen,
  faUsers,
  faChartLine,
  faCog,
  faBars,
  faTimes,
  faCalculator,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: faHome, label: 'Dashboard' },
    { path: '/vendas', icon: faChartLine, label: 'Vendas' },
    { path: '/faturas', icon: faFileInvoice, label: 'Faturação' },
    { path: '/compras', icon: faShoppingCart, label: 'Compras' },
    { path: '/projetos', icon: faProjectDiagram, label: 'Projetos' },
    { path: '/contabilidade', icon: faCalculator, label: 'Contabilidade' },
    { path: '/rh', icon: faUsers, label: 'Recursos Humanos' },
    { path: '/calendario', icon: faCalendarAlt, label: 'Calendário' },
    { path: '/definicoes', icon: faCog, label: 'Definições' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <h2>USIMAMIZI</h2>
            <span>ERP System</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <FontAwesomeIcon icon={item.icon} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.username || 'Usuário'}</span>
              <span className="user-role">{user?.role || 'Admin'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <FontAwesomeIcon icon={faTimes} />
            Sair
          </button>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="main-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          
          <div className="header-title">
            <h1>
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="header-actions">
            <div className="user-menu">
              <span>Bem-vindo, {user?.username || 'Usuário'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
