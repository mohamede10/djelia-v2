import React, { ErrorInfo, ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/colors';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Filet de sécurité global : une erreur de rendu inattendue affiche un écran
 * de secours en français au lieu d'une page blanche, et permet de relancer
 * l'arbre de navigation sans redémarrer l'application.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // En production, brancher ici un service de remontée de crash.
    console.error('Erreur de rendu Djelia :', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <View
          style={styles.card}
          accessible
          accessibilityRole="alert"
          accessibilityLabel="Une erreur inattendue est survenue. Vous pouvez réessayer."
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="alert-circle-outline" size={36} color={colors.error} />
          </View>
          <Text style={styles.title}>Le récit s’est interrompu</Text>
          <Text style={styles.message}>
            Une erreur inattendue est survenue. Vos favoris et votre session restent conservés.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleReset}
            accessibilityRole="button"
            accessibilityLabel="Réessayer d’afficher l’application"
          >
            <Text style={styles.buttonText}>RÉESSAYER</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMid,
    textAlign: 'center',
  },
  button: {
    marginTop: 26,
    paddingHorizontal: 26,
    paddingVertical: 13,
    backgroundColor: colors.indigo,
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.white,
  },
});
