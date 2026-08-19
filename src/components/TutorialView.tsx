import React from 'react';
import {
  UploadCloud,
  FileText,
  Sliders,
  Copy,
  Share2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Settings,
  Key
} from 'lucide-react';

interface TutorialViewProps {
  onStartCreating: () => void;
}

export const TutorialView: React.FC<TutorialViewProps> = ({ onStartCreating }) => {
  const steps = [
    {
      step: 1,
      title: '১. সেটিংসে শপের তথ্য ও লোগো যুক্ত করা (Settings ⚙️)',
      icon: Settings,
      color: '#6366f1',
      description:
        'উপরে ডানপাশের Settings (⚙️) বাটনে ক্লিক করুন। "Saved Store Contact & Business Info" সেকশনে আপনার Store / Brand Logo আপলোড করুন, Business / Page Name এ শপের নাম (যেমন: gadgetbro) বসান, এবং Phone, WhatsApp, Website ও Order Note ইনপুট দিয়ে নিচে "Save All Config & Business Details" এ চাপ দিন।',
      tip: 'টিপস: একবার সেভ করলে প্রতিবার পোস্ট করার সময় এগুলো অটোমেটিক যোগ হয়ে যাবে!',
    },
    {
      step: 2,
      title: '২. Gemini AI Key & Facebook Page Token সেটআপ',
      icon: Key,
      color: '#06b6d4',
      description:
        'Settings এর "Your Personal Google Gemini AI Key" ফিল্ডে aistudio.google.com থেকে নেওয়া ফ্রি API Key বসান। সরাসরি ফেসবুকে পোস্ট করতে চাইলে "Facebook Direct Post Settings" ফিল্ডে Page ID ও Access Token বসিয়ে "Test Page Connection" চেক করুন।',
      tip: 'টিপস: আপনার নিজের Gemini API Key বসালে আপনি প্রতিদিন অনলিমিটেড পোস্ট ফ্রিতে তৈরি করতে পারবেন।',
    },
    {
      step: 3,
      title: '৩. প্রডাক্টের ছবি আপলোড, ড্র্যাগ & ড্রপ বা Ctrl + V পেস্ট',
      icon: UploadCloud,
      color: '#f59e0b',
      description:
        'হোম পেজে এসে প্রডাক্টের ছবি ড্র্যাগ করে ড্রপজোনে ছেড়ে দিন অথবা ফটো ব্রাউজ করুন। অথবা অন্য যেকোনো জায়গা থেকে ছবি কপি করে এনে ব্রাউজারে থাকা অবস্থায় কিবোর্ডে Ctrl + V চাপুন! ছবি স্বয়ংক্রিয়ভাবে যুক্ত হয়ে যাবে।',
      tip: 'টিপস: একসাথে একাধিক ছবি দিলে Gemini AI ভিশন দিয়ে ছবির কালার ও ডিজাইন দেখে মানানসই কপি লিখবে।',
    },
    {
      step: 4,
      title: '৪. প্রডাক্টের অফার প্রাইজ ও বিবরণ লিখুন (Product Specs)',
      icon: FileText,
      color: '#ec4899',
      description:
        '"Product Details / Raw Notes" এর বড় বক্সে প্রডাক্টের নাম, অফার প্রাইজ, ডিসকাউন্ট, সাইজ বা ডেলিভারি ফিচার যা ইচ্ছা টাইপ করুন বা পেস্ট করুন।',
      tip: 'টিপস: ফিল্ডটি বড় করা হয়েছে যেন লম্বা কাস্টমার মেসেজ বা ক্যাটালগ সহজেই পেস্ট করা যায়।',
    },
    {
      step: 5,
      title: '৫. পোস্টের সংখ্যা (১-৫), সাইজ ও ভাষা বেছে নিয়ে Generate চাপুন',
      icon: Sliders,
      color: '#10b981',
      description:
        '"Number of Posts" ফিল্ড থেকে একসাথে ১ থেকে ৫টি পোস্ট এবং "Language" ফিল্ডে "Bangla & English Mix" বেছে নিন। তারপর "Generate Post" বাটনে ক্লিক করুন।',
      tip: 'টিপস: এআই লাইভ কাস্টম সাইবার হ্যালোগ্রাফিক স্পিনারে আপনাকে পোস্ট তৈরির অগ্রগতি দেখাবে।',
    },
    {
      step: 6,
      title: '৬. 1-Click Copy বা সরাসরি Facebook পেজে পোস্ট করুন',
      icon: Copy,
      color: '#8b5cf6',
      description:
        'ডানপাশের রিয়েলটাইম Facebook Feed Mockup এ পোস্টের প্রিভিউ দেখুন। "1-Click Copy" বাটনে চাপ দিলে পুরো টেক্সট কপি হয়ে যাবে। আর Token দেওয়া থাকলে "Post to FB Page" এ চাপলে সরাসরি আপনার ফেসবুক পেজে পোস্ট হয়ে যাবে!',
      tip: 'টিপs: যেকোনো সময় এডিট করতে Edit বাটন এবং ভবিষ্যতের জন্য সেভ করে রাখতে Save বাটন ব্যবহার করুন।',
    },
  ];

  return (
    <div className="tutorial-container card-glass">
      {/* Banner */}
      <div className="tutorial-hero-card">
        <div className="tutorial-hero-content">
          <span className="hero-pill-badge">
            সহজ গাইডলাইন ও স্ট্যাপ-বাই-স্ট্যাপ ব্যবহারে নির্দেশনা
          </span>
          <h2>কীভাবে Post Maker ব্যবহার করে খুব সহজে সেলস পোস্ট তৈরি করবেন?</h2>
          <p>
            কোন অপশনে কী বসাবেন এবং কীভাবে সেটআপ করবেন—সম্পূর্ণ তথ্য নিচে ধাপে ধাপে দেয়া হলো:
          </p>

          <button className="btn-primary btn-start-now" onClick={onStartCreating}>
            <PlayCircle size={16} />
            <span>এখনই পোস্ট বানানো শুরু করুন</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Steps List Grid */}
      <div className="tutorial-steps-grid">
        {steps.map((s) => {
          const IconComp = s.icon;
          return (
            <div key={s.step} className="tutorial-step-card card-glass">
              <div className="step-card-header">
                <div className="step-number-badge" style={{ backgroundColor: `${s.color}20`, color: s.color, borderColor: `${s.color}40` }}>
                  <span>Step {s.step}</span>
                </div>
                <div className="step-icon-box" style={{ color: s.color }}>
                  <IconComp size={22} />
                </div>
              </div>

              <h3>{s.title}</h3>
              <p className="step-desc">{s.description}</p>

              <div className="step-tip-box">
                <CheckCircle2 size={14} className="tip-icon" />
                <span>{s.tip}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Box */}
      <div className="tutorial-summary-box">
        <div className="summary-item">
          <div>
            <h4>কপিরাইটিং স্ট্র্যাটেজি</h4>
            <p>AIDA ও PAS সেলস ফ্রেমওয়ার্কে চমৎকার পোস্ট</p>
          </div>
        </div>

        <div className="summary-item">
          <ShieldCheck size={18} className="icon-indigo" />
          <div>
            <h4>১০০% সুরক্ষিত API Key</h4>
            <p>ব্যাকএন্ড প্রক্সি দিয়ে সম্পূর্ণ হাইড ও সেইফ</p>
          </div>
        </div>

        <div className="summary-item">
          <Share2 size={18} className="icon-blue" />
          <div>
            <h4>ডাইরেক্ট ফেসবুক পোস্ট</h4>
            <p>Meta Graph API দিয়ে ১-ক্লিকে পেজে পাবলিশ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
