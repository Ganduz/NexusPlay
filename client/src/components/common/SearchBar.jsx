import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';
import { gamesApi } from '../../api/gamesApi';
import { formatPrice } from '../../utils/formatters';
import '../../styles/components/common/SearchBar.css';

function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const ref = useClickOutside(() => setShowResults(false));

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const { data } = await gamesApi.search({ q: debouncedQuery, limit: 6 });
        setResults(data.data.results || []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
      onClose?.();
    }
  };

  const handleResultClick = (slug) => {
    navigate(`/game/${slug}`);
    setShowResults(false);
    setQuery('');
    onClose?.();
  };

  return (
    <div className="search-bar" ref={ref}>
      <form onSubmit={handleSubmit} className="search-bar-form">
        <FaSearch className="search-bar-icon" />
        <input
          type="text"
          placeholder="Search games..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="search-bar-input"
        />
        {query && (
          <button type="button" className="search-bar-clear" onClick={() => { setQuery(''); setResults([]); }}>
            <FaTimes />
          </button>
        )}
      </form>

      {showResults && (
        <div className="search-bar-results animate-slideDown">
          {isLoading ? (
            <div className="search-bar-loading">Searching...</div>
          ) : results.length > 0 ? (
            <>
              {results.slice(0, 6).map((game) => (
                <button
                  key={game.slug || game.rawg_id}
                  className="search-result-item"
                  onClick={() => handleResultClick(game.slug)}
                >
                  {game.background_image && (
                    <img src={game.background_image} alt="" className="search-result-img" />
                  )}
                  <div className="search-result-info">
                    <span className="search-result-name">{game.name}</span>
                    {game.min_price !== null && game.min_price !== undefined && (
                      <span className="search-result-price">From {formatPrice(game.min_price)}</span>
                    )}
                  </div>
                  {game.in_store === false && (
                    <span className="search-result-external">External</span>
                  )}
                </button>
              ))}
              <button className="search-result-all" onClick={handleSubmit}>
                View all results for "{query}"
              </button>
            </>
          ) : (
            <div className="search-bar-empty">No games found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
