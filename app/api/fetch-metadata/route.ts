import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Clean and validate URL
    let cleanUrl = url.trim();
    
    // Remove any trailing text after URL (from mobile sharing)
    const urlMatch = cleanUrl.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      cleanUrl = urlMatch[0];
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    console.log('📱 Processing URL:', cleanUrl);

    // Normalize hostname
    let hostname = parsedUrl.hostname.replace('www.', '');
    
    // Handle short URLs (v.douyin.com -> douyin.com)
    if (hostname.startsWith('v.') || hostname.startsWith('m.')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        hostname = parts.slice(-2).join('.');
      }
      console.log('🔄 Normalized hostname to:', hostname);
    }

    // Detect platform type
    if (isSocialMedia(hostname)) {
      return await handleSocialMedia(cleanUrl, parsedUrl, hostname);
    }

    // Regular website handling
    return await fetchRegularMetadata(cleanUrl, parsedUrl, hostname);

  } catch (error) {
    console.error('❌ Metadata fetch error:', error);
    
    try {
      const { url } = await req.json();
      const parsedUrl = new URL(url);
      let hostname = parsedUrl.hostname.replace('www.', '');
      if (hostname.startsWith('v.') || hostname.startsWith('m.')) {
        hostname = hostname.split('.').slice(-2).join('.');
      }
      return createFallback(parsedUrl, hostname);
    } catch {
      return createFallback(new URL('https://example.com'), 'example.com');
    }
  }
}

// Detect if social media
function isSocialMedia(hostname: string): boolean {
  const socialPlatforms = [
    'facebook.com', 'fb.com',
    'instagram.com',
    'tiktok.com',
    'douyin.com',
    'xiaohongshu.com', 'xhslink.com', 'xhs.cn',
    'twitter.com', 'x.com',
    'reddit.com',
    'linkedin.com',
  ];
  
  return socialPlatforms.some(platform => hostname.includes(platform));
}

// Social media handler
async function handleSocialMedia(url: string, parsedUrl: URL, hostname: string) {
  console.log('🎭 Social media detected:', hostname);

  const userAgents = [
    // Bot crawlers (best for Open Graph data)
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Twitterbot/1.0',
    // Regular browsers
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  ];

  let bestResult = null;

  for (const userAgent of userAgents) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8',
        },
        signal: AbortSignal.timeout(12000),
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = extractTitle($, parsedUrl, hostname);
        const description = extractDescription($);
        let thumbnail = extractThumbnail($, parsedUrl);

        // Special handling for different platforms
        if (!thumbnail) {
          if (hostname.includes('facebook.com')) {
            thumbnail = extractFacebookImages($);
          } else if (hostname.includes('instagram.com')) {
            thumbnail = extractInstagramImages($);
          }
        }

        if (title && title !== parsedUrl.hostname) {
          bestResult = { title, description, thumbnail };
          console.log('✅ Found content');
          
          if (thumbnail) {
            console.log('✅ Thumbnail:', thumbnail.substring(0, 80));
            break; // Got everything, stop trying
          }
        }
      }
    } catch (e) {
      continue;
    }
  }

  const platform = getPlatformName(hostname);
  const platformKey = getPlatformKey(hostname);

  // Try to get favicon as last resort
  let thumbnail = bestResult?.thumbnail;
  if (!thumbnail) {
    thumbnail = await getFaviconOrLogo(parsedUrl, platformKey);
  }

  if (bestResult) {
    return NextResponse.json({
      title: cleanText(bestResult.title, 200),
      description: cleanText(bestResult.description, 500),
      thumbnail,
      platform,
    });
  }

  console.log('⚠️ Using fallback for', platform);
  
  return NextResponse.json({
    title: `${platform} Post`,
    description: `Content from ${platform}. Click edit to add details.`,
    thumbnail,
    platform,
    needsManualEdit: true,
  });
}

// Extract Facebook images (including post photos)
function extractFacebookImages($: cheerio.CheerioAPI): string {
  const selectors = [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[property="og:image:secure_url"]',
    'meta[name="twitter:image"]',
    // Facebook-specific selectors
    'img[data-visualcompletion="media-vc-image"]',
    'img[class*="x1ey2m1c"]', // FB's dynamic class
    'img[src*="scontent"]', // FB CDN images
  ];

  for (const selector of selectors) {
    const element = $(selector);
    const content = element.attr('content') || element.attr('src');
    
    if (content && content.startsWith('http') && !content.includes('static') && !content.includes('icon')) {
      console.log('✅ Found FB image');
      return content;
    }
  }

  return '';
}

// Extract Instagram images
function extractInstagramImages($: cheerio.CheerioAPI): string {
  const selectors = [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[name="twitter:image"]',
    'img[class*="x5yr21d"]', // IG's dynamic class
  ];

  for (const selector of selectors) {
    const element = $(selector);
    const content = element.attr('content') || element.attr('src');
    
    if (content && content.startsWith('http')) {
      return content;
    }
  }

  return '';
}

// Regular website handler
async function fetchRegularMetadata(url: string, parsedUrl: URL, hostname: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = extractTitle($, parsedUrl, hostname);
    const description = extractDescription($);
    let thumbnail = extractThumbnail($, parsedUrl);

    // If no thumbnail, try favicon
    if (!thumbnail) {
      thumbnail = await getFaviconOrLogo(parsedUrl, getPlatformKey(hostname));
    }

    return NextResponse.json({
      title: cleanText(title, 200) || parsedUrl.hostname,
      description: cleanText(description, 500),
      thumbnail,
      platform: getPlatformName(hostname),
    });

  } catch (error) {
    console.error('Regular fetch error:', error);
    return createFallback(parsedUrl, hostname);
  }
}

// Get favicon or local logo
async function getFaviconOrLogo(parsedUrl: URL, platformKey: string): Promise<string> {
  // Priority 1: Check if we have a local logo
  const localLogos = ['facebook', 'instagram', 'tiktok', 'douyin', 'xiaohongshu', 'youtube', 'twitter', 'x'];
  
  if (localLogos.includes(platformKey)) {
    console.log('✅ Using local logo:', platformKey);
    return `/logos/${platformKey}.png`;
  }

  // Priority 2: Try to get high-quality favicon
  const faviconUrls = [
    // Google's favicon service (high quality)
    `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`,
    // Direct favicon
    `${parsedUrl.origin}/favicon.ico`,
    // Apple touch icon (usually high quality)
    `${parsedUrl.origin}/apple-touch-icon.png`,
  ];

  // Return Google's favicon service (most reliable)
  return faviconUrls[0];
}

// Get platform key
function getPlatformKey(hostname: string): string {
  const h = hostname.replace('www.', '');
  
  const keyMap: Record<string, string> = {
    'facebook.com': 'facebook',
    'fb.com': 'facebook',
    'instagram.com': 'instagram',
    'tiktok.com': 'tiktok',
    'douyin.com': 'douyin',
    'xiaohongshu.com': 'xiaohongshu',
    'xhslink.com': 'xiaohongshu',
    'youtube.com': 'youtube',
    'youtu.be': 'youtube',
    'twitter.com': 'twitter',
    'x.com': 'x',
  };
  
  return keyMap[h] || h.split('.')[0];
}

// Extract title
function extractTitle($: cheerio.CheerioAPI, url: URL, hostname: string): string {
  let title = (
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    $('h1').first().text() ||
    ''
  ).trim();

  if (!title || title === url.hostname) {
    title = getPlatformName(hostname) + ' Post';
  }

  return title;
}

// Extract description
function extractDescription($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    ''
  ).trim();
}

// Extract thumbnail
function extractThumbnail($: cheerio.CheerioAPI, parsedUrl: URL): string {
  let thumbnail = (
    $('meta[property="og:image"]').attr('content') ||
    $('meta[property="og:image:url"]').attr('content') ||
    $('meta[property="og:image:secure_url"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    $('meta[property="twitter:image"]').attr('content') ||
    ''
  ).trim();

  if (thumbnail && !thumbnail.startsWith('http')) {
    try {
      thumbnail = new URL(thumbnail, parsedUrl.origin).href;
    } catch {
      return '';
    }
  }

  return thumbnail;
}

// Get platform name
function getPlatformName(hostname: string): string {
  const h = hostname.replace('www.', '');
  
  const platforms: Record<string, string> = {
    'facebook.com': 'Facebook',
    'fb.com': 'Facebook',
    'instagram.com': 'Instagram',
    'tiktok.com': 'TikTok',
    'douyin.com': 'Douyin',
    'xiaohongshu.com': 'XiaoHongShu',
    'xhslink.com': 'XiaoHongShu',
    'youtube.com': 'YouTube',
    'youtu.be': 'YouTube',
    'twitter.com': 'Twitter',
    'x.com': 'X',
    'github.com': 'GitHub',
    'reddit.com': 'Reddit',
  };
  
  return platforms[h] || h.split('.')[0].charAt(0).toUpperCase() + h.split('.')[0].slice(1);
}

// Fallback
async function createFallback(parsedUrl: URL, hostname: string) {
  const platform = getPlatformName(hostname);
  const platformKey = getPlatformKey(hostname);
  const thumbnail = await getFaviconOrLogo(parsedUrl, platformKey);
  
  return NextResponse.json({
    title: platform,
    description: '',
    thumbnail,
    platform,
    needsManualEdit: true,
  });
}

// Clean text
function cleanText(text: string, maxLength: number): string {
  if (!text) return '';
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + '...';
  }
  return text;
}
