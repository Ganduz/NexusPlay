import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../../styles/components/common/Pagination.css';

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <FaChevronLeft size={12} />
      </button>

      {getPages().map((p, i) => (
        p === '...' ? (
          <span key={`dots-${i}`} className="pagination-dots">...</span>
        ) : (
          <button
            key={p}
            className={`pagination-btn ${p === page ? 'pagination-btn-active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      ))}

      <button
        className="pagination-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  );
}

export default Pagination;
