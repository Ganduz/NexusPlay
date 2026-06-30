const axios = require('axios');
const env = require('../config/env');
const { cacheService } = require('./cacheService');

// Validate RAWG API key on startup
if (!env.rawg.apiKey || env.rawg.apiKey === 'YOUR_RAWG_API_KEY') {
  console.warn('\x1b[WARNING: RAWG_API_KEY is not configured!\x1b');
  console.warn('  Set a valid RAWG API key in server/.env');
  console.warn('  Get one free at: https://rawg.io/apidocs\n');
}

const rawgApi = axios.create({
  baseURL: env.rawg.baseUrl,
  timeout: 10000,
  params: {
    key: env.rawg.apiKey,
  },
});

/**
 * Decide whether to use slug or rawg_id for RAWG API calls.
 * Placeholder IDs (100000+) from seed without RAWG key are invalid,
 * so we fall back to the slug which RAWG also accepts.
 */
function resolveRawgIdentifier(rawgId, slug) {
  if (slug && (!rawgId || rawgId >= 100000)) return slug;
  return rawgId;
}

const rawgService = {
  /**
   * Get game detail by RAWG ID or slug
   */
  async getGameDetail(rawgId, slug) {
    const identifier = resolveRawgIdentifier(rawgId, slug);
    // Check cache (try both keys)
    const cached = cacheService.getGameDetail(identifier) || (slug && cacheService.getGameDetail(slug));
    if (cached) return cached;

    try {
      const { data } = await rawgApi.get(`/games/${identifier}`);
      const detail = {
        rawg_id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        description_raw: data.description_raw || '',
        released: data.released,
        background_image: data.background_image,
        background_image_additional: data.background_image_additional,
        rating: data.rating,
        rating_top: data.rating_top,
        ratings_count: data.ratings_count,
        metacritic: data.metacritic,
        playtime: data.playtime,
        platforms: (data.platforms || []).map(p => ({
          id: p.platform.id,
          name: p.platform.name,
          slug: p.platform.slug,
          requirements: p.requirements || null,
        })),
        genres: (data.genres || []).map(g => ({ id: g.id, name: g.name, slug: g.slug })),
        tags: (data.tags || []).slice(0, 10).map(t => ({ id: t.id, name: t.name, slug: t.slug })),
        developers: (data.developers || []).map(d => ({ id: d.id, name: d.name })),
        publishers: (data.publishers || []).map(p => ({ id: p.id, name: p.name })),
        esrb_rating: data.esrb_rating ? { id: data.esrb_rating.id, name: data.esrb_rating.name, slug: data.esrb_rating.slug } : null,
        website: data.website,
        screenshots_count: data.screenshots_count,
        movies_count: data.movies_count,
      };

      cacheService.setGameDetail(identifier, detail);
      // Also cache by slug if we resolved by ID, for future slug-based lookups
      if (slug && identifier !== slug) cacheService.setGameDetail(slug, detail);
      return detail;
    } catch (err) {
      console.error(`RAWG getGameDetail error (${identifier}):`, err.message);
      return null;
    }
  },

  /**
   * Get game screenshots
   */
  async getScreenshots(rawgId, slug) {
    const identifier = resolveRawgIdentifier(rawgId, slug);
    const cached = cacheService.getScreenshots(identifier) || (slug && cacheService.getScreenshots(slug));
    if (cached) return cached;

    try {
      const { data } = await rawgApi.get(`/games/${identifier}/screenshots`);
      const screenshots = (data.results || []).map(s => ({
        id: s.id,
        image: s.image,
        width: s.width,
        height: s.height,
      }));

      cacheService.setScreenshots(identifier, screenshots);
      return screenshots;
    } catch (err) {
      console.error(`RAWG getScreenshots error (${identifier}):`, err.message);
      return [];
    }
  },

  /**
   * Get game trailers/movies
   */
  async getMovies(rawgId, slug) {
    const identifier = resolveRawgIdentifier(rawgId, slug);
    const cached = cacheService.getMovies(identifier) || (slug && cacheService.getMovies(slug));
    if (cached) return cached;

    try {
      const { data } = await rawgApi.get(`/games/${identifier}/movies`);
      const movies = (data.results || []).map(m => ({
        id: m.id,
        name: m.name,
        preview: m.preview,
        data: m.data,
      }));

      cacheService.setMovies(identifier, movies);
      return movies;
    } catch (err) {
      console.error(`RAWG getMovies error (${identifier}):`, err.message);
      return [];
    }
  },

  /**
   * Get game series (related games)
   */
  async getGameSeries(rawgId, slug) {
    const identifier = resolveRawgIdentifier(rawgId, slug);
    const cached = cacheService.getSeries(identifier) || (slug && cacheService.getSeries(slug));
    if (cached) return cached;

    try {
      const { data } = await rawgApi.get(`/games/${identifier}/game-series`);
      const series = (data.results || []).map(g => ({
        rawg_id: g.id,
        name: g.name,
        slug: g.slug,
        background_image: g.background_image,
        rating: g.rating,
        released: g.released,
      }));

      cacheService.setSeries(identifier, series);
      return series;
    } catch (err) {
      console.error(`RAWG getGameSeries error (${identifier}):`, err.message);
      return [];
    }
  },

  /**
   * Search games on RAWG
   */
  async searchGames(query, page = 1, pageSize = 20) {
    const cacheKey = `${query}:${page}:${pageSize}`;
    const cached = cacheService.getSearch(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await rawgApi.get('/games', {
        params: {
          search: query,
          page,
          page_size: pageSize,
          search_precise: true,
        },
      });

      const result = {
        results: (data.results || []).map(g => ({
          rawg_id: g.id,
          name: g.name,
          slug: g.slug,
          background_image: g.background_image,
          rating: g.rating,
          released: g.released,
          genres: (g.genres || []).map(gen => ({ id: gen.id, name: gen.name, slug: gen.slug })),
        })),
        count: data.count,
        next: data.next,
        previous: data.previous,
      };

      cacheService.setSearch(cacheKey, result);
      return result;
    } catch (err) {
      console.error('RAWG searchGames error:', err.message);
      return { results: [], count: 0 };
    }
  },

  /**
   * Get list of games (for homepage, etc)
   */
  async getGamesList(params = {}) {
    const cacheKey = JSON.stringify(params);
    const cached = cacheService.getGamesList(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await rawgApi.get('/games', {
        params: {
          page_size: params.pageSize || 20,
          page: params.page || 1,
          ordering: params.ordering || '-rating',
          ...params.filters,
        },
      });

      const result = {
        results: (data.results || []).map(g => ({
          rawg_id: g.id,
          name: g.name,
          slug: g.slug,
          background_image: g.background_image,
          rating: g.rating,
          metacritic: g.metacritic,
          released: g.released,
          genres: (g.genres || []).map(gen => ({ id: gen.id, name: gen.name, slug: gen.slug })),
          short_screenshots: (g.short_screenshots || []).map(s => ({ id: s.id, image: s.image })),
        })),
        count: data.count,
      };

      cacheService.setGamesList(cacheKey, result);
      return result;
    } catch (err) {
      console.error('RAWG getGamesList error:', err.message);
      return { results: [], count: 0 };
    }
  },

  /**
   * Get genres list from RAWG
   */
  async getGenres() {
    const cached = cacheService.getGenres();
    if (cached) return cached;

    try {
      const { data } = await rawgApi.get('/genres');
      const genres = (data.results || []).map(g => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        image_background: g.image_background,
        games_count: g.games_count,
      }));

      cacheService.setGenres(genres);
      return genres;
    } catch (err) {
      console.error('RAWG getGenres error:', err.message);
      return [];
    }
  },
};

module.exports = rawgService;
