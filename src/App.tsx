import { useState, useEffect, useRef } from 'react';
import type { SingleRawInput, GeneratedPost, FacebookConfig, BusinessInfo } from './types';
import { generateSingleFBPost, STRATEGIES } from './services/geminiService';
import { Header } from './components/Header';
import { ProductForm } from './components/ProductForm';
import { PostCard } from './components/PostCard';
import { SettingsModal } from './components/SettingsModal';
import { SettingsView } from './components/SettingsView';
import { verifyFBPageConnection } from './services/facebookService';
import Swal from 'sweetalert2';
import { Trash2, ShieldCheck, Zap, Layers, FileText, Loader2 } from 'lucide-react';
import './index.css';

export function App() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(() => {
    const saved = localStorage.getItem('business_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      pageName: 'gadgetbro',
      websiteUrl: '',
      phone: '',
      whatsapp: '',
      defaultOrderNote: '',
    };
  });

  const [input, setInput] = useState<SingleRawInput>({
    pageName: businessInfo.pageName || 'gadgetbro',
    rawText: '',
    language: 'bn',
    postLength: 'short',
    postCount: 1, // Default 1 post
    ctaValue: '',
  });

  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<GeneratedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressState, setProgressState] = useState<{
    current: number;
    total: number;
    percentage: number;
    strategyName: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'settings'>('create');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const [systemUsageCount, setSystemUsageCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('system_api_usage_count') || '0', 10);
  });

  const [fbConfig, setFbConfig] = useState<FacebookConfig>(() => {
    const saved = localStorage.getItem('fb_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return { pageId: '', accessToken: '', isConnected: false };
  });

  const [fbPageName, setFbPageName] = useState<string>(businessInfo.pageName || 'gadgetbro');
  const [fbPagePicture, setFbPagePicture] = useState<string | undefined>(undefined);

  // Auto load saved posts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved_fb_posts');
    if (saved) {
      try {
        setSavedPosts(JSON.parse(saved));
      } catch {
        // Fallback
      }
    }
  }, []);

  // Sync pageName
  useEffect(() => {
    if (businessInfo.pageName) {
      setFbPageName(businessInfo.pageName);
      if (!input.pageName) {
        setInput((prev) => ({ ...prev, pageName: businessInfo.pageName }));
      }
    }
  }, [businessInfo.pageName]);

  // Verify Facebook Token on load if available
  useEffect(() => {
    if (fbConfig.pageId && fbConfig.accessToken) {
      verifyFBPageConnection(fbConfig.pageId, fbConfig.accessToken).then((res) => {
        if (res.success && res.pageInfo) {
          const name = res.pageInfo.name || businessInfo.pageName || 'gadgetbro';
          setFbPageName(name);
          setFbPagePicture(res.pageInfo.pictureUrl);
          setFbConfig((prev) => ({ ...prev, isConnected: true }));
          if (!input.pageName) {
            setInput((prev) => ({ ...prev, pageName: name }));
          }
        } else {
          setFbConfig((prev) => ({ ...prev, isConnected: false }));
        }
      });
    }
  }, [fbConfig.pageId, fbConfig.accessToken]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setProgressState(null);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Generation Stopped',
        showConfirmButton: false,
        timer: 2000,
        background: '#1e293b',
        color: '#fff',
      });
    }
  };

  const handleGenerate = async () => {
    const hasCustomKey = Boolean(geminiKey.trim());

    // Check system API usage limit (Max 3 free tries without custom key)
    if (!hasCustomKey && systemUsageCount >= 3) {
      Swal.fire({
        title: 'Free Trial Limit Reached (3/3)',
        text: 'You have used all 3 free trial post generations. Please enter your own free Gemini API Key in Config/Settings to continue generating unlimited posts!',
        icon: 'warning',
        confirmButtonText: 'Add Free API Key',
        confirmButtonColor: '#6366f1',
        background: '#1e293b',
        color: '#fff',
      }).then(() => {
        setActiveTab('settings');
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedPosts([]); // Clear previous posts for live streaming
    abortControllerRef.current = new AbortController();

    const countToGenerate = Math.min(Math.max(input.postCount || 1, 1), 5);
    const selectedStrategies = STRATEGIES.slice(0, countToGenerate);

    setProgressState({
      current: 0,
      total: countToGenerate,
      percentage: 0,
      strategyName: 'Initializing AI Engine...',
    });

    try {
      setTimeout(() => {
        document.getElementById('generated-posts-container')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Increment system usage count if using fallback system key
      if (!hasCustomKey) {
        const newCount = systemUsageCount + 1;
        setSystemUsageCount(newCount);
        localStorage.setItem('system_api_usage_count', newCount.toString());
      }

      // Progressive Stream Loop for selected number of posts
      for (let i = 0; i < countToGenerate; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const strat = selectedStrategies[i];
        const currentNum = i + 1;
        const currentPercentage = Math.round((i / countToGenerate) * 100);

        setProgressState({
          current: currentNum,
          total: countToGenerate,
          percentage: currentPercentage,
          strategyName: strat.name,
        });

        const activeKey = geminiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

        const post = await generateSingleFBPost(
          { ...input, pageName: input.pageName.trim() || 'gadgetbro' },
          strat,
          businessInfo,
          activeKey,
          abortControllerRef.current?.signal
        );

        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        setGeneratedPosts((prev) => [...prev, post]);
        setProgressState({
          current: currentNum,
          total: countToGenerate,
          percentage: Math.round((currentNum / countToGenerate) * 100),
          strategyName: strat.name,
        });
      }

      if (!abortControllerRef.current?.signal.aborted) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Generated ${countToGenerate} ${countToGenerate === 1 ? 'Post' : 'Posts'} Successfully!`,
          showConfirmButton: false,
          timer: 2500,
          background: '#1e293b',
          color: '#fff',
        });
      }
    } catch (err: unknown) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      const msg = err instanceof Error ? err.message : 'An error occurred during AI generation.';
      setErrorMessage(msg);
      Swal.fire({
        title: 'Generation Failed',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#6366f1',
        background: '#1e293b',
        color: '#fff',
      });
      if (msg.includes('API Key')) {
        setActiveTab('settings');
      }
    } finally {
      setIsLoading(false);
      setProgressState(null);
      abortControllerRef.current = null;
    }
  };

  const handleSavePost = (postToSave: GeneratedPost) => {
    const updated = [postToSave, ...savedPosts.filter((p) => p.id !== postToSave.id)];
    setSavedPosts(updated);
    localStorage.setItem('saved_fb_posts', JSON.stringify(updated));
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedPosts.filter((p) => p.id !== id);
    setSavedPosts(updated);
    localStorage.setItem('saved_fb_posts', JSON.stringify(updated));
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedPosts.length}
      />

      {/* Main Workspace */}
      <main className="main-container compact-padding">
        {errorMessage && (
          <div className="error-banner card-glass">
            <p><strong>Error:</strong> {errorMessage}</p>
            <button className="btn-close-banner" onClick={() => setErrorMessage(null)}>×</button>
          </div>
        )}

        {/* Tab 1: Generator */}
        {activeTab === 'create' && (
          <div className="single-input-layout">
            {/* Top Input Section */}
            <ProductForm
              input={input}
              setInput={setInput}
              onGenerate={handleGenerate}
              onStop={handleStopGeneration}
              isLoading={isLoading}
              progressState={progressState}
              businessInfo={businessInfo}
              onOpenSettings={() => setActiveTab('settings')}
            />

            {/* Generated Posts Section */}
            <div className="results-wrapper" id="generated-posts-container">
              <div className="section-heading-row">
                <div className="section-heading">
                  <Layers size={18} className="icon-gold" />
                  <h3>
                    {generatedPosts.length > 0
                      ? `Generated Posts (${generatedPosts.length}/${input.postCount || 1} Ready)`
                      : 'Generated Facebook Posts'}
                  </h3>
                </div>

                {!geminiKey.trim() && (
                  <span className="trial-badge">
                    Free Trial Usage: {systemUsageCount}/3
                  </span>
                )}
              </div>

              {/* Cool Glowing Loading Spinner inside Preview Area */}
              {isLoading && (
                <div className="cool-loading-spinner-box card-glass">
                  <div className="glowing-spinner-ring">
                    <Loader2 size={40} className="spin-icon-glowing" />
                  </div>
                  <h4>AI Engine Crafting Posts...</h4>
                  <p>
                    [{progressState?.percentage || 0}%] {progressState?.strategyName || ''}
                  </p>
                </div>
              )}

              {generatedPosts.length > 0 ? (
                <div className="multi-posts-grid">
                  {generatedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      fbConfig={fbConfig}
                      fbPageName={input.pageName.trim() || fbPageName || 'gadgetbro'}
                      fbPagePicture={fbPagePicture}
                      onSavePost={handleSavePost}
                      onOpenSettings={() => setActiveTab('settings')}
                    />
                  ))}
                </div>
              ) : (
                !isLoading && (
                  <div className="empty-preview-card card-glass">
                    <div className="empty-icon-box">
                      <FileText size={32} />
                    </div>
                    <h3>No Posts Generated Yet</h3>
                    <p>
                      Enter your Page Name above and click <strong>"Generate {input.postCount || 1} {input.postCount === 1 ? 'Post' : 'Posts'}"</strong> to see live responses.
                    </p>

                    <div className="features-mini-list">
                      <div className="feature-item">
                        <Zap size={14} />
                        <span>Support multiple product photo uploads & custom post count (1 to 5)</span>
                      </div>
                      <div className="feature-item">
                        <ShieldCheck size={14} />
                        <span>1-Click Copy and Direct Facebook Page Publishing</span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Saved Posts */}
        {activeTab === 'history' && (
          <div className="history-container">
            <div className="section-heading">
              <h3>Saved Posts ({savedPosts.length})</h3>
            </div>

            {savedPosts.length === 0 ? (
              <div className="empty-state card-glass">
                <p>No saved posts yet.</p>
              </div>
            ) : (
              <div className="history-grid">
                {savedPosts.map((post) => (
                  <div key={post.id} className="history-card-wrapper">
                    <div className="history-card-header">
                      <span>Saved: {post.createdAt}</span>
                      <button
                        className="btn-danger-icon"
                        onClick={() => handleDeleteSaved(post.id)}
                        title="Delete from saved list"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <PostCard
                      post={post}
                      fbConfig={fbConfig}
                      fbPageName={input.pageName.trim() || fbPageName || 'gadgetbro'}
                      fbPagePicture={fbPagePicture}
                      onSavePost={handleSavePost}
                      onOpenSettings={() => setActiveTab('settings')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Config - Direct Inline Full Settings Form */}
        {activeTab === 'settings' && (
          <SettingsView
            fbConfig={fbConfig}
            setFbConfig={setFbConfig}
            geminiKey={geminiKey}
            setGeminiKey={setGeminiKey}
            businessInfo={businessInfo}
            setBusinessInfo={setBusinessInfo}
          />
        )}
      </main>

      {/* Settings Modal (kept for popups if triggered) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fbConfig={fbConfig}
        setFbConfig={setFbConfig}
        geminiKey={geminiKey}
        setGeminiKey={setGeminiKey}
        businessInfo={businessInfo}
        setBusinessInfo={setBusinessInfo}
      />
    </div>
  );
}

export default App;
