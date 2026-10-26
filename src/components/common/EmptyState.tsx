import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/colors';

type Props = {
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

/**
 * État vide partagé par les listes de l'application (recherche, favoris…).
 * Centraliser ce bloc garantit le même ton éditorial et les mêmes annonces
 * aux lecteurs d'écran sur tous les écrans.
 */
export const EmptyState = ({
  title,
  message,
  icon = 'book-search-outline',
  actionLabel,
  onAction,
  compact = false,
}: Props) => {
  const showAction = Boolean(actionLabel && onAction);

  return (
    <View
      style={[styles.container, compact && styles.containerCompact]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${message}`}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={compact ? 26 : 34} color={colors.gold} />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {showAction ? (
        <TouchableOpacity
          style={styles.action}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 36,
  },
  containerCompact: {
    flex: 0,
    paddingVertical: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleCompact: {
    fontSize: 17,
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textLight,
    textAlign: 'center',
  },
  action: {
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.indigo,
  },
  actionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.indigo,
  },
});
