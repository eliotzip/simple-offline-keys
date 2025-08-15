import CryptoJS from 'crypto-js';

export interface VaultEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website?: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface VaultFolder {
  id: string;
  name: string;
  order: number;
  createdAt: string;
}

export interface VaultData {
  entries: VaultEntry[];
  folders: VaultFolder[];
}

const STORAGE_KEY = 'offlinevault_data';
const SALT_KEY = 'offlinevault_salt';

export class VaultCrypto {
  private static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  private static deriveKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
  }

  static async initializeVault(pin: string): Promise<boolean> {
    try {
      const salt = this.generateSalt();
      const key = this.deriveKey(pin, salt);
      
      // Store auth type for later detection
      const authType = /^\d+$/.test(pin) ? 'pin' : 'password';
      localStorage.setItem('vault-auth-type', authType);
      
      const initialData: VaultData = {
        entries: [],
        folders: []
      };

      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(initialData), key).toString();
      
      localStorage.setItem(STORAGE_KEY, encrypted);
      localStorage.setItem(SALT_KEY, salt);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize vault:', error);
      return false;
    }
  }

  static getAuthType(): 'pin' | 'password' | null {
    return localStorage.getItem('vault-auth-type') as 'pin' | 'password' | null;
  }

  static async unlockVault(pin: string): Promise<VaultData | null> {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      const salt = localStorage.getItem(SALT_KEY);
      
      if (!encrypted || !salt) {
        return null;
      }

      const key = this.deriveKey(pin, salt);
      const decrypted = CryptoJS.AES.decrypt(encrypted, key);
      const data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      
      return data as VaultData;
    } catch (error) {
      console.error('Failed to unlock vault:', error);
      return null;
    }
  }

  static async saveVault(data: VaultData, pin: string): Promise<boolean> {
    try {
      const salt = localStorage.getItem(SALT_KEY);
      if (!salt) {
        throw new Error('No salt found');
      }

      const key = this.deriveKey(pin, salt);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
      
      localStorage.setItem(STORAGE_KEY, encrypted);
      return true;
    } catch (error) {
      console.error('Failed to save vault:', error);
      return false;
    }
  }

  static vaultExists(): boolean {
    return !!localStorage.getItem(STORAGE_KEY) && !!localStorage.getItem(SALT_KEY);
  }

  static clearVault(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SALT_KEY);
  }

  static generateId(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};