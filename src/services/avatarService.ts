import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, isFirebaseConfigured, storage } from '../config/firebase';

/**
 * Gestion de la photo de profil.
 *
 * - Firebase configuré : la photo est envoyée dans Storage
 *   (`users/{userId}/avatar_<timestamp>.jpg`) et l'URL publique est conservée
 *   dans le profil Firestore.
 * - Mode démo : la photo est copiée dans le dossier de documents de
 *   l'application (mobile) ou compressée en data URI (web), puis enregistrée
 *   avec le profil local. Elle survit donc au rechargement.
 */

const AVATAR_DIRECTORY = `${FileSystem.documentDirectory ?? ''}avatars/`;
const MAX_DIMENSION = 480;

const extFromMimeType = (mimeType?: string | null): string => {
  if (!mimeType) return 'jpg';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('heic') || mimeType.includes('heif')) return 'heic';
  return 'jpg';
};

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Décode une chaîne base64 en octets, sans dépendre de `atob` (Hermes). */
const base64ToBytes = (input: string): Uint8Array => {
  const clean = input.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let index = 0;

  for (let i = 0; i < clean.length; i += 1) {
    const value = BASE64_ALPHABET.indexOf(clean[i]);
    if (value < 0) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[index] = (buffer >> bits) & 0xff;
      index += 1;
    }
  }

  return bytes.slice(0, index);
};

/**
 * Compresse et recadre une image en carré directement dans le navigateur.
 * Évite de dépasser le quota du localStorage avec une photo de téléphone.
 */
const compressDataUriForWeb = (dataUri: string): Promise<string> =>
  new Promise((resolve) => {
    const browser = globalThis as unknown as {
      document?: any;
      Image?: any;
    };

    if (!browser.document || !browser.Image) {
      resolve(dataUri);
      return;
    }

    const image = new browser.Image();
    image.onload = () => {
      try {
        const canvas = browser.document.createElement('canvas');
        canvas.width = MAX_DIMENSION;
        canvas.height = MAX_DIMENSION;
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(dataUri);
          return;
        }

        const scale = Math.max(
          MAX_DIMENSION / image.width,
          MAX_DIMENSION / image.height
        );
        const width = image.width * scale;
        const height = image.height * scale;

        context.drawImage(
          image,
          (MAX_DIMENSION - width) / 2,
          (MAX_DIMENSION - height) / 2,
          width,
          height
        );

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } catch {
        resolve(dataUri);
      }
    };
    image.onerror = () => resolve(dataUri);
    image.src = dataUri;
  });

const readAssetBytes = async (
  asset: ImagePicker.ImagePickerAsset
): Promise<Uint8Array> => {
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    return new Uint8Array(await response.arrayBuffer());
  }

  const base64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToBytes(base64);
};

/** Ouvre la galerie et retourne l'image choisie (ou null si annulé). */
export const pickAvatarFromLibrary = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error(
        'L’accès à vos photos est nécessaire pour choisir un avatar. Autorisez-le dans les réglages de votre appareil.'
      );
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: Platform.OS === 'web',
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
};

/**
 * Enregistre l'image choisie et retourne l'URL à stocker dans le profil.
 * En cas d'échec du téléversement Firebase, on retombe sur un stockage local.
 */
export const persistAvatar = async (
  asset: ImagePicker.ImagePickerAsset,
  userId: string
): Promise<string> => {
  const authenticatedUserId = auth.currentUser?.uid;

  if (
    isFirebaseConfigured &&
    storage &&
    authenticatedUserId &&
    userId &&
    !userId.startsWith('local_')
  ) {
    try {
      const bytes = await readAssetBytes(asset);
      const extension = extFromMimeType(asset.mimeType);
      const storageRef = ref(
        storage,
        `users/${userId}/avatar_${Date.now()}.${extension}`
      );
      await uploadBytes(storageRef, bytes, {
        contentType: asset.mimeType || 'image/jpeg',
      });
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.warn('Avatar upload failed, falling back to local storage:', error);
    }
  }

  if (Platform.OS === 'web') {
    const dataUri = asset.base64
      ? `data:image/jpeg;base64,${asset.base64}`
      : asset.uri;
    return compressDataUriForWeb(dataUri);
  }

  await FileSystem.makeDirectoryAsync(AVATAR_DIRECTORY, {
    intermediates: true,
  }).catch(() => {
    // Le dossier existe déjà : rien à faire.
  });

  const destination = `${AVATAR_DIRECTORY}avatar_${Date.now()}.${extFromMimeType(
    asset.mimeType
  )}`;
  await FileSystem.copyAsync({ from: asset.uri, to: destination });
  return destination;
};
