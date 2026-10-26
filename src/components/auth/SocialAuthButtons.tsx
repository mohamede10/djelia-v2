import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { ResponseType } from 'expo-auth-session';
import { colors } from '../../config/colors';
import { isFirebaseConfigured } from '../../config/firebase';
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  FACEBOOK_APP_ID,
  isFacebookOAuthConfigured,
  isGoogleOAuthConfigured,
} from '../../config/oauth';
import { useAppContext } from '../../store/AppProvider';

const GoogleButton = () => {
  const { loginWithGoogle, isLoading } = useAppContext();
  const [error, setError] = useState('');
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
  });

  const handlePress = async () => {
    setError('');
    if (!request) {
      setError('Connexion Google indisponible. Vérifiez la configuration OAuth.');
      return;
    }
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const idToken = result.params?.id_token;
        if (!idToken) {
          setError('Google n’a pas renvoyé de jeton. Réessayez.');
          return;
        }
        await loginWithGoogle(idToken);
      } else if (result.type === 'error') {
        setError('La connexion Google a échoué. Réessayez.');
      }
    } catch (e: any) {
      setError(e?.message || 'Impossible de se connecter avec Google.');
    }
  };

  return (
    <>
      <SocialButton
        icon="google"
        label="Continuer avec Google"
        onPress={handlePress}
        disabled={isLoading}
        accessibilityLabel="Se connecter avec Google"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );
};

const FacebookButton = () => {
  const { loginWithFacebook, isLoading } = useAppContext();
  const [error, setError] = useState('');
  const [request, , promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    scopes: ['public_profile', 'email'],
    responseType: ResponseType.Token,
  });

  const handlePress = async () => {
    setError('');
    if (!request) {
      setError('Connexion Facebook indisponible. Vérifiez la configuration OAuth.');
      return;
    }
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const accessToken = result.params?.access_token;
        if (!accessToken) {
          setError('Facebook n’a pas renvoyé de jeton. Réessayez.');
          return;
        }
        await loginWithFacebook(accessToken);
      } else if (result.type === 'error') {
        setError('La connexion Facebook a échoué. Réessayez.');
      }
    } catch (e: any) {
      setError(e?.message || 'Impossible de se connecter avec Facebook.');
    }
  };

  return (
    <>
      <SocialButton
        icon="facebook"
        label="Continuer avec Facebook"
        onPress={handlePress}
        disabled={isLoading}
        accessibilityLabel="Se connecter avec Facebook"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );
};

const SocialButton = ({
  icon,
  label,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  icon: 'google' | 'facebook';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
}) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.buttonDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
  >
    <MaterialCommunityIcons name={icon} size={20} color={colors.text} />
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

export const SocialAuthButtons = () => {
  const { loginWithSocialDemo, isLoading } = useAppContext();

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.demoHint}>
          Mode démo : les boutons simulent une connexion sociale locale.
        </Text>
        <SocialButton
          icon="google"
          label="Continuer avec Google"
          onPress={() => loginWithSocialDemo('Google')}
          disabled={isLoading}
          accessibilityLabel="Se connecter avec Google en mode démo"
        />
        <SocialButton
          icon="facebook"
          label="Continuer avec Facebook"
          onPress={() => loginWithSocialDemo('Facebook')}
          disabled={isLoading}
          accessibilityLabel="Se connecter avec Facebook en mode démo"
        />
      </View>
    );
  }

  if (!isGoogleOAuthConfigured && !isFacebookOAuthConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.demoHint}>
          OAuth non configuré. Renseignez les client IDs Google/Facebook dans `.env`.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isGoogleOAuthConfigured ? <GoogleButton /> : null}
      {isFacebookOAuthConfigured ? <FacebookButton /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: 13,
    borderRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: colors.text,
    letterSpacing: 0.5,
  },
  demoHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  error: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.error,
    textAlign: 'center',
  },
});
