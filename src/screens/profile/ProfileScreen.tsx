import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/colors';
import { BogolanPattern, HutIcon } from '../../components/common/AfricanPattern';
import { useAppContext } from '../../store/AppProvider';

const { width, height } = Dimensions.get('window');

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAppContext();

  return (
    <View style={styles.container}>
      {/* WATERMARK VERTICAL */}
      <View style={styles.verticalTitleWrapper} pointerEvents="none">
        <Text style={styles.verticalLetter}>P</Text>
        <Text style={styles.verticalLetter}>R</Text>
        <Text style={styles.verticalLetter}>O</Text>
        <Text style={styles.verticalLetter}>F</Text>
        <Text style={styles.verticalLetter}>I</Text>
        <Text style={styles.verticalLetter}>L</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <BogolanPattern opacity={0.05} />
          <View style={styles.avatarWrapper}>
            <View style={styles.goldRing} />
            <Avatar.Text
              size={100}
              label={user?.name?.substring(0, 2).toUpperCase() || 'DJ'}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
          </View>
          <Text style={styles.name}>{user?.name || 'Gardien Djelia'}</Text>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>GARDIEN DU SAVOIR</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>RÉCITS LUS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>LANGUES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>450</Text>
            <Text style={styles.statLabel}>POINTS</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <Text style={styles.sectionTitle}>MON HÉRITAGE</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Favorites')}>
            <MaterialCommunityIcons name="heart-multiple-outline" size={22} color={colors.primary} />
            <Text style={styles.menuText}>Mes récits favoris</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.borderDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.primary} />
            <Text style={styles.menuText}>Mes badges & titres</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.borderDark} />
          </TouchableOpacity>
          
          <Text style={styles.sectionTitle}>PARAMÈTRES</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <MaterialCommunityIcons name="account-edit-outline" size={22} color={colors.textMid} />
            <Text style={styles.menuText}>Modifier mon identité</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.borderDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textMid} />
            <Text style={styles.menuText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.borderDark} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <View style={styles.logoutLine} />
            <Text style={styles.logoutText}>QUITTER LA COUR ROYALE</Text>
            <View style={styles.logoutLine} />
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldRing: {
    position: 'absolute',
    width: 114,
    height: 114,
    borderRadius: 57,
    borderWidth: 1,
    borderColor: colors.gold,
    opacity: 0.3,
  },
  avatar: {
    backgroundColor: colors.indigo,
  },
  avatarLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: colors.white,
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: colors.text,
  },
  rankBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.gold + '20',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  rankText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: colors.gold,
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: colors.indigo,
  },
  statLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: colors.textLight,
    letterSpacing: 1,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  menu: {
    padding: 25,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 2,
    marginTop: 30,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  logoutBtn: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  logoutLine: {
    width: 20,
    height: 1,
    backgroundColor: colors.primary,
  },
  logoutText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 2,
    marginHorizontal: 15,
  },
});
