import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, isFirebaseConfigured, storage } from '../config/firebase';

/**
 * Gestion de la photo de profil.
 *
 * - L'image est d'abord redimensionnée et compressée (480 px, JPEG) pour
 *   rester légère, conformément au cahier des charges (< 500 Ko).
 * - Firebase configuré : la photo est envoyée dans Storage
 *   (`users/{userId}/avatar_<timestamp>.jpg`) et l'URL publique est conservée
 *   dans le profil Firestore.
 * - Mode démo : la photo est copiée dans le dossier de documents de
 *   l'application (mobile) ou stockée en data URI compressée (web), puis
 *   enregistrée avec le profil local. Elle survit donc au rechargement.
 */

const AVATAR_DIRECTORY = `${FileSystem.documentDirectory ?? ''}avatars/`;
const MAX_DIMENSION = 480;

type PreparedAvatar = {
  uri: string;
  mimeType: string;
  base64?: string;
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
 * Redimensionne et compresse l'image. En cas d'échec du module natif, on
 * utilise l'image d'origine (la galerie a déjà appliqué un recadrage carré).
 */
const prepareAvatar = async (
  asset: ImagePicker.ImagePickerAsset
): Promise<PreparedAvatar> => {
  try {
    const context = ImageManipulator.manipulate(asset.uri);
    context.resize({ width: MAX_DIMENSION });
    const image = await context.renderAsync();
    const saved = await image.saveAsync({
      compress: 0.7,
      format: SaveFormat.JPEG,
      base64: Platform.OS === 'web',
    });

    return {
      uri: saved.uri,
      mimeType: 'image/jpeg',
      base64: saved.base64 ?? undefined,
    };
  } catch (error) {
    console.warn('Avatar compression failed, using original image:', error);
    return {
      uri: asset.uri,
      mimeType: asset.mimeType || 'image/jpeg',
      base64: asset.base64 ?? undefined,
    };
  }
};

/**
 * Compresse et recadre une image en carré directement dans le navigateur.
 * Filet de sécurité si la manipulation native n'est pas disponible sur le web.
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

const readImageBytes = async (uri: string): Promise<Uint8Array> => {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    return new Uint8Array(await response.arrayBuffer());
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
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
    quality: 0.8,
    base64: false,
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
  const prepared = await prepareAvatar(asset);
  const authenticatedUserId = auth.currentUser?.uid;

  if (
    isFirebaseConfigured &&
    storage &&
    authenticatedUserId &&
    userId &&
    !userId.startsWith('local_')
  ) {
    try {
      const bytes = await readImageBytes(prepared.uri);
      const storageRef = ref(storage, `users/${userId}/avatar_${Date.now()}.jpg`);
      await uploadBytes(storageRef, bytes, {
        contentType: prepared.mimeType,
      });
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.warn('Avatar upload failed, falling back to local storage:', error);
    }
  }

  if (Platform.OS === 'web') {
    const dataUri = prepared.base64
      ? `data:image/jpeg;base64,${prepared.base64}`
      : prepared.uri;
    return compressDataUriForWeb(dataUri);
  }

  await FileSystem.makeDirectoryAsync(AVATAR_DIRECTORY, {
    intermediates: true,
  }).catch(() => {
    // Le dossier existe déjà : rien à faire.
  });

  const destination = `${AVATAR_DIRECTORY}avatar_${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: prepared.uri, to: destination });
  return destination;
};
