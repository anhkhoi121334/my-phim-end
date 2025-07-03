import { useCallback, useEffect, useState } from 'react';
import useSearchStore from '@/store/searchStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';

export default function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get values from the search store
  const { 
    query, 
    results, 
    isLoading, 
    error, 
    currentPage, 
    totalPages,
    searchHistory,
    setQuery, 
    search, 
    clearResults,
    clearHistory,
    removeFromHistory,
    initializeHistory
  } = useSearchStore();
  
  // Local state for search input
  const [searchInput, setSearchInput] = useState(query || '');
  
  // Initialize search history from localStorage
  useEffect(() => {
    try {
      initializeHistory();
    } catch (error) {
      console.error('Error initializing search history:', error);
    }
  }, []);
  
  // Initialize search from URL query param
  useEffect(() => {
    try {
      const urlQuery = searchParams?.get('q');
      
      if (urlQuery) {
        setSearchInput(urlQuery);
        setQuery(urlQuery);
        search(1);
      } else if (query) {
        // If no URL query but we have a store query, initialize input
        setSearchInput(query);
      }
    } catch (error) {
      console.error('Error initializing from URL:', error);
    }
  }, [searchParams]);
  
  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      try {
        // Update URL if query is not empty
        if (value?.trim()) {
          router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        } else {
          router.push('/search');
        }
        
        // Update store query and perform search
        setQuery(value || '');
        search(1);
      } catch (error) {
        console.error('Error in debounced search:', error);
      }
    }, 500),
    [router, setQuery, search]
  );
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value;
      setSearchInput(value);
      debouncedSearch(value);
    } catch (error) {
      console.error('Error handling input change:', error);
    }
  };
  
  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      
      // Cancel debounce and search immediately
      debouncedSearch.cancel();
      
      // Update URL if query is not empty
      if (searchInput?.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      } else {
        router.push('/search');
      }
      
      // Update store query and perform search
      setQuery(searchInput || '');
      search(1);
    } catch (error) {
      console.error('Error submitting search:', error);
    }
  };
  
  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    try {
      search(page);
      
      // Scroll to top after page change
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error changing page:', error);
    }
  };
  
  // Handle history item click
  const handleHistoryItemClick = (item: string) => {
    try {
      if (!item) return;
      
      setSearchInput(item);
      setQuery(item);
      search(1);
      router.push(`/search?q=${encodeURIComponent(item)}`);
    } catch (error) {
      console.error('Error handling history item click:', error);
    }
  };
  
  return {
    // State
    searchInput: searchInput || '',
    results: Array.isArray(results) ? results : [],
    isLoading: !!isLoading,
    error,
    currentPage: currentPage || 1,
    totalPages: totalPages || 1,
    searchHistory: Array.isArray(searchHistory) ? searchHistory : [],
    
    // Actions
    setSearchInput,
    handleInputChange,
    handleSubmit,
    handlePageChange,
    handleHistoryItemClick,
    clearResults,
    clearHistory,
    removeFromHistory,
  };
} 