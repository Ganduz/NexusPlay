// 24 curated games with RAWG slugs and business data
const games = [
  { slug: 'grand-theft-auto-v', name: 'Grand Theft Auto V', platforms: ['pc', 'playstation5', 'xbox-series-x'], is_trending: true, featured: true },
  { slug: 'the-witcher-3-wild-hunt', name: 'The Witcher 3: Wild Hunt', platforms: ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'], is_trending: true, featured: true },
  { slug: 'red-dead-redemption-2', name: 'Red Dead Redemption 2', platforms: ['pc', 'playstation5', 'xbox-series-x'], is_trending: true },
  { slug: 'cyberpunk-2077', name: 'Cyberpunk 2077', platforms: ['pc', 'playstation5', 'xbox-series-x'], is_new: true, featured: true },
  { slug: 'elden-ring', name: 'Elden Ring', platforms: ['pc', 'playstation5', 'xbox-series-x'], is_new: true, is_trending: true },
  { slug: 'god-of-war-2', name: 'God of War', platforms: ['pc', 'playstation5'], is_trending: true },
  { slug: 'the-legend-of-zelda-breath-of-the-wild', name: 'The Legend of Zelda: Breath of the Wild', platforms: ['nintendo-switch'], featured: true },
  { slug: 'hogwarts-legacy', name: 'Hogwarts Legacy', platforms: ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'], is_new: true },
  { slug: 'starfield', name: 'Starfield', platforms: ['pc', 'xbox-series-x'], is_new: true, is_preorder: false },
  { slug: 'baldurs-gate-3', name: "Baldur's Gate 3", platforms: ['pc', 'playstation5'], is_new: true, is_trending: true, featured: true },
  { slug: 'resident-evil-4-2023', name: 'Resident Evil 4 Remake', platforms: ['pc', 'playstation5', 'xbox-series-x'], is_new: true },
  { slug: 'marvels-spider-man-remastered', name: "Marvel's Spider-Man Remastered", platforms: ['pc', 'playstation5'], is_trending: true },
  { slug: 'fifa-23-2', name: 'EA Sports FC 24', platforms: ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'], is_new: true },
  { slug: 'minecraft', name: 'Minecraft', platforms: ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'], is_trending: true },
  { slug: 'stardew-valley', name: 'Stardew Valley', platforms: ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'] },
  { slug: 'hades-2018', name: 'Hades', platforms: ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'] },
  { slug: 'hollow-knight', name: 'Hollow Knight', platforms: ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'] },
  { slug: 'doom-eternal', name: 'DOOM Eternal', platforms: ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'], is_trending: true },
  { slug: 'it-takes-two-2', name: 'It Takes Two', platforms: ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'] },
  { slug: 'animal-crossing-2019', name: 'Animal Crossing: New Horizons', platforms: ['nintendo-switch'] },
  { slug: 'ghost-of-tsushima', name: 'Ghost of Tsushima', platforms: ['pc', 'playstation5'] },
  { slug: 'horizon-zero-dawn-2', name: 'Horizon Forbidden West', platforms: ['pc', 'playstation5'] },
  { slug: 'final-fantasy-vii-remake', name: 'Final Fantasy VII Remake', platforms: ['pc', 'playstation5'] },
  { slug: 'the-last-of-us-part-i', name: 'The Last of Us Part I', platforms: ['pc', 'playstation5'], is_new: true },
];

// Price ranges by game "tier"
const priceTiers = {
  aaa_new: { base: [49.99, 69.99], discount: [0, 15] },
  aaa_old: { base: [39.99, 59.99], discount: [20, 60] },
  indie: { base: [14.99, 29.99], discount: [0, 50] },
};

// Categorize games
const indieGames = ['stardew-valley', 'hades', 'hollow-knight'];
const newGames = games.filter(g => g.is_new).map(g => g.slug);

function getGameTier(slug) {
  if (indieGames.includes(slug)) return 'indie';
  if (newGames.includes(slug)) return 'aaa_new';
  return 'aaa_old';
}

function randomInRange(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Test users (password for all: "password123")
const testUsers = [
  { email: 'admin@nexusplay.com', username: 'admin', role: 'admin' },
  { email: 'mario@example.com', username: 'mario_rossi', role: 'customer' },
  { email: 'luca@example.com', username: 'luca_bianchi', role: 'customer' },
  { email: 'giulia@example.com', username: 'giulia_verdi', role: 'customer' },
  { email: 'anna@example.com', username: 'anna_neri', role: 'customer' },
];

// Sample reviews
const sampleReviews = [
  { gameSlug: 'elden-ring', userIdx: 1, rating: 5, title: 'A Masterpiece', body: 'FromSoftware has outdone themselves. The open world is breathtaking and the combat is incredibly satisfying.' },
  { gameSlug: 'elden-ring', userIdx: 2, rating: 5, title: 'Game of the Year', body: 'Everything about this game is perfect. Hundreds of hours of content.' },
  { gameSlug: 'baldurs-gate-3', userIdx: 1, rating: 5, title: 'Best RPG Ever', body: 'Larian Studios delivered an incredible experience. Every choice matters.' },
  { gameSlug: 'baldurs-gate-3', userIdx: 3, rating: 4, title: 'Almost Perfect', body: 'Amazing game with a few minor bugs. The storytelling is unmatched.' },
  { gameSlug: 'cyberpunk-2077', userIdx: 2, rating: 4, title: 'Great After Patches', body: 'The game has improved so much since launch. Night City is stunning.' },
  { gameSlug: 'the-witcher-3-wild-hunt', userIdx: 1, rating: 5, title: 'Timeless Classic', body: 'Even years later, this game holds up as one of the best RPGs ever made.' },
  { gameSlug: 'the-witcher-3-wild-hunt', userIdx: 3, rating: 5, title: 'Unforgettable', body: 'The story, the characters, the world — everything is perfect.' },
  { gameSlug: 'hogwarts-legacy', userIdx: 4, rating: 4, title: 'Dream Come True', body: 'Finally a great Harry Potter game. Hogwarts feels magical to explore.' },
  { gameSlug: 'hollow-knight', userIdx: 2, rating: 5, title: 'Indie Gem', body: 'One of the best metroidvanias ever made. Incredible value for the price.' },
  { gameSlug: 'hades-2018', userIdx: 1, rating: 5, title: 'Addictive Loop', body: 'The gameplay loop is incredibly addictive. Perfect roguelike.' },
  { gameSlug: 'god-of-war-2', userIdx: 3, rating: 5, title: 'Emotional Journey', body: 'Kratos and Atreus story is beautiful. Combat feels weighty and satisfying.' },
  { gameSlug: 'red-dead-redemption-2', userIdx: 4, rating: 5, title: 'Living, Breathing World', body: 'The attention to detail is insane. Arthur Morgan is one of gaming best characters.' },
];

// Edition types
const editionTypes = [
  { name: 'Standard Edition', slug: 'standard', sort_order: 1 },
  { name: 'Deluxe Edition', slug: 'deluxe', sort_order: 2 },
  { name: 'Ultimate Edition', slug: 'ultimate', sort_order: 3 },
];

module.exports = {
  games,
  priceTiers,
  getGameTier,
  randomInRange,
  randomInt,
  testUsers,
  sampleReviews,
  editionTypes,
};
