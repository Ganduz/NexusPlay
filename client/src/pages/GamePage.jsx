import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaCartPlus } from 'react-icons/fa';
import { gamesApi } from '../api/gamesApi';
import { wishlistApi } from '../api/wishlistApi';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import GameHero from '../components/game/GameHero';
import PlatformSelector from '../components/game/PlatformSelector';
import EditionSelector from '../components/game/EditionSelector';
import MediaGallery from '../components/game/MediaGallery';
import SystemRequirements from '../components/game/SystemRequirements';
import ReviewSection from '../components/game/ReviewSection';
import PriceDisplay from '../components/common/PriceDisplay';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { stripHtml, truncate } from '../utils/formatters';
import '../styles/pages/GamePage.css';

function GamePage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { addItem, addToLocalCart } = useCartStore();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      setIsLoading(true);
      try {
        const { data } = await gamesApi.getBySlug(slug);
        setGame(data.data);
        // Set default platform
        if (data.data.platforms?.length > 0) {
          setSelectedPlatform(data.data.platforms[0].platform_slug);
          if (data.data.platforms[0].editions?.length > 0) {
            setSelectedEdition(data.data.platforms[0].editions[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load game:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGame();
  }, [slug]);

  useEffect(() => {
    if (isAuthenticated && game?.id) {
      wishlistApi.check(game.id).then(({ data }) => {
        setIsInWishlist(data.data.inWishlist);
      }).catch(() => {});
    }
  }, [isAuthenticated, game?.id]);

  const handlePlatformChange = (platformSlug) => {
    setSelectedPlatform(platformSlug);
    const platform = game.platforms.find(p => p.platform_slug === platformSlug);
    if (platform?.editions?.length > 0) {
      setSelectedEdition(platform.editions[0].id);
    }
  };

  const currentPlatform = game?.platforms?.find(p => p.platform_slug === selectedPlatform);
  const currentEdition = currentPlatform?.editions?.find(e => e.id === selectedEdition);

  const handleAddToCart = async () => {
    if (!currentEdition) return;
    setIsAddingToCart(true);
    try {
      if (isAuthenticated) {
        await addItem(currentEdition.id);
      } else {
        addToLocalCart({
          game_platform_id: currentEdition.id,
          game_name: game.name,
          game_slug: game.slug,
          rawg_id: game.rawg_id,
          platform_name: currentPlatform.platform_name,
          platform_slug: currentPlatform.platform_slug,
          edition_name: currentEdition.edition_name,
          base_price: currentEdition.base_price,
          discount_percent: currentEdition.discount_percent,
          final_price: currentEdition.final_price,
          background_image: game.background_image,
        });
      }
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to use wishlist');
      return;
    }
    try {
      const { data } = await wishlistApi.toggle(game.id);
      setIsInWishlist(data.data.added);
      toast.success(data.data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (isLoading) return <div className="loading-page"><Loader size="lg" /></div>;
  if (!game) return <div className="loading-page"><p>Game not found</p></div>;

  const description = game.description_raw || stripHtml(game.description || '');

  return (
    <div className="game-page">
      <GameHero game={game} />

      <div className="container">
        <div className="game-page-grid">
          {/* Main content */}
          <div className="game-page-main">
            {description && (
              <div className="game-description">
                <h3>About</h3>
                <p className={showFullDesc ? '' : 'game-description-truncated'}>
                  {showFullDesc ? description : truncate(description, 500)}
                </p>
                {description.length > 500 && (
                  <button className="game-description-toggle" onClick={() => setShowFullDesc(!showFullDesc)}>
                    {showFullDesc ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            <MediaGallery slug={slug} />

            {game.platforms && (
              <SystemRequirements platforms={game.platforms?.map ? game.platforms : []} />
            )}

            {game.tags?.length > 0 && (
              <div className="game-tags">
                <h3>Tags</h3>
                <div className="game-tags-list">
                  {game.tags.map(t => (
                    <span key={t.id} className="game-tag">{t.name}</span>
                  ))}
                </div>
              </div>
            )}

            <ReviewSection slug={slug} gameId={game.id} />
          </div>

          {/* Sidebar */}
          <div className="game-page-sidebar">
            <div className="game-buy-box">
              {game.platforms?.length > 0 && (
                <>
                  <PlatformSelector
                    platforms={game.platforms}
                    selected={selectedPlatform}
                    onSelect={handlePlatformChange}
                  />

                  {currentPlatform && (
                    <EditionSelector
                      editions={currentPlatform.editions}
                      selected={selectedEdition}
                      onSelect={setSelectedEdition}
                    />
                  )}

                  {currentEdition && (
                    <div className="game-buy-price">
                      <PriceDisplay
                        basePrice={currentEdition.base_price}
                        finalPrice={currentEdition.final_price}
                        discountPercent={currentEdition.discount_percent}
                        size="xl"
                      />
                    </div>
                  )}

                  <button
                    className="game-buy-btn"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !currentEdition || currentEdition.stock_status === 'out_of_stock'}
                  >
                    <FaCartPlus />
                    {isAddingToCart ? 'Adding...' : currentEdition?.stock_status === 'preorder' ? 'Pre-order Now' : 'Add to Cart'}
                  </button>
                </>
              )}

              <button className={`game-wishlist-btn ${isInWishlist ? 'active' : ''}`} onClick={handleWishlistToggle}>
                {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>

              {game.metacritic && (
                <div className="game-metacritic">
                  <span className={`metacritic-score ${game.metacritic >= 75 ? 'high' : game.metacritic >= 50 ? 'mid' : 'low'}`}>
                    {game.metacritic}
                  </span>
                  <span>Metacritic</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
