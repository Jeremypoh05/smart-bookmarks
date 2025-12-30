'use client';

import { useState } from 'react';
import { ExternalLink, Tag, Trash2, Loader2, Edit, Share2, Check, Copy } from 'lucide-react';
import EditBookmarkModal from './EditBookmarkModal';

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

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleDelete = async () => {
        if (!confirm('确定要删除这个书签吗？')) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/bookmarks?id=${bookmark.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                onDelete();
            } else {
                alert('删除失败，请重试');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('删除失败，请重试');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: bookmark.title || 'Bookmark',
                    text: bookmark.description || '',
                    url: bookmark.url,
                });
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        } else {
            setShowShareMenu(!showShareMenu);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(bookmark.url);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setShowShareMenu(false);
            }, 2000);
        } catch (err) {
            alert('复制失败');
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative">
                {/* Share Menu */}
                {showShareMenu && (
                    <div className="absolute top-16 right-3 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-20 min-w-[160px]">
                        <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-600 font-medium">已复制！</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 text-slate-600" />
                                    <span className="text-sm text-slate-700">复制链接</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Thumbnail */}
                <div className="relative overflow-hidden bg-slate-100">
                    {bookmark.thumbnail ? (
                        <img
                            src={bookmark.thumbnail}
                            alt={bookmark.title || 'Bookmark'}
                            // 🔥 关键修复 1：防止 Facebook 检测来源域名，绕过防盗链
                            referrerPolicy="no-referrer"
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                                const target = e.currentTarget;
                                // 🔥 关键修复 2：如果 FB 动态图加载失败，优先退回到本地 Logo
                                if (bookmark.platform?.toLowerCase() === 'facebook') {
                                    target.src = '/logos/facebook.png';
                                } else {
                                    // 如果不是 FB 或者本地 Logo 也挂了，再显示 SVG 占位图
                                    target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%2394a3b8' width='400' height='225'/%3E%3Ctext fill='white' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;
                                }
                                // 防止死循环（如果本地 logo 也不存在）
                                target.onerror = null;
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
                            {bookmark.title || '未命名书签'}
                        </h3>
                        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="编辑"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="打开链接"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                                onClick={handleShare}
                                className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="分享"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                title="删除"
                            >
                                {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
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
            </div >

            {/* Edit Modal */}
            {
                showEditModal && (
                    <EditBookmarkModal
                        bookmark={bookmark}
                        onClose={() => setShowEditModal(false)}
                        onSuccess={() => {
                            setShowEditModal(false);
                            onDelete(); // Refresh the list
                        }}
                    />
                )
            }
        </>
    );
}