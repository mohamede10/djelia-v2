import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  AIOrganicIcon,
  BogolanPattern,
  DjeliaLogo,
  HutIcon,
  KoraIcon,
  TamTamIcon,
} from '../../components/common/AfricanPattern';
import { colors } from '../../config/colors';

/**
 * Page d'accueil publique de Djelia.
 *
 * Elle présente l'objectif de l'application avant toute connexion et donne
 * accès au bouton « Connexion » (en haut) ainsi qu'aux appels à l'action
 * « Se connecter » / « Créer un compte ».
 */

type Objectif = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  text: string;
};

const OBJECTIFS: Objectif[] = [
  {
    icon: KoraIcon,
    title: 'Préserver',
    text: 'Recueillir les contes, fables, proverbes et coutumes qui font la mémoire de la Guinée et du Manden.',
  },
  {
    icon: TamTamIcon,
    title: 'Rendre accessible',
    text: 'Offrir cette mémoire à tous, où que l’on soit, dans une interface simple et bilingue.',
  },
  {
    icon: HutIcon,
    title: 'Transmettre',
    text: 'Donner aux nouvelles générations les clés pour comprendre, parler et faire vivre cet héritage.',
  },
];

type Pilier = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  text: string;
};

const PILIERS: Pilier[] = [
  {
    icon: 'book-open-page-variant-outline',
    title: '50 récits',
    text: 'Contes, fables, proverbes et coutumes, classés par région et par ethnie.',
  },
  {
    icon: 'head-heart-outline',
    title: 'DjeliBot',
    text: 'Un griot numérique qui répond à tes questions, catalogue et sources externes à l’appui.',
  },
  {
    icon: 'translate',
    title: 'Langues',
    text: 'Une initiation au mandingue, au pular et au soussou, à ton rythme.',
  },
  {
    icon: 'bookmark-multiple-outline',
    title: 'Favoris',
    text: 'Retrouve les récits que tu aimes et construis ta propre bibliothèque.',
  },
];

export const WelcomeScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const goToLogin = () => navigation.navigate('Login');
  const goToSignup = () => navigation.navigate('Signup');

  return (
    <View style={styles.container}>
      <BogolanPattern opacity={0.05} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* En-tête public avec le bouton de connexion */}
          <View style={styles.topBar}>
            <View style={styles.brand}>
              <DjeliaLogo size={34} />
              <View>
                <Text style={styles.brandName}>DJELIA</Text>
                <Text style={styles.brandTagline}>L’ESPRIT DE LA MÉMOIRE</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={goToLogin}
              accessibilityRole="button"
              accessibilityLabel="CONNEXION — se connecter à Djelia"
            >
              <MaterialCommunityIcons
                name="login"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.loginButtonText}>CONNEXION</Text>
            </TouchableOpacity>
          </View>

          {/* Héros : mission de l'application */}
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>MÉMOIRE VIVANTE · GUINÉE & MANDEN</Text>

            <Text style={[styles.title, isWide && styles.titleWide]}>
              La mémoire de l’Afrique, transmise autrement.
            </Text>

            <Text style={styles.lead}>
              Djelia est une bibliothèque vivante consacrée à la culture
              guinéenne et manden. Elle rassemble les récits des anciens, les
              fait dialoguer avec le numérique et les transmet aux générations
              qui viennent.
            </Text>

            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={goToLogin}
                accessibilityRole="button"
                accessibilityLabel="Se connecter et entrer dans Djelia"
              >
                <Text style={styles.primaryButtonText}>SE CONNECTER</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={16}
                  color={colors.white}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={goToSignup}
                accessibilityRole="button"
                accessibilityLabel="Créer un compte Djelia"
              >
                <Text style={styles.secondaryButtonText}>CRÉER UN COMPTE</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroBadge}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={14}
                color={colors.primary}
              />
              <Text style={styles.heroBadgeText}>
                Gratuit · Sans publicité · Pensé pour la Guinée
              </Text>
            </View>
          </View>

          {/* Objectif de l'application */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NOTRE OBJECTIF</Text>
            <Text style={styles.sectionTitle}>
              Préserver, rendre accessible, transmettre.
            </Text>
            <Text style={styles.paragraph}>
              Beaucoup de récits se transmettent encore de bouche à oreille, et
              risquent de se perdre. Djelia leur donne un refuge durable : un
              catalogue consultable partout, des récits à lire et à écouter, et
              un griot numérique capable de répondre aux questions des
              curieux — sans jamais inventer ce que les sources ne disent pas.
            </Text>
          </View>

          <View style={styles.objectifs}>
            {OBJECTIFS.map((objectif) => (
              <View key={objectif.title} style={styles.objectifCard}>
                <View style={styles.objectifIcon}>
                  <objectif.icon size={26} color={colors.primary} />
                </View>
                <Text style={styles.objectifTitle}>{objectif.title}</Text>
                <Text style={styles.objectifText}>{objectif.text}</Text>
              </View>
            ))}
          </View>

          {/* Ce que l'on trouve dans l'application */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DANS L’APPLICATION</Text>
            <Text style={styles.sectionTitle}>Quatre chemins vers le savoir.</Text>
          </View>

          <View style={styles.piliers}>
            {PILIERS.map((pilier) => (
              <View key={pilier.title} style={styles.pilierCard}>
                <View style={styles.pilierHeader}>
                  <MaterialCommunityIcons
                    name={pilier.icon}
                    size={20}
                    color={colors.indigo}
                  />
                  <Text style={styles.pilierTitle}>{pilier.title}</Text>
                </View>
                <Text style={styles.pilierText}>{pilier.text}</Text>
              </View>
            ))}
          </View>

          {/* Appel à l'action final */}
          <View style={styles.bottomCta}>
            <AIOrganicIcon size={40} color={colors.gold} />
            <Text style={styles.bottomTitle}>Entre dans le cercle</Text>
            <Text style={styles.bottomText}>
              Crée ton compte pour retrouver tes favoris, discuter avec DjeliBot
              et poursuivre ton apprentissage des langues.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={goToLogin}
              accessibilityRole="button"
              accessibilityLabel="Se connecter à Djelia"
            >
              <Text style={styles.primaryButtonText}>SE CONNECTER</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Gardons vivante la mémoire de l’Afrique
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
    flexGrow: 1,
    paddingBottom: 48,
  },
  inner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 48,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: colors.text,
    letterSpacing: 5,
  },
  brandTagline: {
    fontFamily: 'Poppins_300Light',
    fontSize: 8,
    color: colors.textLight,
    letterSpacing: 2,
    marginTop: 2,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  loginButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.primary,
  },
  hero: {
    marginBottom: 56,
  },
  eyebrow: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 36,
    lineHeight: 44,
    color: colors.text,
    marginBottom: 20,
  },
  titleWide: {
    fontSize: 52,
    lineHeight: 62,
    maxWidth: 760,
  },
  lead: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 26,
    color: colors.textMid,
    maxWidth: 640,
    marginBottom: 28,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingHorizontal: 26,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.white,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 13,
    backgroundColor: colors.white,
  },
  secondaryButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMid,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBadgeText: {
    fontFamily: 'Poppins_300Light',
    fontSize: 11,
    color: colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.goldDark,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    lineHeight: 34,
    color: colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 24,
    color: colors.textMid,
    maxWidth: 720,
  },
  objectifs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 56,
  },
  objectifCard: {
    flexGrow: 1,
    flexBasis: 240,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 22,
  },
  objectifIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  objectifTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  objectifText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 21,
    color: colors.textMid,
  },
  piliers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 56,
  },
  pilierCard: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: colors.surfaceWarm,
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
  },
  pilierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pilierTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: colors.indigo,
  },
  pilierText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMid,
  },
  bottomCta: {
    backgroundColor: colors.indigo,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  bottomTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: colors.white,
    marginTop: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  bottomText: {
    fontFamily: 'Poppins_300Light',
    fontSize: 13,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: 480,
    marginBottom: 22,
  },
  footer: {
    textAlign: 'center',
    color: colors.textLight,
    fontFamily: 'Poppins_300Light',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 36,
  },
});
