"use client";

import { useState } from "react";
import { ExternalLink, Tag, Trash2, Loader2 } from "lucide-react";

interface BookmarkCardProps {
  bookmark: {
    id: string;
    url: string;
    title: string | null;
    description: string | null;
    thumbnail: string | null;
    category: string | null;
    tags: string[];
    platform: string | null;
    createdAt: Date;
  };
  onDelete: () => void;
}

export default function BookmarkCard({
  bookmark,
  onDelete,
}: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("确定要删除这个书签吗？")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bookmarks?id=${bookmark.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onDelete();
      } else {
        alert("删除失败，请重试");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("删除失败，请重试");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-slate-100">
        {bookmark.thumbnail ? (
          <img
            src={bookmark.thumbnail}
            alt={bookmark.title || "Bookmark"}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%2394a3b8" width="400" height="225"/%3E%3Ctext fill="white" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E无缩略图%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <p className="text-slate-400 font-medium">无缩略图</p>
          </div>
        )}
        {bookmark.platform && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            {bookmark.platform}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-lg line-clamp-2 flex-1">
            {bookmark.title || "未命名书签"}
          </h3>
          <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors"
              title="打开链接"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
              title="删除"
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {bookmark.description && (
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {bookmark.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          {bookmark.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
              <Tag className="w-3 h-3 mr-1" />
              {bookmark.category}
            </span>
          )}
          <span className="text-xs text-slate-500">
            {formatDate(bookmark.createdAt)}
          </span>
        </div>

        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bookmark.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg"
              >
                {tag}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs px-2 py-1 text-slate-500">
                +{bookmark.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
