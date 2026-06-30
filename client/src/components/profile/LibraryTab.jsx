import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaGamepad,
  FaDesktop,
  FaPlaystation,
  FaXbox,
} from 'react-icons/fa';
import { SiNintendoswitch } from 'react-icons/si';
import { profileApi } from '../../api/profileApi';
import { getPlaceholderImage } from '../../utils/helpers';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';
import '../../styles/components/profile/LibraryTab.css';

const PLATFORM_ICONS = {
  pc: FaDesktop,
  playstation5: FaPlaystation,
  'xbox-series-x': FaXbox,
  'nintendo-switch': SiNintendoswitch,
};

const PLATFORM_LABELS = {
  pc: 'PC',
  playstation5: 'PS5',
  'xbox-series-x': 'Xbox',
};

function LibraryTab() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [revealedKeys, setRevealedKeys] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchLibrary = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: res } = await profileApi.getLibrary({ page, limit: 12 });
      setData(res.data);
    } catch {
      toast.error('Failed to load library');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);


  const getPlatformIcon = (platformSlug) => {
    const Icon = PLATFORM_ICONS[platformSlug] || FaGamepad;
    return <Icon />;
  };

  // Extract unique platforms from data for filter
  const platforms = useMemo(() => {
    if (!data?.items) return [];
    const unique = new Map();
    data.items.forEach((item) => {
      if (item.platform_slug && !unique.has(item.platform_slug)) {
        unique.set(item.platform_slug, item.platform_name);
      }
    });
    return Array.from(unique, ([slug, name]) => ({ slug, name }));
  }, [data]);

  // Group items by game, then by platform
  const groupedGames = useMemo(() => {
    if (!data?.items) return [];
    const gameMap = new Map();
    for (const item of data.items) {
      const slug = item.game_slug;
      if (!gameMap.has(slug)) {
        gameMap.set(slug, {
          game_slug: slug,
          game_name: item.game_name,
          background_image: item.background_image,
          rawg_id: item.rawg_id,
          platforms: new Map(),
        });
      }
      const game = gameMap.get(slug);
      const pSlug = item.platform_slug || item.platform_name;
      if (!game.platforms.has(pSlug)) {
        game.platforms.set(pSlug, {
          platform_name: item.platform_name,
          platform_slug: item.platform_slug,
          editions: [],
        });
      }
      const platform = game.platforms.get(pSlug);
      if (!platform.editions.find(e => e.edition_name === item.edition_name)) {
        platform.editions.push({ edition_name: item.edition_name });
      }
    }
    return Array.from(gameMap.values()).map(game => ({
      ...game,
      platforms: Array.from(game.platforms.values()),
    }));
  }, [data]);

  // Filter grouped games
  const filteredGames = useMemo(() => {
    return groupedGames.filter((game) => {
      const matchesSearch =
        !searchQuery ||
        game.game_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform =
        platformFilter === 'all' ||
        game.platforms.some(p => p.platform_slug === platformFilter);
      return matchesSearch && matchesPlatform;
    });
  }, [groupedGames, searchQuery, platformFilter]);

  if (isLoading && !data) return <Loader text="Loading library..." />;

  if (data && (!data.items || data.items.length === 0)) {
    return (
      <EmptyState
        icon={<FaGamepad size={48} />}
        title="Your library is empty"
        message="Games you purchase will appear here with their serial keys."
        actionText="Browse Games"
        actionLink="/search"
      />
    );
  }

  return (
    <div className="lib animate-fadeInUp">
      {/* Search & Filter Bar */}
      <div className="lib-toolbar">
        <div className="lib-search">
          <FaSearch className="lib-search-icon" />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="lib-search-input"
          />
        </div>

        {platforms.length > 1 && (
          <div className="lib-filter">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="lib-filter-select"
            >
              <option value="all">All Platforms</option>
              {platforms.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <span className="lib-count">
          {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
        </span>
      </div>

      {/* Library Grid */}
      {filteredGames.length === 0 ? (
        <div className="lib-no-results">
          <p>No games match your search.</p>
        </div>
      ) : (
        <div className="lib-grid">
          {filteredGames.map((game) => (
            <div key={game.game_slug} className="lib-card">
              <Link to={`/game/${game.game_slug}`} className="lib-card-img-link">
                <img
                  src={game.background_image || getPlaceholderImage(400, 225)}
                  alt={game.game_name}
                  className="lib-card-img"
                  loading="lazy"
                />
              </Link>

              <div className="lib-card-body">
                <Link to={`/game/${game.game_slug}`} className="lib-card-name">
                  {game.game_name}
                </Link>

                <div className="lib-card-platforms">
                  {game.platforms.map((platform) => (
                    <div key={platform.platform_slug || platform.platform_name} className="lib-card-platform-row">
                      <span className="lib-card-platform-label">
                        {getPlatformIcon(platform.platform_slug)}
                        {PLATFORM_LABELS[platform.platform_slug] || platform.platform_name}
                      </span>
                      <span className="lib-card-platform-editions">
                        {platform.editions.map((edition, ei) => (
                          <span key={ei} className="lib-card-edition">{edition.edition_name}</span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default LibraryTab;
