/**
 * M-PESA Daraja API integration service
 */

// Daraja API endpoints
const ENDPOINTS = {
  OAUTH_TOKEN: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  STK_PUSH: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
  TRANSACTION_STATUS: 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query',
  CALLBACK_URL: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback` : 'https://serviceconnect.co.ke/api/mpesa/callback'
};

// Default business shortcode for sandbox
const BUSINESS_SHORTCODE = '174379'; // Lipa Na M-Pesa Sandbox shortcode
const PASSKEY = process.env.MPESA_PASSKEY || '';
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';

export class DarajaAPI {
  /**
   * Get OAuth token for Daraja API authentication
   */
  static async getAuthToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
      
      const response = await fetch(ENDPOINTS.OAUTH_TOKEN, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Daraja API Auth Error:', errorText);
        throw new Error(`Failed to get auth token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Daraja API auth error:', error);
      throw error;
    }
  }

  /**
   * Generate timestamp for M-PESA API
   */
  static getTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Generate password for STK push
   */
  static generatePassword(timestamp: string): string {
    const buffer = Buffer.from(BUSINESS_SHORTCODE + PASSKEY + timestamp);
    return buffer.toString('base64');
  }

  /**
   * Format phone number to match M-PESA requirements
   * Converts formats like 07XX, 7XX, +254, 254 to 254XXXXXXXXX
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Handle Kenyan phone numbers
    if (digits.length === 9) {
      // Assuming it's like 7XXXXXXXX, add 254 prefix
      return `254${digits}`;
    } else if (digits.length === 10 && digits.startsWith('0')) {
      // Assuming it's like 07XXXXXXXX
      return `254${digits.substring(1)}`;
    } else if (digits.length === 12 && digits.startsWith('254')) {
      // Already formatted
      return digits;
    } else {
      throw new Error('Invalid phone number format');
    }
  }

  /**
   * Initiate STK push to customer's phone
   */
  static async initiateSTKPush(
    phoneNumber: string, 
    amount: number, 
    accountReference: string, 
    transactionDesc: string = 'Payment for service'
  ) {
    try {
      const accessToken = await this.getAuthToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Ensure amount is an integer (M-PESA doesn't accept decimals)
      const intAmount = Math.ceil(amount);
      
      const requestBody = {
        BusinessShortCode: BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: intAmount,
        PartyA: formattedPhone,
        PartyB: BUSINESS_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: ENDPOINTS.CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };
      
      console.log('STK Push request:', requestBody);
      
      const response = await fetch(ENDPOINTS.STK_PUSH, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Daraja API STK Push Error:', errorText);
        throw new Error(`Failed to initiate STK push: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('STK Push response:', data);
      
      return data;
    } catch (error) {
      console.error('Daraja API STK push error:', error);
      throw error;
    }
  }
} 