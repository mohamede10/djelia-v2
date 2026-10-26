import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { TextInput, Text, Button, HelperText } from 'react-native-paper';
import { colors } from '../../config/colors';
import { BogolanPattern, DjeliaLogo } from '../../components/common/AfricanPattern';
import { useAppContext } from '../../store/AppProvider';
import { getFirebaseAuthErrorMessage, validatePassword } from '../../services/authService';
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons';

export const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const { signup, isLoading } = useAppContext();

  const handleSignup = async () => {
    setNameError('');
    setEmailError('');
    setPassError('');
    setGlobalError('');

    if (!name.trim() || name.trim().length < 2) {
      setNameError('Veuillez entrer votre nom complet (minimum 2 caractères).');
      return;
    }
    if (!email.trim()) {
      setEmailError('Veuillez entrer votre adresse email.');
      return;
    }
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setPassError(passCheck.message || 'Mot de passe invalide.');
      return;
    }

    try {
      await signup(name.trim(), email.trim(), password);
    } catch (error: any) {
      const code = error?.code || '';
      const message = code
        ? getFirebaseAuthErrorMessage(code)
        : error?.message || 'Erreur lors de la création du compte.';
      setGlobalError(message);
    }
  };

  // Calculer la force du mot de passe en temps réel
  const getPasswordStrength = (): { label: string; color: string; width: string } => {
    if (!password) return { label: '', color: 'transparent', width: '0%' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score === 1) return { label: 'Faible', color: colors.error, width: '25%' };
    if (score === 2) return { label: 'Moyen', color: colors.gold, width: '50%' };
    if (score === 3) return { label: 'Bon', color: colors.primaryLight, width: '75%' };
    if (score === 4) return { label: 'Fort', color: colors.primary, width: '100%' };
    return { label: '', color: 'transparent', width: '0%' };
  };

  const strength = getPasswordStrength();

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BogolanPattern opacity={0.04} />

        <View style={styles.header}>
          <DjeliaLogo size={60} />
          <Text style={styles.title}>DJELIA</Text>
          <Text style={styles.subtitle}>Rejoignez le cercle des initiés</Text>
        </View>

        <View style={styles.form}>
          {globalError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{globalError}</Text>
            </View>
          ) : null}

          {/* Nom complet */}
          <TextInput
            label="Nom complet"
            value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            mode="flat"
            style={styles.input}
            activeUnderlineColor={colors.primary}
            underlineColor={colors.border}
            autoCapitalize="words"
            left={<TextInput.Icon icon="account-outline" color={colors.textLight} />}
            error={!!nameError}
          />
          {nameError ? <HelperText type="error" style={styles.helperText}>{nameError}</HelperText> : null}

          {/* Email */}
          <TextInput
            label="Adresse email"
            value={email}
            onChangeText={(v) => { setEmail(v); setEmailError(''); }}
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
          {emailError ? <HelperText type="error" style={styles.helperText}>{emailError}</HelperText> : null}

          {/* Mot de passe */}
          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={(v) => { setPassword(v); setPassError(''); }}
            mode="flat"
            style={styles.input}
            activeUnderlineColor={colors.primary}
            underlineColor={colors.border}
            secureTextEntry={!passwordVisible}
            autoComplete="new-password"
            left={<TextInput.Icon icon="lock-outline" color={colors.textLight} />}
            right={
              <TextInput.Icon 
                icon={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                color={colors.textLight}
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
            error={!!passError}
          />
          {passError ? <HelperText type="error" style={styles.helperText}>{passError}</HelperText> : null}

          {/* Barre de force du mot de passe */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View style={[styles.strengthFill, { width: strength.width as any, backgroundColor: strength.color }]} />
              </View>
              {strength.label ? (
                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              ) : null}
            </View>
          )}

          {/* Règles du mot de passe */}
          <View style={styles.rulesBox}>
            {[
              { label: '8 caractères minimum', ok: password.length >= 8 },
              { label: '1 majuscule (A-Z)', ok: /[A-Z]/.test(password) },
              { label: '1 chiffre (0-9)', ok: /[0-9]/.test(password) },
              { label: '1 caractère spécial (!@#...)', ok: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
            ].map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <Text style={{ color: rule.ok ? colors.primary : colors.textLight, fontSize: 12, marginRight: 6 }}>
                  {rule.ok ? '✓' : '○'}
                </Text>
                <Text style={[styles.ruleText, rule.ok && styles.ruleOk]}>{rule.label}</Text>
              </View>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleSignup}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={styles.buttonText}
            contentStyle={styles.buttonContent}
          >
            CRÉER MON COMPTE
          </Button>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continuer avec</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialAuthButtons />

          <TouchableOpacity
            style={[styles.loginLink, styles.loginLinkSpaced]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Revenir à la connexion"
          >
            <Text style={styles.linkText}>
              Déjà un compte ?{' '}
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
    paddingVertical: 50,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
    color: colors.text,
    letterSpacing: 10,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: colors.textMid,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  form: {
    width: '100%',
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
  input: {
    backgroundColor: 'transparent',
    marginBottom: 4,
    fontSize: 15,
  },
  helperText: {
    fontFamily: 'Poppins_400Regular',
    marginBottom: 8,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  rulesBox: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    gap: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  ruleOk: {
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 2,
    fontSize: 13,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 14,
    color: colors.textLight,
    fontFamily: 'Poppins_300Light',
    fontSize: 13,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginLinkSpaced: {
    marginTop: 32,
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
