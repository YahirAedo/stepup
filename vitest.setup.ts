import { createHash } from 'node:crypto';
import { vi } from 'vitest';

vi.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: {
    SHA1: 'SHA-1',
    SHA256: 'SHA-256',
    SHA384: 'SHA-384',
    SHA512: 'SHA-512',
    MD2: 'MD2',
    MD4: 'MD4',
    MD5: 'MD5',
  },
  digestStringAsync: async (algorithm: string, data: string): Promise<string> => {
    const nodeAlgorithm: Record<string, string> = {
      'SHA-1': 'sha1',
      'SHA-256': 'sha256',
      'SHA-384': 'sha384',
      'SHA-512': 'sha512',
      MD2: 'md2',
      MD4: 'md4',
      MD5: 'md5',
    };
    return createHash(nodeAlgorithm[algorithm] ?? 'sha256').update(data).digest('hex');
  },
}));