import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { useTheme } from '../hooks/useTheme';
import { useImageData } from '../hooks/useImageData';
import ImageGridItem from '../components/ImageGridItem';
import { FotoOwlImage } from '../types';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_SPACING = 2;
const ITEM_SIZE = (width - (GRID_COLUMNS + 1) * GRID_SPACING) / GRID_COLUMNS;

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Favorites'>;

interface Props {
  navigation: FavoritesScreenNavigationProp;
}

export default function FavoritesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { favoriteImages, favorites, images } = useImageData();

  const handleImagePress = useCallback((image: FotoOwlImage) => {
    // Find the index in the main images array
    const initialIndex = images.findIndex(img => img.id === image.id);
    navigation.navigate('ImageViewer', {
      imageId: image.id,
      initialIndex: initialIndex >= 0 ? initialIndex : 0,
    });
  }, [navigation, images]);

  const renderItem = useCallback(({ item }: { item: FotoOwlImage }) => (
    <ImageGridItem
      image={item}
      onPress={() => handleImagePress(item)}
      isFavorite={favorites.includes(item.id)}
    />
  ), [handleImagePress, favorites]);

  const keyExtractor = useCallback((item: FotoOwlImage) => item.id.toString(), []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="heart-outline" 
        size={80} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Favorites Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Tap the heart icon on any image to add it to your favorites
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={favoriteImages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={[
          styles.gridContent,
          favoriteImages.length === 0 && styles.emptyContent
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContent: {
    padding: GRID_SPACING,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});