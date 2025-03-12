export interface SimpleSecureStorage {
  setStorage(key: string, data: any): Promise<void>;
  getStorage(key: string): Promise<any>;
  removeStorage(key: string): Promise<void>;
}

export const simpleSecureStorage: SimpleSecureStorage; 