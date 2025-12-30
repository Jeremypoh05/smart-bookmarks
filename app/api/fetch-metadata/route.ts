import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Normalize hostname
    let hostname = parsedUrl.hostname.replace("www.", "");

    // Special handling for short URLs
    if (hostname.startsWith("v.")) {
      const mainDomain = hostname.split(".").slice(-2).join(".");
      hostname = mainDomain;
      console.log(
        "🔄 Normalized hostname from",
        parsedUrl.hostname,
        "to",
        hostname
      );
    }

    // Detect platform type
    if (isSocialMedia(hostname)) {
      return await handleSocialMedia(url, parsedUrl, hostname);
    }

    // Regular website handling
    return await fetchRegularMetadata(url, parsedUrl, hostname);
  } catch (error) {
    console.error("Metadata fetch error:", error);

    try {
      const { url } = await req.json();
      const parsedUrl = new URL(url);
      let hostname = parsedUrl.hostname.replace("www.", "");
      if (hostname.startsWith("v.")) {
        hostname = hostname.split(".").slice(-2).join(".");
      }
      return createFallback(parsedUrl, hostname);
    } catch {
      return createFallback(new URL("https://example.com"), "example.com");
    }
  }
}

// Detect if social media
function isSocialMedia(hostname: string): boolean {
  const socialPlatforms = [
    "facebook.com",
    "fb.com",
    "instagram.com",
    "tiktok.com",
    "douyin.com",
    "xiaohongshu.com",
    "xhslink.com",
    "xhs.cn",
    "twitter.com",
    "x.com",
    "reddit.com",
    "linkedin.com",
    "pinterest.com",
  ];

  return socialPlatforms.some((platform) => hostname.includes(platform));
}

// Social media handler
async function handleSocialMedia(
  url: string,
  parsedUrl: URL,
  hostname: string
) {
  console.log("🎭 Detected social media:", hostname);

  const userAgents = [
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  let bestResult = null;

  for (const userAgent of userAgents) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
          "Cache-Control": "no-cache",
          Referer: "https://www.google.com/",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = extractTitle($, parsedUrl, hostname);
        const description = extractDescription($);
        let thumbnail = extractThumbnail($, parsedUrl);

        // Special Facebook image extraction
        if (hostname.includes("facebook.com") && !thumbnail) {
          thumbnail = extractFacebookImages($);
        }

        if (title && title !== parsedUrl.hostname) {
          bestResult = { title, description, thumbnail };
          console.log("✅ Found content with:", userAgent.substring(0, 50));

          if (thumbnail) {
            console.log("✅ Found thumbnail:", thumbnail.substring(0, 80));
          }

          if (thumbnail) break; // If we got thumbnail, stop trying
        }
      }
    } catch (e) {
      console.log("❌ Failed with user agent:", userAgent.substring(0, 40));
      continue;
    }
  }

  const platform = getPlatformName(hostname);
  const platformKey = getPlatformKey(hostname);

  if (bestResult) {
    return NextResponse.json({
      title: cleanText(bestResult.title, 200),
      description: cleanText(bestResult.description, 500),
      thumbnail:
        bestResult.thumbnail || getLocalOrGeneratedThumbnail(platformKey),
      platform,
    });
  }

  console.log("⚠️ Using fallback for", platform);

  return NextResponse.json({
    title: `${platform} Post`,
    description: `Content from ${platform}. Click edit to add details manually.`,
    thumbnail: getLocalOrGeneratedThumbnail(platformKey),
    platform,
    needsManualEdit: true,
  });
}

// Extract Facebook images
function extractFacebookImages($: cheerio.CheerioAPI): string {
  // Try multiple selectors for Facebook images
  const selectors = [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[property="og:image:secure_url"]',
    "img[data-img-attaching-point]",
    'img[class*="scaledImage"]',
    'div[data-sigil="photo-image"] img',
  ];

  for (const selector of selectors) {
    const content = $(selector).attr("content") || $(selector).attr("src");
    if (content && content.startsWith("http")) {
      console.log("✅ Found FB image with selector:", selector);
      return content;
    }
  }

  return "";
}

// Regular website handler
async function fetchRegularMetadata(
  url: string,
  parsedUrl: URL,
  hostname: string
) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const metadata = {
      title: extractTitle($, parsedUrl, hostname),
      description: extractDescription($),
      thumbnail: extractThumbnail($, parsedUrl),
      platform: getPlatformName(hostname),
    };

    metadata.title = cleanText(metadata.title, 200) || parsedUrl.hostname;
    metadata.description = cleanText(metadata.description, 500);

    if (!metadata.thumbnail) {
      const platformKey = getPlatformKey(hostname);
      metadata.thumbnail = getLocalOrGeneratedThumbnail(platformKey);
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Regular fetch error:", error);
    return createFallback(parsedUrl, hostname);
  }
}

// Extract title
function extractTitle(
  $: cheerio.CheerioAPI,
  url: URL,
  hostname: string
): string {
  let title = (
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $('meta[property="twitter:title"]').attr("content") ||
    $("title").text() ||
    $("h1").first().text() ||
    ""
  ).trim();

  // If title is empty or just hostname, try to get a better title
  if (!title || title === url.hostname) {
    const platform = getPlatformName(hostname);
    title = `${platform} Post`;
  }

  return title;
}

// Extract description
function extractDescription($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    $('meta[property="twitter:description"]').attr("content") ||
    ""
  ).trim();
}

// Extract thumbnail
function extractThumbnail($: cheerio.CheerioAPI, parsedUrl: URL): string {
  let thumbnail = (
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:url"]').attr("content") ||
    $('meta[property="og:image:secure_url"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $('meta[property="twitter:image"]').attr("content") ||
    ""
  ).trim();

  if (thumbnail && !thumbnail.startsWith("http")) {
    try {
      thumbnail = new URL(thumbnail, parsedUrl.origin).href;
    } catch {
      return "";
    }
  }

  return thumbnail;
}

// Get local or generated thumbnail
function getLocalOrGeneratedThumbnail(platformKey: string): string {
  // Check if local image exists
  const publicPath = path.join(
    process.cwd(),
    "public",
    "logos",
    `${platformKey}.png`
  );

  if (fs.existsSync(publicPath)) {
    console.log("✅ Using local logo for", platformKey);
    return `/logos/${platformKey}.png`;
  }

  // Generate SVG placeholder
  return generatePlatformPlaceholder(platformKey);
}

// Get platform key for file naming
function getPlatformKey(hostname: string): string {
  const h = hostname.replace("www.", "");

  const keyMap: Record<string, string> = {
    "facebook.com": "facebook",
    "fb.com": "facebook",
    "instagram.com": "instagram",
    "tiktok.com": "tiktok",
    "douyin.com": "douyin",
    "xiaohongshu.com": "xiaohongshu",
    "xhslink.com": "xiaohongshu",
    "youtube.com": "youtube",
    "twitter.com": "twitter",
    "x.com": "x",
  };

  return keyMap[h] || h.split(".")[0];
}

// Generate platform placeholder
function generatePlatformPlaceholder(platformKey: string): string {
  const platformConfigs: Record<
    string,
    { name: string; colors: [string, string]; emoji: string }
  > = {
    facebook: { name: "Facebook", colors: ["1877F2", "0C63D4"], emoji: "📘" },
    instagram: { name: "Instagram", colors: ["E4405F", "F77737"], emoji: "📷" },
    tiktok: { name: "TikTok", colors: ["000000", "EE1D52"], emoji: "🎵" },
    douyin: { name: "Douyin", colors: ["000000", "FE2C55"], emoji: "🎵" },
    xiaohongshu: { name: "小红书", colors: ["FF2442", "FF6B6B"], emoji: "📕" },
    youtube: { name: "YouTube", colors: ["FF0000", "CC0000"], emoji: "▶️" },
    twitter: { name: "Twitter", colors: ["1DA1F2", "0C8BD9"], emoji: "🐦" },
    x: { name: "X", colors: ["000000", "14171A"], emoji: "✖️" },
  };

  const config = platformConfigs[platformKey] || {
    name: platformKey.charAt(0).toUpperCase() + platformKey.slice(1),
    colors: ["4F46E5", "6366F1"],
    emoji: "🔖",
  };

  const [color1, color2] = config.colors;
  const displayText = encodeURIComponent(config.name);
  const emoji = encodeURIComponent(config.emoji);

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23${color1};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23${color2};stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='225'/%3E%3Ctext fill='white' font-family='system-ui' font-size='56' x='50%25' y='40%25' text-anchor='middle' dominant-baseline='middle'%3E${emoji}%3C/text%3E%3Ctext fill='white' font-family='system-ui' font-weight='600' font-size='28' x='50%25' y='65%25' text-anchor='middle' dominant-baseline='middle'%3E${displayText}%3C/text%3E%3C/svg%3E`;
}

// Get platform name
function getPlatformName(hostname: string): string {
  const h = hostname.replace("www.", "");

  const platforms: Record<string, string> = {
    "facebook.com": "Facebook",
    "fb.com": "Facebook",
    "instagram.com": "Instagram",
    "tiktok.com": "TikTok",
    "douyin.com": "Douyin",
    "xiaohongshu.com": "XiaoHongShu",
    "xhslink.com": "XiaoHongShu",
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "twitter.com": "Twitter",
    "x.com": "X",
    "github.com": "GitHub",
    "reddit.com": "Reddit",
  };

  return (
    platforms[h] ||
    h.split(".")[0].charAt(0).toUpperCase() + h.split(".")[0].slice(1)
  );
}

// Fallback
function createFallback(parsedUrl: URL, hostname: string) {
  const platform = getPlatformName(hostname);
  const platformKey = getPlatformKey(hostname);

  return NextResponse.json({
    title: platform,
    description: "",
    thumbnail: getLocalOrGeneratedThumbnail(platformKey),
    platform,
    needsManualEdit: true,
  });
}

// Clean text
function cleanText(text: string, maxLength: number): string {
  if (!text) return "";
  text = text.replace(/\s+/g, " ").trim();
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + "...";
  }
  return text;
}
