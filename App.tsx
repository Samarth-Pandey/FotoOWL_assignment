import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import ImageViewerScreen from './src/screens/ImageViewerScreen';
import FavoritesScreen from './src/screens/FavouritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ThemeProvider } from './src/hooks/useTheme';

export type RootStackParamList = {
  Home: undefined;
  ImageViewer: { imageId: number; initialIndex: number };
  Favorites: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ImageViewer" 
              component={ImageViewerScreen}
              options={{ 
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen 
              name="Favorites" 
              component={FavoritesScreen}
              options={{ title: 'Favorites' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}