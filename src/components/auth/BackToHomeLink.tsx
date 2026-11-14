import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/colors';

type Props = {
  onPress: () => void;
};

/**
 * Lien discret permettant de quitter l'écran de connexion (ou d'inscription)
 * pour revenir à la page d'accueil publique de Djelia.
 */
export const BackToHomeLink = ({ onPress }: Props) => (
  <View style={styles.row}>
    <TouchableOpacity
      onPress={onPress}
      style={styles.link}
      accessibilityRole="button"
      accessibilityLabel="Revenir à la page d'accueil de Djelia"
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <MaterialCommunityIcons name="arrow-left" size={16} color={colors.primary} />
      <Text style={styles.text}>Retour à l’accueil</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  text: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.primary,
  },
});
