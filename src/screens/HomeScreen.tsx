import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { useTheme } from '../hooks/useTheme';
import { useImageData, SORT_OPTIONS } from '../hooks/useImageData';
import ImageGridItem from '../components/ImageGridItem';
import { FotoOwlImage } from '../types';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_SPACING = 2;
const ITEM_SIZE = (width - (GRID_COLUMNS + 1) * GRID_SPACING) / GRID_COLUMNS;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const {
    images,
    favorites,
    isLoading,
    isRefreshing,
    error,
    hasMoreImages,
    searchQuery,
    isOnline,
    loadMore,
    refresh,
    retry,
    toggleFavorite,
    changeSorting,
    setSearchQuery,
    currentSortOption,
  } = useImageData();

  const [showSortMenu, setShowSortMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleImagePress = useCallback((image: FotoOwlImage, index: number) => {
    navigation.navigate('ImageViewer', {
      imageId: image.id,
      initialIndex: index,
    });
  }, [navigation]);

  const renderItem = useCallback(({ item, index }: { item: FotoOwlImage; index: number }) => (
    <ImageGridItem
      image={item}
      onPress={() => handleImagePress(item, index)}
      isFavorite={favorites.includes(item.id)}
    />
  ), [handleImagePress, favorites]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_SIZE,
    offset: ITEM_SIZE * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: FotoOwlImage) => item.id.toString(), []);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          FotoOwl Gallery
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, { borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Ionicons name="heart" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          }]}
          placeholder="Search by filename..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons name="filter" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {showSortMenu && (
        <View style={[styles.sortMenu, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }]}>
          {SORT_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sortOption,
                currentSortOption.label === option.label && { 
                  backgroundColor: theme.colors.primary + '20' 
                }
              ]}
              onPress={() => {
                changeSorting(option);
                setShowSortMenu(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: theme.colors.text }]}>
                {option.label}
              </Text>
              {currentSortOption.label === option.label && (
                <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!isOnline && (
        <View style={[styles.offlineIndicator, { backgroundColor: theme.colors.error }]}>
          <Ionicons name="wifi-outline" size={16} color="white" />
          <Text style={styles.offlineText}>Offline - Showing cached images</Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMoreImages) return null;
    
    return (
      <View style={styles.footer}>
        {isLoading && (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="images-outline" 
        size={80} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Images Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {searchQuery ? 'Try a different search term' : 'Pull to refresh'}
      </Text>
      {error && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={retry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        maxToRenderPerBatch={15}
        windowSize={10}
        initialNumToRender={15}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortMenu: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  sortOptionText: {
    fontSize: 16,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    gap: 8,
  },
  offlineText: {
    color: 'white',
    fontSize: 14,
  },
  gridContent: {
    padding: GRID_SPACING,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
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
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});