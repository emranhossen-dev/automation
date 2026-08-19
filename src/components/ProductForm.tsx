import React from 'react';
import type { SingleRawInput, PostLanguage, PostLengthPreference, ImageInput } from '../types';
import { Languages, Link as LinkIcon, Store, Square, AlignLeft, Send, Image as ImageIcon, X, Plus, Layers } from 'lucide-react';

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
}

export const ProductForm: React.FC<ProductFormProps> = ({
  input,
  setInput,
  onGenerate,
  onStop,
  isLoading,
}) => {
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages: ImageInput[] = [];
    let processed = 0;

    files.forEach((file) => {
      const mimeType = file.type || 'image/jpeg';
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          base64,
          mimeType,
          previewUrl: result,
        });

        processed++;
        if (processed === files.length) {
          setInput((prev) => ({
            ...prev,
            imageFiles: [...(prev.imageFiles || []), ...newImages],
          }));
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSingleImage = (idToRemove: string) => {
    setInput((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles?.filter((img) => img.id !== idToRemove),
    }));
  };

  return (
    <div className="card-glass form-container compact-padding full-width-card">


      <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="form-body">
        {/* MANDATORY FIELD 1: Page Name (Default: gadgetbro) */}
        <div className="form-group">
          <label className="form-label">
            <Store size={14} />
            <span>Facebook Page / Business Name (Default: gadgetbro)</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="gadgetbro"
            value={input.pageName}
            onChange={(e) => setInput((prev) => ({ ...prev, pageName: e.target.value }))}
            disabled={isLoading}
          />
        </div>

        {/* MULTIPLE IMAGE UPLOAD FIELD */}
        <div className="form-group">
          <label className="form-label">
            <ImageIcon size={14} />
            <span>Upload Product Photos (Optional - Select multiple images for AI vision analysis!)</span>
          </label>

          <div className="multi-image-upload-wrapper">
            <div className="images-preview-strip">
              {input.imageFiles && input.imageFiles.map((img) => (
                <div key={img.id} className="multi-image-item">
                  <img src={img.previewUrl} alt="Product Thumb" className="multi-uploaded-thumb" />
                  <button
                    type="button"
                    className="btn-remove-thumb"
                    onClick={() => handleRemoveSingleImage(img.id)}
                    disabled={isLoading}
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              <div className="image-upload-add-card">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImageUpload}
                  disabled={isLoading}
                  id="multi-product-image-input"
                  className="file-input-hidden"
                />
                <label htmlFor="multi-product-image-input" className="file-input-add-label">
                  <Plus size={18} className="icon-gold" />
                  <span>{input.imageFiles && input.imageFiles.length > 0 ? 'Add More Photos' : 'Upload Product Photos'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* OPTIONAL FIELD 3: Raw Product Details Textarea */}
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

        {/* Controls Grid: Number of Posts, Length Preference, Language & Contact Link */}
        <div className="form-grid-4">
          <div className="form-group">
            <label className="form-label">
              <Layers size={14} /> <span>Number of Posts</span>
            </label>
            <select
              className="form-select"
              value={input.postCount || 1}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, postCount: parseInt(e.target.value, 10) || 1 }))
              }
              disabled={isLoading}
            >
              <option value={1}>1 Post (Default)</option>
              <option value={2}>2 Posts</option>
              <option value={3}>3 Posts</option>
              <option value={4}>4 Posts</option>
              <option value={5}>5 Posts</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <AlignLeft size={14} /> <span>Post Length</span>
            </label>
            <select
              className="form-select"
              value={input.postLength || 'short'}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, postLength: e.target.value as PostLengthPreference }))
              }
              disabled={isLoading}
            >
              <option value="short">Short & Punchy (4-5 lines)</option>
              <option value="balanced">Balanced Mix</option>
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
              <option value="bn-en-mix">Bangla & English Mix</option>
              <option value="banglish">Banglish</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <LinkIcon size={14} /> <span>Contact / Link</span>
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

        {/* Generate / Stop Action Row */}
        <div className="action-row">
          {!isLoading ? (
            <button
              type="submit"
              className="btn-primary btn-generate"
            >
              <Send size={16} />
              <span>Generate {input.postCount || 1} {input.postCount === 1 ? 'Post' : 'Posts'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-danger btn-stop"
              onClick={onStop}
            >
              <Square size={16} fill="currentColor" />
              <span>Stop Generation (Cancel)</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
