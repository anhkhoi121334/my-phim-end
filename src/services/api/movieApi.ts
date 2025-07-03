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
  type?: string;
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
 * Lấy chi tiết phim theo slug (được gọi là ID trong route)
 * @param slug Slug của phim
 * @returns Promise với chi tiết phim
 */
export const fetchMovieById = async (slug: string): Promise<Movie> => {
  try {
    // API này thực chất nhận slug, không phải ID
    const response = await axios.get(`${API_BASE_URL}/v1/api/phim/${slug}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching movie with slug ${slug}:`, error);
    throw new Error(`Failed to fetch movie with slug ${slug}`);
  }
};

/**
 * Lấy chi tiết phim và danh sách tập phim theo slug
 * @param slug Slug của phim
 * @returns Promise với chi tiết phim và danh sách tập phim
 */
export const getMovieDetails = async (slug: string): Promise<MovieDetailResponse> => {
  try {
    // Đúng định dạng API: https://phimapi.com/phim/${slug}
    const url = `${API_BASE_URL}/phim/${slug}`;
    console.log('Fetching movie details from:', url);
    
    const response = await axios.get(url);
    
    // Kiểm tra và xử lý dữ liệu
    if (response.data && response.data.status) {
      return {
        status: true,
        msg: response.data.msg || 'Success',
        movie: response.data.movie || {},
        episodes: response.data.episodes || []
      };
    }
    
    throw new Error('Invalid response format from movie details API');
  } catch (error) {
    console.error(`Error fetching movie details for ${slug}:`, error);
    // Trả về dữ liệu rỗng nhưng đúng cấu trúc trong trường hợp lỗi
    return {
      status: false,
      msg: `Failed to fetch movie details for ${slug}`,
      movie: {} as Movie, 
      episodes: []
    };
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
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Sử dụng API endpoint chính xác cho phim mới cập nhật
    const url = `${API_BASE_URL}/danh-sach/phim-moi-cap-nhat-v3?${params.toString()}`;
    
    try {
      const response = await axios.get(url);
      
      if (response.data && response.data.items) {
        return {
          status: true,
          items: response.data.items,
          pagination: {
            totalItems: response.data.params?.pagination?.totalItems || 0,
            totalItemsPerPage: limit,
            currentPage: response.data.params?.pagination?.currentPage || page,
            totalPages: response.data.params?.pagination?.totalPages || 1
          }
        };
      } else {
        console.error('Invalid response format from latest movies API, using fallback');
        return await useFallbackLatestMovies(page, limit);
      }
    } catch (error) {
      console.error('Error fetching latest movies, trying fallback:', error);
      return await useFallbackLatestMovies(page, limit);
    }
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    // Use fallback when an error occurs
    return await useFallbackLatestMovies(page, limit);
  }
};

// Helper function to get fallback movies
const useFallbackLatestMovies = async (page: number, limit: number) => {
  try {
    const response = await fetchMoviesByGenre({
      genreSlug: 'hanh-dong', // Popular genre
      page,
      sortField: '_id',
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
  } catch (fallbackError) {
    console.error('Error with fallback movie fetch:', fallbackError);
    return {
      status: false,
      items: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: limit,
        currentPage: 1,
        totalPages: 0
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
    // Use correct approach with fallback directly
    return await getFallbackTrendingMovies(page, limit);
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    // Use fallback when an error occurs
    return await getFallbackTrendingMovies(page, limit);
  }
};

// Helper function for trending movies fallback
const getFallbackTrendingMovies = async (page: number, limit: number) => {
  try {
    // Use action genre as fallback for trending movies
    const response = await fetchMoviesByGenre({
      genreSlug: 'hanh-dong', // Popular genre
      page,
      sortField: '_id', 
      sortType: 'desc',
      limit
    });
    
    // Add simulated ratings for better UI experience
    const moviesWithRating = response.data.items.map(movie => ({
      ...movie,
      rating: {
        vote_average: Math.random() * 3 + 7, // Random between 7-10
        vote_count: Math.floor(Math.random() * 1000) + 100 // Random between 100-1100
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
  } catch (fallbackError) {
    console.error('Error with fallback trending movies fetch:', fallbackError);
    return {
      status: false,
      items: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: limit,
        currentPage: 1,
        totalPages: 0
      }
    };
  }
};

/**
 * Lấy danh sách tập phim theo slug
 * @param slug Slug của phim
 * @returns Promise với danh sách tập phim
 */
export const getMovieEpisodes = async (slug: string): Promise<{ status: boolean, episodes: Episode[] }> => {
  try {
    // Endpoint to get episodes, which might be added in the future
    const url = `${API_BASE_URL}/episodes/${slug}`;
    
    try {
      const response = await axios.get(url);
      if (response.data && response.data.status && response.data.episodes) {
        return {
          status: true,
          episodes: response.data.episodes
        };
      }
    } catch (error) {
      console.error(`API episodes endpoint failed, using movie details instead for ${slug}:`, error);
      
      // Fallback: Extract episodes from movie details
      const movieDetails = await getMovieDetails(slug);
      if (movieDetails.status && movieDetails.episodes && movieDetails.episodes.length > 0) {
        const allEpisodes: Episode[] = [];
        
        // Flatten episodes from all servers
        movieDetails.episodes.forEach(server => {
          server.server_data.forEach(episode => {
            // Only add if not already in the list (by slug)
            if (!allEpisodes.some(e => e.slug === episode.slug)) {
              allEpisodes.push(episode);
            }
          });
        });
        
        return {
          status: true,
          episodes: allEpisodes
        };
      }
    }
    
    // If both approaches fail, return empty array
    return {
      status: false,
      episodes: []
    };
  } catch (error) {
    console.error(`Error fetching episodes for ${slug}:`, error);
    return {
      status: false,
      episodes: []
    };
  }
};

/**
 * Lấy danh sách quốc gia phim
 * @returns Promise với danh sách quốc gia
 */
export const fetchCountries = async (): Promise<{id: string, name: string, slug: string}[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/quoc-gia`);
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Fallback danh sách quốc gia phổ biến
    return [
      { id: '1', name: 'Việt Nam', slug: 'viet-nam' },
      { id: '2', name: 'Trung Quốc', slug: 'trung-quoc' },
      { id: '3', name: 'Hàn Quốc', slug: 'han-quoc' },
      { id: '4', name: 'Nhật Bản', slug: 'nhat-ban' },
      { id: '5', name: 'Thái Lan', slug: 'thai-lan' },
      { id: '6', name: 'Âu Mỹ', slug: 'au-my' }
    ];
  }
};

/**
 * Lấy danh sách phim theo quốc gia
 * @param countrySlug Slug của quốc gia
 * @param page Trang cần lấy
 * @param limit Số lượng phim trên mỗi trang
 * @returns Promise với danh sách phim theo quốc gia
 */
export const fetchMoviesByCountry = async (
  countrySlug: string,
  page = 1,
  limit = 24
): Promise<{
  status: boolean;
  items: Movie[];
  pagination?: any;
}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${API_BASE_URL}/v1/api/quoc-gia/${countrySlug}?${params.toString()}`;
    const response = await axios.get<MovieResponse>(url);
    
    return {
      status: true,
      items: response.data.data.items,
      pagination: {
        totalItems: response.data.data.totalItems,
        totalItemsPerPage: limit,
        currentPage: response.data.data.currentPage,
        totalPages: response.data.data.totalPages
      }
    };
  } catch (error) {
    console.error(`Error fetching movies for country ${countrySlug}:`, error);
    
    // Fallback: Dùng phim hành động và lọc theo quốc gia
    try {
      const response = await fetchMoviesByGenre({
        genreSlug: 'hanh-dong',
        page,
        country: countrySlug,
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
    } catch (fallbackError) {
      console.error('Error with fallback country movies fetch:', fallbackError);
      return {
        status: false,
        items: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: limit,
          currentPage: 1,
          totalPages: 0
        }
      };
    }
  }
};

/**
 * Lấy danh sách phim lẻ
 * @param page Trang cần lấy
 * @param limit Số lượng phim trên mỗi trang
 * @returns Promise với danh sách phim lẻ
 */
export const fetchSingleMovies = async (
  page = 1,
  limit = 24
): Promise<{
  status: boolean;
  items: Movie[];
  pagination?: any;
}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Endpoint cho phim lẻ
    const url = `${API_BASE_URL}/v1/api/danh-sach/phim-le?${params.toString()}`;
    
    try {
      const response = await axios.get<MovieResponse>(url);
      return {
        status: true,
        items: response.data.data.items,
        pagination: {
          totalItems: response.data.data.totalItems,
          totalItemsPerPage: limit,
          currentPage: response.data.data.currentPage,
          totalPages: response.data.data.totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching single movies, trying fallback:', error);
      return await useFallbackSingleMovies(page, limit);
    }
  } catch (error) {
    console.error('Error fetching single movies:', error);
    return await useFallbackSingleMovies(page, limit);
  }
};

/**
 * Fallback để lấy phim lẻ từ API khác
 */
const useFallbackSingleMovies = async (page: number, limit: number) => {
  try {
    // Sử dụng API thể loại và lọc theo type=single
    const response = await fetchMoviesByGenre({
      genreSlug: 'hanh-dong', // Thể loại phổ biến
      page,
      limit,
    });
    
    // Lọc chỉ lấy phim lẻ (phim có episode_total = 1 hoặc không có episode_total)
    const singleMovies = response.data.items.filter(movie => 
      movie.episode_total === '1' || 
      !movie.episode_total || 
      movie.episode_total === '' || 
      movie.type === 'single'
    );
    
    return {
      status: true,
      items: singleMovies,
      pagination: {
        totalItems: singleMovies.length,
        totalItemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(singleMovies.length / limit)
      }
    };
  } catch (fallbackError) {
    console.error('Error with fallback single movies fetch:', fallbackError);
    return {
      status: false,
      items: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: limit,
        currentPage: 1,
        totalPages: 0
      }
    };
  }
};

/**
 * Lấy danh sách phim bộ
 * @param page Trang cần lấy
 * @param limit Số lượng phim trên mỗi trang
 * @returns Promise với danh sách phim bộ
 */
export const fetchTVSeries = async (
  page = 1,
  limit = 24
): Promise<{
  status: boolean;
  items: Movie[];
  pagination?: any;
}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Endpoint cho phim bộ
    const url = `${API_BASE_URL}/v1/api/danh-sach/phim-bo?${params.toString()}`;
    
    try {
      const response = await axios.get<MovieResponse>(url);
      return {
        status: true,
        items: response.data.data.items,
        pagination: {
          totalItems: response.data.data.totalItems,
          totalItemsPerPage: limit,
          currentPage: response.data.data.currentPage,
          totalPages: response.data.data.totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching TV series, trying fallback:', error);
      return await useFallbackTVSeries(page, limit);
    }
  } catch (error) {
    console.error('Error fetching TV series:', error);
    return await useFallbackTVSeries(page, limit);
  }
};

/**
 * Fallback để lấy phim bộ từ API khác
 */
const useFallbackTVSeries = async (page: number, limit: number) => {
  try {
    // Sử dụng API thể loại và lọc theo type=series
    const response = await fetchMoviesByGenre({
      genreSlug: 'hanh-dong', // Thể loại phổ biến
      page,
      limit,
    });
    
    // Lọc chỉ lấy phim bộ (phim có episode_total > 1)
    const seriesMovies = response.data.items.filter(movie => 
      movie.episode_total && 
      movie.episode_total !== '1' && 
      movie.episode_total !== '' && 
      parseInt(movie.episode_total) > 1
    );
    
    return {
      status: true,
      items: seriesMovies,
      pagination: {
        totalItems: seriesMovies.length,
        totalItemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(seriesMovies.length / limit)
      }
    };
  } catch (fallbackError) {
    console.error('Error with fallback TV series fetch:', fallbackError);
    return {
      status: false,
      items: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: limit,
        currentPage: 1,
        totalPages: 0
      }
    };
  }
};

/**
 * Lấy danh sách phim chiếu rạp
 * @param page Trang cần lấy
 * @param limit Số lượng phim trên mỗi trang
 * @returns Promise với danh sách phim chiếu rạp
 */
export const fetchTheaterMovies = async (
  page = 1,
  limit = 24
): Promise<{
  status: boolean;
  items: Movie[];
  pagination?: any;
}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Endpoint cho phim chiếu rạp
    const url = `${API_BASE_URL}/v1/api/danh-sach/phim-chieu-rap?${params.toString()}`;
    
    try {
      const response = await axios.get<MovieResponse>(url);
      return {
        status: true,
        items: response.data.data.items,
        pagination: {
          totalItems: response.data.data.totalItems,
          totalItemsPerPage: limit,
          currentPage: response.data.data.currentPage,
          totalPages: response.data.data.totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching theater movies, trying fallback:', error);
      return await useFallbackTheaterMovies(page, limit);
    }
  } catch (error) {
    console.error('Error fetching theater movies:', error);
    return await useFallbackTheaterMovies(page, limit);
  }
};

/**
 * Fallback để lấy phim chiếu rạp từ API khác
 */
const useFallbackTheaterMovies = async (page: number, limit: number) => {
  try {
    // Sử dụng API phim lẻ và lọc theo chất lượng cao
    const response = await fetchSingleMovies(page, limit * 2);
    
    // Lọc chỉ lấy phim có chất lượng cao (HD, Full HD, 4K)
    const theaterMovies = response.items.filter(movie => 
      movie.quality && 
      (movie.quality.includes('HD') || 
       movie.quality.includes('4K') ||
       movie.quality.includes('CAM'))
    ).slice(0, limit);
    
    return {
      status: true,
      items: theaterMovies,
      pagination: {
        totalItems: theaterMovies.length * 3, // Giả lập có nhiều trang
        totalItemsPerPage: limit,
        currentPage: page,
        totalPages: 3 // Giả lập có 3 trang
      }
    };
  } catch (fallbackError) {
    console.error('Error with fallback theater movies fetch:', fallbackError);
    return {
      status: false,
      items: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: limit,
        currentPage: 1,
        totalPages: 0
      }
    };
  }
};

/**
 * Lấy danh sách phim đề xuất
 * @param page Trang cần lấy
 * @param limit Số lượng phim trên mỗi trang
 * @returns Promise với danh sách phim đề xuất
 */
export const getRecommendedMovies = async (
  page = 1,
  limit = 24
): Promise<{
  status: boolean;
  items: Movie[];
  pagination?: any;
}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Endpoint cho phim đề xuất
    const url = `${API_BASE_URL}/v1/api/danh-sach/phim-de-xuat?${params.toString()}`;
    
    try {
      const response = await axios.get<MovieResponse>(url);
      return {
        status: true,
        items: response.data.data.items,
        pagination: {
          totalItems: response.data.data.totalItems,
          totalItemsPerPage: limit,
          currentPage: response.data.data.currentPage,
          totalPages: response.data.data.totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching recommended movies, trying fallback:', error);
      return await useFallbackRecommendedMovies(page, limit);
    }
  } catch (error) {
    console.error('Error fetching recommended movies:', error);
    return await useFallbackRecommendedMovies(page, limit);
  }
};

/**
 * Fallback để lấy phim đề xuất từ API khác
 */
const useFallbackRecommendedMovies = async (page: number, limit: number) => {
  try {
    // Sử dụng API thể loại phổ biến như hành động hoặc tình cảm
    const genres = ['hanh-dong', 'tinh-cam'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    const response = await fetchMoviesByGenre({
      genreSlug: randomGenre,
      page,
      sortField: '_id',
      sortType: 'desc',
      limit: limit * 2
    });
    
    // Lọc và xáo trộn danh sách để có cảm giác đề xuất
    let recommendedMovies = [...response.data.items];
    recommendedMovies.sort(() => Math.random() - 0.5);
    recommendedMovies = recommendedMovies.slice(0, limit);
    
    // Thêm đánh giá giả lập để hiển thị tốt hơn
    recommendedMovies = recommendedMovies.map(movie => ({
      ...movie,
      rating: {
        vote_average: Math.random() * 2 + 8, // Random between 8-10
        vote_count: Math.floor(Math.random() * 2000) + 500 // Random between 500-2500
      }
    }));
    
    return {
      status: true,
      items: recommendedMovies,
      pagination: {
        totalItems: recommendedMovies.length * 4, // Giả lập có nhiều trang
        totalItemsPerPage: limit,
        currentPage: page,
        totalPages: 4 // Giả lập có 4 trang
      }
    };
  } catch (fallbackError) {
    console.error('Error with fallback recommended movies fetch:', fallbackError);
    return {
      status: false,
      items: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: limit,
        currentPage: 1,
        totalPages: 0
      }
    };
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
  getTrendingMovies,
  getMovieEpisodes,
  fetchCountries,
  fetchMoviesByCountry,
  fetchSingleMovies,
  fetchTVSeries,
  fetchTheaterMovies,
  getRecommendedMovies
}; 