import React from 'react';
import { Home, Bookmark, Settings, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenSettings?: () => void;
  activeTab: 'create' | 'history' | 'settings' | 'tutorial';
  setActiveTab: (tab: 'create' | 'history' | 'settings' | 'tutorial') => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
}) => {
  return (
    <header className="header-container compact">
      <div className="header-content">
        {/* Left: Home Icon + Post Maker Name */}
        <div
          className="brand-group"
          onClick={() => setActiveTab('create')}
          style={{ cursor: 'pointer' }}
          title="Home - Post Maker"
        >
          <Home size={18} className="brand-home-icon" />
          <h1 className="brand-title">Post Maker</h1>
        </div>

        {/* Right: Tutorial, Saved & Settings */}
        <div className="tab-navigation inline-tabs">
          <button
            className={`tab-btn ${activeTab === 'tutorial' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutorial')}
            title="Step-by-Step Bangla Tutorial"
          >
            <BookOpen size={15} className="icon-gold" />
            <span className="tab-label">Tutorial</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            title="Saved Posts"
          >
            <Bookmark size={15} />
            <span className="tab-label">Saved</span>
            {savedCount > 0 && <span className="badge-count">{savedCount}</span>}
          </button>

          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <Settings size={15} />
            <span className="tab-label">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
