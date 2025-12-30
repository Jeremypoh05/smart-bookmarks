// import { NextRequest, NextResponse } from "next/server";

// // 暂时使用规则基础的分类，等你获得 OpenAI API key 后再替换
// export async function POST(req: NextRequest) {
//   try {
//     const { url, title, description } = await req.json();

//     const content = `${url} ${title} ${description}`.toLowerCase();

//     // 简单的关键词匹配分类
//     let category = "其他";
//     const tags: string[] = [];

//     if (
//       content.includes("youtube") ||
//       content.includes("video") ||
//       content.includes("教程") ||
//       content.includes("学习") ||
//       content.includes("tutorial") ||
//       content.includes("course") ||
//       content.includes("react") ||
//       content.includes("javascript") ||
//       content.includes("coding") ||
//       content.includes("react")
//     ) {
//       category = "学习/科技";
//       tags.push("教程", "学习");
//     } else if (
//       content.includes("tool") ||
//       content.includes("工具") ||
//       content.includes("ai") ||
//       content.includes("软件") ||
//       content.includes("app")
//     ) {
//       category = "工具/资源";
//       tags.push("工具", "效率");
//     } else if (
//       content.includes("health") ||
//       content.includes("fitness") ||
//       content.includes("健康") ||
//       content.includes("运动") ||
//       content.includes("workout")
//     ) {
//       category = "健康/运动";
//       tags.push("健康", "运动");
//     } else if (
//       content.includes("food") ||
//       content.includes("recipe") ||
//       content.includes("美食") ||
//       content.includes("旅游") ||
//       content.includes("travel")
//     ) {
//       category = "美食/旅游";
//       tags.push("美食", "生活");
//     } else if (
//       content.includes("tiktok") ||
//       content.includes("douyin") ||
//       content.includes("娱乐") ||
//       content.includes("music") ||
//       content.includes("game")
//     ) {
//       category = "娱乐/休闲";
//       tags.push("娱乐", "休闲");
//     }

//     return NextResponse.json({ category, tags });
//   } catch (error) {
//     console.error("Analyze error:", error);
//     return NextResponse.json(
//       { category: "其他", tags: [] },
//       { status: 200 } // 即使失败也返回默认值
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { url, title, description } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        "OpenAI API key not configured, using fallback classification"
      );
      return fallbackClassification(url, title, description);
    }

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

Also generate 2-4 relevant tags (in English or the content's language).

Return ONLY a JSON object with this exact format:
{"category": "Learning/Tech", "tags": ["tutorial", "react", "web development"]}`,
        },
        {
          role: "user",
          content: `URL: ${url}\nTitle: ${title}\nDescription: ${
            description || "N/A"
          }`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({
      category: result.category || "Other",
      tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : [],
    });
  } catch (error) {
    console.error("AI analyze error:", error);

    // Fallback to keyword-based classification
    const { url, title, description } = await req.json();
    return fallbackClassification(url, title, description);
  }
}

// Fallback classification when AI fails
function fallbackClassification(
  url: string,
  title: string,
  description: string
) {
  const content = `${url} ${title} ${description}`.toLowerCase();

  let category = "Other";
  const tags: string[] = [];

  if (
    content.match(
      /youtube|video|tutorial|learn|course|react|javascript|coding|programming|tech/
    )
  ) {
    category = "Learning/Tech";
    tags.push("tutorial", "learning");
  } else if (content.match(/tool|ai|software|app|resource|utility/)) {
    category = "Tools/Resources";
    tags.push("tool", "productivity");
  } else if (content.match(/health|fitness|workout|exercise|gym|wellness/)) {
    category = "Health/Fitness";
    tags.push("health", "fitness");
  } else if (content.match(/food|recipe|restaurant|travel|vacation|hotel/)) {
    category = "Food/Travel";
    tags.push("food", "lifestyle");
  } else if (
    content.match(/tiktok|douyin|entertainment|music|game|movie|fun/)
  ) {
    category = "Entertainment/Leisure";
    tags.push("entertainment", "fun");
  }

  return NextResponse.json({ category, tags });
}