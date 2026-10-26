import {
  getFirebaseAuthErrorMessage,
  validateEmail,
  validatePassword,
} from '../authService';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn() },
  FacebookAuthProvider: { credential: jest.fn() },
  signInWithCredential: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  isFirebaseConfigured: false,
}));

describe('validation de l’email', () => {
  it('accepte une adresse valide', () => {
    expect(validateEmail('griot@djelia.gn')).toBe(true);
    expect(validateEmail('  voyageur@example.com  ')).toBe(true);
  });

  it('refuse une adresse invalide', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('griot')).toBe(false);
    expect(validateEmail('griot@djelia')).toBe(false);
    expect(validateEmail('griot @djelia.gn')).toBe(false);
  });
});

describe('validation du mot de passe', () => {
  it('exige au moins 8 caractères', () => {
    const result = validatePassword('Abc1!');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/8 caractères/);
  });

  it('exige une majuscule', () => {
    const result = validatePassword('abc12345!');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/majuscule/);
  });

  it('exige un chiffre', () => {
    const result = validatePassword('Abcdefgh!');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/chiffre/);
  });

  it('exige un caractère spécial', () => {
    const result = validatePassword('Abcdefg1');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/spécial/);
  });

  it('accepte un mot de passe conforme au cahier des charges', () => {
    expect(validatePassword('Djelia2026!').valid).toBe(true);
  });
});

describe('messages d’erreur Firebase', () => {
  it('traduit les codes courants en français', () => {
    expect(getFirebaseAuthErrorMessage('auth/invalid-email')).toMatch(/email/i);
    expect(getFirebaseAuthErrorMessage('auth/user-not-found')).toMatch(/compte/i);
    expect(getFirebaseAuthErrorMessage('auth/wrong-password')).toMatch(/mot de passe/i);
  });

  it('fournit un message générique pour un code inconnu', () => {
    expect(getFirebaseAuthErrorMessage('auth/code-inconnu')).toMatch(/erreur/i);
  });
});
