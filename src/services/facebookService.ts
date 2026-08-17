import type { FacebookConfig } from '../types';

export interface PostToFBResponse {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export const publishPostToFacebook = async (
  message: string,
  config: FacebookConfig,
  linkUrl?: string
): Promise<PostToFBResponse> => {
  if (!config.pageId || !config.accessToken) {
    return {
      success: false,
      error: 'Facebook Page ID or Page Access Token is missing. Please configure them in FB Settings.',
    };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${config.pageId}/feed`;
    const bodyParams = new URLSearchParams();
    bodyParams.append('message', message);
    bodyParams.append('access_token', config.accessToken);
    if (linkUrl) {
      bodyParams.append('link', linkUrl);
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Facebook API Error: ${res.statusText}`,
      };
    }

    const postId = data.id;
    // Construct public post link if possible
    const pagePostId = postId.includes('_') ? postId.split('_')[1] : postId;
    const postUrl = `https://facebook.com/${config.pageId}/posts/${pagePostId}`;

    return {
      success: true,
      postId,
      postUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error while connecting to Facebook Graph API.';
    return {
      success: false,
      error: message,
    };
  }
};

export interface FBPageInfo {
  name: string;
  id: string;
  pictureUrl?: string;
}

export const verifyFBPageConnection = async (
  pageId: string,
  accessToken: string
): Promise<{ success: boolean; pageInfo?: FBPageInfo; error?: string }> => {
  if (!pageId || !accessToken) {
    return { success: false, error: 'Please enter both Page ID and Page Access Token.' };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${pageId}?fields=name,picture.type(large)&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Invalid Facebook Page ID or Access Token.',
      };
    }

    return {
      success: true,
      pageInfo: {
        id: data.id,
        name: data.name,
        pictureUrl: data.picture?.data?.url,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network connection failed.';
    return {
      success: false,
      error: message,
    };
  }
};
