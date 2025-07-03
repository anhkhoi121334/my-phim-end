import { useQuery } from '@tanstack/react-query';
import { movieApi } from '@/services';
import { Movie } from '@/types';

interface AnimeData {
  latest: Movie[];
  popular: Movie[];
}

const filterAnimeMovies = (movies: Movie[]) => {
  return movies.filter(movie => 
    movie.category?.some(cat => 
      cat.name.toLowerCase().includes('hoạt hình') || 
      cat.name.toLowerCase().includes('anime')
    )
  );
};

export const useAnime = (limit: number = 50) => {
  return useQuery<AnimeData, Error>({
    queryKey: ['anime', limit],
    queryFn: async () => {
      const response = await movieApi.getLatestMovies(1, limit);
      if (!response?.items) {
        throw new Error('Failed to fetch anime movies');
      }

      const animeMovies = filterAnimeMovies(response.items);
      
      // Sắp xếp theo rating cho phim phổ biến
      const popularAnime = [...animeMovies]
        .sort((a, b) => {
          const ratingA = a.rating?.vote_average || 0;
          const ratingB = b.rating?.vote_average || 0;
          return ratingB - ratingA;
        });

      return {
        latest: animeMovies.slice(0, Math.min(animeMovies.length, 24)),
        popular: popularAnime.slice(0, Math.min(popularAnime.length, 24))
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}; 