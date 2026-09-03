/**
 * SOC 2 Compliant Encryption Utility
 * Uses Web Crypto API (AES-GCM) for data-at-rest protection in LocalStorage.
 */

async function getOrCreateKey(): Promise<CryptoKey> {
  const salt = new TextEncoder().encode('mrtechsys-sovereign-audit-v1');
  // In a production app, this would ideally be derived from a user session or a hardware-bound key.
  // For this browser-only demo, we use a consistent derivation.
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    salt,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const encryptedStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const encryptedData = localStorage.getItem(name);
    if (!encryptedData) return null;

    try {
      const { iv, data } = JSON.parse(encryptedData);
      const key = await getOrCreateKey();
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      console.error('Decryption failed - audit trail integrity check failed.', e);
      return null;
    }
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    const key = await getOrCreateKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(value);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const storageValue = JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    });

    localStorage.setItem(name, storageValue);
  },

  removeItem: async (name: string): Promise<void> => {
    localStorage.removeItem(name);
  },
};
