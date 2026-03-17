import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

interface AvatarProps {
  name: string;
  photoUri?: string | null;
  size?: number;
  showBadge?: boolean;
}

export default function Avatar({ name, photoUri, size = 48, showBadge = false }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={{ width: size, height: size }}>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
        </View>
      )}
      {showBadge && (
        <View style={[styles.badge, { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: Colors.surface,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
});
