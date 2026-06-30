const gameModel = require('../models/gameModel');
const gamePlatformModel = require('../models/gamePlatformModel');
const rawgService = require('../services/rawgService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const gameController = {
  getAll: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, platform, minPrice, maxPrice, sort, search } = req.query;

    const result = await gameModel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      platform,
      minPrice,
      maxPrice,
      sort,
      search,
    });

    // Enrich with RAWG data (background_image)
    const enriched = await Promise.all(
      result.games.map(async (game) => {
        const rawgData = await rawgService.getGameDetail(game.rawg_id, game.slug);
        return {
          ...game,
          background_image: rawgData?.background_image || null,
          rating: rawgData?.rating || null,
          genres: rawgData?.genres || [],
        };
      })
    );

    res.json({
      success: true,
      data: {
        games: enriched,
        pagination: result.pagination,
      },
    });
  }),

  getHomepage: asyncHandler(async (req, res) => {
    const sections = await gameModel.getHomepageSections();

    // Enrich each section with RAWG data
    const enrichSection = async (games) => {
      return Promise.all(
        games.map(async (game) => {
          const rawgData = await rawgService.getGameDetail(game.rawg_id, game.slug);
          return {
            ...game,
            background_image: rawgData?.background_image || null,
            rating: rawgData?.rating || null,
            metacritic: rawgData?.metacritic || null,
            genres: rawgData?.genres || [],
          };
        })
      );
    };

    const [featured, newReleases, trending, preorders, bestDeals] = await Promise.all([
      enrichSection(sections.featured),
      enrichSection(sections.newReleases),
      enrichSection(sections.trending),
      enrichSection(sections.preorders),
      enrichSection(sections.bestDeals),
    ]);

    // Get platforms for tab navigation
    const platforms = await gamePlatformModel.getAllPlatforms();

    res.json({
      success: true,
      data: {
        featured,
        newReleases,
        trending,
        preorders,
        bestDeals,
        platforms,
      },
    });
  }),

  search: asyncHandler(async (req, res) => {
    const { q } = req.query;

    const dbResults = await gameModel.searchByName(q, 50);

    const results = await Promise.all(
      dbResults.map(async (game) => {
        const rawgData = await rawgService.getGameDetail(game.rawg_id, game.slug);
        return {
          ...game,
          background_image: rawgData?.background_image || null,
          rating: rawgData?.rating || null,
          genres: rawgData?.genres || [],
          in_store: true,
        };
      })
    );

    res.json({
      success: true,
      data: {
        results,
        total: results.length,
      },
    });
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const game = await gameModel.findBySlug(slug);
    if (!game) throw ApiError.notFound('Game not found');

    // Get RAWG details
    const rawgData = await rawgService.getGameDetail(game.rawg_id, game.slug);

    // Get platforms + prices
    const platforms = await gamePlatformModel.getGroupedByPlatform(game.id);

    res.json({
      success: true,
      data: {
        ...game,
        ...(rawgData || {}),
        platforms,
        min_price: platforms.length > 0
          ? Math.min(...platforms.flatMap(p => p.editions.map(e => parseFloat(e.final_price))))
          : null,
        max_discount: platforms.length > 0
          ? Math.max(...platforms.flatMap(p => p.editions.map(e => e.discount_percent)))
          : 0,
      },
    });
  }),

  getScreenshots: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const game = await gameModel.findBySlug(slug);
    if (!game) throw ApiError.notFound('Game not found');

    const screenshots = await rawgService.getScreenshots(game.rawg_id, game.slug);
    res.json({ success: true, data: screenshots });
  }),

  getTrailers: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const game = await gameModel.findBySlug(slug);
    if (!game) throw ApiError.notFound('Game not found');

    const trailers = await rawgService.getMovies(game.rawg_id, game.slug);
    res.json({ success: true, data: trailers });
  }),

  getSeries: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const game = await gameModel.findBySlug(slug);
    if (!game) throw ApiError.notFound('Game not found');

    const series = await rawgService.getGameSeries(game.rawg_id, game.slug);
    res.json({ success: true, data: series });
  }),

  getPlatforms: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const game = await gameModel.findBySlug(slug);
    if (!game) throw ApiError.notFound('Game not found');

    const platforms = await gamePlatformModel.getGroupedByPlatform(game.id);
    res.json({ success: true, data: platforms });
  }),

  getGenres: asyncHandler(async (req, res) => {
    const genres = await rawgService.getGenres();
    res.json({ success: true, data: genres });
  }),
};

module.exports = gameController;
