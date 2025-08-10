export interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name?: string;
  thumb_url: string;
  poster_url?: string;
  content?: string;
  category?: Array<{
    name: string;
    slug: string;
  }>;
  type?: string;
  status?: string;
  quality?: string;
  lang?: string;
  year?: number;
  time?: string;
  episode_current?: string;
  episode_total?: string;
  created_at?: string;
  modified_at?: string;
}

export interface Episode {
  _id: string;
  name: string;
  slug: string;
  link_embed?: string;
  link_m3u8?: string;
}

export interface MovieDetailResponse {
  status: boolean;
  msg?: string; 
  movie: Movie;
  episodes: {
    server_name: string;
    server_data: Episode[];
  }[];
}