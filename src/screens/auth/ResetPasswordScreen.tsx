import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BogolanPattern, DjeliaLogo } from '../../components/common/AfricanPattern';
import { colors } from '../../config/colors';
import { useAppContext } from '../../store/AppProvider';
import { getFirebaseAuthErrorMessage, validateEmail } from '../../services/authService';

type Props = NativeStackScreenProps<any, 'ResetPassword'>;

export const ResetPasswordScreen = ({ navigation }: Props) => {
  const { resetPassword } = useAppContext();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setEmailError('');
    setGlobalError('');
    setSuccess(false);

    if (!validateEmail(email)) {
      setEmailError('Veuillez entrer une adresse email valide.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (error: any) {
      const code = error?.code || '';
      setGlobalError(
        code
          ? getFirebaseAuthErrorMessage(code)
          : error?.message || 'Impossible d\'envoyer le lien de réinitialisation.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BogolanPattern opacity={0.04} />

        <View style={styles.header}>
          <DjeliaLogo size={60} />
          <Text style={styles.title}>MÉMOIRE PERDUE</Text>
          <Text style={styles.subtitle}>Retrouvez l’accès à votre cercle</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.instructions}>
            Saisissez l’adresse email associée à votre compte. Nous vous enverrons
            un lien pour choisir un nouveau mot de passe.
          </Text>

          {globalError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{globalError}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBanner}>
              <Text style={styles.successTitle}>Lien envoyé</Text>
              <Text style={styles.successText}>
                Si un compte existe pour {email.trim()}, un email de réinitialisation
                vient d’être envoyé. Pensez à vérifier vos courriers indésirables.
              </Text>
            </View>
          ) : null}

          <TextInput
            label="Adresse email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setEmailError('');
              setGlobalError('');
            }}
            mode="flat"
            style={styles.input}
            activeUnderlineColor={colors.primary}
            underlineColor={colors.border}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            left={<TextInput.Icon icon="email-outline" color={colors.textLight} />}
            error={!!emailError}
          />
          {emailError ? (
            <HelperText type="error" style={styles.helperText}>
              {emailError}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleReset}
            loading={loading}
            disabled={loading}
            style={styles.button}
            labelStyle={styles.buttonText}
            contentStyle={styles.buttonContent}
          >
            ENVOYER LE LIEN
          </Button>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Vous vous en souvenez ?{' '}
              <Text style={styles.linkBold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 36,
    paddingVertical: 60,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: colors.text,
    letterSpacing: 4,
    marginTop: 18,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: colors.textMid,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  instructions: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textMid,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FFF0F0',
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: colors.error,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  successBanner: {
    backgroundColor: colors.surfaceWarm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: colors.primary,
    marginBottom: 4,
  },
  successText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.textMid,
    lineHeight: 20,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 6,
    fontSize: 15,
  },
  helperText: {
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginTop: 12,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 2,
    fontSize: 13,
  },
  backLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    color: colors.textMid,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  linkBold: {
    color: colors.primary,
    fontFamily: 'Poppins_700Bold',
    textDecorationLine: 'underline',
  },
});
