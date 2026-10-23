import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { colors } from '../../config/colors';
import { BogolanPattern } from '../../components/common/AfricanPattern';

const DIALECT_DATA: any = {
  'Mandingue (Malinké)': {
    words: [
      { fr: 'Bonjour', local: 'I ni tié', phonetic: '[ee-nee-tyay]' },
      { fr: 'Merci', local: 'I ni cè', phonetic: '[ee-nee-tshay]' },
      { fr: 'S\'il vous plaît', local: 'Hakè to', phonetic: '[ha-kay toh]' },
      { fr: 'Comment ça va ?', local: 'I ka kènè ?', phonetic: '[ee kah kay-nay]' },
      { fr: 'Au revoir', local: 'K\'an bèn', phonetic: '[kan-ben]' },
    ]
  },
  'Pular': {
    words: [
      { fr: 'Bonjour', local: 'Tjarama', phonetic: '[tsha-rah-mah]' },
      { fr: 'Merci', local: 'Djarama', phonetic: '[djah-rah-mah]' },
      { fr: 'Comment ça va ?', local: 'A hiba e djam ?', phonetic: '[ah hee-bah ay djahm]' },
      { fr: 'Très bien', local: 'Djam tan', phonetic: '[djahm tahn]' },
      { fr: 'Au revoir', local: 'En nalla djam', phonetic: '[en nah-lah djahm]' },
    ]
  },
  'Soussou': {
    words: [
      { fr: 'Bonjour', local: 'Tana mou ma', phonetic: '[tah-nah moo mah]' },
      { fr: 'Merci', local: 'Inouwali', phonetic: '[ee-noo-wah-lee]' },
      { fr: 'Comment ça va ?', local: 'I kènè ?', phonetic: '[ee kay-nay]' },
      { fr: 'Ça va bien', local: 'A kènè', phonetic: '[ah kay-nay]' },
      { fr: 'Au revoir', local: 'Sigué djam', phonetic: '[see-gay djahm]' },
    ]
  }
};

export const LearnDetailScreen = ({ route, navigation }: any) => {
  const { language } = route.params;
  const data = DIALECT_DATA[language] || { words: [] };

  return (
    <View style={styles.container}>
      <BogolanPattern opacity={0.03} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.label}>INITIATION AU</Text>
          <Text style={styles.title}>{language}</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.list}>
          {data.words.map((item: any, index: number) => (
            <View key={index} style={styles.wordCard}>
              <View style={styles.wordInfo}>
                <Text style={styles.frText}>{item.fr}</Text>
                <Text style={styles.localText}>{item.local}</Text>
                <Text style={styles.phoneticText}>{item.phonetic}</Text>
              </View>
              <TouchableOpacity style={styles.audioBtn}>
                <Text style={styles.audioEmoji}>🔊</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.aiButton}
          onPress={() => navigation.navigate('DjeliBot', { initialMessage: `Peux-tu m'en dire plus sur la langue ${language} ?` })}
        >
          <Text style={styles.aiEmoji}>🥁</Text>
          <Text style={styles.aiButtonText}>DEMANDER AU DJELIBOT</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Le saviez-vous ?</Text>
          <Text style={styles.infoText}>
            La transmission d'une langue est le premier pas vers la préservation d'une culture. 
            En apprenant ces quelques mots, vous honorez la mémoire des anciens.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 25,
    paddingTop: 100, // Espace pour le header transparent de navigation
  },
  header: {
    marginBottom: 40,
  },
  label: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 3,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: colors.text,
    marginTop: 5,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: colors.primary,
    marginTop: 15,
  },
  list: {
    gap: 15,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  wordInfo: {
    flex: 1,
  },
  frText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  localText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: colors.primary,
  },
  phoneticText: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: colors.textMid,
    fontStyle: 'italic',
    marginTop: 2,
  },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  audioEmoji: {
    fontSize: 18,
  },
  infoCard: {
    marginTop: 40,
    padding: 20,
    backgroundColor: colors.indigo,
  },
  infoTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: colors.gold,
    marginBottom: 10,
  },
  infoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.white,
    lineHeight: 22,
    opacity: 0.8,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWarm,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.gold,
    borderStyle: 'dashed',
  },
  aiEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  aiButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 1,
  },
});
