import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { FotoOwlImage, PaginationParams, SortOption } from '../types';

const INITIAL_PARAMS: PaginationParams = {
  page: 0,
  page_size: 40,
  order_by: 2,
  order_asc: true,
};

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', order_by: 2, order_asc: false },
  { label: 'Oldest First', order_by: 2, order_asc: true },
  { label: 'Name A-Z', order_by: 1, order_asc: true },
  { label: 'Name Z-A', order_by: 1, order_asc: false },
];

export function useImageData() {
  const [images, setImages] = useState<FotoOwlImage[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [currentParams, setCurrentParams] = useState<PaginationParams>(INITIAL_PARAMS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentPage = useRef(0);
  const isOnline = useRef(true); // Simple online state

  // Load initial data
  useEffect(() => {
    loadInitialData();
    loadFavorites();
  }, []);

  const loadInitialData = async () => {
    try {
      // Try to load cached data first
      const cached = await storageService.getCachedImages();
      if (cached.length > 0) {
        setImages(cached);
      }
      
      // Then fetch fresh data
      await loadImages(true);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadFavorites = async () => {
    const favs = await storageService.getFavorites();
    setFavorites(favs);
  };

  const loadImages = async (reset = false, params = currentParams) => {
    if (isLoading && !reset) return;

    setIsLoading(true);
    setError(null);

    try {
      const requestId = `fetch-${Date.now()}`;
      const response = await apiService.fetchImages({
        ...params,
        page: reset ? 0 : currentPage.current + 1,
      }, requestId);

      if (response.ok && response.data?.image_list) {
        const newImages = response.data.image_list;
        
        if (reset) {
          setImages(newImages);
          currentPage.current = 0;
        } else {
          setImages(prev => [...prev, ...newImages]);
          currentPage.current += 1;
        }

        setHasMoreImages(newImages.length === params.page_size);
        
        // Cache the data
        const allImages = reset ? newImages : [...images, ...newImages];
        await storageService.setCachedImages(allImages);
        
        isOnline.current = true;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      
      if (error instanceof Error && error.message !== 'Request cancelled') {
        setError(error.message);
        isOnline.current = false;
      }
      
      // If this is initial load and failed, try to load cached data
      if (reset && images.length === 0) {
        const cached = await storageService.getCachedImages();
        if (cached.length > 0) {
          setImages(cached);
          setError('Showing cached images - check your connection');
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!isLoading && hasMoreImages && !searchQuery) {
      loadImages(false);
    }
  }, [isLoading, hasMoreImages, searchQuery]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    currentPage.current = 0;
    await loadImages(true);
  }, []);

  const changeSorting = useCallback(async (sortOption: SortOption) => {
    const newParams = {
      ...currentParams,
      order_by: sortOption.order_by,
      order_asc: sortOption.order_asc,
    };
    setCurrentParams(newParams);
    currentPage.current = 0;
    await loadImages(true, newParams);
  }, [currentParams]);

  // Favorites management
  const toggleFavorite = useCallback(async (imageId: number) => {
    const isFav = favorites.includes(imageId);
    if (isFav) {
      await storageService.removeFavorite(imageId);
      setFavorites(prev => prev.filter(id => id !== imageId));
    } else {
      await storageService.addFavorite(imageId);
      setFavorites(prev => [...prev, imageId]);
    }
  }, [favorites]);

  const getFavoriteImages = useCallback(() => {
    return images.filter(img => favorites.includes(img.id));
  }, [images, favorites]);

  // Search functionality
  const filteredImages = searchQuery.length > 0 
    ? images.filter(img => 
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : images;

  const retry = useCallback(() => {
    currentPage.current = 0;
    loadImages(true);
  }, []);

  return {
    images: filteredImages,
    favorites,
    favoriteImages: getFavoriteImages(),
    isLoading,
    isRefreshing,
    error,
    hasMoreImages: hasMoreImages && !searchQuery,
    searchQuery,
    isOnline: isOnline.current,
    loadMore,
    refresh,
    retry,
    toggleFavorite,
    changeSorting,
    setSearchQuery,
    currentSortOption: SORT_OPTIONS.find(
      opt => opt.order_by === currentParams.order_by && 
             opt.order_asc === currentParams.order_asc
    ) || SORT_OPTIONS[0],
  };
}