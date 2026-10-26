import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/colors';

type Props = {
  /** Texte à lire lorsque le récit ne dispose pas de fichier audio. */
  text: string;
  title: string;
};

/**
 * Narration de secours par synthèse vocale.
 *
 * Le cahier des charges prévoit un audio par contenu. Les récits qui n'ont pas
 * encore d'enregistrement sont lus par la voix du système, avec une mention
 * explicite pour ne pas faire passer la synthèse pour un enregistrement de griot.
 */
export const SpeechNarration = ({ text, title }: Props) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      Speech.stop();
    };
  }, []);

  const start = () => {
    Speech.stop();
    setIsPaused(false);
    setIsSpeaking(true);
    Speech.speak(`${title}. ${text}`, {
      language: 'fr-FR',
      rate: 0.92,
      pitch: 1.0,
      onStart: () => {
        if (mounted.current) setIsSpeaking(true);
      },
      onDone: () => {
        if (mounted.current) {
          setIsSpeaking(false);
          setIsPaused(false);
        }
      },
      onStopped: () => {
        if (mounted.current) {
          setIsSpeaking(false);
          setIsPaused(false);
        }
      },
      onError: () => {
        if (mounted.current) {
          setIsSpeaking(false);
          setIsPaused(false);
        }
      },
    });
  };

  const toggle = async () => {
    if (!isSpeaking) {
      start();
      return;
    }
    if (isPaused) {
      await Speech.resume();
      setIsPaused(false);
    } else {
      await Speech.pause();
      setIsPaused(true);
    }
  };

  const stop = async () => {
    await Speech.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="account-voice" size={18} color={colors.gold} />
        <Text style={styles.label}>NARRATION VOCALE</Text>
      </View>
      <Text style={styles.hint}>
        Enregistrement de griot à venir. En attendant, écoutez la lecture automatique du récit.
      </Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={toggle}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            isSpeaking ? (isPaused ? 'Reprendre la narration' : 'Mettre la narration en pause') : 'Écouter le récit'
          }
        >
          <MaterialCommunityIcons
            name={isSpeaking ? (isPaused ? 'play' : 'pause') : 'play'}
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>
        <Text style={styles.status}>
          {isSpeaking ? (isPaused ? 'Narration en pause' : 'Narration en cours…') : 'Prêt à écouter'}
        </Text>
        {isSpeaking ? (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stop}
            accessibilityRole="button"
            accessibilityLabel="Arrêter la narration"
          >
            <MaterialCommunityIcons name="stop" size={18} color={colors.textMid} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  label: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: colors.text,
  },
  hint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: colors.textLight,
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textMid,
  },
  stopButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
