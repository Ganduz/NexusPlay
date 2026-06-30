import { Link } from 'react-router-dom';
import '../../styles/components/common/EmptyState.css';

function EmptyState({ icon, title, message, actionText, actionLink, onAction }) {
  return (
    <div className="empty-state animate-fadeInUp">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {actionText && actionLink && (
        <Link to={actionLink} className="empty-state-action">{actionText}</Link>
      )}
      {actionText && onAction && (
        <button onClick={onAction} className="empty-state-action">{actionText}</button>
      )}
    </div>
  );
}

export default EmptyState;
