import { useState } from 'react';
import '../../styles/components/game/SystemRequirements.css';

function SystemRequirements({ platforms = [] }) {
  const pcPlatform = platforms.find(p => p.slug === 'pc' || p.name?.toLowerCase().includes('pc'));

  if (!pcPlatform?.requirements) return null;

  const { minimum, recommended } = pcPlatform.requirements;
  if (!minimum && !recommended) return null;

  const [activeTab, setActiveTab] = useState(minimum ? 'minimum' : 'recommended');

  return (
    <div className="sys-req">
      <h3 className="sys-req-title">System Requirements</h3>
      <div className="sys-req-tabs">
        {minimum && <button className={`sys-req-tab ${activeTab === 'minimum' ? 'active' : ''}`} onClick={() => setActiveTab('minimum')}>Minimum</button>}
        {recommended && <button className={`sys-req-tab ${activeTab === 'recommended' ? 'active' : ''}`} onClick={() => setActiveTab('recommended')}>Recommended</button>}
      </div>
      <div className="sys-req-content" dangerouslySetInnerHTML={{ __html: activeTab === 'minimum' ? minimum : recommended }} />
    </div>
  );
}

export default SystemRequirements;
