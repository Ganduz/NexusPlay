import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';
import '../styles/pages/NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content animate-fadeInUp">
        <span className="not-found-code">404</span>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn"><FaHome /> Go Home</Link>
          <Link to="/search" className="not-found-btn-secondary"><FaSearch /> Browse Games</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
