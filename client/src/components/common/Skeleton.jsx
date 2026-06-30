import '../../styles/components/common/Skeleton.css';

function Skeleton({ width, height, borderRadius = 'var(--radius-md)', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius,
      }}
    />
  );
}

export function GameCardSkeleton() {
  return (
    <div className="game-card-skeleton">
      <Skeleton height="200px" borderRadius="var(--radius-lg) var(--radius-lg) 0 0" />
      <div className="game-card-skeleton-body">
        <Skeleton width="70%" height="14px" />
        <Skeleton width="40%" height="12px" />
        <div className="game-card-skeleton-footer">
          <Skeleton width="60px" height="24px" borderRadius="var(--radius-sm)" />
          <Skeleton width="50px" height="18px" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
