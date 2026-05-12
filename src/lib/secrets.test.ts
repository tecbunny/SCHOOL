import { describe, expect, it } from '@jest/globals';

import { safeSecretEquals } from './secrets';

describe('safeSecretEquals', () => {
  it('accepts matching non-empty secrets', () => {
    expect(safeSecretEquals('same-secret', 'same-secret')).toBe(true);
  });

  it('rejects missing, different, or differently-sized secrets', () => {
    expect(safeSecretEquals('', 'same-secret')).toBe(false);
    expect(safeSecretEquals(null, 'same-secret')).toBe(false);
    expect(safeSecretEquals('wrong-secret', 'same-secret')).toBe(false);
    expect(safeSecretEquals('short', 'same-secret')).toBe(false);
  });
});
