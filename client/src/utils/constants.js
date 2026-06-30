export const PLATFORM_COLORS = {
  pc: '#4a90d9',
  playstation5: '#0070d1',
  'xbox-series-x': '#107c10',
  'nintendo-switch': '#e4000f',
};

export const PLATFORM_NAMES = {
  pc: 'PC',
  playstation5: 'PlayStation 5',
  'xbox-series-x': 'Xbox Series X|S',
  'nintendo-switch': 'Nintendo Switch',
};

export const PLATFORM_ICONS = {
  pc: 'FaDesktop',
  playstation5: 'FaPlaystation',
  'xbox-series-x': 'FaXbox',
  'nintendo-switch': 'SiNintendoswitch',
};

export const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Name A-Z' },
  { value: 'name:desc', label: 'Name Z-A' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'release:desc', label: 'Newest First' },
  { value: 'release:asc', label: 'Oldest First' },
  { value: 'discount:desc', label: 'Biggest Discount' },
];

export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};
