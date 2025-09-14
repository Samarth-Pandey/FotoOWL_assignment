import AsyncStorage from '@react-native-async-storage/async-storage';
import { FotoOwlImage } from '../types';

const FAVORITES_KEY = 'favorites';
const IMAGES_CACHE_KEY = 'cached_images';
const THEME_KEY = 'theme_preference';

export class StorageService {
  // Favorites
  async getFavorites(): Promise<number[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  async addFavorite(imageId: number): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(imageId)) {
        favorites.push(imageId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  }

  async removeFavorite(imageId: number): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(id => id !== imageId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  async isFavorite(imageId: number): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(imageId);
  }

  // Image cache
  async getCachedImages(): Promise<FotoOwlImage[]> {
    try {
      const cached = await AsyncStorage.getItem(IMAGES_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error loading cached images:', error);
      return [];
    }
  }

  async setCachedImages(images: FotoOwlImage[]): Promise<void> {
    try {
      // Only cache essential data to avoid storage bloat
      const lightweightCache = images.map(img => ({
        id: img.id,
        name: img.name,
        thumbnail_url: img.thumbnail_url,
        med_url: img.med_url,
        img_url: img.img_url,
        width: img.width,
        height: img.height,
      }));
      await AsyncStorage.setItem(IMAGES_CACHE_KEY, JSON.stringify(lightweightCache));
    } catch (error) {
      console.error('Error caching images:', error);
    }
  }

  // Theme
  async getTheme(): Promise<'light' | 'dark' | 'system'> {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return (theme as 'light' | 'dark' | 'system') || 'system';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'system';
    }
  }

  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  // Clear all data
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([IMAGES_CACHE_KEY, FAVORITES_KEY]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const storageService = new StorageService();