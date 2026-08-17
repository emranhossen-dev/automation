export type MarketingStrategy = 'problem-solving' | 'hard-sell' | 'storytelling' | 'feature-spotlight' | 'customer-review';

export type PostLanguage = 'bn' | 'banglish' | 'en';

export type PostLengthPreference = 'balanced' | 'short' | 'detailed';

export interface BusinessInfo {
  pageName: string;
  websiteUrl: string;
  phone: string;
  whatsapp: string;
  defaultOrderNote: string;
}

export interface ImageInput {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface SingleRawInput {
  pageName: string;
  rawText: string;
  language: PostLanguage;
  postLength: PostLengthPreference;
  ctaValue?: string;
  imageFile?: ImageInput;
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
  imageUrl?: string;
}

export interface FacebookConfig {
  pageId: string;
  accessToken: string;
  isConnected: boolean;
}
