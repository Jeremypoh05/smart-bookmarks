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

    let cleanUrl = url.trim();
    const urlMatch = cleanUrl.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      cleanUrl = urlMatch[0];
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    console.log("\n🔗 Processing:", cleanUrl);

    // 🔥 IMPROVED: Better hostname normalization
    let hostname = parsedUrl.hostname.replace("www.", "");
    
    // Fix TikTok variants (vt.tiktok.com, m.tiktok.com, vm.tiktok.com)
    if (hostname.includes("tiktok.com")) {
      hostname = "tiktok.com";
    }
    
    // Fix Douyin variants (v.douyin.com, m.douyin.com)
    if (hostname.includes("douyin.com")) {
      hostname = "douyin.com";
    }
    
    // Fix YouTube
    if (hostname === "youtu.be" || hostname.includes("youtube.com")) {
      hostname = "youtube.com";
    }
    
    // Fix Xiaohongshu
    if (hostname.includes("xhs")) {
      hostname = "xiaohongshu.com";
    }

    console.log("🏷️  Platform:", hostname);

    if (isSocialMedia(hostname)) {
      return await handleSocialMedia(cleanUrl, parsedUrl, hostname);
    }

    return await fetchRegularMetadata(cleanUrl, parsedUrl, hostname);
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

function isSocialMedia(hostname: string): boolean {
  const platforms = [
    "facebook.com",
    "fb.com",
    "instagram.com",
    "tiktok.com",
    "douyin.com",
    "xiaohongshu.com",
    "youtube.com",
    "youtu.be",
    "twitter.com",
    "x.com",
  ];
  return platforms.some((p) => hostname.includes(p));
}

async function handleSocialMedia(
  url: string,
  parsedUrl: URL,
  hostname: string
) {
  console.log("🎭 Social Media Handler");

  // 🔥 IMPROVED: More user agents for Douyin/TikTok
  const userAgents = [
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Twitterbot/1.0",
    // 🔥 Mobile user agents for TikTok/Douyin
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  let bestResult = null;

  for (const userAgent of userAgents) {
    try {
      console.log(`🔍 Trying: ${userAgent.substring(0, 40)}...`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });

      console.log("📡 Status:", response.status);

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = extractTitle($, parsedUrl, hostname);
      const description = extractDescription($);
      let thumbnail = extractThumbnail($, parsedUrl);

      console.log("📝 Title:", title ? title.substring(0, 50) : "NONE");
      console.log("📄 Desc:", description ? description.substring(0, 50) : "NONE");
      console.log("🖼️  Thumb:", thumbnail ? "YES" : "NO");

      // 🔥 Platform-specific extraction
      if (!thumbnail && (hostname === "tiktok.com" || hostname === "douyin.com")) {
        thumbnail = extractTikTokDouyinThumbnail($, html);
      }

      if (title && title !== getPlatformName(hostname) && title.length > 3) {
        if (
          !bestResult ||
          (description && description.length > (bestResult.description?.length || 0))
        ) {
          bestResult = { title, description, thumbnail };
          console.log("✅ Better result found");

          if (thumbnail && description) {
            console.log("✅ Complete data, stopping");
            break;
          }
        }
      }
    } catch (e) {
      console.log("❌ Failed:", (e as Error).message);
      continue;
    }
  }

  const platform = getPlatformName(hostname);
  const platformKey = getPlatformKey(hostname);

  let finalThumbnail = bestResult?.thumbnail || "";

  // 🔥 FIX: Ensure thumbnail is always a string, not an array
  if (Array.isArray(finalThumbnail)) {
    finalThumbnail = finalThumbnail[0] || "";
  }

  if (!finalThumbnail) {
    console.log("⚠️ No thumbnail found, using fallback");
    finalThumbnail = getLocalOrFavicon(platformKey, parsedUrl.hostname);
  }

  return NextResponse.json({
    title: cleanText(bestResult?.title || `${platform} Post`, 200),
    description: cleanText(bestResult?.description || "", 500),
    thumbnail: finalThumbnail,
    platform,
  });
}

// 🔥 NEW: TikTok/Douyin specific thumbnail extraction
function extractTikTokDouyinThumbnail($: cheerio.CheerioAPI, html: string): string {
  // Method 1: JSON-LD structured data
  const scripts = $('script[type="application/ld+json"]');
  let img = "";
  
  scripts.each((i, script) => {
    try {
      const data = JSON.parse($(script).html() || "{}");
      if (data.thumbnailUrl) {
        img = data.thumbnailUrl;
        return false; // break
      }
      if (data.image?.url) {
        img = data.image.url;
        return false;
      }
      if (typeof data.image === "string") {
        img = data.image;
        return false;
      }
    } catch {}
  });

  if (img) {
    console.log("✅ TikTok/Douyin JSON-LD thumbnail");
    return img;
  }

  // Method 2: Search for common CDN patterns
  const patterns = [
    /https:\/\/p\d+\.douyinpic\.com[^"'\s<>]+/gi,
    /https:\/\/[^"'\s]+\.tiktokcdn\.com[^"'\s<>]+/gi,
    /https:\/\/[^"'\s]+\.muscdn\.com[^"'\s<>]+/gi,
  ];

  for (const pattern of patterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      console.log("✅ TikTok/Douyin CDN thumbnail");
      return matches[0].split(/["'<>\s]/)[0];
    }
  }

  console.log("❌ No TikTok/Douyin thumbnail found");
  return "";
}

async function fetchRegularMetadata(
  url: string,
  parsedUrl: URL,
  hostname: string
) {
  console.log("🌐 Regular Website Handler");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = extractTitle($, parsedUrl, hostname);
    const description = extractDescription($);
    let thumbnail = extractThumbnail($, parsedUrl);

    if (!thumbnail) {
      thumbnail = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=256`;
    }

    return NextResponse.json({
      title: cleanText(title, 200) || parsedUrl.hostname,
      description: cleanText(description, 500),
      thumbnail,
      platform: getPlatformName(hostname),
    });
  } catch (error) {
    console.error("❌ Fetch error:", error);

    return NextResponse.json({
      title: parsedUrl.hostname,
      description: `Website from ${parsedUrl.hostname}`,
      thumbnail: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=256`,
      platform: getPlatformName(hostname),
    });
  }
}

function getLocalOrFavicon(platformKey: string, hostname: string): string {
  const publicPath = path.join(
    process.cwd(),
    "public",
    "logos",
    `${platformKey}.png`
  );

  if (fs.existsSync(publicPath)) {
    console.log("✅ Using local logo:", platformKey);
    return `/logos/${platformKey}.png`;
  }

  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`;
}

function extractTitle($: cheerio.CheerioAPI, url: URL, hostname: string): string {
  return (
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
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
    ""
  ).trim();
}

function extractThumbnail($: cheerio.CheerioAPI, parsedUrl: URL): string {
  let thumb = (
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:url"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
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
  const map: Record<string, string> = {
    "facebook.com": "facebook",
    "fb.com": "facebook",
    "instagram.com": "instagram",
    "tiktok.com": "tiktok",
    "douyin.com": "douyin",
    "xiaohongshu.com": "xiaohongshu",
    "youtube.com": "youtube",
    "youtu.be": "youtube",
    "twitter.com": "twitter",
    "x.com": "x",
  };
  return map[hostname] || hostname.split(".")[0];
}

function getPlatformName(hostname: string): string {
  const map: Record<string, string> = {
    "facebook.com": "Facebook",
    "fb.com": "Facebook",
    "instagram.com": "Instagram",
    "tiktok.com": "TikTok",
    "douyin.com": "Douyin",
    "xiaohongshu.com": "XiaoHongShu",
    "youtube.com": "YouTube",
    "twitter.com": "Twitter",
    "x.com": "X",
  };
  return map[hostname] || hostname.split(".")[0].charAt(0).toUpperCase() + hostname.split(".")[0].slice(1);
}

function cleanText(text: string, maxLength: number): string {
  if (!text) return "";
  text = text.replace(/\s+/g, " ").trim();
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + "...";
  }
  return text;
}