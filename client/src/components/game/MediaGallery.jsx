import { useState, useEffect } from 'react';
import { FaPlay, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { gamesApi } from '../../api/gamesApi';
import '../../styles/components/game/MediaGallery.css';

function MediaGallery({ slug }) {
  const [screenshots, setScreenshots] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [ssRes, trRes] = await Promise.all([
          gamesApi.getScreenshots(slug),
          gamesApi.getTrailers(slug),
        ]);
        setScreenshots(ssRes.data.data || []);
        setTrailers(trRes.data.data || []);
      } catch { /* ignore */ }
    };
    fetchMedia();
  }, [slug]);

  const allMedia = [...trailers.map(t => ({ type: 'video', ...t })), ...screenshots.map(s => ({ type: 'image', ...s }))];

  if (allMedia.length === 0) return null;

  return (
    <div className="media-gallery">
      <h3 className="media-gallery-title">Media</h3>
      <div className="media-gallery-grid">
        {allMedia.slice(0, 8).map((item, idx) => (
          <button
            key={item.id || idx}
            className="media-thumb"
            onClick={() => { setSelectedIndex(idx); setShowTrailer(item.type === 'video'); }}
          >
            <img
              src={item.type === 'video' ? item.preview : item.image}
              alt=""
              loading="lazy"
            />
            {item.type === 'video' && (
              <div className="media-thumb-play"><FaPlay /></div>
            )}
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="media-lightbox" onClick={() => setSelectedIndex(null)}>
          <button className="media-lightbox-close"><FaTimes /></button>
          <div className="media-lightbox-content" onClick={(e) => e.stopPropagation()}>
            {allMedia[selectedIndex].type === 'video' ? (
              <video
                src={allMedia[selectedIndex].data?.max || allMedia[selectedIndex].data?.['480']}
                controls
                autoPlay
                className="media-lightbox-video"
              />
            ) : (
              <img src={allMedia[selectedIndex].image} alt="" className="media-lightbox-image" />
            )}
          </div>
          {selectedIndex > 0 && (
            <button className="media-lightbox-nav media-lightbox-prev" onClick={(e) => { e.stopPropagation(); setSelectedIndex(i => i - 1); }}>
              <FaChevronLeft />
            </button>
          )}
          {selectedIndex < allMedia.length - 1 && (
            <button className="media-lightbox-nav media-lightbox-next" onClick={(e) => { e.stopPropagation(); setSelectedIndex(i => i + 1); }}>
              <FaChevronRight />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MediaGallery;
