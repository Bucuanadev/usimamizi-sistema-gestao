// =====================================================
// HOOK DE AUTENTICAÇÃO
// =====================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import apiService from '../services/api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Verificando autenticação inicial...');
    
    // Verificar se há token salvo no localStorage
    const token = localStorage.getItem('auth_token');
    console.log('Token encontrado:', token);
    
    if (token) {
      // SEMPRE aceitar qualquer token (modo desenvolvimento)
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@usimamizi.co.mz',
        empresa_id: 1,
        role: 'admin'
      };
      
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        token,
      });
      
      console.log('Usuário autenticado automaticamente');
    } else {
      console.log('Nenhum token encontrado, usuário não autenticado');
    }
    
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('Tentativa de login para:', username);
    
    try {
      setLoading(true);
      
      // SEMPRE aceitar qualquer credencial (modo desenvolvimento)
      const mockUser = {
        id: 1,
        username: username,
        email: `${username}@usimamizi.co.mz`,
        empresa_id: 1,
        role: 'admin'
      };
      
      const mockToken = 'dev-token-' + Date.now();
      
      // Simular delay de login
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.setItem('auth_token', mockToken);
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        token: mockToken,
      });
      
      console.log('Login aceito para:', username);
      console.log('Estado de autenticação:', { isAuthenticated: true, user: mockUser });
      
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    apiService.logout();
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
