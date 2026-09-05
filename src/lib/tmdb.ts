import { TMDBShow, TMDBSeasonDetail, TMDBEpisode, TMDBSeasonSummary, TMDBSearchResponse } from '../types/tmdb';
import { POPULAR_SHOWS_MOCK, MOCK_SEASON_EPISODES } from '../data/mockShows';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TVMAZE_BASE_URL = 'https://api.tvmaze.com';

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

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

interface TVMazeShowItem {
  id: number;
  name: string;
  summary?: string;
  premiered?: string;
  rating?: { average: number | null };
  weight?: number;
  genres?: string[];
  status?: string;
  network?: { id: number; name: string };
  webChannel?: { id: number; name: string };
  image?: { medium: string; original: string } | null;
  _embedded?: {
    seasons?: Array<{
      id: number;
      number: number;
      name?: string;
      summary?: string;
      episodeOrder?: number;
      premiereDate?: string;
      image?: { medium: string; original: string } | null;
    }>;
    episodes?: Array<{
      id: number;
      name: string;
      season: number;
      number: number;
      airdate?: string;
      runtime?: number;
      summary?: string;
      rating?: { average: number | null };
      image?: { medium: string; original: string } | null;
    }>;
  };
}

function mapTVMazeToShow(show: TVMazeShowItem): TMDBShow {
  const seasons: TMDBSeasonSummary[] = show._embedded?.seasons?.map((s) => ({
    id: s.id,
    season_number: s.number,
    name: s.name || `Season ${s.number}`,
    overview: stripHtml(s.summary),
    poster_path: s.image?.original || s.image?.medium || show.image?.original || null,
    air_date: s.premiereDate || null,
    episode_count: s.episodeOrder || 8,
  })) || [];

  return {
    id: show.id,
    name: show.name,
    overview: stripHtml(show.summary) || 'No overview available.',
    poster_path: show.image?.original || show.image?.medium || null,
    backdrop_path: show.image?.original || null,
    first_air_date: show.premiered || '',
    vote_average: show.rating?.average || 8.0,
    vote_count: show.weight ? show.weight * 10 : 120,
    popularity: show.weight || 80,
    genres: show.genres?.map((g, i) => ({ id: i + 1, name: g })) || [],
    status: show.status || 'Active',
    networks: show.network
      ? [{ id: show.network.id, name: show.network.name, logo_path: null }]
      : show.webChannel
      ? [{ id: show.webChannel.id, name: show.webChannel.name, logo_path: null }]
      : [],
    number_of_seasons: seasons.length > 0 ? seasons.length : 1,
    number_of_episodes: show._embedded?.episodes?.length || (seasons.length > 0 ? seasons.length * 8 : 10),
    seasons: seasons.length > 0 ? seasons : undefined,
  };
}

// In-memory cache for fast lookups and offline resilience
const showDetailsCache = new Map<number, TMDBShow>();
const seasonDetailsCache = new Map<string, TMDBSeasonDetail>();

export async function fetchTrendingShows(): Promise<TMDBShow[]> {
  const apiKey = getTMDBApiKey();
  if (apiKey) {
    try {
      const res = await fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${apiKey}&language=en-US`);
      if (res.ok) {
        const data: TMDBSearchResponse = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results;
        }
      }
    } catch (err) {
      console.warn('TMDB trending error:', err);
    }
  }

  // Live query from TVMaze for trending hot titles
  const trendingQueries = ['The Gentlemen', 'Severance', 'House of the Dragon', 'The Bear', 'Fallout', 'Shogun', 'Slow Horses', 'Silo'];
  try {
    const promises = trendingQueries.map(async (q) => {
      const res = await fetch(`${TVMAZE_BASE_URL}/search/shows?q=${encodeURIComponent(q)}`);
      if (!res.ok) return null;
      const results: Array<{ score: number; show: TVMazeShowItem }> = await res.json();
      return results.length > 0 ? mapTVMazeToShow(results[0].show) : null;
    });

    const shows = (await Promise.all(promises)).filter((s): s is TMDBShow => s !== null);
    if (shows.length > 0) return shows;
  } catch (err) {
    console.warn('TVMaze trending fallback error:', err);
  }

  return POPULAR_SHOWS_MOCK;
}

export async function fetchPopularShows(): Promise<TMDBShow[]> {
  const apiKey = getTMDBApiKey();
  if (apiKey) {
    try {
      const res = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${apiKey}&language=en-US&page=1`);
      if (res.ok) {
        const data: TMDBSearchResponse = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results;
        }
      }
    } catch (err) {
      console.warn('TMDB popular error:', err);
    }
  }

  const popularQueries = ['Breaking Bad', 'The Boys', 'Stranger Things', 'Game of Thrones', 'Succession', 'The Last of Us', 'Ted Lasso', 'The Mandalorian'];
  try {
    const promises = popularQueries.map(async (q) => {
      const res = await fetch(`${TVMAZE_BASE_URL}/search/shows?q=${encodeURIComponent(q)}`);
      if (!res.ok) return null;
      const results: Array<{ score: number; show: TVMazeShowItem }> = await res.json();
      return results.length > 0 ? mapTVMazeToShow(results[0].show) : null;
    });

    const shows = (await Promise.all(promises)).filter((s): s is TMDBShow => s !== null);
    if (shows.length > 0) return shows;
  } catch (err) {
    console.warn('TVMaze popular fallback error:', err);
  }

  return POPULAR_SHOWS_MOCK;
}

export async function searchTMDB(query: string): Promise<TMDBShow[]> {
  if (!query || query.trim().length === 0) return [];

  const apiKey = getTMDBApiKey();
  if (apiKey) {
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
      );
      if (res.ok) {
        const data: TMDBSearchResponse = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results;
        }
      }
    } catch (err) {
      console.warn('TMDB search error, falling back to TVMaze:', err);
    }
  }

  // Live universal TV database search with TVMaze (No API Key Required)
  try {
    const res = await fetch(`${TVMAZE_BASE_URL}/search/shows?q=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      const data: Array<{ score: number; show: TVMazeShowItem }> = await res.json();
      if (data && data.length > 0) {
        return data.map((item) => mapTVMazeToShow(item.show));
      }
    }
  } catch (err) {
    console.warn('TVMaze search failed:', err);
  }

  // Offline mock fallback
  const q = query.toLowerCase();
  return POPULAR_SHOWS_MOCK.filter(
    (s) => s.name.toLowerCase().includes(q) || s.overview.toLowerCase().includes(q)
  );
}

export async function fetchShowDetails(showId: number): Promise<TMDBShow | null> {
  if (showDetailsCache.has(showId)) {
    return showDetailsCache.get(showId)!;
  }

  const apiKey = getTMDBApiKey();
  if (apiKey) {
    try {
      const res = await fetch(`${TMDB_BASE_URL}/tv/${showId}?api_key=${apiKey}&language=en-US`);
      if (res.ok) {
        const data: TMDBShow = await res.json();
        showDetailsCache.set(showId, data);
        return data;
      }
    } catch (err) {
      console.warn('TMDB details error, trying TVMaze:', err);
    }
  }

  // TVMaze show details with embedded seasons and episodes
  try {
    const res = await fetch(`${TVMAZE_BASE_URL}/shows/${showId}?embed[]=seasons&embed[]=episodes`);
    if (res.ok) {
      const data: TVMazeShowItem = await res.json();
      const mapped = mapTVMazeToShow(data);
      showDetailsCache.set(showId, mapped);

      // Pre-populate seasonDetailsCache from embedded episodes
      if (data._embedded?.episodes) {
        const episodesBySeason = new Map<number, TMDBEpisode[]>();
        data._embedded.episodes.forEach((ep) => {
          const epList = episodesBySeason.get(ep.season) || [];
          epList.push({
            id: ep.id,
            name: ep.name,
            overview: stripHtml(ep.summary) || `Episode ${ep.number} of Season ${ep.season}.`,
            episode_number: ep.number,
            season_number: ep.season,
            air_date: ep.airdate || null,
            still_path: ep.image?.original || ep.image?.medium || mapped.backdrop_path || null,
            vote_average: ep.rating?.average || 8.0,
            runtime: ep.runtime || 50,
          });
          episodesBySeason.set(ep.season, epList);
        });

        episodesBySeason.forEach((eps, seasonNum) => {
          seasonDetailsCache.set(`${showId}-${seasonNum}`, {
            id: showId * 100 + seasonNum,
            _id: `tvm-${showId}-${seasonNum}`,
            name: `Season ${seasonNum}`,
            overview: `Episodes for Season ${seasonNum}`,
            season_number: seasonNum,
            poster_path: mapped.poster_path,
            air_date: eps[0]?.air_date || null,
            episodes: eps,
          });
        });
      }

      return mapped;
    }
  } catch (err) {
    console.warn('TVMaze show details failed:', err);
  }

  return POPULAR_SHOWS_MOCK.find((s) => s.id === showId) || null;
}

export async function fetchSeasonDetails(
  showId: number,
  seasonNumber: number
): Promise<TMDBSeasonDetail | null> {
  const cacheKey = `${showId}-${seasonNumber}`;
  if (seasonDetailsCache.has(cacheKey)) {
    return seasonDetailsCache.get(cacheKey)!;
  }

  const apiKey = getTMDBApiKey();
  if (apiKey) {
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${apiKey}&language=en-US`
      );
      if (res.ok) {
        const data: TMDBSeasonDetail = await res.json();
        seasonDetailsCache.set(cacheKey, data);
        return data;
      }
    } catch (err) {
      console.warn('TMDB season error, trying TVMaze:', err);
    }
  }

  // Fetch from TVMaze episodes
  try {
    const res = await fetch(`${TVMAZE_BASE_URL}/shows/${showId}/episodes`);
    if (res.ok) {
      const allEpisodes: Array<{
        id: number;
        name: string;
        season: number;
        number: number;
        airdate?: string;
        runtime?: number;
        summary?: string;
        rating?: { average: number | null };
        image?: { medium: string; original: string } | null;
      }> = await res.json();

      const seasonEps = allEpisodes.filter((e) => e.season === seasonNumber);
      if (seasonEps.length > 0) {
        const detail: TMDBSeasonDetail = {
          id: showId * 100 + seasonNumber,
          _id: `tvm-${showId}-${seasonNumber}`,
          name: `Season ${seasonNumber}`,
          overview: `Episodes for Season ${seasonNumber}`,
          season_number: seasonNumber,
          poster_path: seasonEps[0]?.image?.original || null,
          air_date: seasonEps[0]?.airdate || null,
          episodes: seasonEps.map((ep) => ({
            id: ep.id,
            name: ep.name,
            overview: stripHtml(ep.summary) || `Episode ${ep.number} of Season ${ep.season}.`,
            episode_number: ep.number,
            season_number: ep.season,
            air_date: ep.airdate || null,
            still_path: ep.image?.original || ep.image?.medium || null,
            vote_average: ep.rating?.average || 8.0,
            runtime: ep.runtime || 50,
          })),
        };
        seasonDetailsCache.set(cacheKey, detail);
        return detail;
      }
    }
  } catch (err) {
    console.warn('TVMaze fetch season episodes failed:', err);
  }

  if (MOCK_SEASON_EPISODES[cacheKey]) {
    return MOCK_SEASON_EPISODES[cacheKey];
  }

  // Default fallback generator if offline
  return {
    id: showId * 100 + seasonNumber,
    _id: `gen-${showId}-${seasonNumber}`,
    name: `Season ${seasonNumber}`,
    overview: `Episodes for Season ${seasonNumber}`,
    season_number: seasonNumber,
    poster_path: null,
    air_date: '2024-01-01',
    episodes: Array.from({ length: 8 }, (_, i) => ({
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
