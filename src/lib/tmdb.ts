import { TMDBShow, TMDBSeasonDetail, TMDBSearchResponse } from '../types/tmdb';
import { POPULAR_SHOWS_MOCK, MOCK_SEASON_EPISODES } from '../data/mockShows';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export function getTMDBApiKey(): string {
  try {
    const savedKey = localStorage.getItem('couch_commander_tmdb_key');
    if (savedKey && savedKey.trim().length > 0) {
      return savedKey.trim();
    }
  } catch {
    // ignore
  }
  return (import.meta.env.VITE_TMDB_API_KEY as string) || '';
}

export async function fetchTrendingShows(): Promise<TMDBShow[]> {
  const apiKey = getTMDBApiKey();
  if (!apiKey) {
    return POPULAR_SHOWS_MOCK;
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${apiKey}&language=en-US`);
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    const data: TMDBSearchResponse = await res.json();
    return data.results.length > 0 ? data.results : POPULAR_SHOWS_MOCK;
  } catch (err) {
    console.warn('Falling back to mock trending shows:', err);
    return POPULAR_SHOWS_MOCK;
  }
}

export async function fetchPopularShows(): Promise<TMDBShow[]> {
  const apiKey = getTMDBApiKey();
  if (!apiKey) {
    return POPULAR_SHOWS_MOCK;
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${apiKey}&language=en-US&page=1`);
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    const data: TMDBSearchResponse = await res.json();
    return data.results.length > 0 ? data.results : POPULAR_SHOWS_MOCK;
  } catch (err) {
    console.warn('Falling back to mock popular shows:', err);
    return POPULAR_SHOWS_MOCK;
  }
}

export async function searchTMDB(query: string): Promise<TMDBShow[]> {
  if (!query || query.trim().length === 0) return [];

  const apiKey = getTMDBApiKey();
  if (!apiKey) {
    // Filter local mock shows
    const q = query.toLowerCase();
    return POPULAR_SHOWS_MOCK.filter(s =>
      s.name.toLowerCase().includes(q) || s.overview.toLowerCase().includes(q)
    );
  }

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );
    if (!res.ok) throw new Error(`TMDB search error: ${res.status}`);
    const data: TMDBSearchResponse = await res.json();
    return data.results;
  } catch (err) {
    console.warn('Search fallback to mock shows:', err);
    const q = query.toLowerCase();
    return POPULAR_SHOWS_MOCK.filter(s =>
      s.name.toLowerCase().includes(q) || s.overview.toLowerCase().includes(q)
    );
  }
}

export async function fetchShowDetails(showId: number): Promise<TMDBShow | null> {
  const apiKey = getTMDBApiKey();
  if (!apiKey) {
    return POPULAR_SHOWS_MOCK.find(s => s.id === showId) || null;
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${showId}?api_key=${apiKey}&language=en-US`);
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    const data: TMDBShow = await res.json();
    return data;
  } catch (err) {
    console.warn('Fetch show details fallback:', err);
    return POPULAR_SHOWS_MOCK.find(s => s.id === showId) || null;
  }
}

export async function fetchSeasonDetails(showId: number, seasonNumber: number): Promise<TMDBSeasonDetail | null> {
  const cacheKey = `${showId}-${seasonNumber}`;
  const apiKey = getTMDBApiKey();

  if (!apiKey) {
    if (MOCK_SEASON_EPISODES[cacheKey]) {
      return MOCK_SEASON_EPISODES[cacheKey];
    }
    // Generate dummy season episodes if requested
    return {
      id: showId * 100 + seasonNumber,
      _id: `gen-${showId}-${seasonNumber}`,
      name: `Season ${seasonNumber}`,
      overview: `Episodes for Season ${seasonNumber}`,
      season_number: seasonNumber,
      poster_path: null,
      air_date: '2024-01-01',
      episodes: Array.from({ length: 10 }, (_, i) => ({
        id: showId * 1000 + seasonNumber * 100 + i + 1,
        name: `Episode ${i + 1}`,
        overview: `Episode ${i + 1} summary and dramatic progression.`,
        episode_number: i + 1,
        season_number: seasonNumber,
        air_date: '2024-01-01',
        still_path: null,
        vote_average: 8.0,
        runtime: 50,
      })),
    };
  }

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${apiKey}&language=en-US`
    );
    if (!res.ok) throw new Error(`TMDB season error: ${res.status}`);
    const data: TMDBSeasonDetail = await res.json();
    return data;
  } catch (err) {
    console.warn('Fetch season fallback:', err);
    return MOCK_SEASON_EPISODES[cacheKey] || null;
  }
}
