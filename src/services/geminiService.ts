import type { SingleRawInput, GeneratedPost, MarketingStrategy, BusinessInfo } from '../types';

export interface StrategyDefinition {
  id: MarketingStrategy;
  name: string;
  guide: string;
  defaultLength: 'short' | 'medium' | 'detailed';
}

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: 'hard-sell',
    name: 'Direct Hard Sell & Offer',
    guide: 'Use a high-converting direct offer style (AIDA framework). Focus heavily on price, limited-time discount, special offer, urgency, and immediate call to action.',
    defaultLength: 'short',
  },
  {
    id: 'problem-solving',
    name: 'Problem-Solving (PAS)',
    guide: 'Use the PAS (Problem - Agitate - Solution) framework. Highlight customer pain points, why it is frustrating, and present this product as the ultimate solution.',
    defaultLength: 'medium',
  },
  {
    id: 'storytelling',
    name: 'Storytelling & Lifestyle',
    guide: 'Use a storytelling / lifestyle approach. Describe a real-life scenario or daily experience where someone uses this product, making it feel relatable and desirable.',
    defaultLength: 'detailed',
  },
  {
    id: 'feature-spotlight',
    name: 'Feature & Specs Spotlight',
    guide: 'Focus heavily on key features, materials, specifications, build quality, and why this product stands out from competitors.',
    defaultLength: 'short',
  },
  {
    id: 'customer-review',
    name: 'Customer Trust & Review',
    guide: 'Format the post like a recommendation / social proof highlighting customer trust, satisfaction guarantee, and proven results.',
    defaultLength: 'medium',
  },
];

export const generateSingleFBPost = async (
  input: SingleRawInput,
  strategyDef: StrategyDefinition,
  businessInfo?: BusinessInfo,
  userApiKey?: string,
  signal?: AbortSignal
): Promise<GeneratedPost> => {
  const apiKey =
    userApiKey?.trim() ||
    localStorage.getItem('gemini_api_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'No Gemini API Key found. Please enter your API Key in Config.'
    );
  }

  const promptText = buildSinglePostPrompt(input, strategyDef, businessInfo);
  const models = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];

  // Construct parts array for text + optional image vision
  const partsArray: unknown[] = [];

  if (input.imageFile && input.imageFile.base64) {
    partsArray.push({
      inlineData: {
        mimeType: input.imageFile.mimeType,
        data: input.imageFile.base64,
      },
    });
  }

  partsArray.push({ text: promptText });

  let rawText = '';
  let lastError = '';

  for (const model of models) {
    if (signal?.aborted) {
      throw new Error('Generation cancelled by user.');
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: partsArray,
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
          signal,
        }
      );

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        rawText = data.candidates[0].content.parts[0].text;
        break;
      } else if (data.error?.message) {
        lastError = data.error.message;
      }
    } catch (e: unknown) {
      if (signal?.aborted || (e instanceof Error && e.name === 'AbortError')) {
        throw new Error('Generation cancelled by user.');
      }
      lastError = e instanceof Error ? e.message : 'Network failure.';
    }
  }

  if (!rawText) {
    throw new Error(`Gemini API Error: ${lastError || 'Could not connect to Gemini models.'}`);
  }

  return cleanAndFormatPost(rawText, strategyDef, input);
};

const buildSinglePostPrompt = (
  input: SingleRawInput,
  strategyDef: StrategyDefinition,
  businessInfo?: BusinessInfo
): string => {
  const languageGuide = {
    bn: 'Standard persuasive Bangladeshi E-Commerce Facebook Post style in clean Bengali (বাংলা).',
    banglish: 'Banglish (Bengali written in English letters).',
    en: 'Professional English Facebook copy tailored for e-commerce sales.',
  }[input.language];

  const pageName = input.pageName || businessInfo?.pageName || 'My Facebook Business Page';

  let storeDetailsText = `PAGE / STORE NAME: ${pageName}\n`;
  if (businessInfo) {
    if (businessInfo.websiteUrl) storeDetailsText += `Website: ${businessInfo.websiteUrl}\n`;
    if (businessInfo.phone) storeDetailsText += `Phone: ${businessInfo.phone}\n`;
    if (businessInfo.whatsapp) storeDetailsText += `WhatsApp: ${businessInfo.whatsapp}\n`;
    if (businessInfo.defaultOrderNote) storeDetailsText += `Order Note: ${businessInfo.defaultOrderNote}\n`;
  }

  const rawDetails = input.rawText.trim()
    ? input.rawText
    : 'General promotional sales post highlighting high quality products, fast delivery, and special discounts.';

  let lengthInstruction = '';
  const targetLength =
    input.postLength === 'short'
      ? 'short'
      : input.postLength === 'detailed'
      ? 'detailed'
      : strategyDef.defaultLength;

  if (targetLength === 'short') {
    lengthInstruction =
      'LENGTH CONSTRAINT: WRITE A SHORT, CRISP, & PUNCHY POST (Maximum 4 to 6 lines total). Keep it fast to read for mobile users scrolling Facebook. Do NOT write long paragraphs.';
  } else if (targetLength === 'medium') {
    lengthInstruction =
      'LENGTH CONSTRAINT: WRITE A BALANCED MEDIUM-LENGTH POST (Around 6 to 10 lines total). Include a catchy hook and 3 concise bullet points.';
  } else {
    lengthInstruction =
      'LENGTH CONSTRAINT: WRITE A DETAILED & IN-DEPTH POST. Provide rich storytelling or thorough feature breakdown.';
  }

  const imageInstruction = input.imageFile
    ? 'IMAGE ANALYSIS INSTRUCTION: Analyze the attached product image visually! Describe its colors, design, visual appeal, package details, or specs shown in the image and incorporate them naturally into the post.'
    : '';

  return `
You are an expert E-Commerce Copywriter and Facebook Marketing Specialist.
Write ONE Facebook Business Page post for: "${pageName}".

STORE DETAILS:
${storeDetailsText}

RAW PRODUCT DETAILS:
"""
${rawDetails}
${input.ctaValue ? `Additional Contact / Link: ${input.ctaValue}` : ''}
"""

${imageInstruction}

MARKETING ANGLE TO USE:
${strategyDef.name}
Strategy Instructions: ${strategyDef.guide}

${lengthInstruction}

LANGUAGE REQUIREMENT:
${languageGuide}

CRITICAL RULES:
1. NO EMOJIS: Do NOT include ANY emojis anywhere in the text.
2. NO JSON / NO MARKDOWN METADATA: Do NOT wrap in JSON format or backticks.
3. READY-TO-POST FORMAT: Format with clean line breaks, price breakdown, and order contact details at the bottom.
4. HASHTAGS: Include 4 to 6 relevant hashtags at the bottom of the post.

OUTPUT INSTRUCTION:
Return ONLY the final ready-to-copy Facebook post text in plain text. Nothing else.
`;
};

const cleanAndFormatPost = (
  rawText: string,
  strategyDef: StrategyDefinition,
  input: SingleRawInput
): GeneratedPost => {
  let cleaned = rawText
    .replace(/^```[a-z]*\n?/gi, '')
    .replace(/```$/gi, '')
    .trim();

  // Strip emojis
  cleaned = cleaned.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    ''
  );

  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      const obj = JSON.parse(cleaned);
      if (obj.fullPostText) cleaned = obj.fullPostText;
      else if (obj.body) cleaned = obj.body;
      else if (obj.post) cleaned = obj.post;
    } catch {
      // Keep cleaned text
    }
  }

  const lines = cleaned.split('\n').filter((l) => l.trim().length > 0);
  const headline = lines[0] || `${strategyDef.name} Post`;
  const hashtags = cleaned.match(/#[a-zA-Z0-9_\u0980-\u09FF]+/g) || [];

  const targetLength =
    input.postLength === 'short'
      ? 'short'
      : input.postLength === 'detailed'
      ? 'detailed'
      : strategyDef.defaultLength;

  return {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    headline: headline.replace(/[*#]/g, '').trim(),
    body: cleaned,
    callToAction: input.ctaValue || '',
    hashtags,
    fullPostText: cleaned.trim(),
    strategy: strategyDef.id,
    strategyName: strategyDef.name,
    lengthType: targetLength,
    language: input.language,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    imageUrl: input.imageFile?.previewUrl,
  };
};
