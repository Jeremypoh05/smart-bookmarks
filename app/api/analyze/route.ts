import { NextRequest, NextResponse } from "next/server";

// 暂时使用规则基础的分类，等你获得 OpenAI API key 后再替换
export async function POST(req: NextRequest) {
  try {
    const { url, title, description } = await req.json();

    const content = `${url} ${title} ${description}`.toLowerCase();

    // 简单的关键词匹配分类
    let category = "其他";
    const tags: string[] = [];

    if (
      content.includes("youtube") ||
      content.includes("video") ||
      content.includes("教程") ||
      content.includes("学习") ||
      content.includes("tutorial") ||
      content.includes("course") ||
      content.includes("react") ||
      content.includes("javascript") ||
      content.includes("coding") ||
      content.includes("react")
    ) {
      category = "学习/科技";
      tags.push("教程", "学习");
    } else if (
      content.includes("tool") ||
      content.includes("工具") ||
      content.includes("ai") ||
      content.includes("软件") ||
      content.includes("app")
    ) {
      category = "工具/资源";
      tags.push("工具", "效率");
    } else if (
      content.includes("health") ||
      content.includes("fitness") ||
      content.includes("健康") ||
      content.includes("运动") ||
      content.includes("workout")
    ) {
      category = "健康/运动";
      tags.push("健康", "运动");
    } else if (
      content.includes("food") ||
      content.includes("recipe") ||
      content.includes("美食") ||
      content.includes("旅游") ||
      content.includes("travel")
    ) {
      category = "美食/旅游";
      tags.push("美食", "生活");
    } else if (
      content.includes("tiktok") ||
      content.includes("douyin") ||
      content.includes("娱乐") ||
      content.includes("music") ||
      content.includes("game")
    ) {
      category = "娱乐/休闲";
      tags.push("娱乐", "休闲");
    }

    return NextResponse.json({ category, tags });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { category: "其他", tags: [] },
      { status: 200 } // 即使失败也返回默认值
    );
  }
}
