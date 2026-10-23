import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Rect, Line, Path, Ellipse, Defs, Pattern } from 'react-native-svg';
import { colors } from '../../config/colors';

// Motif Bogolan subtil pour les fonds
export const BogolanPattern = ({ color = colors.border, opacity = 0.15 }) => (
  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
    <Path
      d="M0 10 L10 0 M10 20 L20 10 M0 30 L30 0 M20 30 L30 20"
      stroke={color}
      strokeWidth="1"
      opacity={opacity}
    />
    <Path
      d="M40 10 L50 0 M50 20 L60 10 M40 30 L70 0 M60 30 L70 20"
      stroke={color}
      strokeWidth="1"
      opacity={opacity}
      transform="translate(10, 40)"
    />
    <Circle cx="15" cy="15" r="1.5" fill={color} opacity={opacity} />
    <Circle cx="55" cy="55" r="1.5" fill={color} opacity={opacity} />
  </Svg>
);

// Kora stylisée (Cordes et calebasse)
export const KoraIcon = ({ size = 40, color = colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Circle cx="20" cy="28" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M20 5 L20 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M15 10 L15 25 M25 10 L25 25" stroke={color} strokeWidth="1" opacity="0.6" />
  </Svg>
);

// Case traditionnelle / Village (Symbole racine)
export const HutIcon = ({ size = 40, color = colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M10 30 L30 30 L30 20 L20 10 L10 20 Z" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M20 10 L10 20 M20 10 L30 20" stroke={color} strokeWidth="2" />
    <Path d="M18 30 L18 24 L22 24 L22 30" stroke={color} strokeWidth="1.5" />
  </Svg>
);

// Logo Djelia Authentique (Empreinte digitale tricolore)
export const DjeliaLogo = ({ size = 60 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Courbe Rouge (Haut) */}
    <Path
      d="M20 50 Q50 10 80 50"
      fill="none"
      stroke={colors.accentRed}
      strokeWidth="8"
      strokeLinecap="round"
    />
    {/* Courbe Jaune (Milieu) */}
    <Path
      d="M30 60 Q50 30 70 60"
      fill="none"
      stroke={colors.gold}
      strokeWidth="8"
      strokeLinecap="round"
    />
    {/* Courbe Verte (Bas) */}
    <Path
      d="M40 70 Q50 50 60 70"
      fill="none"
      stroke={colors.primary}
      strokeWidth="8"
      strokeLinecap="round"
    />
  </Svg>
);

// Tam-tam / Djembe stylisé "Fine Art"
export const TamTamIcon = ({ size = 40, color = colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path
      d="M10 8 Q10 4 20 4 Q30 4 30 8 L28 15 Q28 20 23 20 L23 32 Q23 36 20 36 Q17 36 17 32 L17 20 Q12 20 12 15 Z"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    />
    <Ellipse cx="20" cy="8" rx="10" ry="3" fill="none" stroke={color} strokeWidth="1" />
    <Line x1="15" y1="20" x2="15" y2="34" stroke={color} strokeWidth="0.5" opacity="0.4" />
    <Line x1="25" y1="20" x2="25" y2="34" stroke={color} strokeWidth="0.5" opacity="0.4" />
    <Line x1="20" y1="20" x2="20" y2="36" stroke={color} strokeWidth="0.5" opacity="0.4" />
  </Svg>
);


// Symbole IA discret intégré (Lignes de circuit organiques)
export const AIOrganicIcon = ({ size = 40, color = colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path
      d="M10 20 Q20 10 30 20 M10 25 Q20 15 30 25"
      fill="none"
      stroke={color}
      strokeWidth="1"
      opacity="0.4"
    />
    <Circle cx="10" cy="20" r="2" fill={color} />
    <Circle cx="30" cy="20" r="2" fill={color} />
    <Circle cx="20" cy="12" r="1.5" fill={color} opacity="0.6" />
  </Svg>
);

// Frise décorative sobre
export const AfricanPattern = ({ style = {} }) => (
  <View style={[styles.pattern, style]}>
    <Svg width="100%" height="20" viewBox="0 0 400 20">
      <Path
        d="M0 10 L10 0 L20 10 L30 0 L40 10 L50 0 L60 10 L70 0 L80 10"
        fill="none"
        stroke={colors.gold}
        strokeWidth="1"
        opacity="0.3"
      />
      <Circle cx="5" cy="5" r="1" fill={colors.primary} opacity="0.2" />
      <Circle cx="25" cy="5" r="1" fill={colors.primary} opacity="0.2" />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  pattern: {
    height: 20,
    width: '100%',
  },
});
