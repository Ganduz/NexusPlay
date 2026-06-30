const NodeCache = require('node-cache');

const cache = new NodeCache({
  maxKeys: 500,
  checkperiod: 120,
  useClones: false,
});

// TTL constants in seconds
const TTL = {
  GAME_DETAIL: 3600,       // 1 hour
  GAME_SCREENSHOTS: 21600, // 6 hours
  GAME_MOVIES: 21600,      // 6 hours
  GAME_SERIES: 43200,      // 12 hours
  GAMES_LIST: 900,         // 15 minutes
  GAMES_SEARCH: 300,       // 5 minutes
  GENRES: 86400,           // 24 hours
};

const cacheService = {
  get(key) {
    return cache.get(key);
  },

  set(key, value, ttl) {
    return cache.set(key, value, ttl);
  },

  del(key) {
    return cache.del(key);
  },

  flush() {
    return cache.flushAll();
  },

  getStats() {
    return cache.getStats();
  },

  getGameDetail(rawgId) {
    return cache.get(`game:detail:${rawgId}`);
  },

  setGameDetail(rawgId, data) {
    return cache.set(`game:detail:${rawgId}`, data, TTL.GAME_DETAIL);
  },

  getScreenshots(rawgId) {
    return cache.get(`game:screenshots:${rawgId}`);
  },

  setScreenshots(rawgId, data) {
    return cache.set(`game:screenshots:${rawgId}`, data, TTL.GAME_SCREENSHOTS);
  },

  getMovies(rawgId) {
    return cache.get(`game:movies:${rawgId}`);
  },

  setMovies(rawgId, data) {
    return cache.set(`game:movies:${rawgId}`, data, TTL.GAME_MOVIES);
  },

  getSeries(rawgId) {
    return cache.get(`game:series:${rawgId}`);
  },

  setSeries(rawgId, data) {
    return cache.set(`game:series:${rawgId}`, data, TTL.GAME_SERIES);
  },

  getGamesList(key) {
    return cache.get(`games:list:${key}`);
  },

  setGamesList(key, data) {
    return cache.set(`games:list:${key}`, data, TTL.GAMES_LIST);
  },

  getSearch(query) {
    return cache.get(`games:search:${query}`);
  },

  setSearch(query, data) {
    return cache.set(`games:search:${query}`, data, TTL.GAMES_SEARCH);
  },

  getGenres() {
    return cache.get('genres');
  },

  setGenres(data) {
    return cache.set('genres', data, TTL.GENRES);
  },
};

module.exports = { cacheService, TTL };
