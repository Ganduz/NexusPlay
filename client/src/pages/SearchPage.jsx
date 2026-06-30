import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { gamesApi } from '../api/gamesApi';
import GameCard from '../components/home/GameCard';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { SORT_OPTIONS } from '../utils/constants';
import { GameCardSkeleton } from '../components/common/Skeleton';
import '../styles/pages/SearchPage.css';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get('q') || '';
  const platform = searchParams.get('platform') || '';
  const sort = searchParams.get('sort') || 'name:asc';
  const page = parseInt(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const genre = searchParams.get('genre') || '';
  const activeGenres = genre ? genre.split(',').filter(Boolean) : [];

  useEffect(() => {
    gamesApi.getGenres().then(({ data }) => setGenres(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const params = { page, limit: 20, sort };
        if (q) params.search = q;
        if (platform) params.platform = platform;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const { data } = await gamesApi.getAll(params);
        setGames(data.data.games || []);
        setPagination(data.data.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch { setGames([]); } finally { setIsLoading(false); }
    };
    fetchGames();
  }, [q, platform, sort, page, minPrice, maxPrice]);

  const filteredGames = activeGenres.length > 0
    ? games.filter(g => g.genres?.some(gen => activeGenres.includes(gen.slug)))
    : games;

  const toggleGenre = (slug) => {
    const next = activeGenres.includes(slug)
      ? activeGenres.filter(s => s !== slug)
      : [...activeGenres, slug];
    updateParam('genre', next.join(','));
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) { params.set(key, value); } else { params.delete(key); }
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="search-page container">
      <div className="search-page-header">
        <h1>{q ? `Results for "${q}"` : 'Browse Games'}</h1>
        <span className="search-page-count">{activeGenres.length > 0 ? `${filteredGames.length} of ` : ''}{pagination.total} games found</span>
        <button className="search-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> Filters
        </button>
      </div>

      <div className="search-page-grid">
        <aside className={`search-filters ${showFilters ? 'search-filters-open' : ''}`}>
          <div className="search-filters-header">
            <h3>Filters</h3>
            <button className="search-filters-close" onClick={() => setShowFilters(false)}><FaTimes /></button>
          </div>

          <div className="filter-group">
            <label>Platform</label>
            <select value={platform} onChange={(e) => updateParam('platform', e.target.value)}>
              <option value="">All Platforms</option>
              <option value="pc">PC</option>
              <option value="playstation5">PlayStation 5</option>
              <option value="xbox-series-x">Xbox Series X|S</option>
              <option value="nintendo-switch">Nintendo Switch</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="filter-price-row">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} min="0" step="0.01" />
              <span>-</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} min="0" step="0.01" />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Genre</label>
            <div className="filter-genres">
              {genres.map(g => (
                <button
                  key={g.slug}
                  className={`filter-genre-btn ${activeGenres.includes(g.slug) ? 'active' : ''}`}
                  onClick={() => toggleGenre(g.slug)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {(platform || minPrice || maxPrice || activeGenres.length > 0) && (
            <button className="filter-clear" onClick={() => { setSearchParams(q ? { q } : {}); }}>Clear Filters</button>
          )}
        </aside>

        <main className="search-results">
          {isLoading ? (
            <div className="search-results-grid">
              {Array.from({ length: 8 }).map((_, i) => <GameCardSkeleton key={i} />)}
            </div>
          ) : filteredGames.length > 0 ? (
            <>
              <div className="search-results-grid stagger-children">
                {filteredGames.map(game => (
                  <GameCard key={game.slug || game.id} game={game} showWishlist={false} />
                ))}
              </div>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => updateParam('page', p.toString())} />
            </>
          ) : (
            <EmptyState  title="No games found" message="Try adjusting your filters or search terms" actionText="Clear Search" onAction={() => setSearchParams({})} />
          )}
        </main>
      </div>
    </div>
  );
}

export default SearchPage;
