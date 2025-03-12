import axios from 'axios';
import { log, delay } from '../utils/helpers';

export class TempEmailService {
  private baseUrl: string;
  private account: { email: string; password: string } | null;
  private token: string | null;

  constructor() {
    this.baseUrl = 'https://api.mail.tm';
    this.account = null;
    this.token = null;
  }

  async createAccount() {
    try {
      log('Obtaining available domains...');
      const domainsResponse = await axios.get(`${this.baseUrl}/domains`);
      const domain = domainsResponse.data["hydra:member"][0].domain;

      const username = `user${Math.floor(Math.random() * 100000)}${Date.now().toString().slice(-4)}`;
      const password = `pass${Math.random().toString(36).substring(2, 10)}`;
      const email = `${username}@${domain}`;

      log(`Creating account with email: ${email}`);
      await axios.post(`${this.baseUrl}/accounts`, {
        address: email,
        password: password
      });

      log('Getting access token...');
      const tokenResponse = await axios.post(`${this.baseUrl}/token`, {
        address: email,
        password: password
      });

      this.account = { email, password };
      this.token = tokenResponse.data.token;

      log(`Temporary email created: ${email}`, 'success');
      return this.account;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log('Error creating temporary email: ' + errorMessage, 'error');
      throw new Error(`Failed to create temporary email: ${errorMessage}`);
    }
  }

  async checkInbox(maxAttempts = 30, delaySeconds = 5) {
    if (!this.token) {
      throw new Error('Account must be created before checking inbox');
    }

    log(`Checking emails for ${this.account?.email}...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      log(`Attempt ${attempt}/${maxAttempts} to check emails...`);

      try {
        const response = await axios.get(`${this.baseUrl}/messages`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });

        const messages = response.data["hydra:member"];

        if (messages && messages.length > 0) {
          log(`${messages.length} email(s) found!`, 'success');
          return messages;
        }

        await delay(delaySeconds * 1000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log('Error checking emails: ' + errorMessage, 'warn');
        await delay(delaySeconds * 1000);
      }
    }

    log('Timeout exceeded. No emails received.', 'error');
    return [];
  }

  async getMessageDetails(messageId: string) {
    if (!this.token) {
      throw new Error('Account must be created before reading messages');
    }

    try {
      log(`Getting message details ${messageId}...`);
      const response = await axios.get(`${this.baseUrl}/messages/${messageId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      const messageData = response.data;

      log('Email response structure:');
      log(`- Has HTML: ${Boolean(messageData.html)}`);
      log(`- Has text: ${Boolean(messageData.text)}`);

      if (!messageData.html && !messageData.text) {
        log('Non-standard email format. Analyzing structure...', 'warn');
        log('Available properties: ' + Object.keys(messageData).join(', '));
      }

      return messageData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Error getting message details ${messageId}: ${errorMessage}`, 'error');
      throw error;
    }
  }
}