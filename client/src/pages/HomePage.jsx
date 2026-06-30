import { useState, useEffect } from 'react';
import { gamesApi } from '../api/gamesApi';
import { wishlistApi } from '../api/wishlistApi';
import useAuthStore from '../store/authStore';
import HeroBanner from '../components/home/HeroBanner';
import GameCarousel from '../components/home/GameCarousel';
import PlatformTabs from '../components/home/PlatformTabs';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import '../styles/pages/HomePage.css';

function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [sections, setSections] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await gamesApi.getHomepage();
        setSections(data.data);
      } catch (err) {
        console.error('Failed to load homepage:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      wishlistApi.getWishlist().then(({ data }) => {
        setWishlistIds(data.data.map((item) => item.game_id));
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleWishlistToggle = async (game) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to use wishlist');
      return;
    }
    try {
      const { data } = await wishlistApi.toggle(game.id);
      if (data.data.added) {
        setWishlistIds((prev) => [...prev, game.id]);
        toast.success('Added to wishlist');
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== game.id));
        toast.success('Removed from wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (isLoading) {
    return <div className="loading-page"><Loader size="lg" text="Loading NexusPlay..." /></div>;
  }

  if (!sections) return null;

  return (
    <div className="home-page">
      <HeroBanner games={sections.featured || []} />

      <div className="container">
        <GameCarousel
          title="Trending Now"
          games={sections.trending}
          linkTo="/search?sort=discount:desc"
          onWishlistToggle={handleWishlistToggle}
          wishlistIds={wishlistIds}
        />

        <GameCarousel
          title="New Releases"
          games={sections.newReleases}
          linkTo="/search?sort=release:desc"
          onWishlistToggle={handleWishlistToggle}
          wishlistIds={wishlistIds}
        />

        <GameCarousel
          title="Best Deals"
          games={sections.bestDeals}
          linkTo="/search?sort=discount:desc"
          onWishlistToggle={handleWishlistToggle}
          wishlistIds={wishlistIds}
        />

        <PlatformTabs />

        {sections.preorders?.length > 0 && (
          <GameCarousel
            title="Pre-orders"
            games={sections.preorders}
            onWishlistToggle={handleWishlistToggle}
            wishlistIds={wishlistIds}
          />
        )}
      </div>
    </div>
  );
}

export default HomePage;
