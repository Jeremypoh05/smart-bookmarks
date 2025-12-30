import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// GET - 获取用户的所有书签
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// POST - 创建新书签
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const newBookmark = await prisma.bookmark.create({
      data: {
        userId,
        url: body.url,
        title: body.title,
        description: body.description,
        thumbnail: body.thumbnail,
        category: body.category,
        tags: body.tags || [],
        platform: body.platform,
      },
    });

    return NextResponse.json(newBookmark);
  } catch (error) {
    console.error("Create bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}

// DELETE - 删除书签
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // 确保只能删除自己的书签
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
    });

    if (!bookmark || bookmark.userId !== userId) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    await prisma.bookmark.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}

// PATCH - 更新书签
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, category, tags } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // 确保只能编辑自己的书签
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
    });

    if (!bookmark || bookmark.userId !== userId) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // 更新书签
    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        title,
        description,
        category,
        tags: tags || [],
      },
    });

    return NextResponse.json(updatedBookmark);
  } catch (error) {
    console.error('Update bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}

