// import { NextRequest, NextResponse } from "next/server";
// import * as cheerio from "cheerio";

// export async function POST(req: NextRequest) {
//   try {
//     const { url } = await req.json();

//     if (!url) {
//       return NextResponse.json({ error: "URL is required" }, { status: 400 });
//     }

//     // 验证 URL
//     let parsedUrl;
//     try {
//       parsedUrl = new URL(url);
//     } catch {
//       return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
//     }

//     const response = await fetch(url, {
//       headers: {
//         "User-Agent": "Mozilla/5.0 (compatible; SmartBookmarks/1.0)",
//       },
//       signal: AbortSignal.timeout(10000), // 10 秒超时
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch URL");
//     }

//     const html = await response.text();
//     const $ = cheerio.load(html);

//     // 抓取 Open Graph metadata
//     const metadata = {
//       title:
//         $('meta[property="og:title"]').attr("content") ||
//         $('meta[name="twitter:title"]').attr("content") ||
//         $("title").text().trim() ||
//         "未命名书签",

//       description:
//         $('meta[property="og:description"]').attr("content") ||
//         $('meta[name="description"]').attr("content") ||
//         $('meta[name="twitter:description"]').attr("content") ||
//         "",

//       thumbnail:
//         $('meta[property="og:image"]').attr("content") ||
//         $('meta[name="twitter:image"]').attr("content") ||
//         "",

//       platform: parsedUrl.hostname.replace("www.", "").split(".")[0],
//     };

//     // 清理数据
//     if (metadata.title.length > 200) {
//       metadata.title = metadata.title.substring(0, 197) + "...";
//     }
//     if (metadata.description.length > 500) {
//       metadata.description = metadata.description.substring(0, 497) + "...";
//     }

//     return NextResponse.json(metadata);
//   } catch (error) {
//     console.error("Fetch metadata error:", error);

//     // 返回基本信息而不是完全失败
//     const { url } = await req.json();
//     const parsedUrl = new URL(url);

//     return NextResponse.json({
//       title: parsedUrl.hostname,
//       description: "",
//       thumbnail: "",
//       platform: parsedUrl.hostname.replace("www.", "").split(".")[0],
//     });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata with multiple fallbacks
    const metadata = {
      title: extractTitle($),
      description: extractDescription($),
      thumbnail: extractThumbnail($, parsedUrl),
      platform: extractPlatform(parsedUrl),
    };

    // Clean and validate data
    metadata.title = cleanText(metadata.title, 200) || "Untitled Bookmark";
    metadata.description = cleanText(metadata.description, 500);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Fetch metadata error:", error);

    // Return basic info instead of complete failure
    try {
      const { url } = await req.json();
      const parsedUrl = new URL(url);

      return NextResponse.json({
        title: parsedUrl.hostname,
        description: "",
        thumbnail: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`,
        platform: extractPlatform(parsedUrl),
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to process URL" },
        { status: 500 }
      );
    }
  }
}

// Extract title with multiple fallbacks
function extractTitle($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $('meta[property="og:site_name"]').attr("content") ||
    $("title").text() ||
    $("h1").first().text() ||
    ""
  );
}

// Extract description with multiple fallbacks
function extractDescription($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    $('meta[property="description"]').attr("content") ||
    ""
  );
}

// Extract thumbnail with multiple fallbacks
function extractThumbnail($: cheerio.CheerioAPI, parsedUrl: URL): string {
  let thumbnail =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:url"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $('meta[name="twitter:image:src"]').attr("content") ||
    $('link[rel="image_src"]').attr("href") ||
    $("img").first().attr("src") ||
    "";

  // Convert relative URLs to absolute
  if (thumbnail && !thumbnail.startsWith("http")) {
    try {
      thumbnail = new URL(thumbnail, parsedUrl.origin).href;
    } catch {
      thumbnail = "";
    }
  }

  // Fallback to high-quality favicon if no image found
  if (!thumbnail) {
    thumbnail = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`;
  }

  return thumbnail;
}

// Extract platform name
function extractPlatform(url: URL): string {
  const hostname = url.hostname.replace("www.", "");

  // Special cases for popular platforms
  const platformMap: Record<string, string> = {
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "tiktok.com": "TikTok",
    "xiaohongshu.com": "XiaoHongShu",
    "douyin.com": "Douyin",
    "instagram.com": "Instagram",
    "twitter.com": "Twitter",
    "x.com": "X",
    "facebook.com": "Facebook",
    "linkedin.com": "LinkedIn",
    "reddit.com": "Reddit",
    "medium.com": "Medium",
    "github.com": "GitHub",
  };

  return platformMap[hostname] || hostname.split(".")[0];
}

// Clean and truncate text
function cleanText(text: string | undefined, maxLength: number): string {
  if (!text) return "";

  // Remove extra whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Truncate if too long
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + "...";
  }

  return text;
}