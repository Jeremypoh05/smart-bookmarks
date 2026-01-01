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

    let hostname = parsedUrl.hostname.replace("www.", "");
    if (hostname.startsWith("v.") || hostname.startsWith("m.")) {
      hostname = hostname.split(".").slice(-2).join(".");
    }
    if (hostname === "youtu.be") {
      hostname = "youtube.com";
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
    "xhslink.com",
    "xhs.cn",
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

  const userAgents = [
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Twitterbot/1.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
  ];

  let bestResult = null;

  for (const userAgent of userAgents) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = extractTitle($, parsedUrl, hostname);
      const description = extractDescription($);
      const thumbnail = extractThumbnail($, parsedUrl);

      console.log("📝 Title:", title ? title.substring(0, 50) : "NONE");
      console.log(
        "📄 Desc:",
        description ? description.substring(0, 50) : "NONE"
      );
      console.log("🖼️  Thumb:", thumbnail ? "YES" : "NO");

      // Only update if we got better data
      if (title && title !== getPlatformName(hostname) && title.length > 3) {
        if (
          !bestResult ||
          (description &&
            description.length > (bestResult.description?.length || 0))
        ) {
          bestResult = { title, description, thumbnail };
          console.log("✅ Better result found");

          // If we have everything, stop
          if (thumbnail && description) {
            console.log("✅ Complete data, stopping");
            break;
          }
        }
      }
    } catch (e) {
      continue;
    }
  }

  const platform = getPlatformName(hostname);
  const platformKey = getPlatformKey(hostname);

  let finalThumbnail = bestResult?.thumbnail || "";

  if (!finalThumbnail) {
    finalThumbnail = getLocalOrFavicon(platformKey, parsedUrl.hostname);
  }

  return NextResponse.json({
    title: cleanText(bestResult?.title || `${platform} Post`, 200),
    description: cleanText(bestResult?.description || "", 500),
    thumbnail: finalThumbnail,
    platform,
  });
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
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.log(`⚠️ HTTP ${response.status}`);
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

function extractTitle(
  $: cheerio.CheerioAPI,
  url: URL,
  hostname: string
): string {
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
    $('meta[property="twitter:description"]').attr("content") ||
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
    "xhslink.com": "xiaohongshu",
    "youtube.com": "youtube",
    "youtu.be": "youtube",
    "twitter.com": "twitter",
    "x.com": "x",
  };
  return map[hostname.replace("www.", "")] || hostname.split(".")[0];
}

function getPlatformName(hostname: string): string {
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
  const h = hostname.replace("www.", "");
  return (
    map[h] || h.split(".")[0].charAt(0).toUpperCase() + h.split(".")[0].slice(1)
  );
}

function cleanText(text: string, maxLength: number): string {
  if (!text) return "";
  text = text.replace(/\s+/g, " ").trim();
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + "...";
  }
  return text;
}
