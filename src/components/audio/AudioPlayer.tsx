import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Audio } from 'expo-av';
import Svg, { Rect } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/colors';

const { width } = Dimensions.get('window');

type Props = { audioUrl?: any };

const WAVE_HEIGHTS = [4, 8, 12, 10, 15, 12, 18, 14, 20, 16, 14, 18, 12, 16, 12, 14, 10, 12, 8, 6, 10, 16, 8, 12, 6];

const Waveform = ({ progress, onSeek, disabled }: { progress: number; onSeek: (p: number) => void; disabled?: boolean }) => {
  const activeCount = Math.floor(progress * WAVE_HEIGHTS.length);
  const containerWidth = WAVE_HEIGHTS.length * 8;
  
  return (
    <TouchableOpacity 
      activeOpacity={1} 
      disabled={disabled}
      onPress={(e) => {
        const x = e.nativeEvent.locationX;
        onSeek(x / containerWidth);
      }}
    >
      <Svg width={containerWidth} height="20" viewBox={`0 0 ${containerWidth} 20`}>
        {WAVE_HEIGHTS.map((h, i) => (
          <Rect
            key={i}
            x={i * 8 + 1}
            y={(20 - h) / 2}
            width="3"
            height={h}
            rx="1.5"
            fill={i <= activeCount ? colors.gold : colors.white}
            opacity={disabled ? 0.1 : (i <= activeCount ? 1 : 0.15)}
          />
        ))}
      </Svg>
    </TouchableOpacity>
  );
};

export const AudioPlayer = ({ audioUrl }: Props) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1.0);

  const hasAudio = !!audioUrl;

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const onStatus = (status: any) => {
    if (status.isLoaded) {
      setProgress((status.positionMillis || 0) / (status.durationMillis || 1));
      setDuration(status.durationMillis || 0);
      if (status.didJustFinish) { setIsPlaying(false); setProgress(0); }
    }
  };

  const handlePlayPause = async () => {
    if (!hasAudio) return;
    if (!sound) {
      const source = typeof audioUrl === 'string' ? { uri: audioUrl } : audioUrl;
      const { sound: s } = await Audio.Sound.createAsync(
        source, 
        { shouldPlay: true, rate: rate, shouldCorrectPitch: true }, 
        onStatus
      );
      setSound(s);
      setIsPlaying(true);
      return;
    }
    if (isPlaying) { await sound.pauseAsync(); setIsPlaying(false); }
    else { await sound.playAsync(); setIsPlaying(true); }
  };

  const seek = async (p: number) => {
    if (sound && hasAudio) {
      const pos = p * duration;
      await sound.setPositionAsync(pos);
    }
  };

  const skip = async (seconds: number) => {
    if (sound && hasAudio) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        const newPos = Math.max(0, Math.min(duration, status.positionMillis + seconds * 1000));
        await sound.setPositionAsync(newPos);
      }
    }
  };

  const cycleRate = async () => {
    if (!hasAudio) return;
    const nextRates = [1.0, 1.5, 2.0];
    const next = nextRates[(nextRates.indexOf(rate) + 1) % nextRates.length];
    setRate(next);
    if (sound) { await sound.setRateAsync(next, true); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.leftGroup}>
          <TouchableOpacity 
            onPress={() => skip(-10)} 
            style={styles.smallSkip}
            disabled={!hasAudio}
          >
            <MaterialCommunityIcons name="rewind-10" size={20} color={colors.white} opacity={hasAudio ? 0.6 : 0.1} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.playBtn, !hasAudio && styles.disabledBtn]} 
            onPress={handlePlayPause}
            disabled={!hasAudio}
          >
            <MaterialCommunityIcons 
              name={isPlaying ? "pause" : "play"} 
              size={20} 
              color={hasAudio ? colors.indigo : 'rgba(0,0,0,0.2)'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => skip(10)} 
            style={styles.smallSkip}
            disabled={!hasAudio}
          >
            <MaterialCommunityIcons name="fast-forward-10" size={20} color={colors.white} opacity={hasAudio ? 0.6 : 0.1} />
          </TouchableOpacity>
        </View>

        <View style={styles.waveGroup}>
          <Waveform progress={progress} onSeek={seek} disabled={!hasAudio} />
          <Text style={[styles.metaText, !hasAudio && { color: colors.white, opacity: 0.3 }]}>
            {hasAudio ? (isPlaying ? 'EN ÉCOUTE...' : 'PRÊT À ÉCOUTER') : 'NARRATION BIENTÔT DISPONIBLE'}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.rateChip, !hasAudio && { opacity: 0.2 }]} 
          onPress={cycleRate}
          disabled={!hasAudio}
        >
          <Text style={styles.rateText}>{rate}x</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20, left: 20, right: 20,
    backgroundColor: colors.indigo,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  smallSkip: {
    padding: 4,
  },
  waveGroup: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  metaText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 7,
    color: colors.gold,
    letterSpacing: 1,
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
  rateChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rateText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: colors.white,
    opacity: 0.8,
  },
});
