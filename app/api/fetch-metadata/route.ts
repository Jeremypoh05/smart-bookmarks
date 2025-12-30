import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Clean URL - remove trailing text from mobile sharing
    let cleanUrl = url.trim();
    const urlMatch = cleanUrl.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      cleanUrl = urlMatch[0];
    }

    // Remove trailing slashes and query params that might cause issues
    cleanUrl = cleanUrl.replace(/[?#].*$/, "").replace(/\/$/, "");

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    console.log("🔗 Processing:", cleanUrl);

    // Normalize hostname
    let hostname = parsedUrl.hostname.replace("www.", "");

    // Handle short domains (v.douyin.com -> douyin.com, m.youtube.com -> youtube.com)
    if (hostname.startsWith("v.") || hostname.startsWith("m.")) {
      const parts = hostname.split(".");
      if (parts.length >= 3) {
        hostname = parts.slice(-2).join(".");
      }
    }

    // Special handling for youtu.be
    if (hostname === "youtu.be") {
      hostname = "youtube.com";
    }

    console.log("🏷️  Platform:", hostname);

    const platformKey = getPlatformKey(hostname);
    const isSocial = isSocialMedia(hostname);

    // Fetch metadata
    const metadata = await fetchMetadata(
      cleanUrl,
      parsedUrl,
      hostname,
      isSocial
    );

    // Ensure we have a thumbnail
    if (!metadata.thumbnail) {
      metadata.thumbnail = await getThumbnail(parsedUrl, platformKey, hostname);
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("❌ Error:", error);

    try {
      const { url } = await req.json();
      const parsedUrl = new URL(url);
      let hostname = parsedUrl.hostname.replace("www.", "");
      if (hostname.startsWith("v.") || hostname.startsWith("m.")) {
        hostname = hostname.split(".").slice(-2).join(".");
      }
      return createFallback(parsedUrl, hostname);
    } catch {
      return createFallback(new URL("https://example.com"), "example.com");
    }
  }
}

// Check if social media
function isSocialMedia(hostname: string): boolean {
  const platforms = [
    "facebook.com",
    "fb.com",
    "instagram.com",
    "tiktok.com",
    "douyin.com",
    "xiaohongshu.com",
    "xhslink.com",
    "youtube.com",
    "youtu.be",
    "twitter.com",
    "x.com",
    "reddit.com",
    "linkedin.com",
  ];
  return platforms.some((p) => hostname.includes(p));
}

// Main metadata fetcher
async function fetchMetadata(
  url: string,
  parsedUrl: URL,
  hostname: string,
  isSocial: boolean
) {
  const userAgents = isSocial
    ? [
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Twitterbot/1.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
      ]
    : [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ];

  let bestResult = { title: "", description: "", thumbnail: "" };

  for (const userAgent of userAgents) {
    try {
      console.log("🔍 Trying with:", userAgent.substring(0, 30) + "...");

      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Referer: "https://www.google.com/",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        console.log("❌ HTTP", response.status);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = extractTitle($, parsedUrl, hostname);
      const description = extractDescription($);
      let thumbnail = extractThumbnail($, parsedUrl);

      // Platform-specific thumbnail extraction
      if (!thumbnail && hostname.includes("facebook.com")) {
        thumbnail = extractFacebookThumbnail($, html);
      }

      if (!thumbnail && hostname.includes("xiaohongshu.com")) {
        thumbnail = extractXiaohongshuThumbnail($, html);
      }

      if (title && title.length > 10) {
        bestResult = { title, description, thumbnail };
        console.log("✅ Title:", title.substring(0, 50));
        console.log("✅ Desc:", description.substring(0, 50));
        console.log("✅ Thumb:", thumbnail ? "Found" : "None");

        if (thumbnail) break; // Got everything
      }
    } catch (error) {
      console.log("❌ Error:");
      continue;
    }
  }

  const platform = getPlatformName(hostname);

  return {
    title: cleanText(bestResult.title, 200) || `${platform} Post`,
    description: cleanText(bestResult.description, 500),
    thumbnail: bestResult.thumbnail,
    platform,
  };
}

// Extract Facebook thumbnail
function extractFacebookThumbnail($: cheerio.CheerioAPI, html: string): string {
  // Method 1: Standard Open Graph
  let img =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:url"]').attr("content") ||
    $('meta[property="og:image:secure_url"]').attr("content");

  if (
    img &&
    img.startsWith("http") &&
    !img.includes("static") &&
    !img.includes("icon")
  ) {
    console.log("✅ FB OG Image");
    return img;
  }

  // Method 2: Twitter Card
  img =
    $('meta[name="twitter:image"]').attr("content") ||
    $('meta[property="twitter:image"]').attr("content");

  if (img && img.startsWith("http")) {
    console.log("✅ FB Twitter Image");
    return img;
  }

  // Method 3: Look for scontent images in HTML (FB's CDN)
  const scontentMatch = html.match(/https:\/\/scontent[^"'\s]+\.jpg/i);
  if (scontentMatch) {
    console.log("✅ FB CDN Image");
    return scontentMatch[0];
  }

  // Method 4: JSON-LD structured data
  const scripts = $('script[type="application/ld+json"]');
  scripts.each((i, script) => {
    try {
      const data = JSON.parse($(script).html() || "{}");
      if (data.image?.url) {
        img = data.image.url;
        return false; // break
      }
      if (typeof data.image === "string") {
        img = data.image;
        return false;
      }
    } catch {}
  });

  if (img && img.startsWith("http")) {
    console.log("✅ FB JSON-LD Image");
    return img;
  }

  console.log("❌ No FB image found");
  return "";
}

// Extract Xiaohongshu thumbnail
function extractXiaohongshuThumbnail(
  $: cheerio.CheerioAPI,
  html: string
): string {
  // Method 1: Open Graph
  const img = $('meta[property="og:image"]').attr("content");
  if (img && img.startsWith("http") && !img.includes("avatar")) {
    return img;
  }

  // Method 2: Look for image URLs in HTML
  const imgMatch = html.match(/https:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)/gi);
  if (imgMatch && imgMatch.length > 0) {
    // Filter out avatars and small images
    const validImg = imgMatch.find(
      (url) =>
        !url.includes("avatar") &&
        !url.includes("icon") &&
        (url.includes("1080x") || url.includes("note"))
    );
    if (validImg) return validImg;
  }

  return "";
}

// Get thumbnail with fallbacks
async function getThumbnail(
  parsedUrl: URL,
  platformKey: string,
  hostname: string
): Promise<string> {
  // Priority 1: Local logos for known platforms
  const knownPlatforms = [
    "facebook",
    "instagram",
    "tiktok",
    "douyin",
    "xiaohongshu",
    "youtube",
    "twitter",
    "x",
  ];

  if (knownPlatforms.includes(platformKey)) {
    console.log("✅ Using local logo:", platformKey);
    return `/logos/${platformKey}.png`;
  }

  // Priority 2: Try multiple favicon sources
  const faviconUrls = [
    // Google's high-quality favicon service
    `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=256`,
    // DuckDuckGo icons (good quality)
    `https://icons.duckduckgo.com/ip3/${parsedUrl.hostname}.ico`,
    // Favicon.io
    `https://favicons.githubusercontent.com/${parsedUrl.hostname}`,
  ];

  // Test first favicon URL
  try {
    const response = await fetch(faviconUrls[0], {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      console.log("✅ Using Google favicon");
      return faviconUrls[0];
    }
  } catch {
    console.log("⚠️ Favicon check failed, using anyway");
  }

  return faviconUrls[0]; // Return Google's service as fallback
}

// Standard extraction functions
function extractTitle(
  $: cheerio.CheerioAPI,
  url: URL,
  hostname: string
): string {
  return (
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $('meta[property="twitter:title"]').attr("content") ||
    $("title").text() ||
    $("h1").first().text() ||
    getPlatformName(hostname)
  ).trim();
}

function extractDescription($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    $('meta[property="twitter:description"]').attr("content") ||
    ""
  ).trim();
}

function extractThumbnail($: cheerio.CheerioAPI, parsedUrl: URL): string {
  let thumb = (
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:url"]').attr("content") ||
    $('meta[property="og:image:secure_url"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $('meta[property="twitter:image"]').attr("content") ||
    ""
  ).trim();

  if (thumb && !thumb.startsWith("http")) {
    try {
      thumb = new URL(thumb, parsedUrl.origin).href;
    } catch {
      return "";
    }
  }

  return thumb;
}

function getPlatformKey(hostname: string): string {
  const h = hostname.replace("www.", "");
  const map: Record<string, string> = {
    "facebook.com": "facebook",
    "fb.com": "facebook",
    "instagram.com": "instagram",
    "tiktok.com": "tiktok",
    "douyin.com": "douyin",
    "xiaohongshu.com": "xiaohongshu",
    "xhslink.com": "xiaohongshu",
    "youtube.com": "youtube",
    "youtu.be": "youtube",
    "twitter.com": "twitter",
    "x.com": "x",
  };
  return map[h] || h.split(".")[0];
}

function getPlatformName(hostname: string): string {
  const h = hostname.replace("www.", "");
  const map: Record<string, string> = {
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
  };
  return (
    map[h] || h.split(".")[0].charAt(0).toUpperCase() + h.split(".")[0].slice(1)
  );
}

async function createFallback(parsedUrl: URL, hostname: string) {
  const platform = getPlatformName(hostname);
  const platformKey = getPlatformKey(hostname);
  const thumbnail = await getThumbnail(parsedUrl, platformKey, hostname);

  return NextResponse.json({
    title: platform,
    description: "",
    thumbnail,
    platform,
  });
}

function cleanText(text: string, maxLength: number): string {
  if (!text) return "";
  text = text.replace(/\s+/g, " ").trim();
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + "...";
  }
  return text;
}
