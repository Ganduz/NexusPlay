import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import PriceDisplay from '../common/PriceDisplay';
import { getPlaceholderImage } from '../../utils/helpers';
import '../../styles/components/home/GameCard.css';

function GameCard({ game, onWishlistToggle, isInWishlist = false, showWishlist = true }) {
  const {
    slug,
    name,
    background_image,
    min_price,
    max_discount,
    min_base_price,
    genres = [],
    is_new,
    is_preorder,
    rating,
  } = game;

  const basePrice = min_base_price || (max_discount > 0 ? min_price / (1 - max_discount / 100) : min_price);

  return (
    <div className="game-card animate-fadeInUp">
      <Link to={`/game/${slug}`} className="game-card-image-link">
        <img
          src={background_image || getPlaceholderImage(400, 225)}
          alt={name}
          className="game-card-image"
          loading="lazy"
        />
        <div className="game-card-overlay">
          {max_discount > 0 && (
            <span className="game-card-discount">-{max_discount}%</span>
          )}
          {Boolean(is_new) && <span className="game-card-new">New</span>}
          {Boolean(is_preorder) && <span className="badge badge-preorder">Pre-order</span>}
        </div>
      </Link>

      <div className="game-card-body">
        <div className="game-card-genres">
          {genres.slice(0, 2).filter(g => g.name).map((g, index) => (
            <span key={g.id || g.slug || index} className="game-card-genre">{g.name}</span>
          ))}
        </div>

        <Link to={`/game/${slug}`} className="game-card-title">{name}</Link>

        <div className="game-card-footer">
          {min_price !== null && min_price !== undefined ? (
            <PriceDisplay
              basePrice={basePrice}
              finalPrice={min_price}
              discountPercent={max_discount || 0}
              size="sm"
            />
          ) : (
            <span className="game-card-no-price">Coming Soon</span>
          )}

          {showWishlist && (
            <button
              className={`game-card-wishlist ${isInWishlist ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onWishlistToggle?.(game); }}
              title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isInWishlist ? <FaHeart /> : <FaRegHeart />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameCard;
