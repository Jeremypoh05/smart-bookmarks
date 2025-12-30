import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 验证 URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SmartBookmarks/1.0)",
      },
      signal: AbortSignal.timeout(10000), // 10 秒超时
    });

    if (!response.ok) {
      throw new Error("Failed to fetch URL");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 抓取 Open Graph metadata
    const metadata = {
      title:
        $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $("title").text().trim() ||
        "未命名书签",

      description:
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        $('meta[name="twitter:description"]').attr("content") ||
        "",

      thumbnail:
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        "",

      platform: parsedUrl.hostname.replace("www.", "").split(".")[0],
    };

    // 清理数据
    if (metadata.title.length > 200) {
      metadata.title = metadata.title.substring(0, 197) + "...";
    }
    if (metadata.description.length > 500) {
      metadata.description = metadata.description.substring(0, 497) + "...";
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Fetch metadata error:", error);

    // 返回基本信息而不是完全失败
    const { url } = await req.json();
    const parsedUrl = new URL(url);

    return NextResponse.json({
      title: parsedUrl.hostname,
      description: "",
      thumbnail: "",
      platform: parsedUrl.hostname.replace("www.", "").split(".")[0],
    });
  }
}
