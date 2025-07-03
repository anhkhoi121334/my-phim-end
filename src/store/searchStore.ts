import { create } from 'zustand';
import { Movie } from '@/services/api/movieApi';
import movieApi from '@/services/api/movieApi';

interface SearchState {
  // Search state
  query: string;
  results: Movie[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  
  // History
  searchHistory: string[];
  
  // Actions
  setQuery: (query: string) => void;
  search: (page?: number) => Promise<void>;
  clearResults: () => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
  initializeHistory: () => void;
}

// Helper for localStorage (safe for SSR)
const getLocalStorage = (key: string, defaultValue: any = []) => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  }
  return defaultValue;
};

const setLocalStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Create the search store
const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  query: '',
  results: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  searchHistory: [],
  
  // Initialize search history from localStorage
  initializeHistory: () => {
    const history = getLocalStorage('searchHistory', []);
    set({ searchHistory: history || [] });
  },
  
  // Set search query
  setQuery: (query) => set({ query }),
  
  // Search movies
  search: async (page = 1) => {
    const { query } = get();
    
    if (!query?.trim()) {
      return set({ 
        results: [], 
        isLoading: false, 
        error: null,
        currentPage: 1,
        totalPages: 1 
      });
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Call the search API
      const response = await movieApi.searchMovies(query, page);
      
      // Update search history - with additional null checks
      if (response?.data && Array.isArray(response.data.items) && response.data.items.length > 0) {
        const history = get().searchHistory || [];
        if (Array.isArray(history) && !history.includes(query)) {
          const newHistory = [query, ...history].slice(0, 10); // Keep last 10 searches
          setLocalStorage('searchHistory', newHistory);
          set({ searchHistory: newHistory });
        }
      }
      
      // Update state with search results - with additional null checks
      set({ 
        results: (response?.data && Array.isArray(response.data.items)) ? response.data.items : [],
        isLoading: false,
        currentPage: response?.data?.currentPage || 1,
        totalPages: response?.data?.totalPages || 1
      });
    } catch (error) {
      console.error('Search error:', error);
      set({ 
        isLoading: false, 
        error: 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.' 
      });
    }
  },
  
  // Clear search results
  clearResults: () => set({ 
    query: '', 
    results: [], 
    currentPage: 1,
    totalPages: 1 
  }),
  
  // Clear search history
  clearHistory: () => {
    setLocalStorage('searchHistory', []);
    set({ searchHistory: [] });
  },
  
  // Remove item from search history
  removeFromHistory: (query) => {
    const history = get().searchHistory || [];
    const newHistory = Array.isArray(history) ? history.filter(item => item !== query) : [];
    setLocalStorage('searchHistory', newHistory);
    set({ searchHistory: newHistory });
  }
}));

export default useSearchStore; 