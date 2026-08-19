import React, { useState } from 'react';
import type { GeneratedPost, FacebookConfig } from '../types';
import { publishPostToFacebook } from '../services/facebookService';
import { BannerStudioModal } from './BannerStudioModal';
import Swal from 'sweetalert2';
import {
  Copy,
  Check,
  Send,
  Edit2,
  Bookmark,
  Share2,
  ThumbsUp,
  MessageSquare,
  Globe,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  AlignLeft,
  FileText,
  Sparkles
} from 'lucide-react';

interface PostCardProps {
  post: GeneratedPost;
  fbConfig: FacebookConfig;
  fbPageName?: string;
  fbPagePicture?: string;
  storeLogoUrl?: string;
  onSavePost?: (post: GeneratedPost) => void;
  onOpenSettings?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  fbConfig,
  fbPageName = 'gadgetbro',
  fbPagePicture,
  storeLogoUrl,
  onSavePost,
  onOpenSettings,
}) => {
  const [postText, setPostText] = useState(post.fullPostText);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    postUrl?: string;
    error?: string;
  } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>(post.imageUrls || []);
  const [selectedBannerImg, setSelectedBannerImg] = useState<{ idx: number; url: string } | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(postText);
    setIsCopied(true);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Copied to Clipboard!',
      showConfirmButton: false,
      timer: 2000,
      background: '#1e293b',
      color: '#fff',
    });

    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePublishToFB = async () => {
    if (!fbConfig.isConnected || !fbConfig.pageId || !fbConfig.accessToken) {
      Swal.fire({
        title: 'FB Connection Required',
        text: 'Please configure your Facebook Page Token in Config/Settings first.',
        icon: 'warning',
        confirmButtonText: 'Open Config',
        confirmButtonColor: '#6366f1',
        background: '#1e293b',
        color: '#fff',
      }).then(() => {
        if (onOpenSettings) onOpenSettings();
      });
      return;
    }

    Swal.fire({
      title: 'Publish to Facebook?',
      text: `Directly publish this post to "${fbPageName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1877f2',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Yes, Publish Now!',
      cancelButtonText: 'Cancel',
      background: '#1e293b',
      color: '#fff',
    }).then(async (res) => {
      if (res.isConfirmed) {
        setIsPublishing(true);
        setPublishResult(null);

        const result = await publishPostToFacebook(postText, fbConfig);

        setIsPublishing(false);
        setPublishResult(result);

        if (result.success) {
          Swal.fire({
            title: 'Published Successfully!',
            text: 'Your post is now live on your Facebook Page.',
            icon: 'success',
            confirmButtonColor: '#1877f2',
            background: '#1e293b',
            color: '#fff',
          });
        } else {
          Swal.fire({
            title: 'Publishing Error',
            text: result.error || 'Failed to post on Facebook.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            background: '#1e293b',
            color: '#fff',
          });
        }
      }
    });
  };

  const handleSave = () => {
    if (onSavePost) {
      onSavePost({ ...post, fullPostText: postText });
      setIsSaved(true);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Post Saved!',
        showConfirmButton: false,
        timer: 1800,
        background: '#1e293b',
        color: '#fff',
      });

      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const cleanStrategyBadgeLabels: Record<string, string> = {
    'hard-sell': 'Direct',
    'problem-solving': 'Problem-Solving',
    storytelling: 'Storytelling',
    'feature-spotlight': 'Spotlight',
    'customer-review': 'Review',
  };

  const renderLengthBadge = () => {
    if (post.lengthType === 'short') {
      return (
        <span className="badge-length short" title="Short Copy">
          <Zap size={11} />
          <span>Short</span>
        </span>
      );
    } else if (post.lengthType === 'detailed') {
      return (
        <span className="badge-length detailed" title="Detailed Copy">
          <FileText size={11} />
          <span>Detailed</span>
        </span>
      );
    }
    return (
      <span className="badge-length medium" title="Medium Length Copy">
        <AlignLeft size={11} />
        <span>Medium</span>
      </span>
    );
  };

  return (
    <div className="fb-post-mockup card-glass">
      {/* Meta Bar */}
      <div className="fb-post-top-bar">
        <div className="badge-group">
          <span className="badge-strategy">
            {cleanStrategyBadgeLabels[post.strategy] || post.strategyName || post.strategy}
          </span>
          {renderLengthBadge()}
        </div>

        <div className="top-bar-actions">
          <button
            className={`btn-icon-sm ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
            title="Edit generated text"
          >
            <Edit2 size={13} />
            <span>{isEditing ? 'Done' : 'Edit'}</span>
          </button>

          {onSavePost && (
            <button className="btn-icon-sm" onClick={handleSave} title="Save to list">
              {isSaved ? <Check size={13} className="text-green" /> : <Bookmark size={13} />}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}
        </div>
      </div>

      {/* FB Feed Header */}
      <div className="fb-header">
        <div className="fb-avatar">
          {storeLogoUrl || post.logoUrl || fbPagePicture ? (
            <img src={storeLogoUrl || post.logoUrl || fbPagePicture} alt={fbPageName} />
          ) : (
            <div className="avatar-placeholder">{(fbPageName || 'gadgetbro').charAt(0).toUpperCase()}</div>
          )}
        </div>

        <div className="fb-user-info">
          <div className="fb-name-row">
            <span className="fb-page-name">{fbPageName || 'gadgetbro'}</span>
            <span className="fb-verified-badge">✓</span>
          </div>
          <div className="fb-time-row">
            <span className="fb-timestamp">Just now</span>
            <span className="dot">•</span>
            <Globe size={12} className="globe-icon" />
          </div>
        </div>
      </div>

      {/* FB Post Body */}
      <div className="fb-content">
        {isEditing ? (
          <textarea
            className="fb-edit-textarea"
            rows={10}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
        ) : (
          <div className="fb-post-text">{postText}</div>
        )}
      </div>

      {/* Attached Product Photos Grid / Strip if uploaded */}
      {attachedImages && attachedImages.length > 0 && (
        <div className={`fb-attached-grid-wrapper count-${Math.min(attachedImages.length, 4)}`}>
          {attachedImages.map((url, idx) => (
            <div key={idx} className="attached-img-item">
              <img src={url} alt={`Product attachment ${idx + 1}`} />
              <button
                type="button"
                className="btn-overlay-banner-studio"
                onClick={() => setSelectedBannerImg({ idx, url })}
                title="Add Code / Price Badge to Image"
              >
                <Sparkles size={11} className="icon-gold" />
                <span>Banner Studio</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Banner Studio Modal */}
      {selectedBannerImg && (
        <BannerStudioModal
          isOpen={!!selectedBannerImg}
          onClose={() => setSelectedBannerImg(null)}
          imageUrl={selectedBannerImg.url}
          storeName={fbPageName}
          storeLogoUrl={storeLogoUrl || fbPagePicture}
          onSaveBanner={(newUrl) => {
            const updated = [...attachedImages];
            updated[selectedBannerImg.idx] = newUrl;
            setAttachedImages(updated);
          }}
        />
      )}

      {/* FB Post Action Bar Mockup */}
      <div className="fb-reactions-bar">
        <div className="fb-reaction-counts">
          <ThumbsUp size={13} />
          <span className="reaction-text">45 Engagements</span>
        </div>
        <div className="fb-comment-counts">
          <span>12 Comments</span>
          <span>•</span>
          <span>5 Shares</span>
        </div>
      </div>

      <div className="fb-action-buttons-mock">
        <button className="fb-mock-btn">
          <ThumbsUp size={15} />
          <span>Like</span>
        </button>
        <button className="fb-mock-btn">
          <MessageSquare size={15} />
          <span>Comment</span>
        </button>
        <button className="fb-mock-btn">
          <Share2 size={15} />
          <span>Share</span>
        </button>
      </div>

      {/* Automation Action Bar */}
      <div className="automation-actions-bar">
        <button
          className={`btn-action btn-copy ${isCopied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {isCopied ? (
            <>
              <Check size={16} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>1-Click Copy</span>
            </>
          )}
        </button>

        <button
          className="btn-action btn-publish"
          onClick={handlePublishToFB}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <>
              <Loader2 className="spin-icon" size={16} />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Post to FB Page</span>
            </>
          )}
        </button>
      </div>

      {/* Publishing Status Banner */}
      {publishResult && (
        <div
          className={`publish-status-banner ${
            publishResult.success ? 'success' : 'error'
          }`}
        >
          {publishResult.success ? (
            <div className="status-item">
              <CheckCircle className="status-icon" size={18} />
              <div>
                <strong>Post Published to Facebook Page!</strong>
                {publishResult.postUrl && (
                  <a
                    href={publishResult.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-post-link"
                  >
                    <span>View Live Post</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="status-item">
              <AlertCircle className="status-icon" size={18} />
              <div>
                <strong>Failed to Post:</strong> {publishResult.error}
                <button
                  className="btn-text-underline"
                  onClick={onOpenSettings}
                >
                  Check FB Token
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
