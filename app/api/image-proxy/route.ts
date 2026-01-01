// app/api/image-proxy/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let targetUrl = searchParams.get("url");

  if (!targetUrl) return new Response("No URL", { status: 400 });

  try {
    // 1. 关键：修复被多次转义的参数
    // 将 %26amp%3B 或 &amp; 还原为标准的 &
    targetUrl = decodeURIComponent(targetUrl).replace(/&amp;/g, "&");

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.facebook.com/",
      },
    });

    if (!response.ok) {
      console.error(`❌ FB Proxy failed: ${response.status}`);
      return new Response("Failed to fetch image", { status: response.status });
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*", // 允许前端读取
      },
    });
  } catch (error) {
    return new Response("Internal Error", { status: 500 });
  }
}
