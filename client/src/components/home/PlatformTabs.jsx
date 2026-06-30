import { useState, useEffect } from 'react';
import { FaDesktop, FaPlaystation, FaXbox } from 'react-icons/fa';
import { SiNintendoswitch } from 'react-icons/si';
import { gamesApi } from '../../api/gamesApi';
import GameCard from './GameCard';
import Loader from '../common/Loader';
import '../../styles/components/home/PlatformTabs.css';

const PLATFORM_CONFIG = [
  { slug: 'pc', name: 'PC', icon: FaDesktop, color: '#4a90d9' },
  { slug: 'playstation5', name: 'PlayStation', icon: FaPlaystation, color: '#0070d1' },
  { slug: 'xbox-series-x', name: 'Xbox', icon: FaXbox, color: '#107c10' },
  { slug: 'nintendo-switch', name: 'Switch', icon: SiNintendoswitch, color: '#e4000f' },
];

function PlatformTabs() {
  const [active, setActive] = useState('pc');
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const { data } = await gamesApi.getAll({ platform: active, limit: 8 });
        setGames(data.data.games || []);
      } catch {
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, [active]);

  return (
    <section className="platform-tabs">
      <h2 className="platform-tabs-title">Browse by Platform</h2>

      <div className="platform-tabs-nav">
        {PLATFORM_CONFIG.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.slug}
              className={`platform-tab ${active === p.slug ? 'platform-tab-active' : ''}`}
              onClick={() => setActive(p.slug)}
              style={{ '--platform-color': p.color }}
            >
              <Icon className="platform-tab-icon" />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="platform-tabs-content">
        {isLoading ? (
          <div className="platform-tabs-loading"><Loader /></div>
        ) : (
          <div className="game-carousel-grid stagger-children">
            {games.map((game) => (
              <GameCard key={game.slug || game.id} game={game} showWishlist={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PlatformTabs;
