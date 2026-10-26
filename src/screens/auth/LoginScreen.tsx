import React, { useState } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  View,
} from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { BogolanPattern, DjeliaLogo } from '../../components/common/AfricanPattern';
import { colors } from '../../config/colors';
import { useAppContext } from '../../store/AppProvider';
import { getFirebaseAuthErrorMessage } from '../../services/authService';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const { login, isLoading } = useAppContext();

  const handleLogin = async () => {
    setEmailError('');
    setGlobalError('');

    if (!email.trim()) {
      setEmailError('Veuillez entrer votre adresse email.');
      return;
    }
    if (!password) {
      setGlobalError('Veuillez entrer votre mot de passe.');
      return;
    }

    try {
      await login(email, password);
    } catch (error: any) {
      const code = error?.code || '';
      const message = code
        ? getFirebaseAuthErrorMessage(code)
        : error?.message || 'Erreur de connexion.';
      setGlobalError(message);
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
          <DjeliaLogo size={70} />
          <Text style={styles.title}>DJELIA</Text>
          <Text style={styles.subtitle}>Connectez-vous à la mémoire</Text>
        </View>

        <View style={styles.form}>
          {/* Message d'erreur global */}
          {globalError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{globalError}</Text>
            </View>
          ) : null}

          <TextInput
            label="Adresse email"
            value={email}
            onChangeText={(v) => { setEmail(v); setEmailError(''); setGlobalError(''); }}
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

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={(v) => { setPassword(v); setGlobalError(''); }}
            mode="flat"
            style={styles.input}
            activeUnderlineColor={colors.primary}
            underlineColor={colors.border}
            secureTextEntry={!passwordVisible}
            autoComplete="password"
            left={<TextInput.Icon icon="lock-outline" color={colors.textLight} />}
            right={
              <TextInput.Icon 
                icon={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                color={colors.textLight}
                onPress={() => setPasswordVisible(!passwordVisible)} 
              />
            }
          />

          <TouchableOpacity 
            style={styles.forgotLink} 
            onPress={() => navigation.navigate('ResetPassword')}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={styles.buttonText}
            contentStyle={styles.buttonContent}
          >
            SE CONNECTER
          </Button>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.linkText}>
              Pas encore de compte ?{' '}
              <Text style={styles.linkBold}>Rejoindre le cercle</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Gardons vivante la mémoire de l’Afrique</Text>
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
    marginBottom: 50,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
    color: colors.text,
    letterSpacing: 10,
    marginTop: 18,
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
    marginBottom: 6,
    fontSize: 15,
  },
  helperText: {
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 8,
  },
  forgotText: {
    color: colors.primary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 4,
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
    marginVertical: 28,
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
  signupLink: {
    alignItems: 'center',
    marginTop: 4,
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
  footer: {
    textAlign: 'center',
    color: colors.textLight,
    fontFamily: 'Poppins_300Light',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 50,
    textTransform: 'uppercase',
  },
});
