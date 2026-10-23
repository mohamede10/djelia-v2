import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { colors } from '../../config/colors';
import { KoraIcon, TamTamIcon, HutIcon, BogolanPattern } from '../../components/common/AfricanPattern';

const { height } = Dimensions.get('window');

const LANGUAGES = [
  {
    id: '1',
    name: 'Mandingue (Malinké)',
    description: 'La langue de l’Empire du Mali, riche et mélodieuse. Le souffle du Manden.',
    icon: KoraIcon,
    color: colors.primary,
  },
  {
    id: '2',
    name: 'Pular',
    description: 'La langue du Fouta Djallon, poétique et pastorale. Le rythme des bergers.',
    icon: TamTamIcon,
    color: colors.accentRed,
  },
  {
    id: '3',
    name: 'Soussou',
    description: 'Le rythme de la côte, direct et vibrant. L’âme de la Basse Guinée.',
    icon: HutIcon,
    color: colors.gold,
  }
];

export const LearnScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <BogolanPattern opacity={0.03} />
      
      <ScreenHeader 
        title="Langues"
        subtitle="Académie de la Parole"
      />

      {/* WATERMARK VERTICAL */}
      <View style={styles.verticalTitleWrapper} pointerEvents="none">
        <Text style={styles.verticalLetter}>L</Text>
        <Text style={styles.verticalLetter}>A</Text>
        <Text style={styles.verticalLetter}>N</Text>
        <Text style={styles.verticalLetter}>G</Text>
        <Text style={styles.verticalLetter}>U</Text>
        <Text style={styles.verticalLetter}>E</Text>
        <Text style={styles.verticalLetter}>S</Text>
      </View>
      
      <FlatList
        data={LANGUAGES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('LearnDetail', { language: item.name })}
          >
            <View style={[styles.tabletLine, { backgroundColor: item.color }]} />
            <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '10' }]}>
                  <item.icon size={24} color={item.color} />
                </View>
                <Text style={styles.langName}>{item.name}</Text>
              </View>
              <Text style={styles.langDesc}>{item.description}</Text>
              <View style={styles.footerRow}>
                <Text style={[styles.actionText, { color: item.color }]}>S'INITIER AU DIALECTE</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color={item.color} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  verticalTitleWrapper: {
    position: 'absolute',
    right: 15,
    top: 0,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  verticalLetter: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 50,
    color: colors.text,
    opacity: 0.04,
    lineHeight: 60,
  },
  list: {
    padding: 25,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginBottom: 25,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    borderRadius: 0,
    overflow: 'hidden',
  },
  tabletLine: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconBox: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  langName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: colors.text,
  },
  langDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textMid,
    lineHeight: 22,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    marginRight: 8,
  },
});
