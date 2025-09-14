import React, { memo } from 'react';
import { TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { FotoOwlImage } from '../types';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_SPACING = 2;
const ITEM_SIZE = (width - (GRID_COLUMNS + 1) * GRID_SPACING) / GRID_COLUMNS;

interface Props {
  image: FotoOwlImage;
  onPress: () => void;
  isFavorite: boolean;
}

function ImageGridItem({ image, onPress, isFavorite }: Props) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: image.thumbnail_url }}
        style={[styles.image, { backgroundColor: theme.colors.surface }]}
        contentFit="cover"
        transition={200}
        placeholder={{ uri: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' }}
      />
      {isFavorite && (
        <View style={[styles.favoriteIndicator, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="heart" size={12} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: GRID_SPACING / 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(ImageGridItem);