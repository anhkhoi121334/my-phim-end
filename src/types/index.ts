/**
 * Interface định nghĩa cấu trúc Movie
 */
export interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  slug: string;
  type: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  quality: string;
  lang: string;
  episode_current: string;
  episode_total: string;
  time: string;
  content?: string;
  imdb?: string;
  category: Array<{ name: string; slug: string }>;
  country: Array<{ name: string; slug: string }>;
}

/**
 * Interface định nghĩa cấu trúc Pagination
 */
export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Interface định nghĩa cấu trúc MovieResponse
 */
export interface MovieResponse {
  status: boolean;
  items: Movie[];
  pagination: Pagination;
}

/**
 * Interface định nghĩa cấu trúc Episode
 */
export interface Episode {
  server_name: string;
  server_data: Array<{
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
  }>;
}

/**
 * Interface định nghĩa cấu trúc MovieDetail
 */
export interface MovieDetail extends Movie {
  actor: string[];
  director: string[];
  genre: Array<{ name: string; slug: string }>;
  episodes: Episode[];
} 