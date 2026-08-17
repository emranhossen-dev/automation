import React from 'react';
import type { SingleRawInput, PostLanguage, BusinessInfo, PostLengthPreference } from '../types';
import { Languages, FileText, Link as LinkIcon, Building2, Store, Square, AlignLeft, Send, Loader2, Image, X } from 'lucide-react';

interface ProductFormProps {
  input: SingleRawInput;
  setInput: React.Dispatch<React.SetStateAction<SingleRawInput>>;
  onGenerate: () => void;
  onStop: () => void;
  isLoading: boolean;
  progressState: {
    current: number;
    total: number;
    percentage: number;
    strategyName: string;
  } | null;
  businessInfo: BusinessInfo;
  onOpenSettings: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  input,
  setInput,
  onGenerate,
  onStop,
  isLoading,
  progressState,
  businessInfo,
  onOpenSettings,
}) => {
  const loadPreset = (presetType: 'fashion' | 'gadget' | 'beauty') => {
    if (presetType === 'fashion') {
      setInput((prev) => ({
        ...prev,
        pageName: prev.pageName || businessInfo.pageName || 'Men Style BD',
        rawText: `Product: Premium 100% Organic Linen Shirt (Men Linen Shirt)
Size: M, L, XL, XXL
Color: White, Navy Blue, Olive Green
Regular Price: 1450 BDT
Offer Price: 990 BDT
Key Features: Highly breathable, sweat resistant, skin friendly, non-fading fabric.
Delivery: Cash on Delivery available all over Bangladesh (60 BDT inside Dhaka, 120 BDT outside Dhaka).`,
        language: 'bn',
      }));
    } else if (presetType === 'gadget') {
      setInput((prev) => ({
        ...prev,
        pageName: prev.pageName || businessInfo.pageName || 'Gadget Zone BD',
        rawText: `Product: TWS Airbuds Pro ANC (Bass Boosted)
Features: Active Noise Cancellation, 30 Hours Total Battery Backup, Type-C Fast Charging, IPX5 Water & Sweat Resistant, Crystal Clear Call Quality
Regular Price: 2500 BDT
Offer Price: 1650 BDT
Warranty: 6 Months Replacement Guarantee`,
        language: 'bn',
      }));
    } else if (presetType === 'beauty') {
      setInput((prev) => ({
        ...prev,
        pageName: prev.pageName || businessInfo.pageName || 'Glow Cosmetics BD',
        rawText: `Product: Organic Vitamin C Glowing Face Serum
Ingredients: Organic Orange Extract + Niacinamide
Benefits: Brightens skin in 14 days, reduces spots and sunburn marks. Dermatologist tested.
Price: 850 BDT (Regular 1200 BDT)
Delivery: Free Home Delivery!`,
        language: 'bn',
      }));
    }
  };

  const handleAppendBusinessInfo = () => {
    const parts = [];
    if (businessInfo.pageName) parts.push(`Page: ${businessInfo.pageName}`);
    if (businessInfo.phone) parts.push(`Phone: ${businessInfo.phone}`);
    if (businessInfo.whatsapp) parts.push(`WhatsApp: ${businessInfo.whatsapp}`);
    if (businessInfo.websiteUrl) parts.push(`Website: ${businessInfo.websiteUrl}`);
    if (businessInfo.defaultOrderNote) parts.push(`Order Note: ${businessInfo.defaultOrderNote}`);

    if (parts.length === 0) {
      onOpenSettings();
      return;
    }

    if (businessInfo.pageName && !input.pageName) {
      setInput((prev) => ({ ...prev, pageName: businessInfo.pageName }));
    }

    const businessText = `\n\n--- Store Contact Info ---\n${parts.join('\n')}`;
    setInput((prev) => ({
      ...prev,
      rawText: prev.rawText + businessText,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mimeType = file.type || 'image/jpeg';
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      setInput((prev) => ({
        ...prev,
        imageFile: {
          base64,
          mimeType,
          previewUrl: result,
        },
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setInput((prev) => ({ ...prev, imageFile: undefined }));
  };

  const hasBusinessData =
    Boolean(businessInfo.pageName) ||
    Boolean(businessInfo.phone) ||
    Boolean(businessInfo.websiteUrl) ||
    Boolean(businessInfo.whatsapp);

  return (
    <div className="card-glass form-container compact-padding full-width-card">
      <div className="form-header">
        <div className="form-title-group">
          <FileText className="icon-gold" size={18} />
          <h2>Post Generator Input</h2>
        </div>

        <div className="preset-group">
          <span className="preset-label">Samples:</span>
          <button type="button" className="btn-preset" onClick={() => loadPreset('fashion')} disabled={isLoading}>
            Shirt
          </button>
          <button type="button" className="btn-preset" onClick={() => loadPreset('gadget')} disabled={isLoading}>
            Airbuds
          </button>
          <button type="button" className="btn-preset" onClick={() => loadPreset('beauty')} disabled={isLoading}>
            Serum
          </button>

          <button
            type="button"
            className={`btn-preset btn-preset-business ${hasBusinessData ? 'active' : ''}`}
            onClick={handleAppendBusinessInfo}
            disabled={isLoading}
            title={hasBusinessData ? 'Append Saved Store Contact Info' : 'Click to setup store info'}
          >
            <Building2 size={12} />
            <span>{hasBusinessData ? '+ Add Saved Store Info' : '+ Setup Store Info'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="form-body">
        {/* MANDATORY FIELD 1: Page Name */}
        <div className="form-group">
          <label className="form-label">
            <Store size={14} />
            <span>Facebook Page / Business Name * (Mandatory)</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. My E-Commerce Store"
            value={input.pageName}
            onChange={(e) => setInput((prev) => ({ ...prev, pageName: e.target.value }))}
            required
            disabled={isLoading}
          />
        </div>

        {/* Product Image Upload Field */}
        <div className="form-group">
          <label className="form-label">
            <Image size={14} />
            <span>Upload Product Photo (Optional - AI will analyze the image visually to generate posts!)</span>
          </label>

          {!input.imageFile ? (
            <div className="image-upload-dropzone">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                id="product-image-input"
                className="file-input-hidden"
              />
              <label htmlFor="product-image-input" className="file-input-label">
                <Image size={20} className="icon-gold" />
                <span>Click or Drag Product Photo Here to Upload</span>
              </label>
            </div>
          ) : (
            <div className="image-preview-card">
              <img src={input.imageFile.previewUrl} alt="Product Preview" className="uploaded-thumb" />
              <div className="image-info">
                <span>Product Photo Uploaded</span>
                <button type="button" className="btn-remove-img" onClick={handleRemoveImage} disabled={isLoading}>
                  <X size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* OPTIONAL FIELD 2: Raw Product Details Textarea */}
        <div className="form-group">
          <label className="form-label">
            <span>Product Details / Raw Notes (Optional - Paste product details, prices, specs)</span>
          </label>
          <textarea
            className="form-textarea raw-input-textarea"
            rows={4}
            placeholder="Paste or type raw product specs, offer price, delivery notes (optional)..."
            value={input.rawText}
            onChange={(e) => setInput((prev) => ({ ...prev, rawText: e.target.value }))}
            disabled={isLoading}
          />
        </div>

        {/* Controls Row */}
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">
              <AlignLeft size={14} /> <span>Post Length Preference</span>
            </label>
            <select
              className="form-select"
              value={input.postLength || 'short'}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, postLength: e.target.value as PostLengthPreference }))
              }
              disabled={isLoading}
            >
              <option value="short">Short & Punchy (Quick 4-5 lines for mobile)</option>
              <option value="balanced">Balanced Mix (2 Short, 2 Medium, 1 Detailed)</option>
              <option value="detailed">Detailed & In-Depth</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Languages size={14} /> <span>Language</span>
            </label>
            <select
              className="form-select"
              value={input.language}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, language: e.target.value as PostLanguage }))
              }
              disabled={isLoading}
            >
              <option value="bn">Bengali (বাংলা)</option>
              <option value="banglish">Banglish</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <LinkIcon size={14} /> <span>Additional Contact / Link</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. m.me/page, WhatsApp, website URL"
              value={input.ctaValue || ''}
              onChange={(e) => setInput((prev) => ({ ...prev, ctaValue: e.target.value }))}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Unified Generate & Progress Bar Row with Side Stop Button */}
        <div className="action-row">
          {!isLoading ? (
            <button
              type="submit"
              className="btn-primary btn-generate"
              disabled={!input.pageName.trim()}
            >
              <Send size={16} />
              <span>Generate 5 Post Variations</span>
            </button>
          ) : (
            <div className="unified-progress-bar-card">
              <div className="progress-fill-bg" style={{ width: `${progressState?.percentage || 0}%` }} />
              
              <div className="progress-text-content">
                <Loader2 className="spin-icon" size={16} />
                <span>
                  [{progressState?.percentage || 0}%] Generating {progressState?.current || 0}/{progressState?.total || 5}: {progressState?.strategyName || ''}
                </span>
              </div>

              <button
                type="button"
                className="btn-stop-side"
                onClick={onStop}
                title="Cancel Generation"
              >
                <Square size={12} fill="currentColor" />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
