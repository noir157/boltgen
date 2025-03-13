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
}

export class AccountManager {
  private baseUrl: string;

  constructor() {
    // Usar a URL do Railway aqui
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://seu-app.railway.app';
  }

  async createAndConfirmAccount(): Promise<AccountResponse> {
    try {
      log('Sending request to create account...');
      const response = await axios.post<AccountResponse>(`${this.baseUrl}/api/create-account`);
      
      if (response.data.success && response.data.accountInfo) {
        log('Account created successfully!', 'success');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to create account');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Error creating account: ${errorMessage}`, 'error');
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  async checkServerStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/status`);
      return response.data.status === 'online';
    } catch (error) {
      log('Server status check failed', 'error');
      return false;
    }
  }
}
