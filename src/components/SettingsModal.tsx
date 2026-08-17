import React, { useState, useEffect } from 'react';
import type { FacebookConfig, BusinessInfo } from '../types';
import { verifyFBPageConnection } from '../services/facebookService';
import type { FBPageInfo } from '../services/facebookService';
import {
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Loader2,
  Save,
  ChevronDown,
  ChevronUp,
  Building2,
  Cpu
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fbConfig: FacebookConfig;
  setFbConfig: React.Dispatch<React.SetStateAction<FacebookConfig>>;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  businessInfo: BusinessInfo;
  setBusinessInfo: React.Dispatch<React.SetStateAction<BusinessInfo>>;
}

const FacebookIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  fbConfig,
  setFbConfig,
  geminiKey,
  setGeminiKey,
  businessInfo,
  setBusinessInfo,
}) => {
  const [tempGeminiKey, setTempGeminiKey] = useState(geminiKey);
  const [tempPageId, setTempPageId] = useState(fbConfig.pageId);
  const [tempAccessToken, setTempAccessToken] = useState(fbConfig.accessToken);
  const [tempBusiness, setTempBusiness] = useState<BusinessInfo>(businessInfo);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    pageInfo?: FBPageInfo;
    error?: string;
  } | null>(null);

  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setTempGeminiKey(geminiKey);
    setTempPageId(fbConfig.pageId);
    setTempAccessToken(fbConfig.accessToken);
    setTempBusiness(businessInfo);
  }, [geminiKey, fbConfig, businessInfo, isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsVerifying(true);
    setVerifyResult(null);

    const res = await verifyFBPageConnection(tempPageId, tempAccessToken);
    setIsVerifying(false);
    setVerifyResult(res);

    if (res.success && res.pageInfo) {
      setFbConfig({
        pageId: tempPageId,
        accessToken: tempAccessToken,
        isConnected: true,
      });

      if (!tempBusiness.pageName) {
        setTempBusiness((prev) => ({ ...prev, pageName: res.pageInfo?.name || '' }));
      }
    }
  };

  const handleSaveAll = () => {
    setGeminiKey(tempGeminiKey);
    localStorage.setItem('gemini_api_key', tempGeminiKey);

    const updatedFb = {
      pageId: tempPageId,
      accessToken: tempAccessToken,
      isConnected: verifyResult?.success || (Boolean(tempPageId) && Boolean(tempAccessToken)),
    };
    setFbConfig(updatedFb);
    localStorage.setItem('fb_config', JSON.stringify(updatedFb));

    setBusinessInfo(tempBusiness);
    localStorage.setItem('business_info', JSON.stringify(tempBusiness));

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content card-glass">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Key className="icon-gold" size={20} />
            <h2>API & Store Settings</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Section 0: Prefilled Business / Store Info */}
          <div className="settings-section">
            <div className="section-title">
              <Building2 className="icon-gold" size={18} />
              <h3>Saved Store / Business Info (Prefilled Data)</h3>
            </div>
            <p className="section-desc">
              Save your store details here so you never have to re-type page name, website, phone or WhatsApp for products!
            </p>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Business / Page Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Urban Trends BD"
                  value={tempBusiness.pageName}
                  onChange={(e) => setTempBusiness({ ...tempBusiness, pageName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Website URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. https://my-store.com"
                  value={tempBusiness.websiteUrl}
                  onChange={(e) => setTempBusiness({ ...tempBusiness, websiteUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 01700000000"
                  value={tempBusiness.phone}
                  onChange={(e) => setTempBusiness({ ...tempBusiness, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. +8801700000000"
                  value={tempBusiness.whatsapp}
                  onChange={(e) => setTempBusiness({ ...tempBusiness, whatsapp: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Default Order & Delivery Note</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Inside Dhaka 60 BDT delivery, outside Dhaka 120 BDT."
                value={tempBusiness.defaultOrderNote}
                onChange={(e) => setTempBusiness({ ...tempBusiness, defaultOrderNote: e.target.value })}
              />
            </div>
          </div>

          <hr className="divider" />

          {/* Section 1: Gemini API Key */}
          <div className="settings-section">
            <div className="section-title">
              <Cpu size={18} />
              <h3>1. Google Gemini AI Key (Free)</h3>
            </div>
            <p className="section-desc">
              To get a free key, visit{' '}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-link"
              >
                Google AI Studio <ExternalLink size={12} />
              </a>
              .
            </p>
            <input
              type="password"
              className="form-input"
              placeholder="Paste your Gemini API key here..."
              value={tempGeminiKey}
              onChange={(e) => setTempGeminiKey(e.target.value)}
            />
          </div>

          <hr className="divider" />

          {/* Section 2: Facebook Graph API Credentials */}
          <div className="settings-section">
            <div className="section-title">
              <FacebookIcon className="icon-blue" size={18} />
              <h3>2. Facebook Direct Post Settings (Free)</h3>
            </div>
            <p className="section-desc">
              Enter your Facebook Page ID and Page Access Token for 1-click publishing.
            </p>

            <div className="form-group">
              <label className="form-label">Facebook Page ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 10029384819283"
                value={tempPageId}
                onChange={(e) => setTempPageId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Page Access Token</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Paste Page Access Token starting with EAAB..."
                value={tempAccessToken}
                onChange={(e) => setTempAccessToken(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn-secondary btn-test-conn"
              onClick={handleTestConnection}
              disabled={isVerifying || !tempPageId || !tempAccessToken}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="spin-icon" size={15} />
                  <span>Checking Connection...</span>
                </>
              ) : (
                <>
                  <FacebookIcon size={15} />
                  <span>Test Page Connection</span>
                </>
              )}
            </button>

            {/* Test Connection Results */}
            {verifyResult && (
              <div
                className={`verify-result-box ${
                  verifyResult.success ? 'success' : 'error'
                }`}
              >
                {verifyResult.success && verifyResult.pageInfo ? (
                  <div className="page-info-card">
                    {verifyResult.pageInfo.pictureUrl && (
                      <img
                        src={verifyResult.pageInfo.pictureUrl}
                        alt="FB Page"
                        className="verify-page-avatar"
                      />
                    )}
                    <div>
                      <div className="verify-success-title">
                        <CheckCircle2 size={15} />
                        <span>Connected Successfully!</span>
                      </div>
                      <p className="verify-page-name">{verifyResult.pageInfo.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="verify-error">
                    <AlertCircle size={15} />
                    <span>{verifyResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Guide Accordion */}
          <div className="guide-accordion">
            <button
              className="guide-header-btn"
              onClick={() => setShowGuide(!showGuide)}
            >
              <HelpCircle size={15} />
              <span>How to get Free API Keys & Tokens?</span>
              {showGuide ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showGuide && (
              <div className="guide-content">
                <h4>Gemini API Key (Free):</h4>
                <ol>
                  <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">aistudio.google.com</a></li>
                  <li>Sign in with Google and click <strong>Create API Key</strong>.</li>
                </ol>

                <h4>Facebook Page Access Token (Free):</h4>
                <ol>
                  <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer">Meta Graph API Explorer</a></li>
                  <li>Select your Page and add <code>pages_manage_posts</code> permission.</li>
                  <li>Click <strong>Generate Access Token</strong> and paste above.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSaveAll}>
            <Save size={15} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
