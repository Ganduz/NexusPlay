import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import GameCard from './GameCard';
import '../../styles/components/home/GameCarousel.css';

function GameCarousel({ title, games = [], linkTo, linkText = 'View All', onWishlistToggle, wishlistIds = [] }) {
  if (games.length === 0) return null;

  return (
    <section className="game-carousel">
      <div className="game-carousel-header">
        <h2 className="game-carousel-title">{title}</h2>
        {linkTo && (
          <Link to={linkTo} className="game-carousel-link">
            {linkText} <FaArrowRight size={12} />
          </Link>
        )}
      </div>

      <div className="game-carousel-grid stagger-children">
        {games.map((game) => (
          <GameCard
            key={game.slug || game.id}
            game={game}
            onWishlistToggle={onWishlistToggle}
            isInWishlist={wishlistIds.includes(game.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default GameCarousel;
