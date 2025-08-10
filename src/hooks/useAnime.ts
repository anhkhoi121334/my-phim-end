import { useQuery } from '@tanstack/react-query';
import { movieApi, Movie } from '@/services/api/movieApi';

export interface AnimeData {
  latest: Movie[];
  popular: Movie[];
}

export const useAnime = (limit: number = 50) => {
  return useQuery<AnimeData, Error>({
    queryKey: ['anime', limit],
    queryFn: async () => {
      // Sử dụng API fetchAnimationMovies trực tiếp thay vì lọc từ danh sách phim
      const response = await movieApi.fetchAnimationMovies(1, limit);
      if (!response?.items) {
        throw new Error('Failed to fetch anime movies');
      }

      // Sắp xếp theo rating cho phim phổ biến
      const popularAnime = [...response.items]
        .sort((a, b) => {
          const ratingA = a.rating?.vote_average || 0;
          const ratingB = b.rating?.vote_average || 0;
          return ratingB - ratingA;
        });

      return {
        latest: response.items.slice(0, Math.min(response.items.length, 24)),
        popular: popularAnime.slice(0, Math.min(popularAnime.length, 24))
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}; 