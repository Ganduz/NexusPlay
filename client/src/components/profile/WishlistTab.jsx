import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { wishlistApi } from '../../api/wishlistApi';
import { formatPrice } from '../../utils/formatters';
import { getPlaceholderImage, getErrorMessage } from '../../utils/helpers';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import PriceDisplay from '../common/PriceDisplay';
import toast from 'react-hot-toast';
import '../../styles/components/profile/WishlistTab.css';

function WishlistTab() {
  const [items, setItems] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await wishlistApi.getWishlist();
      setItems(data.data || []);
    } catch {
      setItems([]);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (gameId) => {
    setRemovingId(gameId);
    try {
      await wishlistApi.toggle(gameId);
      setItems((prev) => prev.filter((item) => item.game_id !== gameId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) return <Loader text="Loading wishlist..." />;

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={<FaHeart size={48} />}
        title="Your wishlist is empty"
        message="Browse our catalog and add games you love to your wishlist."
        actionText="Browse Games"
        actionLink="/search"
      />
    );
  }

  return (
    <div className="wish animate-fadeInUp">
      <div className="wish-count">
        {items.length} {items.length === 1 ? 'game' : 'games'} in wishlist
      </div>

      <div className="wish-grid">
        {items.map((item) => {
          const hasDiscount = item.max_discount > 0;
          const basePrice = hasDiscount
            ? item.min_price / (1 - item.max_discount / 100)
            : item.min_price;

          return (
            <div key={item.id} className="wish-card">
              <Link to={`/game/${item.slug}`} className="wish-card-img-link">
                <img
                  src={item.background_image || getPlaceholderImage(400, 225)}
                  alt={item.name}
                  className="wish-card-img"
                  loading="lazy"
                />
                {hasDiscount && (
                  <span className="wish-card-discount">-{item.max_discount}%</span>
                )}
              </Link>

              <div className="wish-card-body">
                <Link to={`/game/${item.slug}`} className="wish-card-name">
                  {item.name}
                </Link>

                <div className="wish-card-price">
                  {item.min_price != null ? (
                    <PriceDisplay
                      basePrice={basePrice}
                      finalPrice={item.min_price}
                      discountPercent={item.max_discount || 0}
                      size="sm"
                    />
                  ) : (
                    <span className="wish-card-no-price">Coming Soon</span>
                  )}
                </div>

                <div className="wish-card-actions">
                  <button
                    className="wish-card-btn wish-card-btn-remove-2"
                    onClick={() => handleRemove(item.game_id)}
                    disabled={removingId === item.game_id}
                    title="Remove from wishlist"
                  >
                    <span>Remove from Wishlist</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WishlistTab;
