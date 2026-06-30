import { FaDesktop, FaPlaystation, FaXbox } from 'react-icons/fa';
import { SiNintendoswitch } from 'react-icons/si';
import '../../styles/components/game/PlatformSelector.css';

const ICONS = {
  pc: FaDesktop,
  playstation5: FaPlaystation,
  'xbox-series-x': FaXbox,
  'nintendo-switch': SiNintendoswitch,
};

const COLORS = {
  pc: '#4a90d9',
  playstation5: '#0070d1',
  'xbox-series-x': '#107c10',
  'nintendo-switch': '#e4000f',
};

function PlatformSelector({ platforms = [], selected, onSelect }) {
  return (
    <div className="platform-selector">
      <label className="platform-selector-label">Platform</label>
      <div className="platform-selector-options">
        {platforms.map((p) => {
          const Icon = ICONS[p.platform_slug] || FaDesktop;
          const isActive = selected === p.platform_slug;
          return (
            <button
              key={p.platform_slug}
              className={`platform-option ${isActive ? 'platform-option-active' : ''}`}
              style={{ '--p-color': COLORS[p.platform_slug] || '#7c3aed' }}
              onClick={() => onSelect(p.platform_slug)}
            >
              <Icon className="platform-option-icon" />
              <span>{p.platform_name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PlatformSelector;
