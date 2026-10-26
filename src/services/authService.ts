import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  preferredLanguages?: string[];
  role?: 'user' | 'admin' | 'griot';
  createdAt?: any;
};

// Règles de validation conformes au cahier des charges Djelia
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une lettre majuscule.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre.' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%...).' };
  }
  return { valid: true };
};

// Traduction des erreurs Firebase en français compréhensible
export const getFirebaseAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà associée à un compte existant.';
    case 'auth/invalid-email':
      return 'Format d\'adresse email invalide.';
    case 'auth/operation-not-allowed':
      return 'L\'authentification par email/mot de passe n\'est pas activée sur Firebase.';
    case 'auth/weak-password':
      return 'Le mot de passe est trop faible.';
    case 'auth/user-disabled':
      return 'Ce compte utilisateur a été désactivé.';
    case 'auth/user-not-found':
      return 'Aucun compte associé à cette adresse email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Identifiants incorrects. Vérifiez votre email et mot de passe.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives infructueuses. Veuillez réessayer dans quelques minutes.';
    case 'auth/network-request-failed':
      return 'Problème de connexion réseau. Vérifiez votre accès internet.';
    default:
      return 'Une erreur est survenue lors de l\'authentification. Veuillez réessayer.';
  }
};

/**
 * Création d'un nouveau compte avec Firebase Auth et enregistrement dans Firestore
 */
export const registerUser = async (name: string, email: string, pass: string): Promise<UserProfile> => {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName || trimmedName.length < 2) {
    throw new Error('Veuillez renseigner un nom complet valide (minimum 2 caractères).');
  }

  if (!validateEmail(trimmedEmail)) {
    throw new Error('Veuillez entrer une adresse email valide.');
  }

  const passCheck = validatePassword(pass);
  if (!passCheck.valid) {
    throw new Error(passCheck.message);
  }

  // Si Firebase est configuré avec un vrai projet
  if (isFirebaseConfigured) {
    const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
    const fbUser = userCredential.user;

    // Mise à jour du nom d'affichage Auth
    await updateProfile(fbUser, { displayName: trimmedName });

    // Création du profil document dans Firestore
    const profile: UserProfile = {
      id: fbUser.uid,
      name: trimmedName,
      email: trimmedEmail,
      preferredLanguages: ['Mandingue', 'Pular', 'Soussou'],
      role: 'user',
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', fbUser.uid), profile);
    return profile;
  } else {
    // Mode hors-ligne / fallback local de démonstration si Firebase n'a pas encore de clés renseignées.
    // L'identifiant reste stable pour conserver les favoris et le profil locaux.
    return {
      id: 'local_user',
      name: trimmedName,
      email: trimmedEmail,
      preferredLanguages: ['Mandingue', 'Pular', 'Soussou'],
      role: 'user',
    };
  }
};

/**
 * Connexion utilisateur
 */
export const loginUser = async (email: string, pass: string): Promise<UserProfile> => {
  const trimmedEmail = email.trim();

  if (!validateEmail(trimmedEmail)) {
    throw new Error('Veuillez entrer une adresse email valide.');
  }
  if (!pass) {
    throw new Error('Veuillez entrer votre mot de passe.');
  }

  if (isFirebaseConfigured) {
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
    const fbUser = userCredential.user;

    // Récupérer le profil dans Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || 'Utilisateur Djelia',
        email: fbUser.email || trimmedEmail,
        photoUrl: data.photoUrl || fbUser.photoURL || undefined,
        preferredLanguages: data.preferredLanguages || ['Mandingue', 'Pular', 'Soussou'],
        role: data.role || 'user',
      };
    } else {
      // Profil de secours si le document n'a pas encore été créé
      const newProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || trimmedEmail.split('@')[0],
        email: fbUser.email || trimmedEmail,
        preferredLanguages: ['Mandingue', 'Pular', 'Soussou'],
        role: 'user',
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } else {
    // Fallback local
    return {
      id: 'local_user',
      name: trimmedEmail.split('@')[0] || 'Voyageur Djelia',
      email: trimmedEmail,
      preferredLanguages: ['Mandingue', 'Pular', 'Soussou'],
      role: 'user',
    };
  }
};

/**
 * Déconnexion
 */
export const logoutUser = async (): Promise<void> => {
  if (isFirebaseConfigured) {
    await signOut(auth);
  }
};

/**
 * Réinitialisation du mot de passe
 */
export const resetUserPassword = async (email: string): Promise<void> => {
  const trimmedEmail = email.trim();
  if (!validateEmail(trimmedEmail)) {
    throw new Error('Veuillez renseigner une adresse email valide pour recevoir le lien de réinitialisation.');
  }

  if (isFirebaseConfigured) {
    await sendPasswordResetEmail(auth, trimmedEmail);
  }
};

/**
 * Récupération du profil utilisateur depuis Firestore
 */
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!isFirebaseConfigured || !uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: uid,
      name: data.name || 'Utilisateur Djelia',
      email: data.email || '',
      photoUrl: data.photoUrl || undefined,
      preferredLanguages: data.preferredLanguages || ['Mandingue', 'Pular', 'Soussou'],
      role: data.role || 'user',
      createdAt: data.createdAt,
    };
  } catch (e) {
    console.warn('Fetch user profile error:', e);
    return null;
  }
};

/**
 * Mise à jour du profil utilisateur
 */
export const updateUserProfileData = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  if (isFirebaseConfigured && uid && !uid.startsWith('local_')) {
    const userRef = doc(db, 'users', uid);
    const definedFields = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );
    // `setDoc` + merge évite l'échec si le document n'a pas encore été créé
    // (connexion OAuth, profil incomplet, etc.).
    await setDoc(
      userRef,
      { ...definedFields, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }
};
