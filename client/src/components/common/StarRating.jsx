import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import '../../styles/components/common/StarRating.css';

function StarRating({ rating, maxRating = 5, size = 16, interactive = false, onRate, showValue = false }) {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    if (rating >= i) {
      stars.push(
        <FaStar
          key={i}
          size={size}
          className="star star-filled"
          onClick={() => interactive && onRate?.(i)}
        />
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <FaStarHalfAlt
          key={i}
          size={size}
          className="star star-half"
          onClick={() => interactive && onRate?.(i)}
        />
      );
    } else {
      stars.push(
        <FaRegStar
          key={i}
          size={size}
          className="star star-empty"
          onClick={() => interactive && onRate?.(i)}
        />
      );
    }
  }

  return (
    <div className={`star-rating ${interactive ? 'star-rating-interactive' : ''}`}>
      <div className="stars">{stars}</div>
      {showValue && rating > 0 && (
        <span className="star-value">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
}

export default StarRating;
