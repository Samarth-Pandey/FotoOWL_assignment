import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Share,
  Alert,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { useTheme } from '../hooks/useTheme';
import { useImageData } from '../hooks/useImageData';
import { FotoOwlImage } from '../types';

const { width, height } = Dimensions.get('window');

type ImageViewerNavigationProp = StackNavigationProp<RootStackParamList, 'ImageViewer'>;
type ImageViewerRouteProp = RouteProp<RootStackParamList, 'ImageViewer'>;

interface Props {
  navigation: ImageViewerNavigationProp;
  route: ImageViewerRouteProp;
}

export default function ImageViewerScreen({ navigation, route }: Props) {
  const { theme, isDark } = useTheme();
  const { images, favorites, toggleFavorite } = useImageData();
  const { imageId, initialIndex } = route.params;
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const controlsTimeout = useRef<NodeJS.Timeout>();

  const currentImage = images[currentIndex];
  const isFavorite = currentImage ? favorites.includes(currentImage.id) : false;

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    if (showControls) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [showControls]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleShare = async () => {
    if (!currentImage) return;
    
    try {
      await Share.share({
        url: currentImage.img_url,
        message: `Check out this image: ${currentImage.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = async () => {
    if (!currentImage || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permissions to save images.');
        return;
      }

      const fileUri = FileSystem.documentDirectory + currentImage.name;
      const { uri } = await FileSystem.downloadAsync(currentImage.img_url, fileUri);
      
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('FotoOwl Gallery', asset, false);
      
      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      console.error('Error downloading:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFavorite = () => {
    if (currentImage) {
      toggleFavorite(currentImage.id);
    }
  };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const renderImageItem = ({ item }: { item: FotoOwlImage }) => (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={toggleControls}
      style={styles.imageContainer}
    >
      <Image
        source={{ uri: item.img_url }}
        style={styles.image}
        contentFit="contain"
        transition={300}
        placeholder={{ uri: item.thumbnail_url }}
      />
    </TouchableOpacity>
  );

  const keyExtractor = (item: FotoOwlImage) => item.id.toString();

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <StatusBar hidden={!showControls} backgroundColor="#000000" />
      
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderImageItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />

      {showControls && (
        <>
          <SafeAreaView style={styles.topControls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.imageCounter}>
              {currentIndex + 1} / {images.length}
            </Text>
            
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={handleFavorite}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#FF3B30" : "white"} 
              />
            </TouchableOpacity>
          </SafeAreaView>

          <SafeAreaView style={styles.bottomControls}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: isDownloading ? theme.colors.textSecondary : theme.colors.success,
                  opacity: isDownloading ? 0.6 : 1,
                }
              ]}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              <Ionicons 
                name={isDownloading ? "hourglass-outline" : "download-outline"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.actionButtonText}>
                {isDownloading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>

          {currentImage && (
            <View style={styles.imageInfo}>
              <Text style={styles.imageName} numberOfLines={1}>
                {currentImage.name}
              </Text>
              <Text style={styles.imageDetails}>
                {currentImage.width} × {currentImage.height} • {(currentImage.size / 1024 / 1024).toFixed(1)} MB
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageInfo: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  imageName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  imageDetails: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
});