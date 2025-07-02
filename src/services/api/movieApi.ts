import axios from 'axios';

// Base URL cho API
const API_BASE_URL = 'https://phimapi.com';

// Interface cho các model
export interface Genre {
  _id: string;
  name: string;
  slug: string;
}

export interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  slug: string;
  year: number;
  thumb_url: string;
  poster_url: string;
  quality: string;
  lang: string;
  time: string;
  category: {
    id?: string;
    name: string;
    slug: string;
  }[];
  country: {
    id?: string;
    name: string;
    slug: string;
  }[];
  episode_current: string;
  episode_total: string;
  content?: string;
  tmdb?: {
    type: string;
    id: string;
    season: number;
    vote_average: number;
    vote_count: number;
  };
  rating?: {
    vote_average: number;
    vote_count: number;
  };
}

export interface MovieResponse {
  status: boolean;
  data: {
    items: Movie[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface ServerData {
  server_name: string;
  server_data: Episode[];
}

export interface MovieDetailResponse {
  status: boolean;
  msg: string;
  movie: Movie;
  episodes: ServerData[];
}

/**
 * Lấy danh sách thể loại phim
 * @returns Promise với danh sách thể loại
 */
export const fetchGenres = async (): Promise<Genre[]> => {
  try {
    const response = await axios.get<Genre[]>(`${API_BASE_URL}/the-loai`);
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw new Error('Failed to fetch genres');
  }
};

/**
 * Lấy danh sách phim theo thể loại
 * @param params Các tham số để lọc phim
 * @returns Promise với danh sách phim theo thể loại
 */
export const fetchMoviesByGenre = async ({
  genreSlug,
  page = 1,
  sortField = '_id',
  sortType = 'desc',
  sortLang = '',
  country = '',
  year = '',
  limit = 24,
}: {
  genreSlug: string;
  page?: number;
  sortField?: string;
  sortType?: 'asc' | 'desc';
  sortLang?: string;
  country?: string;
  year?: string | number;
  limit?: number;
}): Promise<MovieResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      sort_field: sortField,
      sort_type: sortType,
      limit: limit.toString(),
    });

    if (sortLang) params.append('sort_lang', sortLang);
    if (country) params.append('country', country);
    if (year) params.append('year', year.toString());

    const url = `${API_BASE_URL}/v1/api/the-loai/${genreSlug}?${params.toString()}`;
    const response = await axios.get<MovieResponse>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movies for genre ${genreSlug}:`, error);
    throw new Error(`Failed to fetch movies for genre ${genreSlug}`);
  }
};

/**
 * Lấy chi tiết phim theo ID
 * @param id ID của phim
 * @returns Promise với chi tiết phim
 */
export const fetchMovieById = async (id: string): Promise<Movie> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/api/phim/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching movie with ID ${id}:`, error);
    throw new Error(`Failed to fetch movie with ID ${id}`);
  }
};

/**
 * Lấy chi tiết phim và danh sách tập phim theo slug
 * @param slug Slug của phim
 * @returns Promise với chi tiết phim và danh sách tập phim
 */
export const getMovieDetails = async (slug: string): Promise<MovieDetailResponse> => {
  try {
    const response = await axios.get<MovieDetailResponse>(`${API_BASE_URL}/phim/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ${slug}:`, error);
    throw new Error(`Failed to fetch movie details for ${slug}`);
  }
};

/**
 * Tìm kiếm phim theo từ khóa
 * @param keyword Từ khóa tìm kiếm
 * @param page Trang cần lấy
 * @param limit Số lượng phim trên mỗi trang
 * @returns Promise với kết quả tìm kiếm
 */
export const searchMovies = async (
  keyword: string,
  page = 1,
  limit = 24
): Promise<MovieResponse> => {
  try {
    const params = new URLSearchParams({
      keyword,
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${API_BASE_URL}/v1/api/tim-kiem?${params.toString()}`;
    const response = await axios.get<MovieResponse>(url);
    return response.data;
  } catch (error) {
    console.error(`Error searching for "${keyword}":`, error);
    throw new Error(`Failed to search for "${keyword}"`);
  }
};

/**
 * Lấy danh sách phim mới nhất
 * @param page Trang cần lấy
 * @param limit Số lượng phim trên mỗi trang
 * @returns Promise với danh sách phim mới nhất
 */
export const getLatestMovies = async (
  page = 1,
  limit = 24
): Promise<{
  status: boolean;
  items: Movie[];
  pagination?: any;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    
    // Kiểm tra và xử lý dữ liệu từ API
    if (response.data && response.data.items) {
      return {
        status: true,
        items: response.data.items,
        pagination: response.data.pagination
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    
    // Fallback: Sử dụng API thể loại để lấy phim mới nhất
    const response = await fetchMoviesByGenre({
      genreSlug: 'hanh-dong', // Thể loại phổ biến để có nhiều phim
      page,
      sortField: '_id', // Sắp xếp theo ID để có phim mới
      sortType: 'desc',
      limit
    });
    
    return {
      status: true,
      items: response.data.items,
      pagination: {
        totalItems: response.data.totalItems,
        totalItemsPerPage: limit,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      }
    };
  }
};

/**
 * Lấy danh sách phim xu hướng/hot nhất
 * @param page Trang cần lấy
 * @param limit Số lượng phim trên mỗi trang
 * @returns Promise với danh sách phim xu hướng
 */
export const getTrendingMovies = async (
  page = 1,
  limit = 24
): Promise<{
  status: boolean;
  items: Movie[];
  pagination?: any;
}> => {
  try {
    // Sử dụng API thể loại để lấy phim xu hướng
    const response = await fetchMoviesByGenre({
      genreSlug: 'hanh-dong', // Thể loại phổ biến để có nhiều phim
      page,
      sortField: '_id', // Sắp xếp theo ID để có phim mới
      sortType: 'desc',
      limit
    });
    
    // Thêm rating giả lập cho các phim
    const moviesWithRating = response.data.items.map(movie => ({
      ...movie,
      rating: {
        vote_average: Math.random() * 3 + 7, // Random từ 7-10
        vote_count: Math.floor(Math.random() * 1000) + 100 // Random từ 100-1100
      }
    }));
    
    return {
      status: true,
      items: moviesWithRating,
      pagination: {
        totalItems: response.data.totalItems,
        totalItemsPerPage: limit,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw new Error('Failed to fetch trending movies');
  }
};

// Export default object với tất cả các hàm
export default {
  fetchGenres,
  fetchMoviesByGenre,
  fetchMovieById,
  getMovieDetails,
  searchMovies,
  getLatestMovies,
  getTrendingMovies
}; 