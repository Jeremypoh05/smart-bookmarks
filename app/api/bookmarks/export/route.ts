// app/api/bookmarks/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json"; // json, csv, html, markdown

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    let fileContent: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "csv":
        fileContent = exportToCSV(bookmarks);
        contentType = "text/csv";
        filename = `bookmarks_${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "html":
        fileContent = exportToHTML(bookmarks);
        contentType = "text/html";
        filename = `bookmarks_${new Date().toISOString().split("T")[0]}.html`;
        break;

      case "markdown":
        fileContent = exportToMarkdown(bookmarks);
        contentType = "text/markdown";
        filename = `bookmarks_${new Date().toISOString().split("T")[0]}.md`;
        break;

      case "json":
      default:
        fileContent = JSON.stringify(bookmarks, null, 2);
        contentType = "application/json";
        filename = `bookmarks_${new Date().toISOString().split("T")[0]}.json`;
        break;
    }

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export bookmarks" },
      { status: 500 }
    );
  }
}

// 定义 Bookmark 类型
interface BookmarkExport {
  id: string;
  title: string | null; // 允许为 null
  url: string;
  description: string | null;
  category: string | null; // 允许为 null
  tags: string[];
  platform: string | null; // 允许为 null
  thumbnail: string | null;
  createdAt: Date;
}

// CSV 导出
function exportToCSV(bookmarks: BookmarkExport[]): string {
  const headers = [
    "ID",
    "Title",
    "URL",
    "Description",
    "Category",
    "Tags",
    "Platform",
    "Thumbnail",
    "Created At",
  ];

  const rows = bookmarks.map((b) => [
    b.id,
    escapeCsvField(b.title ?? "Untitled"),
    b.url,
    escapeCsvField(b.description || ""),
    escapeCsvField(b.category ?? "Uncategorized"),
    Array.isArray(b.tags) ? b.tags.join(";") : "",
    b.platform,
    b.thumbnail || "",
    b.createdAt.toISOString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// HTML 导出（浏览器标准格式）
function exportToHTML(bookmarks: BookmarkExport[]): string {
  const groupedByCategory = bookmarks.reduce((acc, bookmark) => {
    const category = bookmark.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(bookmark);
    return acc;
  }, {} as Record<string, BookmarkExport[]>);

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  for (const [category, items] of Object.entries(groupedByCategory)) {
    html += `    <DT><H3>${escapeHtml(category)}</H3>\n    <DL><p>\n`;
    items.forEach((bookmark) => {
      const addDate = Math.floor(new Date(bookmark.createdAt).getTime() / 1000);
      html += `        <DT><A HREF="${escapeHtml(
        bookmark.url
      )}" ADD_DATE="${addDate}"`;
      if (bookmark.thumbnail) {
        html += ` ICON="${escapeHtml(bookmark.thumbnail)}"`;
      }
        html += `>${escapeHtml(bookmark.title ?? "Untitled")}</A>\n`;      if (bookmark.description) {
        html += `        <DD>${escapeHtml(bookmark.description ?? "")}\n`;
      }
    });
    html += `    </DL><p>\n`;
  }

  html += `</DL><p>`;
  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Markdown 导出
function exportToMarkdown(bookmarks: BookmarkExport[]): string {
  const groupedByCategory = bookmarks.reduce((acc, bookmark) => {
    const category = bookmark.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(bookmark);
    return acc;
  }, {} as Record<string, BookmarkExport[]>);

  let markdown = `# My Bookmarks\n\nExported on ${new Date().toLocaleDateString()}\n\n`;

  for (const [category, items] of Object.entries(groupedByCategory)) {
    markdown += `## ${category}\n\n`;
    items.forEach((bookmark) => {
      markdown += `### [${bookmark.title}](${bookmark.url})\n\n`;
      if (bookmark.description) {
        markdown += `${bookmark.description}\n\n`;
      }
      if (bookmark.tags && bookmark.tags.length > 0) {
        markdown += `**Tags:** ${bookmark.tags.join(", ")}\n\n`;
      }
      markdown += `**Platform:** ${bookmark.platform} | **Saved:** ${new Date(
        bookmark.createdAt
      ).toLocaleDateString()}\n\n`;
      markdown += `---\n\n`;
    });
  }

  return markdown;
}
