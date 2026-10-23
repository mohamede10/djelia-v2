import React from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { colors } from '../../config/colors';
import { BogolanPattern } from '../../components/common/AfricanPattern';

const { width, height } = Dimensions.get('window');

const PRODUCTS = [
  {
    id: '1',
    name: 'Masque Nimba Sacré',
    artisan: 'Maître Camara',
    price: '250 000 FG',
    category: 'SCULPTURE',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800', // Savannah (tested)
  },
  {
    id: '2',
    name: 'Pagne Lépi Authentique',
    artisan: 'Tisseuses de Labé',
    price: '150 000 FG',
    category: 'TEXTILE',
    image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800', // Sunset (tested)
  },
  {
    id: '3',
    name: 'Kora Traditionnelle',
    artisan: 'Atelier Keïta',
    price: '1 200 000 FG',
    category: 'INSTRUMENT',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800', // Landscape (tested)
  }
];

export const MarketplaceScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <BogolanPattern opacity={0.03} />
      <ScreenHeader 
        title="Marché"
        subtitle="Galerie de l'Excellence"
      />

      {/* WATERMARK VERTICAL */}
      <View style={styles.verticalTitleWrapper} pointerEvents="none">
        <Text style={styles.verticalLetter}>A</Text>
        <Text style={styles.verticalLetter}>R</Text>
        <Text style={styles.verticalLetter}>T</Text>
      </View>
      
      <FlatList
        data={PRODUCTS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={[styles.card, index % 2 === 0 ? styles.cardLeft : styles.cardRight]} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <View style={styles.imageWrapper}>
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceWarm }]} />
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.goldFrame} />
            </View>
            <View style={styles.content}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.artisan}>PAR {item.artisan.toUpperCase()}</Text>
              <Text style={styles.price}>{item.price}</Text>
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
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 40,
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
  },
  cardRight: {
    flexDirection: 'row-reverse',
  },
  imageWrapper: {
    width: '45%',
    height: 220,
    position: 'relative',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  goldFrame: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: '50%',
    height: '50%',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.gold,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  category: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: 8,
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 10,
  },
  artisan: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: colors.textLight,
    letterSpacing: 1,
    marginBottom: 15,
  },
  price: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: colors.indigo,
  },
});
