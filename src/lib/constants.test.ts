import { describe, expect, it } from '@jest/globals';

import { isUserRole } from './constants';

describe('isUserRole', () => {
  it('accepts supported user roles', () => {
    expect(isUserRole('admin')).toBe(true);
    expect(isUserRole('student')).toBe(true);
  });

  it('rejects unknown role values', () => {
    expect(isUserRole('superadmin')).toBe(false);
    expect(isUserRole(null)).toBe(false);
  });
});
