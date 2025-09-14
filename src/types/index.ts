export interface FotoOwlImage {
  id: number;
  event_id: number;
  name: string;
  mime_type: string;
  width: number;
  height: number;
  img_url: string;
  thumbnail_url: string;
  med_url: string;
  high_url: string;
  create_time: string;
  size: number;
}

export interface ApiResponse {
  ok: boolean;
  data: {
    image_list: FotoOwlImage[];
  };
}

export interface PaginationParams {
  page: number;
  page_size: number;
  order_by: number;
  order_asc: boolean;
}

export interface AppState {
  images: FotoOwlImage[];
  favorites: number[];
  currentPage: number;
  hasMoreImages: boolean;
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
}

export type SortOption = {
  label: string;
  order_by: number;
  order_asc: boolean;
};