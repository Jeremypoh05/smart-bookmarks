// app/api/bookmarks/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import * as cheerio from "cheerio";

interface BookmarkImport {
  url: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  platform?: string;
  thumbnail?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const format = formData.get("format") as string; // json, csv, html

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileContent = await file.text();
    let bookmarksToImport: BookmarkImport[] = [];

    switch (format) {
      case "csv":
        bookmarksToImport = parseCSV(fileContent);
        break;
      case "html":
        bookmarksToImport = parseHTML(fileContent);
        break;
      case "json":
      default:
        bookmarksToImport = JSON.parse(fileContent);
        break;
    }

    // 批量创建书签，使用 AI 分析
    const results: ImportResult = {
      success: 0,
      failed: 0,
      duplicates: 0,
      errors: [],
    };

    for (const bookmark of bookmarksToImport) {
      try {
        // 检查是否已存在（去重）
        const existing = await prisma.bookmark.findFirst({
          where: {
            userId,
            url: bookmark.url,
          },
        });

        if (existing) {
          results.duplicates++;
          continue;
        }

        // 如果没有分类和标签，使用 AI 分析
        let category = bookmark.category;
        let tags = bookmark.tags || [];

        if (!category || tags.length === 0) {
          try {
            const aiResponse = await fetch(
              `${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/api/analyze`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  url: bookmark.url,
                  title: bookmark.title,
                  description: bookmark.description || "",
                }),
              }
            );

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              category = category || aiData.category;
              tags = tags.length > 0 ? tags : aiData.tags;
            }
          } catch (aiError) {
            console.log("AI analysis failed, using defaults");
          }
        }

        await prisma.bookmark.create({
          data: {
            userId,
            url: bookmark.url,
            title: bookmark.title || "Untitled",
            description: bookmark.description || "",
            thumbnail: bookmark.thumbnail || "",
            category: category || "Other",
            tags: tags,
            platform: bookmark.platform || "Web",
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Failed to import: ${bookmark.title || bookmark.url}`
        );
        console.error("Import error:", error);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import bookmarks" },
      { status: 500 }
    );
  }
}

// CSV 解析
function parseCSV(content: string): BookmarkImport[] {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const bookmarks: BookmarkImport[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const bookmark: BookmarkImport = { url: "" };

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || "";

      switch (header.toLowerCase()) {
        case "id":
          // Skip ID on import
          break;
        case "title":
          bookmark.title = value;
          break;
        case "url":
          bookmark.url = value;
          break;
        case "description":
          bookmark.description = value;
          break;
        case "category":
          bookmark.category = value;
          break;
        case "tags":
          bookmark.tags = value ? value.split(";").map((t) => t.trim()) : [];
          break;
        case "platform":
          bookmark.platform = value;
          break;
        case "thumbnail":
          bookmark.thumbnail = value;
          break;
      }
    });

    if (bookmark.url) {
      bookmarks.push(bookmark);
    }
  }

  return bookmarks;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// HTML 解析（浏览器导出的书签格式）
function parseHTML(content: string): BookmarkImport[] {
  const $ = cheerio.load(content);
  const bookmarks: BookmarkImport[] = [];

  let currentCategory = "Uncategorized";

  $("DT").each((i, elem) => {
    const $elem = $(elem);

    // 检查是否是文件夹
    const $h3 = $elem.find("H3").first();
    if ($h3.length > 0) {
      currentCategory = $h3.text().trim();
      return;
    }

    // 提取书签
    const $a = $elem.find("A").first();
    if ($a.length > 0) {
      const url = $a.attr("href");
      const title = $a.text().trim();

      if (url) {
        const $dd = $elem.next("DD");
        const description = $dd.length > 0 ? $dd.text().trim() : "";

        bookmarks.push({
          url,
          title: title || url,
          description,
          category: currentCategory,
          platform: getPlatformFromUrl(url),
          thumbnail: $a.attr("icon") || "",
        });
      }
    }
  });

  return bookmarks;
}

function getPlatformFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "YouTube";
    }
    if (hostname.includes("tiktok.com")) return "TikTok";
    if (hostname.includes("instagram.com")) return "Instagram";
    if (hostname.includes("facebook.com")) return "Facebook";
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return "Twitter/X";
    }
    if (hostname.includes("douyin.com")) return "Douyin";
    if (hostname.includes("xiaohongshu.com")) return "XiaoHongShu";

    return "Web";
  } catch {
    return "Web";
  }
}
