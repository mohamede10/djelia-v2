import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppContext } from '../../store/AppProvider';
import { colors } from '../../config/colors';
import { BogolanPattern } from '../../components/common/AfricanPattern';
import { persistAvatar, pickAvatarFromLibrary } from '../../services/avatarService';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const LANGUAGES = ['Mandingue', 'Pular', 'Soussou', 'Français'];

export const EditProfileScreen = ({ navigation }: Props) => {
  const { user, updateProfile } = useAppContext();
  const [name, setName] = useState(user?.name || '');
  const [languages, setLanguages] = useState<string[]>(
    user?.preferredLanguages || ['Mandingue', 'Pular', 'Soussou']
  );
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePickAvatar = async () => {
    if (photoLoading) return;
    setError('');
    try {
      const asset = await pickAvatarFromLibrary();
      if (!asset) return;

      setPhotoLoading(true);
      const url = await persistAvatar(asset, user?.id || 'local_user');
      await updateProfile({ photoUrl: url });
      setPhotoUrl(url);
    } catch (e: any) {
      setError(
        e?.message || 'Impossible de mettre à jour la photo. Veuillez réessayer.'
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (photoLoading || !photoUrl) return;
    setError('');
    setPhotoLoading(true);
    try {
      await updateProfile({ photoUrl: '' });
      setPhotoUrl('');
    } catch (e: any) {
      setError(e?.message || 'Impossible de retirer la photo.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const toggleLanguage = (language: string) => {
    setLanguages((previous) =>
      previous.includes(language)
        ? previous.filter((item) => item !== language)
        : [...previous, language]
    );
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim() || name.trim().length < 2) {
      setError('Veuillez renseigner un nom complet valide (minimum 2 caractères).');
      return;
    }
    if (languages.length === 0) {
      setError('Choisissez au moins une langue de prédilection.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), preferredLanguages: languages });
      navigation.goBack();
    } catch (e: any) {
      setError(e?.message || 'Impossible d\'enregistrer les modifications.');
    } finally {
      setLoading(false);
    }
  };

  const initials = (user?.name || 'DJ').substring(0, 2).toUpperCase();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <BogolanPattern opacity={0.03} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickAvatar}
            activeOpacity={0.85}
            disabled={photoLoading}
            accessibilityRole="button"
            accessibilityLabel="Changer la photo de profil"
            accessibilityState={{ busy: photoLoading }}
          >
            {photoUrl ? (
              <Avatar.Image size={96} source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
              <Avatar.Text
                size={96}
                label={initials}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            )}
            <View style={styles.cameraBadge}>
              <MaterialCommunityIcons
                name={photoLoading ? 'progress-clock' : 'camera'}
                size={16}
                color={colors.white}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {photoLoading
              ? 'Mise à jour de la photo…'
              : 'Touchez pour choisir une photo depuis votre galerie.'}
          </Text>
          {photoUrl ? (
            <TouchableOpacity
              onPress={handleRemoveAvatar}
              disabled={photoLoading}
              activeOpacity={0.7}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>Retirer la photo</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>IDENTITÉ</Text>
        <TextInput
          label="Nom complet"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError('');
          }}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.borderDark}
          activeOutlineColor={colors.primary}
          left={<TextInput.Icon icon="account-outline" color={colors.textLight} />}
        />

        <TextInput
          label="Adresse email"
          value={user?.email || ''}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.borderDark}
          activeOutlineColor={colors.primary}
          editable={false}
          left={<TextInput.Icon icon="email-lock-outline" color={colors.textLight} />}
        />

        <Text style={styles.label}>LANGUES DE PRÉDILECTION</Text>
        <Text style={styles.hint}>
          Ces langues guideront les contenus et les recommandations de DjeliBot.
        </Text>
        <View style={styles.chipsRow}>
          {LANGUAGES.map((language) => {
            const selected = languages.includes(language);
            return (
              <TouchableOpacity
                key={language}
                onPress={() => toggleLanguage(language)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {language}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          labelStyle={styles.buttonText}
          loading={loading}
          disabled={loading}
        >
          ENREGISTRER
        </Button>
      </ScrollView>
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
    paddingBottom: 60,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
  },
  avatar: {
    backgroundColor: colors.indigo,
  },
  avatarLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: colors.white,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 12,
    textAlign: 'center',
  },
  removeButton: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  removeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.primary,
    textTransform: 'uppercase',
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
  errorText: {
    color: colors.error,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  label: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 6,
  },
  hint: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 18,
    marginBottom: 14,
  },
  input: {
    marginBottom: 22,
    backgroundColor: colors.white,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.textMid,
  },
  chipTextSelected: {
    fontFamily: 'Poppins_700Bold',
    color: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    letterSpacing: 1.5,
  },
});
