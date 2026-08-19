import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Zap, Wand2 } from 'lucide-react';

interface LoadingProps {
  progressState: {
    current: number;
    total: number;
    percentage: number;
    strategyName: string;
  } | null;
}

const AI_PHRASES = [
  'Analyzing product photos & visual color palette...',
  'Applying AIDA & PAS High-Converting Copywriting Framework...',
  'Crafting natural Bengali & English Code-Switched Copy...',
  'Optimizing price call-to-action & delivery notes...',
  'Injecting urgency, social proof, and mobile readability...',
];

export const MindBlowingLoadingSpinner: React.FC<LoadingProps> = ({ progressState }) => {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % AI_PHRASES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const percentage = progressState?.percentage || 15;

  return (
    <div className="cyber-loading-card card-glass">
      {/* Outer Holographic Glow Aura */}
      <div className="cyber-hologram-wrapper">
        <div className="cyber-orbit-ring outer-ring"></div>
        <div className="cyber-orbit-ring middle-ring"></div>
        <div className="cyber-core-orb">
          <Wand2 size={28} className="cyber-wand-icon" />
        </div>
        <div className="cyber-sparkle-dot dot-1"></div>
        <div className="cyber-sparkle-dot dot-2"></div>
        <div className="cyber-sparkle-dot dot-3"></div>
      </div>

      {/* Progress Counter & Strategy Tag */}
      <div className="cyber-status-content">
        <div className="cyber-badge-row">
          <span className="cyber-live-badge">
            <Cpu size={13} className="spin-slow" />
            AI Multimodal Engine Active
          </span>
          {progressState?.strategyName && (
            <span className="cyber-strategy-badge">
              <Zap size={12} className="icon-gold" />
              Angle: {progressState.strategyName}
            </span>
          )}
        </div>

        <h3 className="cyber-main-title">
          Crafting High-Converting Post ({progressState?.current || 1}/{progressState?.total || 1})
        </h3>

        {/* Dynamic AI Ticker Text */}
        <div className="cyber-phrase-box">
          <Sparkles size={14} className="icon-gold animate-pulse" />
          <span className="cyber-phrase-text">{AI_PHRASES[phraseIdx]}</span>
        </div>

        {/* Progress Bar Track */}
        <div className="cyber-progress-track">
          <div
            className="cyber-progress-fill"
            style={{ width: `${Math.max(percentage, 10)}%` }}
          ></div>
          <span className="cyber-percentage-label">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};
