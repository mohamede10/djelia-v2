import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors } from '../../config/colors';
import { BogolanPattern } from '../../components/common/AfricanPattern';

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { product } = route.params;

  return (
    <View style={styles.container}>
      <BogolanPattern opacity={0.03} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Image source={{ uri: product.image }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.artisan}>Par {product.artisan}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.description}>
            Cet objet unique est le fruit d'un savoir-faire ancestral transmis de génération en génération. 
            Chaque détail raconte une histoire, chaque courbe est un hommage à notre culture. 
            En achetant ce produit, vous soutenez directement les artisans locaux et la préservation de notre patrimoine.
          </Text>

          <View style={styles.footer}>
            <View>
              <Text style={styles.priceLabel}>PRIX</Text>
              <Text style={styles.price}>{product.price}</Text>
            </View>
            <Button 
              mode="contained" 
              style={styles.buyBtn} 
              labelStyle={styles.buyBtnText}
              onPress={() => alert('Fonctionnalité de paiement bientôt disponible !')}
            >
              COMMANDER
            </Button>
          </View>
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
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 400,
  },
  content: {
    padding: 30,
    backgroundColor: colors.background,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  category: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: 8,
  },
  name: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: colors.text,
    lineHeight: 34,
  },
  artisan: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textLight,
    marginTop: 5,
  },
  divider: {
    width: 50,
    height: 3,
    backgroundColor: colors.primary,
    marginVertical: 25,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMid,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.textLight,
    letterSpacing: 1,
  },
  price: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: colors.primary,
  },
  buyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 0,
    paddingHorizontal: 20,
  },
  buyBtnText: {
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1,
  },
});
