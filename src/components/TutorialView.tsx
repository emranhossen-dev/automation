import React from 'react';
import {
  Sparkles,
  Store,
  UploadCloud,
  FileText,
  Sliders,
  Send,
  Copy,
  Share2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  PlayCircle
} from 'lucide-react';

interface TutorialViewProps {
  onStartCreating: () => void;
}

export const TutorialView: React.FC<TutorialViewProps> = ({ onStartCreating }) => {
  const steps = [
    {
      step: 1,
      title: 'পেজ বা শপের নাম দিন (Facebook Page Name)',
      icon: Store,
      color: '#6366f1',
      description:
        'প্রথমে আপনার ফেসবুক পেজ বা ই-কমার্স ব্র্যান্ডের নাম দিন (যেমন: "gadgetbro")। পোস্টের নিচের ব্র্যান্ড নেম এবং Facebook Feed Mockup এ এই নামটিই যুক্ত হবে।',
      tip: 'টিপস: একবার Config এ শপ ইনফো সেভ করে রাখলে সবসময় অটোমেটিক সেভ হয়ে থাকবে।',
    },
    {
      step: 2,
      title: 'প্রডাক্টের ছবি ড্র্যাগ & ড্রপ বা Ctrl + V চেপে পেস্ট করুন',
      icon: UploadCloud,
      color: '#06b6d4',
      description:
        'আপনার ডিভাইসের যেকোনো ফাইল সরাসরি টেনে এনে ড্রপ করুন অথবা কিবোর্ডে Ctrl + V চেপে যেকোনো জায়গা থেকে কপি করা প্রডাক্টের ছবি পেস্ট করুন। Gemini AI ভিশন টেকনোলজি দিয়ে ছবিগুলোর কালার, ডিজাইন ও আউটলুক বিশ্লেষণ করবে।',
      tip: 'টিপস: একসাথে একাধিক ছবি আপলোড করতে পারবেন।',
    },
    {
      step: 3,
      title: 'প্রডাক্টের সংক্ষেপ বিবরণ বা দাম লিখুন (Product Specs)',
      icon: FileText,
      color: '#f59e0b',
      description:
        'প্রডাক্টের মডেল, অফার প্রাইজ, ডিসকাউন্ট বা বিশেষ কোনো টেকনিক্যাল ফিচার থাকলে সংক্ষেপে লিখুন। আপনি চাইলে র কাস্টমার চ্যাট কপি-পেস্টও করে দিতে পারেন!',
      tip: 'টিপস: লেখা না দিয়ে কেবল ছবি দিয়েও এআই পোস্ট তৈরি করতে পারে।',
    },
    {
      step: 4,
      title: 'পোস্টের সংখ্যা, দৈর্ঘ্য এবং ভাষা বেছে নিন',
      icon: Sliders,
      color: '#ec4899',
      description:
        'একসাথে ১ থেকে ৫টি পর্যন্ত বিভিন্ন মার্কেটিং স্ট্রেটেজির পোস্ট সিলেক্ট করুন। ভাষা হিসেবে বাংলা, Bangla-English Mix, Banglish বা English বেছে নেওয়ার সুযোগ আছে।',
      tip: 'টিপস: বাংলাদেশি কাস্টমারদের জন্য "Bangla & English Mix" সবচেয়ে বেশি সেল আনে!',
    },
    {
      step: 5,
      title: '"Generate Post" বাটনে ক্লিক করুন',
      icon: Send,
      color: '#10b981',
      description:
        'এআই ইঞ্জিন ব্যাকএন্ড প্রক্সির মাধ্যমে সিকিউরলি Gemini Model কল করে কয়েক সেকেন্ডেই সম্পূর্ণ তৈরি পোস্ট তৈরি করবে।',
      tip: 'টিপস: আপনার জন্য সম্পূর্ণ ফ্রিতে দৈনিক ৩টি ট্রায়াল পোস্ট তৈরি করার সুবিধা থাকবে।',
    },
    {
      step: 6,
      title: '১-ক্লিকে কপি বা সরাসরি Facebook পেজে পোস্ট করুন!',
      icon: Copy,
      color: '#8b5cf6',
      description:
        'তৈরি হওয়া পোস্টগুলো রিয়েলটাইম Facebook Feed Mockup এ প্রিভিউ দেখুন। "1-Click Copy" বাটনে চাপ দিয়ে হুবহু কপি করুন অথবা পেজ টোকেন দিয়ে সরাসরি পেজে পাবলিশ করুন।',
      tip: 'টিপস: যেকোনো পোস্ট এডিট করতে চাইলে Edit বাটনে চাপ দিয়ে টেক্সট কাস্টমাইজ করতে পারবেন।',
    },
  ];

  return (
    <div className="tutorial-container card-glass">
      {/* Banner */}
      <div className="tutorial-hero-card">
        <div className="tutorial-hero-content">
          <span className="hero-pill-badge">
            <Sparkles size={14} className="icon-gold" />
            সহজ গাইডলাইন ও ব্যবহারের টিউটোরিয়াল
          </span>
          <h2>কীভাবে Post Maker ব্যবহার করে কয়েক সেকেন্ডে সেলস পোস্ট বানাবেন?</h2>
          <p>
            নিচের ধাপগুলো অনুসরণ করে আপনার ই-কমার্স বিজনেসের জন্য হাই-কনভার্টিং ফেসবুক পোস্ট জেনারেট করুন:
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
          <Zap size={18} className="icon-gold" />
          <div>
            <h4>হাই-কনভার্টিং কপিরাইটিং</h4>
            <p>AIDA ও PAS মার্কেটিং ফ্রেমওয়ার্কে তৈরি পোস্ট</p>
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
