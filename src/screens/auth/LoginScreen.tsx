import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { BogolanPattern, TamTamIcon } from '../../components/common/AfricanPattern';
import { colors } from '../../config/colors';
import { useAppContext } from '../../store/AppProvider';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAppContext();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BogolanPattern opacity={0.05} />
        
        <View style={styles.header}>
          <TamTamIcon size={50} color={colors.primary} />
          <Text style={styles.title}>DJELIA</Text>
          <Text style={styles.subtitle}>Connectez-vous à la mémoire</Text>
        </View>

        <View style={styles.form}>
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
            onPress={() => login(email, password)}
            loading={isLoading}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            SE CONNECTER
          </Button>

          <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.linkText}>Créer un nouveau compte</Text>
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
    marginBottom: 60,
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
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 0, // Carré pour plus de sobriété "pro"
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 2,
  },
  signupLink: {
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
