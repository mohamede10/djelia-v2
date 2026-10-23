import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Text, Button } from 'react-native-paper';
import { colors } from '../../config/colors';
import { BogolanPattern, TamTamIcon } from '../../components/common/AfricanPattern';
import { useAppContext } from '../../store/AppProvider';

export const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAppContext();

  const handleSignup = async () => {
    if (email && password && name) await login(email, password);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BogolanPattern opacity={0.05} />
        
        <View style={styles.header}>
          <TamTamIcon size={50} color={colors.primary} />
          <Text style={styles.title}>DJELIA</Text>
          <Text style={styles.subtitle}>Rejoignez le cercle des initiés</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Nom complet"
            value={name}
            onChangeText={setName}
            mode="flat"
            style={styles.input}
            activeUnderlineColor={colors.primary}
            underlineColor={colors.border}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="flat"
            style={styles.input}
            activeUnderlineColor={colors.primary}
            underlineColor={colors.border}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="flat"
            style={styles.input}
            activeUnderlineColor={colors.primary}
            underlineColor={colors.border}
            secureTextEntry
          />

          <Button
            mode="contained"
            onPress={handleSignup}
            loading={isLoading}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            CRÉER MON COMPTE
          </Button>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
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
    padding: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: colors.text,
    letterSpacing: 8,
    marginTop: 20,
  },
  subtitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 14,
    color: colors.textMid,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 0,
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 2,
  },
  loginLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textMid,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
