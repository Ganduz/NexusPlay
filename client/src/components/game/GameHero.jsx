import { FaCalendar, FaUser, FaBuilding } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';
import '../../styles/components/game/GameHero.css';

function GameHero({ game }) {
  return (
    <div className="game-hero" style={{ backgroundImage: `url(${game.background_image})` }}>
      <div className="game-hero-overlay" />
      <div className="game-hero-content container">
        <div className="game-hero-badges">
          {game.genres?.map((g) => (
            <span key={g.id} className="hero-genre">{g.name}</span>
          ))}
        </div>
        <h1 className="game-hero-title">{game.name}</h1>
        <div className="game-hero-meta">
          {game.released && (
            <span className="game-hero-meta-item">
              <FaCalendar /> {formatDate(game.released || game.release_date)}
            </span>
          )}
          {game.developers?.length > 0 && (
            <span className="game-hero-meta-item">
              <FaUser /> {game.developers.map(d => d.name).join(', ')}
            </span>
          )}
          {game.publishers?.length > 0 && (
            <span className="game-hero-meta-item">
              <FaBuilding /> {game.publishers.map(p => p.name).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameHero;
