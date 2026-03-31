const { containsSecretPassword } = require('../src/utils/passwordDetection');

describe('containsSecretPassword', () => {
  it('returns true when secret appears exactly (case-sensitive)', () => {
    expect(containsSecretPassword('The secret is COCOLOCO', 'COCOLOCO')).toBe(true);
  });

  it('returns false when casing does not match', () => {
    expect(containsSecretPassword('The secret is cocoloco', 'COCOLOCO')).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(containsSecretPassword(null, 'COCOLOCO')).toBe(false);
    expect(containsSecretPassword('output', null)).toBe(false);
  });
});
