import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, X, Check, Tag, Type } from 'lucide-react';
import Swal from 'sweetalert2';

interface BannerStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  storeName?: string;
  storeLogoUrl?: string;
  onSaveBanner?: (newImageUrl: string) => void;
}

export const BannerStudioModal: React.FC<BannerStudioModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  storeName = 'gadgetbro',
  storeLogoUrl,
  onSaveBanner,
}) => {
  const [productCode, setProductCode] = useState('CODE: GB-101');
  const [priceTag, setPriceTag] = useState('৳1,200 (SAVE 20%)');
  const [customTag, setCustomTag] = useState('🔥 HOT DEAL');
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-bar'>('bottom-bar');
  const [theme, setTheme] = useState<'neon' | 'hot-deal' | 'luxury' | 'glass'>('neon');
  const [includeLogo, setIncludeLogo] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render on canvas whenever inputs change
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      // Set canvas dimensions equal to image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw background image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const scale = img.width / 800; // Relative scaling factor based on resolution
      const fontSize = Math.max(18, Math.round(24 * scale));
      const padding = Math.max(12, Math.round(16 * scale));
      const margin = Math.max(20, Math.round(30 * scale));

      // Choose theme colors
      let badgeBg = 'rgba(15, 23, 42, 0.88)';
      let textPrimary = '#ffffff';
      let textAccent = '#38bdf8';
      let borderColor = '#6366f1';

      if (theme === 'hot-deal') {
        badgeBg = 'rgba(220, 38, 38, 0.92)';
        textPrimary = '#ffffff';
        textAccent = '#fef08a';
        borderColor = '#ef4444';
      } else if (theme === 'luxury') {
        badgeBg = 'rgba(17, 24, 39, 0.92)';
        textPrimary = '#fbbf24';
        textAccent = '#ffffff';
        borderColor = '#f59e0b';
      } else if (theme === 'glass') {
        badgeBg = 'rgba(255, 255, 255, 0.25)';
        textPrimary = '#0f172a';
        textAccent = '#1e1b4b';
        borderColor = 'rgba(255, 255, 255, 0.5)';
      }

      ctx.font = `bold ${fontSize}px sans-serif`;

      if (position === 'bottom-bar') {
        // Full Width Banner Bar at bottom
        const barHeight = Math.max(60, Math.round(85 * scale));
        const barY = img.height - barHeight;

        // Dark gradient bar
        const gradient = ctx.createLinearGradient(0, barY, img.width, img.height);
        if (theme === 'hot-deal') {
          gradient.addColorStop(0, 'rgba(185, 28, 28, 0.95)');
          gradient.addColorStop(1, 'rgba(124, 45, 18, 0.95)');
        } else if (theme === 'luxury') {
          gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
          gradient.addColorStop(1, 'rgba(30, 27, 75, 0.95)');
        } else {
          gradient.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
          gradient.addColorStop(1, 'rgba(49, 46, 129, 0.92)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, barY, img.width, barHeight);

        // Top Accent Line
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, barY, img.width, Math.max(3, Math.round(4 * scale)));

        // Left Text (Product Code + Custom Tag)
        ctx.fillStyle = textPrimary;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        let leftText = '';
        if (productCode) leftText += productCode;
        if (customTag) leftText += (leftText ? '  •  ' : '') + customTag;

        ctx.fillText(leftText, margin, barY + barHeight / 2);

        // Right Text (Price)
        if (priceTag) {
          ctx.fillStyle = textAccent;
          ctx.textAlign = 'right';
          ctx.fillText(priceTag, img.width - margin, barY + barHeight / 2);
        }
      } else {
        // Corner Badge Box
        const lines: string[] = [];
        if (customTag) lines.push(customTag);
        if (productCode) lines.push(productCode);
        if (priceTag) lines.push(priceTag);

        if (lines.length > 0) {
          let maxWidth = 0;
          lines.forEach((line) => {
            const w = ctx.measureText(line).width;
            if (w > maxWidth) maxWidth = w;
          });

          const boxWidth = maxWidth + padding * 2.5;
          const boxHeight = lines.length * (fontSize * 1.35) + padding * 1.5;

          let x = margin;
          let y = margin;

          if (position === 'top-right') {
            x = img.width - boxWidth - margin;
          } else if (position === 'bottom-left') {
            y = img.height - boxHeight - margin;
          } else if (position === 'bottom-right') {
            x = img.width - boxWidth - margin;
            y = img.height - boxHeight - margin;
          }

          // Draw Rounded Rectangle Box
          ctx.save();
          ctx.fillStyle = badgeBg;
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = Math.max(2, Math.round(3 * scale));

          const radius = Math.max(8, Math.round(12 * scale));
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, boxWidth, boxHeight, radius);
          } else {
            ctx.rect(x, y, boxWidth, boxHeight);
          }
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Render Lines Text inside Box
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          lines.forEach((line, idx) => {
            const textY = y + padding + idx * (fontSize * 1.35);

            if (line === priceTag) {
              ctx.fillStyle = textAccent;
            } else if (line === customTag) {
              ctx.fillStyle = '#fbbf24';
            } else {
              ctx.fillStyle = textPrimary;
            }

            ctx.fillText(line, x + padding, textY);
          });
        }
      }

      // Draw Store Logo Stamp if enabled
      if (includeLogo && (storeLogoUrl || storeName)) {
        if (storeLogoUrl) {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.src = storeLogoUrl;
          logoImg.onload = () => {
            const logoSize = Math.max(40, Math.round(60 * scale));
            const lx = position.includes('top') ? margin : img.width - logoSize - margin;
            const ly = position.includes('top') ? img.height - logoSize - margin : margin;

            ctx.save();
            ctx.beginPath();
            ctx.arc(lx + logoSize / 2, ly + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
            ctx.restore();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(2, Math.round(3 * scale));
            ctx.stroke();
          };
        }
      }
    };
  }, [isOpen, imageUrl, productCode, priceTag, customTag, position, theme, includeLogo, storeName, storeLogoUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `promo-banner-${productCode ? productCode.replace(/[^a-zA-Z0-9]/g, '_') : 'post'}.png`;
    a.click();

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Promo Banner Downloaded!',
      showConfirmButton: false,
      timer: 2000,
      background: '#1e293b',
      color: '#fff',
    });
  };

  const handleApplyToPost = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    if (onSaveBanner) {
      onSaveBanner(dataUrl);
    }
    onClose();

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Promo Banner Saved to Post!',
      showConfirmButton: false,
      timer: 2000,
      background: '#1e293b',
      color: '#fff',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container banner-studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Sparkles className="icon-gold" size={20} />
            <h2>AI Banner Studio</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="banner-studio-grid">
          {/* Controls Panel */}
          <div className="studio-controls-panel">
            <div className="form-group">
              <label className="form-label">
                <Tag size={14} className="icon-indigo" />
                <span>Product Code / SKU</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CODE: GB-101"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Type size={14} className="icon-gold" />
                <span>Price / Offer Tag</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ৳1,200 (SAVE 20%)"
                value={priceTag}
                onChange={(e) => setPriceTag(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Sparkles size={14} className="icon-blue" />
                <span>Custom Badge Label</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 🔥 HOT DEAL"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Badge Position</label>
                <select
                  className="form-select"
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                >
                  <option value="bottom-bar">Bottom Full Banner</option>
                  <option value="top-left">Top Left Badge</option>
                  <option value="top-right">Top Right Badge</option>
                  <option value="bottom-left">Bottom Left Badge</option>
                  <option value="bottom-right">Bottom Right Badge</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Banner Theme</label>
                <select
                  className="form-select"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                >
                  <option value="neon">🔮 Cyber Neon Indigo</option>
                  <option value="hot-deal">🔥 Hot Offer Red</option>
                  <option value="luxury">👑 Luxury Gold</option>
                  <option value="glass">💎 Minimal Glass</option>
                </select>
              </div>
            </div>

            <div className="checkbox-row">
              <input
                type="checkbox"
                id="include-logo-chk"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
              />
              <label htmlFor="include-logo-chk">Include Store Logo Stamp</label>
            </div>
          </div>

          {/* Canvas Live Preview Panel */}
          <div className="studio-preview-panel">
            <div className="canvas-wrapper">
              <canvas ref={canvasRef} className="banner-live-canvas" />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-secondary" onClick={handleDownload}>
            <Download size={14} />
            <span>Download</span>
          </button>
          <button type="button" className="btn-primary" onClick={handleApplyToPost}>
            <Check size={14} />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
