import axios from 'axios';
import { log } from '../utils/helpers';

interface AccountResponse {
  success: boolean;
  accountInfo?: {
    email: string;
    username: string;
    password: string;
    confirmed: boolean;
  };
  error?: string;
  diagnostic?: boolean;
}

export class AccountManager {
  private baseUrl: string;

  constructor() {
    // Remover trailing slash se existir
    const apiUrl = import.meta.env.VITE_API_URL || 'https://seu-app-railway.up.railway.app';
    this.baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    console.log('API Base URL:', this.baseUrl);
  }

  async checkServerStatus(): Promise<boolean> {
    const url = `${this.baseUrl}/api/status`;
    console.log('Verificando status do servidor em:', url);
    
    try {
      // Primeiro tente com fetch para evitar problemas de CORS
      console.log('Tentando verificar status com fetch API...');
      const fetchResponse = await fetch(url, { 
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!fetchResponse.ok) {
        throw new Error(`Status code: ${fetchResponse.status}`);
      }
      
      const data = await fetchResponse.json();
      console.log('Resposta do servidor (Fetch):', data);
      return data && data.status === 'online';
    } catch (fetchError) {
      console.error('Erro Fetch:', fetchError);
      
      // Se falhar com fetch, tente com Axios
      try {
        console.log('Tentando com Axios...');
        const response = await axios.get(url, { 
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Resposta do servidor (Axios):', response.data);
        return response.data && response.data.status === 'online';
      } catch (axiosError) {
        console.error('Erro Axios:', axiosError);
        
        // Última tentativa: verificar a rota de healthcheck
        try {
          console.log('Tentando rota de healthcheck...');
          const healthResponse = await fetch(`${this.baseUrl}/api/healthcheck`);
          const healthData = await healthResponse.json();
          console.log('Resposta healthcheck:', healthData);
          return healthData && healthData.status === 'ok';
        } catch (healthError) {
          console.error('Erro healthcheck:', healthError);
          return false;
        }
      }
    }
  }

  async testCors(): Promise<boolean> {
    try {
      console.log('Testando configuração CORS...');
      const response = await fetch(`${this.baseUrl}/api/cors-test`);
      const data = await response.json();
      console.log('Resposta do teste CORS:', data);
      return data && data.success === true;
    } catch (error) {
      console.error('Erro no teste CORS:', error);
      return false;
    }
  }
  
  async createAndConfirmAccount(): Promise<AccountResponse> {
    try {
      log('Enviando solicitação para criar conta...');
      console.log('URL da API:', `${this.baseUrl}/api/create-account`);
      
      // Testar CORS antes
      await this.testCors();
      
      // Usar fetch em vez de axios para evitar problemas de CORS
      const response = await fetch(`${this.baseUrl}/api/create-account`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Resposta completa do servidor:', data);
      
      if (data.success && data.accountInfo) {
        log('Conta criada com sucesso!', 'success');
        return data;
      } else {
        throw new Error(data.error || 'Falha ao criar conta');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      log(`Erro ao criar conta: ${errorMessage}`, 'error');
      console.error('Detalhes do erro:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}
