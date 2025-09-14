# FotoOwl Gallery - React Native Image Gallery App

A cross-platform image gallery app built with React Native and Expo, featuring infinite scroll, full-screen viewing, and offline capabilities.

## Features

### Core Features ✅
- **Infinite Scroll Grid**: Optimized image grid with pull-to-refresh
- **Full-Screen Viewer**: Swipe between images with zoom and pan
- **Search & Sort**: Filter by filename and sort by date/name
- **Favorites**: Save and view favorite images locally
- **Offline Support**: Cached images available without internet
- **Dark/Light Theme**: System-aware theme with manual toggle

### Additional Features ✅
- **Share & Save**: Native sharing and save to device gallery
- **Performance Optimized**: Efficient image caching and list virtualization
- **Error Handling**: Robust API error handling with retry mechanisms
- **Responsive Design**: Works on phones and tablets
- **TypeScript**: Full type safety throughout the app

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone and setup:**
```bash
git clone <your-repo-url>
cd FotoOwlGallery
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with your API credentials if different
```

3. **Run the app:**
```bash
# Start Expo development server
npm start

# Run on specific platform
npm run ios       # iOS Simulator
npm run android   # Android Emulator
npm run web       # Web browser
```

## Architecture Overview

The app follows a clean, modular architecture with clear separation of concerns:

### Project Structure
```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── hooks/          # Custom React hooks
├── services/       # API and storage services
├── types/          # TypeScript type definitions
└── __tests__/      # Unit tests
```

### Key Architectural Decisions

**State Management**: Custom hooks with React Context for theme and centralized data management for images/favorites. This provides good performance without adding complexity of external state libraries.

**API Layer**: Service class with request cancellation, timeout handling, and retry logic. Supports pagination and robust error handling for network issues.

**Caching Strategy**: Two-tier caching:
- **Metadata Cache**: AsyncStorage for image metadata and favorites
- **Image Cache**: Expo Image's built-in caching for actual image files

**Navigation**: React Navigation with stack navigator for smooth transitions and proper modal presentation for the image viewer.

## Performance Optimizations

### List Virtualization
- Uses FlatList with optimized props (`windowSize`, `maxToRenderPerBatch`)
- `getItemLayout` for consistent item sizing
- `removeClippedSubviews` for memory efficiency
- Memoized components to prevent unnecessary re-renders

### Image Handling
- Three image sizes: thumbnail (grid), medium (preview), high quality (full-screen)
- Expo Image component with built-in caching and lazy loading
- Placeholder images during loading transitions

### Memory Management
- Request cancellation on component unmount
- Efficient data structures (normalized image data)
- Limited cache size to prevent storage bloat

## API Integration

**Base URL**: `https://openapi.fotoowl.ai/open/event/image-list`

**Parameters**:
- `event_id`: Event identifier 
- `page`: Pagination page number
- `page_size`: Items per page (40)
- `order_by`: Sort field (1=name, 2=date)
- `order_asc`: Sort direction (true/false)
- `key`: API key 

**Error Handling**:
- Network timeouts (10s)
- Request cancellation
- Exponential backoff retry
- Offline mode detection

## Testing

### Unit Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

Test coverage includes:
- Component rendering and interactions
- Custom hooks logic
- API service functionality
- Error scenarios

### Manual Testing Checklist
- [ ] Grid loads with infinite scroll
- [ ] Pull-to-refresh works
- [ ] Image viewer opens and swipes work
- [ ] Favorites can be added/removed
- [ ] Search filters correctly
- [ ] Sort options change order
- [ ] Offline mode shows cached data
- [ ] Theme switching works
- [ ] Share functionality works
- [ ] Save to gallery works (with permissions)

## Known Limitations & Next Steps

### Current Limitations
1. **Search**: Only supports filename search (no metadata search)
2. **Sorting**: Limited to name and date fields from API
3. **Cache Size**: No automatic cache cleanup (could grow large)
4. **Deep Linking**: Basic implementation (could be enhanced)
5. **Analytics**: No usage tracking or performance monitoring

### Planned Improvements
1. **Enhanced Search**: Metadata-based search with filters
2. **Better Caching**: LRU cache with size limits and cleanup
3. **Image Processing**: Watermarking and basic editing features
4. **Social Features**: Comments and sharing within the app
5. **Performance**: Migration to FlashList for better scroll performance
6. **Accessibility**: Better screen reader support and navigation

## Environment Variables

Create `.env` file with:
```env
EXPO_PUBLIC_FOTOOWL_API_KEY=****
EXPO_PUBLIC_EVENT_ID=******
```

## Build for Production

### Development Build
```bash
npx expo install --fix              # Fix dependencies
npx expo build:ios                  # iOS build
npx expo build:android              # Android build
```

### Store Deployment
The app is configured for store deployment with proper icons, splash screens, and permissions. Update `app.config.js` with your bundle identifiers before submitting.

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.


for run,
npx expo start --clear

for build,
npx expo login
eas build --platform android --profile production

