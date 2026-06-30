import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import PriceDisplay from '../common/PriceDisplay';
import { getPlaceholderImage } from '../../utils/helpers';
import '../../styles/components/home/HeroBanner.css';

function HeroBanner({ games = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (games.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % games.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [games.length]);

  if (games.length === 0) return null;

  const game = games[current];
  const basePrice = game.min_base_price || (game.max_discount > 0 ? game.min_price / (1 - game.max_discount / 100) : game.min_price);

  return (
    <section className="hero-banner">
      <div className="hero-slides">
        {games.map((g, idx) => (
          <div
            key={g.slug}
            className={`hero-slide ${idx === current ? 'hero-slide-active' : ''}`}
            style={{ backgroundImage: `url(${g.background_image || getPlaceholderImage(1400, 600)})` }}
          />
        ))}
      </div>

      <div className="hero-gradient" />

      <div className="hero-content container">
        <div className="hero-info animate-fadeInUp" key={game.slug}>
          {game.genres && game.genres.length > 0 && (
            <div className="hero-genres">
              {game.genres.slice(0, 3).map((g) => (
                <span key={g.id || g.slug} className="hero-genre">{g.name}</span>
              ))}
            </div>
          )}
          <h1 className="hero-title">{game.name}</h1>
          <div className="hero-actions">
            <Link to={`/game/${game.slug}`} className="hero-btn hero-btn-primary">
              View Game <FaArrowRight />
            </Link>
            {game.min_price != null && (
              <div className="hero-price">
                <span className="hero-price-label">From</span>
                <PriceDisplay
                  basePrice={basePrice}
                  finalPrice={game.min_price}
                  discountPercent={game.max_discount || 0}
                  size="lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {games.length > 1 && (
        <>
          <button className="hero-nav hero-nav-prev" onClick={() => setCurrent((c) => (c - 1 + games.length) % games.length)}>
            <FaChevronLeft />
          </button>
          <button className="hero-nav hero-nav-next" onClick={() => setCurrent((c) => (c + 1) % games.length)}>
            <FaChevronRight />
          </button>
          <div className="hero-dots">
            {games.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === current ? 'hero-dot-active' : ''}`}
                onClick={() => setCurrent(idx)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default HeroBanner;
