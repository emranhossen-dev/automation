export type MarketingStrategy = 'problem-solving' | 'hard-sell' | 'storytelling' | 'feature-spotlight' | 'customer-review';

export type PostLanguage = 'bn' | 'bn-en-mix' | 'banglish' | 'en';

export type PostLengthPreference = 'short' | 'balanced' | 'detailed';

export interface BusinessInfo {
  pageName: string;
  websiteUrl: string;
  phone: string;
  whatsapp: string;
  defaultOrderNote: string;
}

export interface ImageInput {
  id: string;
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface SingleRawInput {
  pageName: string;
  rawText: string;
  language: PostLanguage;
  postLength: PostLengthPreference;
  postCount: number; // 1 to 5, default 1
  ctaValue?: string;
  imageFiles?: ImageInput[];
}

export interface GeneratedPost {
  id: string;
  headline: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  fullPostText: string;
  strategy: MarketingStrategy;
  strategyName: string;
  lengthType: 'short' | 'medium' | 'detailed';
  language: PostLanguage;
  createdAt: string;
  imageUrls?: string[];
}

export interface FacebookConfig {
  pageId: string;
  accessToken: string;
  isConnected: boolean;
}
