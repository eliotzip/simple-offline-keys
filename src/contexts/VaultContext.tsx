import React, { createContext, useContext, useState, useCallback } from 'react';
import { VaultCrypto, VaultData, VaultEntry, VaultFolder } from '@/lib/crypto';

interface VaultContextType {
  isUnlocked: boolean;
  data: VaultData | null;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  saveEntry: (entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateEntry: (id: string, entry: Partial<VaultEntry>) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  createFolder: (name: string) => Promise<boolean>;
  updateFolder: (id: string, name: string) => Promise<boolean>;
  deleteFolder: (id: string) => Promise<boolean>;
  reorderEntries: (entries: VaultEntry[]) => Promise<boolean>;
  reorderFolders: (folders: VaultFolder[]) => Promise<boolean>;
  moveEntryToFolder: (entryId: string, folderId?: string) => Promise<boolean>;
  currentPin: string;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [data, setData] = useState<VaultData | null>(null);
  const [currentPin, setCurrentPin] = useState('');

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    if (!VaultCrypto.vaultExists()) {
      const success = await VaultCrypto.initializeVault(pin);
      if (!success) return false;
    }

    const vaultData = await VaultCrypto.unlockVault(pin);
    if (vaultData) {
      setData(vaultData);
      setCurrentPin(pin);
      setIsUnlocked(true);
      return true;
    }
    return false;
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    setData(null);
    setCurrentPin('');
  }, []);

  const saveVaultData = useCallback(async (newData: VaultData): Promise<boolean> => {
    if (!currentPin) return false;
    
    const success = await VaultCrypto.saveVault(newData, currentPin);
    if (success) {
      setData(newData);
    }
    return success;
  }, [currentPin]);

  const saveEntry = useCallback(async (entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    if (!data) return false;

    const now = new Date().toISOString();
    const maxOrder = Math.max(...data.entries.map(e => e.order), -1);
    
    const newEntry: VaultEntry = {
      ...entry,
      id: VaultCrypto.generateId(),
      createdAt: now,
      updatedAt: now,
      order: maxOrder + 1,
    };

    const newData = {
      ...data,
      entries: [...data.entries, newEntry],
    };

    return saveVaultData(newData);
  }, [data, saveVaultData]);

  const updateEntry = useCallback(async (id: string, updates: Partial<VaultEntry>): Promise<boolean> => {
    if (!data) return false;

    const newData = {
      ...data,
      entries: data.entries.map(entry =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      ),
    };

    return saveVaultData(newData);
  }, [data, saveVaultData]);

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    if (!data) return false;

    const newData = {
      ...data,
      entries: data.entries.filter(entry => entry.id !== id),
    };

    return saveVaultData(newData);
  }, [data, saveVaultData]);

  const createFolder = useCallback(async (name: string): Promise<boolean> => {
    if (!data) return false;

    const maxOrder = Math.max(...data.folders.map(f => f.order), -1);
    
    const newFolder: VaultFolder = {
      id: VaultCrypto.generateId(),
      name,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };

    const newData = {
      ...data,
      folders: [...data.folders, newFolder],
    };

    return saveVaultData(newData);
  }, [data, saveVaultData]);

  const updateFolder = useCallback(async (id: string, name: string): Promise<boolean> => {
    if (!data) return false;

    const newData = {
      ...data,
      folders: data.folders.map(folder =>
        folder.id === id ? { ...folder, name } : folder
      ),
    };

    return saveVaultData(newData);
  }, [data, saveVaultData]);

  const deleteFolder = useCallback(async (id: string): Promise<boolean> => {
    if (!data) return false;

    const newData = {
      ...data,
      folders: data.folders.filter(folder => folder.id !== id),
      entries: data.entries.map(entry =>
        entry.folderId === id ? { ...entry, folderId: undefined } : entry
      ),
    };

    return saveVaultData(newData);
  }, [data, saveVaultData]);

  const reorderEntries = useCallback(async (entries: VaultEntry[]): Promise<boolean> => {
    if (!data) return false;

    const newData = {
      ...data,
      entries: entries.map((entry, index) => ({ ...entry, order: index })),
    };

    return saveVaultData(newData);
  }, [data, saveVaultData]);

  const reorderFolders = useCallback(async (folders: VaultFolder[]): Promise<boolean> => {
    if (!data) return false;

    const newData = {
      ...data,
      folders: folders.map((folder, index) => ({ ...folder, order: index })),
    };

    return saveVaultData(newData);
  }, [data, saveVaultData]);

  const moveEntryToFolder = useCallback(async (entryId: string, folderId?: string): Promise<boolean> => {
    if (!data) return false;

    const newData = {
      ...data,
      entries: data.entries.map(entry =>
        entry.id === entryId
          ? { ...entry, folderId, updatedAt: new Date().toISOString() }
          : entry
      ),
    };

    return saveVaultData(newData);
  }, [data, saveVaultData]);

  const value: VaultContextType = {
    isUnlocked,
    data,
    unlock,
    lock,
    saveEntry,
    updateEntry,
    deleteEntry,
    createFolder,
    updateFolder,
    deleteFolder,
    reorderEntries,
    reorderFolders,
    moveEntryToFolder,
    currentPin,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
};