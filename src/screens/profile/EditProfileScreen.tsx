import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppContext } from '../../store/AppProvider';
import { colors } from '../../config/colors';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const EditProfileScreen = ({ navigation }: Props) => {
  const { user } = useAppContext();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.goBack();
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TextInput
          label="Nom complet"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.borderDark}
          activeOutlineColor={colors.primary}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          labelStyle={styles.buttonText}
          loading={loading}
          disabled={loading}
        >
          Enregistrer
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  input: {
    marginBottom: 24,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
});
