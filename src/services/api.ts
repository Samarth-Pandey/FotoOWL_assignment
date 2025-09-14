import Constants from 'expo-constants';
import { ApiResponse, PaginationParams } from '../types';

const API_BASE = 'https://openapi.fotoowl.ai/open/event/image-list';
const API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_FOTOOWL_API_KEY || '4030';
const EVENT_ID = Constants.expoConfig?.extra?.EXPO_PUBLIC_EVENT_ID || '154770';

class ApiService {
  private abortControllers = new Map<string, AbortController>();

  private createUrl(params: PaginationParams): string {
    const url = new URL(API_BASE);
    url.searchParams.set('event_id', EVENT_ID);
    url.searchParams.set('page', params.page.toString());
    url.searchParams.set('page_size', params.page_size.toString());
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('order_by', params.order_by.toString());
    url.searchParams.set('order_asc', params.order_asc.toString());
    return url.toString();
  }

  async fetchImages(
    params: PaginationParams,
    requestId?: string
  ): Promise<ApiResponse> {
    // Cancel previous request with same ID
    if (requestId && this.abortControllers.has(requestId)) {
      this.abortControllers.get(requestId)?.abort();
    }

    const abortController = new AbortController();
    if (requestId) {
      this.abortControllers.set(requestId, abortController);
    }

    try {
      const url = this.createUrl(params);
      // Implement timeout manually using AbortController
      const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 second timeout
      const response = await fetch(url, {
        signal: abortController.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (requestId) {
        this.abortControllers.delete(requestId);
      }

      return data;
    } catch (error) {
      if (requestId) {
        this.abortControllers.delete(requestId);
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  cancelRequest(requestId: string) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  cancelAllRequests() {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }
}

export const apiService = new ApiService();