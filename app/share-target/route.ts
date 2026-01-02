// app/share-target/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    // 如果未登录，重定向到登录页
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const text = formData.get("text") as string;
    const url = formData.get("url") as string;

    // 重定向到 dashboard 并带上分享的数据
    const dashboardUrl = new URL("/dashboard", req.url);
    dashboardUrl.searchParams.set("share", "true");
    if (url) dashboardUrl.searchParams.set("url", url);
    if (title) dashboardUrl.searchParams.set("title", title);
    if (text) dashboardUrl.searchParams.set("text", text);

    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    console.error("Share target error:", error);
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}

export async function GET(req: NextRequest) {
  // Fallback for browsers that use GET
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
