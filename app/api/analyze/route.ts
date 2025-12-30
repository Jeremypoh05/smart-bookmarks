import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { url, title, description } = await req.json();

    // 检查 API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not found");
      return handleFallback(url, title, description);
    }

    console.log("🤖 Calling OpenAI API...");
    console.log("Input:", {
      url,
      title: title?.substring(0, 50),
      description: description?.substring(0, 50),
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a bookmark classification assistant. Analyze the content and classify it into ONE of these categories:
- Learning/Tech
- Tools/Resources
- Health/Fitness
- Entertainment/Leisure
- Food/Travel
- Other

Also generate 2-4 relevant tags.

Return ONLY a JSON object:
{"category": "Learning/Tech", "tags": ["tutorial", "coding", "web"]}`,
        },
        {
          role: "user",
          content: `Classify this bookmark:
URL: ${url}
Title: ${title || "N/A"}
Description: ${description || "N/A"}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    console.log("✅ OpenAI response:", result);
    console.log("📊 Tokens used:", completion.usage);

    return NextResponse.json({
      category: result.category || "Other",
      tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : [],
    });
  } catch (error) {
    console.error("❌ OpenAI API error:", error);

    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }

    const { url, title, description } = await req.json();
    return handleFallback(url, title, description);
  }
}

// Fallback 分类
function handleFallback(url: string, title: string, description: string) {
  console.log("⚠️ Using fallback classification");

  const content = `${url} ${title} ${description}`.toLowerCase();

  let category = "Other";
  const tags: string[] = [];

  if (
    content.match(
      /youtube|video|tutorial|learn|course|coding|programming|tech|react|javascript/
    )
  ) {
    category = "Learning/Tech";
    tags.push("tutorial", "learning", "tech");
  } else if (content.match(/tool|ai|software|app|resource|productivity/)) {
    category = "Tools/Resources";
    tags.push("tool", "productivity", "resource");
  } else if (content.match(/health|fitness|workout|exercise|gym|sport/)) {
    category = "Health/Fitness";
    tags.push("health", "fitness", "wellness");
  } else if (
    content.match(/food|recipe|restaurant|travel|vacation|hotel|trip/)
  ) {
    category = "Food/Travel";
    tags.push("food", "travel", "lifestyle");
  } else if (
    content.match(
      /tiktok|douyin|entertainment|music|game|movie|fun|xiaohongshu|小红书/
    )
  ) {
    category = "Entertainment/Leisure";
    tags.push("entertainment", "social media", "lifestyle");
  } else if (content.match(/xiaohongshu|小红书|xhs/)) {
    category = "Entertainment/Leisure";
    tags.push("social media", "lifestyle", "community");
  }

  console.log("Fallback result:", { category, tags });

  return NextResponse.json({ category, tags });
}
