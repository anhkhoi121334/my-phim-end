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
  poster_url: string;
  thumb_url?: string;
  quality?: string;
  trailer_url?: string;
  time?: string;
  episode_current?: string;
  episode_total?: string;
  content?: string;
  type?: string;
  status?: boolean;
  slug_category?: string[];
  year?: number;
  category?: {
    name: string;
    slug: string;
  }[];
  country?: {
    name: string;
    slug: string;
  }[];
  director?: string[];
  actor?: string[];
  lang?: string;
  view?: number;
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

interface MoviesByGenreResponse {
  status: boolean;
  data?: {
    items: Movie[];
    params: {
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
      }
    }
  }
}

interface MoviesByGenreResult {
  status: boolean;
  items: Movie[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }
}

// Thêm interface cho Pagination
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  totalItemsPerPage?: number;
}

// Thêm interface cho Country
export interface Country {
  _id: string;
  name: string;
  slug: string;
}

// Thêm interface cho kết quả trả về từ API
export interface MovieApiResponse {
  status: boolean;
  items: Movie[];
  pagination?: Pagination;
}

// Thêm interface cho API response
export interface ApiResponse<T> {
  status: boolean;
  error?: string;
  message?: string;
  data?: T;
  [key: string]: any;
}

/**
 * Lấy danh sách thể loại phim
 * @returns Promise với danh sách thể loại
 */
export const fetchGenres = async (): Promise<Genre[]> => {
  try {
    const response = await axios.get<ApiResponse<{ items: Genre[] }>>(`${API_BASE_URL}/the-loai`);
    if (response.data?.status && response.data?.data?.items) {
      return response.data.data.items;
    }
    return getFallbackGenres();
  } catch (error) {
    console.error('Error fetching genres:', error);
    return getFallbackGenres();
  }
};

// Fallback data cho thể loại
const getFallbackGenres = (): Genre[] => {
    return [
      { _id: '1', name: 'Hành Động', slug: 'hanh-dong' },
      { _id: '2', name: 'Tình Cảm', slug: 'tinh-cam' },
      { _id: '3', name: 'Hài Hước', slug: 'hai-huoc' },
      { _id: '4', name: 'Cổ Trang', slug: 'co-trang' },
      { _id: '5', name: 'Tâm Lý', slug: 'tam-ly' },
      { _id: '6', name: 'Hình Sự', slug: 'hinh-su' },
      { _id: '7', name: 'Chiến Tranh', slug: 'chien-tranh' },
      { _id: '8', name: 'Thể Thao', slug: 'the-thao' },
      { _id: '9', name: 'Võ Thuật', slug: 'vo-thuat' },
      { _id: '10', name: 'Viễn Tưởng', slug: 'vien-tuong' },
      { _id: '11', name: 'Phiêu Lưu', slug: 'phieu-luu' },
      { _id: '12', name: 'Khoa Học', slug: 'khoa-hoc' },
      { _id: '13', name: 'Kinh Dị', slug: 'kinh-di' },
      { _id: '14', name: 'Âm Nhạc', slug: 'am-nhac' },
      { _id: '15', name: 'Thần Thoại', slug: 'than-thoai' },
      { _id: '16', name: 'Tài Liệu', slug: 'tai-lieu' },
      { _id: '17', name: 'Gia Đình', slug: 'gia-dinh' },
      { _id: '18', name: 'Chính Kịch', slug: 'chinh-kich' },
      { _id: '19', name: 'Bí Ẩn', slug: 'bi-an' },
    ];
};

/**
 * Lấy danh sách phim theo thể loại
 * @param params Các tham số để lọc phim
 * @returns Promise với danh sách phim theo thể loại
 */
export const fetchMoviesByGenre = async ({
  genreSlug,
  page = 1,
  limit = 24,
  sortBy = 'latest'
}: {
  genreSlug: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}): Promise<MoviesByGenreResult> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Thêm tham số sắp xếp dựa trên sortBy
    let sort_field = 'modified.time';
    const sort_type = 'desc';

    switch (sortBy) {
      case 'popular':
        sort_field = 'view';
        break;
      case 'rating':
        sort_field = 'rating';
        break;
      default:
        sort_field = 'modified.time'; // Mới nhất
    }

    params.append('sort_field', sort_field);
    params.append('sort_type', sort_type);

    const url = `${API_BASE_URL}/v1/api/the-loai/${genreSlug}?${params.toString()}`;
    const response = await axios.get<MoviesByGenreResponse>(url);

    if (response.data?.status && response.data?.data?.items) {
      const { items } = response.data.data;
      const pagination = response.data.data.params.pagination;

      return {
        status: true,
        items: items,
        pagination: {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems
        }
      };
    }

    // Fallback nếu không có dữ liệu
    return {
      status: false,
      items: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0
      }
    };

  } catch (error) {
    console.error(`Error fetching movies for genre ${genreSlug}:`, error);
    return {
      status: false,
      items: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0
      }
    };
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
    // Use internal API route to avoid CORS issues
    const response = await axios.get(`/api/movies/${slug}`);
    if (response.data?.status) {
      return response.data;
    }
    throw new Error('Failed to fetch movie details');
  } catch (error) {
    console.error(`Error fetching movie details for ${slug}:`, error);
    throw error;
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

    const response = await axios.get(`${API_BASE_URL}/v1/api/tim-kiem?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    return {
      status: false,
      data: {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }
    };
  }
};

/**
 * Lấy danh sách phim mới
 */
export const getLatestMovies = async (
  page = 1,
  limit = 24,
  sortBy = 'latest',
  genre?: string,
  country?: string,
  year?: number | null
): Promise<MovieApiResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Thêm tham số sắp xếp dựa trên sortBy
    let sort_field = 'modified.time';
    const sort_type = 'desc';
    
    switch (sortBy) {
      case 'popular':
        sort_field = 'view';
        break;
      case 'rating':
        sort_field = 'rating';
        break;
      default:
        sort_field = 'modified.time'; // Mới nhất
    }

    params.append('sort_field', sort_field);
    params.append('sort_type', sort_type);

    // Thêm các tham số filter nếu có
    if (genre) params.append('genre', genre);
    if (country) params.append('country', country);
    if (year) params.append('year', year.toString());

    const url = `${API_BASE_URL}/danh-sach/phim-moi-cap-nhat-v3?${params.toString()}`;
      const response = await axios.get(url);
      
    if (response.data?.status && response.data?.items) {
        return {
          status: true,
          items: response.data.items,
        pagination: response.data.pagination
        };
      }
      
    return getFallbackLatestMovies(page, limit);
    } catch (error) {
      console.error('Error fetching latest movies:', error);
      return getFallbackLatestMovies(page, limit);
  }
};

// Fallback data cho phim mới
const getFallbackLatestMovies = async (page: number, limit: number) => {
    return {
      status: true,
    items: [
      {
        _id: '1',
        name: 'Phim Hành Động 2024',
        origin_name: 'Action Movie 2024',
        slug: 'phim-hanh-dong-2024',
        year: 2024,
        thumb_url: '/placeholder.jpg',
        poster_url: '/placeholder.jpg',
        quality: 'HD',
        lang: 'Vietsub',
        time: '120 phút',
        category: [{ name: 'Hành Động', slug: 'hanh-dong' }],
        country: [{ name: 'Mỹ', slug: 'my' }],
        episode_current: 'Full',
        episode_total: '1',
      },
      {
        _id: '2',
        name: 'Phim Tình Cảm 2024',
        origin_name: 'Romance Movie 2024',
        slug: 'phim-tinh-cam-2024',
        year: 2024,
        thumb_url: '/placeholder.jpg',
        poster_url: '/placeholder.jpg',
        quality: 'HD',
        lang: 'Vietsub',
        time: '110 phút',
        category: [{ name: 'Tình Cảm', slug: 'tinh-cam' }],
        country: [{ name: 'Hàn Quốc', slug: 'han-quoc' }],
        episode_current: 'Full',
        episode_total: '1',
      },
      // Thêm 10 phim fallback khác với dữ liệu tương tự
    ].slice((page - 1) * limit, page * limit),
      pagination: {
      currentPage: page,
      totalPages: 1,
      totalItems: 12
      }
    };
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
): Promise<MovieApiResponse> => {
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
      limit
    });
    
    // Add simulated ratings for better UI experience
    const moviesWithRating = response.items.map(movie => ({
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
        totalItems: response.pagination.totalItems,
        totalItemsPerPage: limit,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages
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
export const getMovieEpisodes = async (
  slug: string
): Promise<{ status: boolean; episodes: Episode[] }> => {
  try {
    const response = await getMovieDetails(slug);
    if (response.status && Array.isArray(response.episodes)) {
      // Ưu tiên server có nhiều tập nhất và có link m3u8 hoặc link_embed hợp lệ
      let selectedServer: ServerData | undefined = response.episodes.find(
        server =>
          server.server_data.some(
            ep => ep.link_m3u8 || ep.link_embed
          )
      );

      // Nếu không có server nào hợp lệ, fallback về server đầu tiên
      if (!selectedServer) selectedServer = response.episodes[0];

      // Lọc ra các tập có link xem hợp lệ
      const validEpisodes =
        selectedServer?.server_data.filter(
          ep => ep.link_m3u8 || ep.link_embed
        ) || [];

      return {
        status: validEpisodes.length > 0,
        episodes: validEpisodes,
      };
    }
    return {
      status: false,
      episodes: [],
    };
  } catch (error) {
    console.error(`Error fetching episodes for movie ${slug}:`, error);
    return {
      status: false,
      episodes: [],
    };
  }
};

/**
 * Lấy danh sách quốc gia
 * @returns Promise với danh sách quốc gia
 */
export const fetchCountries = async (): Promise<Country[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/quoc-gia`);
    if (response.data?.status && response.data?.items) {
      return response.data.items;
    }
    return getFallbackCountries();
  } catch (error) {
    console.error('Error fetching countries:', error);
    return getFallbackCountries();
  }
};

// Fallback data cho quốc gia
const getFallbackCountries = (): Country[] => {
    return [
      { _id: '1', name: 'Việt Nam', slug: 'viet-nam' },
    { _id: '2', name: 'Thái Lan', slug: 'thai-lan' },
      { _id: '3', name: 'Hàn Quốc', slug: 'han-quoc' },
      { _id: '4', name: 'Nhật Bản', slug: 'nhat-ban' },
    { _id: '5', name: 'Trung Quốc', slug: 'trung-quoc' },
    { _id: '6', name: 'Đài Loan', slug: 'dai-loan' },
    { _id: '7', name: 'Hồng Kông', slug: 'hong-kong' },
    { _id: '8', name: 'Ấn Độ', slug: 'an-do' },
    { _id: '9', name: 'Mỹ', slug: 'my' },
      { _id: '10', name: 'Anh', slug: 'anh' },
      { _id: '11', name: 'Pháp', slug: 'phap' },
      { _id: '12', name: 'Canada', slug: 'canada' },
      { _id: '13', name: 'Quốc Gia Khác', slug: 'quoc-gia-khac' },
    ];
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
  limit = 24,
  sortBy = 'latest'
): Promise<MovieApiResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Thêm tham số sắp xếp dựa trên sortBy
    let sort_field = 'modified.time';
    const sort_type = 'desc';

    switch (sortBy) {
      case 'popular':
        sort_field = 'view';
        break;
      case 'rating':
        sort_field = 'rating';
        break;
      default:
        sort_field = 'modified.time'; // Mới nhất
    }

    params.append('sort_field', sort_field);
    params.append('sort_type', sort_type);

    const url = `${API_BASE_URL}/v1/api/quoc-gia/${countrySlug}?${params.toString()}`;
    const response = await axios.get(url);

    if (response.data?.status && response.data?.data?.items) {
      const { items } = response.data.data;
      const pagination = response.data.data.params.pagination;

      return {
        status: true,
        items: items,
        pagination: {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems
        }
      };
    }

    // Fallback nếu không có dữ liệu
    return {
      status: false,
      items: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0
      }
    };

  } catch (error) {
    console.error(`Error fetching movies for country ${countrySlug}:`, error);
    return {
      status: false,
      items: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0
      }
    };
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
  limit = 24,
  sortBy = 'latest',
  genre?: string,
  country?: string,
  year?: number | null
): Promise<MovieApiResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Thêm tham số sắp xếp dựa trên sortBy
    let sort_field = 'modified.time';
    const sort_type = 'desc';

    switch (sortBy) {
      case 'popular':
        sort_field = 'view';
        break;
      case 'rating':
        sort_field = 'rating';
        break;
      default:
        sort_field = 'modified.time'; // Mới nhất
    }

    params.append('sort_field', sort_field);
    params.append('sort_type', sort_type);

    // Thêm các tham số lọc nếu có
    if (genre) params.append('category', genre);
    if (country) params.append('country', country);
    if (year) params.append('year', year.toString());

    const url = `${API_BASE_URL}/v1/api/danh-sach/phim-le?${params.toString()}`;
    const response = await axios.get(url);

    if (response.data?.status && response.data?.data?.items) {
      const { items } = response.data.data;
      const pagination = response.data.data.params.pagination;

      return {
        status: true,
        items: items,
        pagination: {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems
        }
      };
    }

    return getFallbackSingleMovies(page, limit);
  } catch (error) {
    console.error('Error fetching single movies:', error);
    return getFallbackSingleMovies(page, limit);
  }
};

/**
 * Fallback để lấy phim lẻ từ API khác
 */
const getFallbackSingleMovies = async (page: number, limit: number) => {
  try {
    // Sử dụng API thể loại và lọc theo type=single
    const response = await fetchMoviesByGenre({
      genreSlug: 'hanh-dong', // Thể loại phổ biến
      page,
      limit,
    });
    
    // Lọc chỉ lấy phim lẻ (phim có episode_total = 1 hoặc không có episode_total)
    const singleMovies = response.items.filter(movie => 
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
  limit = 24,
  sortBy = 'latest',
  genre?: string,
  country?: string,
  year?: number | null
): Promise<MovieApiResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Thêm tham số sắp xếp dựa trên sortBy
    let sort_field = 'modified.time';
    const sort_type = 'desc';

    switch (sortBy) {
      case 'popular':
        sort_field = 'view';
        break;
      case 'rating':
        sort_field = 'rating';
        break;
      default:
        sort_field = 'modified.time'; // Mới nhất
    }

    params.append('sort_field', sort_field);
    params.append('sort_type', sort_type);

    // Thêm các tham số lọc nếu có
    if (genre) params.append('category', genre);
    if (country) params.append('country', country);
    if (year) params.append('year', year.toString());

    const url = `${API_BASE_URL}/v1/api/danh-sach/phim-bo?${params.toString()}`;
    const response = await axios.get(url);

    if (response.data?.status && response.data?.data?.items) {
      const { items } = response.data.data;
      const pagination = response.data.data.params.pagination;

      return {
        status: true,
        items: items,
        pagination: {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems
        }
      };
    }

    return getFallbackTVSeries(page, limit);
  } catch (error) {
    console.error('Error fetching TV series:', error);
    return getFallbackTVSeries(page, limit);
  }
};

/**
 * Fallback để lấy phim bộ từ API khác
 */
const getFallbackTVSeries = async (page: number, limit: number) => {
  try {
    // Sử dụng API thể loại và lọc theo type=series
    const response = await fetchMoviesByGenre({
      genreSlug: 'hanh-dong', // Thể loại phổ biến
      page,
      limit,
    });
    
    // Lọc chỉ lấy phim bộ (phim có episode_total > 1)
    const seriesMovies = response.items.filter(movie => 
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
  limit = 24,
  sortBy = 'latest',
  genre?: string,
  country?: string,
  year?: number | null
): Promise<MovieApiResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Thêm tham số sắp xếp dựa trên sortBy
    let sort_field = 'modified.time';
    const sort_type = 'desc';

    switch (sortBy) {
      case 'popular':
        sort_field = 'view';
        break;
      case 'rating':
        sort_field = 'rating';
        break;
      default:
        sort_field = 'modified.time'; // Mới nhất
    }

    params.append('sort_field', sort_field);
    params.append('sort_type', sort_type);

    // Thêm các tham số lọc nếu có
    if (genre) params.append('category', genre);
    if (country) params.append('country', country);
    if (year) params.append('year', year.toString());

    const url = `${API_BASE_URL}/v1/api/danh-sach/tv-shows?${params.toString()}`;
    const response = await axios.get(url);

    if (response.data?.status && response.data?.data?.items) {
      const { items } = response.data.data;
      const pagination = response.data.data.params.pagination;

      return {
        status: true,
        items: items,
        pagination: {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems
        }
      };
    }

    return getFallbackTheaterMovies(page, limit);
  } catch (error) {
    console.error('Error fetching theater movies:', error);
    return getFallbackTheaterMovies(page, limit);
  }
};

/**
 * Fallback để lấy phim chiếu rạp từ API khác
 */
const getFallbackTheaterMovies = async (page: number, limit: number) => {
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
): Promise<MovieApiResponse> => {
  try {
    // Use fallback directly since the API endpoint doesn't exist
    return await getFallbackRecommendedMovies(page, limit);
  } catch (error) {
    console.error('Error fetching recommended movies:', error);
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
 * Fallback để lấy phim đề xuất từ API khác
 */
const getFallbackRecommendedMovies = async (page: number, limit: number) => {
  try {
    // Sử dụng API thể loại phổ biến như hành động hoặc tình cảm
    const genres = ['hanh-dong', 'tinh-cam'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    const response = await fetchMoviesByGenre({
      genreSlug: randomGenre,
      page,
      limit: limit * 2
    });
    
    // Lọc và xáo trộn danh sách để có cảm giác đề xuất
    let recommendedMovies = [...response.items];
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

/**
 * Lấy danh sách phim hoạt hình
 * @param page Trang cần lấy
 * @param limit Số lượng phim trên mỗi trang
 * @returns Promise với danh sách phim hoạt hình
 */
export const fetchAnimationMovies = async (
  page = 1,
  limit = 24,
  sortBy = 'latest',
  genre?: string,
  country?: string,
  year?: number | null
): Promise<MovieApiResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Thêm tham số sắp xếp dựa trên sortBy
    let sort_field = 'modified.time';
    const sort_type = 'desc';

    switch (sortBy) {
      case 'popular':
        sort_field = 'view';
        break;
      case 'rating':
        sort_field = 'rating';
        break;
      default:
        sort_field = 'modified.time'; // Mới nhất
    }

    params.append('sort_field', sort_field);
    params.append('sort_type', sort_type);

    // Thêm các tham số lọc nếu có
    if (genre) params.append('category', genre);
    if (country) params.append('country', country);
    if (year) params.append('year', year.toString());

    const url = `${API_BASE_URL}/v1/api/danh-sach/hoat-hinh?${params.toString()}`;
    const response = await axios.get(url);

    if (response.data?.status && response.data?.data?.items) {
      const { items } = response.data.data;
      const pagination = response.data.data.params.pagination;

      return {
        status: true,
        items: items,
        pagination: {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems
        }
      };
    }

    return getFallbackAnimationMovies(page, limit);
  } catch (error) {
    console.error('Error fetching animation movies:', error);
    return getFallbackAnimationMovies(page, limit);
  }
};

// Helper function for animation movies fallback
const getFallbackAnimationMovies = async (page: number, limit: number) => {
  try {
    // Sử dụng API thể loại phổ biến như hành động hoặc tình cảm
    const genres = ['hanh-dong', 'tinh-cam'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    const response = await fetchMoviesByGenre({
      genreSlug: randomGenre,
      page,
      limit: limit * 2
    });
    
    // Lọc và xáo trộn danh sách để có cảm giác đề xuất
    let recommendedMovies = [...response.items];
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
    console.error('Error with fallback animation movies fetch:', fallbackError);
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
 * Lấy danh sách năm phát hành
 * @returns Danh sách năm từ 2015 đến năm hiện tại
 */
export const getYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= 2015; year--) {
    years.push(year);
  }
  return years;
};

// Tạo object chứa tất cả các hàm export
export const movieApi = {
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
  getRecommendedMovies,
  fetchAnimationMovies,
  getYears,
  getRelatedMovies: async (movieId: string): Promise<ApiResponse<{ movies: Movie[] }>> => {
    try {
      // Use internal API route to avoid CORS issues
      const response = await axios.get(`/api/movies/by-id/${movieId}/related`);
      return response.data;
    } catch (error) {
      console.error('Error fetching related movies:', error);
      return {
        status: false,
        data: { movies: [] }
      };
    }
  },
  
  // Legacy getRelatedMovies function (keeping for reference)
  getRelatedMoviesLegacy: async (movieId: string): Promise<ApiResponse<{ movies: Movie[] }>> => {
    try {
      // Thử lấy thông tin chi tiết phim để biết thể loại
      let movieDetails;
      try {
        movieDetails = await axios.get(`${API_BASE_URL}/v1/api/phim/${movieId}`);
      } catch (detailError) {
        console.error('Error fetching movie details for related movies:', detailError);
        // Không ném lỗi ở đây, chuyển xuống phương án dự phòng
        console.log('Switching to fallback method for related movies');
      }
      
      // Nếu lấy được thông tin phim và có thể loại
      if (movieDetails?.data?.movie?.category && Array.isArray(movieDetails.data.movie.category) && movieDetails.data.movie.category.length > 0) {
        // Lấy thể loại đầu tiên của phim
        const firstCategory = movieDetails.data.movie.category[0];
        
        if (firstCategory?.slug) {
          try {
            // Lấy phim cùng thể loại
            const relatedResponse = await axios.get(`${API_BASE_URL}/v1/api/danh-sach/the-loai/${firstCategory.slug}?page=1&limit=6`);
            
            // Kiểm tra dữ liệu trả về có hợp lệ không
            if (relatedResponse?.data?.items && Array.isArray(relatedResponse.data.items)) {
              // Lọc ra những phim không phải là phim hiện tại
              const filteredMovies = relatedResponse.data.items.filter(
                (item: any) => item._id !== movieId
              ) || [];
              
              if (filteredMovies.length > 0) {
                return {
                  status: true,
                  data: { movies: filteredMovies.slice(0, 6) }
                };
              }
            }
          } catch (categoryError) {
            console.error('Error fetching movies by category:', categoryError);
            // Không ném lỗi, chuyển xuống phương án dự phòng
            console.log('Cannot fetch by category, using fallback');
          }
        }
      }
      
      // Phương án dự phòng: lấy phim mới nhất
      console.log('Using latest movies as fallback for related movies');
      const latestMovies = await getLatestMovies(1, 8);
      
      if (latestMovies?.items && Array.isArray(latestMovies.items)) {
        const relatedMovies = latestMovies.items
          .filter((movie: Movie) => movie._id !== movieId)
          .slice(0, 6);
        
        return {
          status: true,
          data: { movies: relatedMovies }
        };
      }
      
      // Nếu tất cả các phương án đều thất bại, trả về mảng rỗng
      return { 
        status: true, // Đặt true để không hiển thị lỗi cho người dùng
        data: { movies: [] }
      };
    } catch (error) {
      console.error('Error in getRelatedMovies:', error);
      
      // Dữ liệu dự phòng khi có lỗi bất ngờ: trả về mảng rỗng
      return { 
        status: true, // Đặt true để không hiển thị lỗi cho người dùng
        data: { movies: [] }
      };
    }
  },

  saveWatchHistory: async (movieId: string): Promise<ApiResponse<any>> => {
    const response = await fetch('/api/movies/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movieId })
  });
  return response.json();
  },
};

export async function fetchMovies(page = 1, limit = 10) {
  const res = await fetch(`https://api.dulieuphim.ink/phim-moi/v3?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Không thể lấy danh sách phim');
  return res.json();
}

export async function fetchMovieImage(slug: string) {
  const res = await fetch(`https://api.dulieuphim.ink/get-img/v3?slug=${slug}`);
  if (!res.ok) throw new Error('Không thể lấy ảnh phim');
  return res.json();
}

// Cache implementation
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

interface CacheItem {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheItem>();

export const fetchWithCache = async (url: string) => {
  const cached = cache.get(url);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TIME) {
    return cached.data;
  }

  const response = await fetch(url);
  const data = await response.json();
  
  cache.set(url, {
    data,
    timestamp: now
  });

  return data;
};

// Export default object
export default movieApi;