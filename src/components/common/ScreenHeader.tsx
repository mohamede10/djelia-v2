import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../config/colors';

const { width } = Dimensions.get('window');

type Props = {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
};

export const ScreenHeader = ({ title, subtitle, rightElement }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightElement && <View style={styles.right}>{rightElement}</View>}
      </View>
      <View style={styles.borderLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  right: {
    paddingBottom: 5,
  },
  borderLine: {
    width: 60,
    height: 3,
    backgroundColor: colors.gold,
    marginTop: 15,
  },
});
