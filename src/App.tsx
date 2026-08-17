import { useState, useEffect, useRef } from 'react';
import type { SingleRawInput, GeneratedPost, FacebookConfig, BusinessInfo } from './types';
import { generateSingleFBPost, STRATEGIES } from './services/geminiService';
import { Header } from './components/Header';
import { ProductForm } from './components/ProductForm';
import { PostCard } from './components/PostCard';
import { SettingsModal } from './components/SettingsModal';
import { verifyFBPageConnection } from './services/facebookService';
import Swal from 'sweetalert2';
import { Trash2, ArrowRight, ShieldCheck, Zap, Layers, FileText } from 'lucide-react';
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
      pageName: '',
      websiteUrl: '',
      phone: '',
      whatsapp: '',
      defaultOrderNote: '',
    };
  });

  const [input, setInput] = useState<SingleRawInput>({
    pageName: businessInfo.pageName || '',
    rawText: '',
    language: 'bn',
    postLength: 'short',
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
    return (
      localStorage.getItem('gemini_api_key') ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.GEMINI_API_KEY ||
      ''
    );
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

  const [fbPageName, setFbPageName] = useState<string>(businessInfo.pageName || 'My Business Page');
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
          const name = res.pageInfo.name || businessInfo.pageName || 'My Business Page';
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
    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedPosts([]); // Clear previous posts for live streaming
    abortControllerRef.current = new AbortController();

    const total = STRATEGIES.length;
    setProgressState({
      current: 0,
      total,
      percentage: 0,
      strategyName: 'Initializing AI Engine...',
    });

    try {
      setTimeout(() => {
        document.getElementById('generated-posts-container')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Progressive Stream Loop with Percentage calculation
      for (let i = 0; i < total; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const strat = STRATEGIES[i];
        const currentNum = i + 1;
        const currentPercentage = Math.round((i / total) * 100);

        setProgressState({
          current: currentNum,
          total,
          percentage: currentPercentage,
          strategyName: strat.name,
        });

        // User Settings Key takes Priority 1, fallback to env
        const activeKey =
          geminiKey.trim() ||
          localStorage.getItem('gemini_api_key') ||
          import.meta.env.VITE_GEMINI_API_KEY ||
          import.meta.env.GEMINI_API_KEY;

        const post = await generateSingleFBPost(
          input,
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
          total,
          percentage: Math.round((currentNum / total) * 100),
          strategyName: strat.name,
        });
      }

      if (!abortControllerRef.current?.signal.aborted) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'All 5 Post Variations Ready!',
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
        setIsSettingsOpen(true);
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
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Generated Posts Section */}
            <div className="results-wrapper" id="generated-posts-container">
              <div className="section-heading-row">
                <div className="section-heading">
                  <Layers size={18} className="icon-gold" />
                  <h3>
                    {generatedPosts.length > 0
                      ? `Generated Posts (${generatedPosts.length}/${STRATEGIES.length} Variations Ready)`
                      : 'Generated Facebook Posts'}
                  </h3>
                </div>
              </div>

              {generatedPosts.length > 0 ? (
                <div className="multi-posts-grid">
                  {generatedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      fbConfig={fbConfig}
                      fbPageName={input.pageName || fbPageName}
                      fbPagePicture={fbPagePicture}
                      onSavePost={handleSavePost}
                      onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-preview-card card-glass">
                  <div className="empty-icon-box">
                    <FileText size={32} />
                  </div>
                  <h3>No Posts Generated Yet</h3>
                  <p>
                    Enter your Page Name above and click <strong>"Generate 5 Post Variations"</strong> to see live responses.
                  </p>

                  <div className="features-mini-list">
                    <div className="feature-item">
                      <Zap size={14} />
                      <span>Live progressive stream with inline percentage progress & Stop button</span>
                    </div>
                    <div className="feature-item">
                      <ShieldCheck size={14} />
                      <span>1-Click Copy and Direct Facebook Page Publishing</span>
                    </div>
                  </div>
                </div>
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
                      fbPageName={input.pageName || fbPageName}
                      fbPagePicture={fbPagePicture}
                      onSavePost={handleSavePost}
                      onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Config */}
        {activeTab === 'settings' && (
          <div className="tab-settings-container card-glass">
            <h2>API & Store Settings</h2>
            <p>Configure your Store Details, Gemini AI Key, and Facebook Page Access Tokens.</p>

            <button
              className="btn-primary"
              onClick={() => setIsSettingsOpen(true)}
              style={{ marginTop: '1rem' }}
            >
              <span>Open Settings Dialog</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </main>

      {/* Settings Modal */}
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
