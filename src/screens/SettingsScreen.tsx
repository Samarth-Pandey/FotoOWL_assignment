import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { storageService } from '../services/storage';

export default function SettingsScreen() {
  const { theme, isDark, themeMode, setThemeMode } = useTheme();

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached images and favorites. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearCache();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const ThemeSelector = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Theme
      </Text>
      
      {(['system', 'light', 'dark'] as const).map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[
            styles.themeOption,
            themeMode === mode && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => setThemeMode(mode)}
        >
          <View style={styles.themeOptionContent}>
            <Ionicons
              name={
                mode === 'system' ? 'phone-portrait' :
                mode === 'light' ? 'sunny' : 'moon'
              }
              size={20}
              color={theme.colors.text}
            />
            <Text style={[styles.themeOptionText, { color: theme.colors.text }]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </View>
          {themeMode === mode && (
            <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemeSelector />
        
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Storage
          </Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleClearCache}
          >
            <View style={styles.settingItemContent}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.settingItemText, { color: theme.colors.error }]}>
                Clear Cache
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About
          </Text>
          
          <View style={styles.aboutItem}>
            <Text style={[styles.aboutLabel, { color: theme.colors.textSecondary }]}>
              Version
            </Text>
            <Text style={[styles.aboutValue, { color: theme.colors.text }]}>
              1.0.0
            </Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={[styles.aboutLabel, { color: theme.colors.textSecondary }]}>
              API
            </Text>
            <Text style={[styles.aboutValue, { color: theme.colors.text }]}>
              FotoOwl Public API
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeOptionText: {
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontSize: 16,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 16,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});