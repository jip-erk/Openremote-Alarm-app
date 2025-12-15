// ==============================
// MOCK ONLY - STORAGE SERVICE
// ==============================

export type StorageType = "local" | "session";

class MockStorageService {
  private storageType: StorageType = "local";

  constructor(type: StorageType = "local") {
    this.storageType = type;
  }

  private get storage(): Storage {
    if (typeof window === "undefined") {
      return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };
    }
    return this.storageType === "session" ? sessionStorage : localStorage;
  }

  setStorageType(type: StorageType) {
    this.storageType = type;
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error("MockStorageService get error", e);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("MockStorageService set error", e);
      // Handle quota exceeded or other errors
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        alert("Storage quota exceeded. Cannot save mock data.");
      }
    }
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }
}

export const mockStorage = new MockStorageService();
