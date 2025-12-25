import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY, language: 'tr-TR' }
});

export const fetchTrending = (type, page = 1) => api.get(`/trending/${type}/day`, { params: { page } });
export const fetchGenres = (type) => api.get(`/genre/${type}/list`);
export const fetchDiscovery = (type, filters = {}, page = 1) => {
  const params = {
    page,
    sort_by: filters.sortBy || 'popularity.desc',
    with_genres: filters.genre,
    with_cast: filters.actorId,
    'vote_average.gte': filters.rating,
    'primary_release_date.gte': filters.year ? `${filters.year}-01-01` : undefined,
    'primary_release_date.lte': filters.year ? `${filters.year}-12-31` : undefined
  };
  return api.get(`/discover/${type}`, { params });
};

export const fetchDetails = (type, id) => api.get(`/${type}/${id}?append_to_response=credits,videos,similar`);
export const searchGlobal = (type, query) => api.get(`/search/${type}`, { params: { query } });

export default api;