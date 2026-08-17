import React from 'react';
import { FileText, Bookmark, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings?: () => void;
  activeTab: 'create' | 'history' | 'settings';
  setActiveTab: (tab: 'create' | 'history' | 'settings') => void;
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
        <div className="brand-group">
          <h1 className="brand-title">AI</h1>
        </div>

        <div className="tab-navigation inline-tabs">
          <button
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
            title="Generator"
          >
            <FileText size={14} />
            <span className="tab-label">Generator</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            title="Saved Posts"
          >
            <Bookmark size={14} />
            <span className="tab-label">Posts</span>
            {savedCount > 0 && <span className="badge-count">{savedCount}</span>}
          </button>

          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Config & Settings"
          >
            <Settings size={14} />
            <span className="tab-label">Config</span>
          </button>
        </div>
      </div>
    </header>
  );
};
