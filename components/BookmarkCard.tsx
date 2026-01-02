// components/BookmarkCard.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Share2, Loader2, Tag, Check } from 'lucide-react';
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
    // 🔥 NEW: 选择模式相关 props
    selectionMode?: boolean;
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
}

export default function BookmarkCard({
    bookmark,
    onDelete,
    selectionMode = false,
    isSelected = false,
    onSelect
}: BookmarkCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

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
        setShowMenu(false);

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
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(bookmark.url);
                alert('Link copied to clipboard!');
            } catch (err) {
                alert('Failed to copy link');
            }
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // 🔥 NEW: 在选择模式下切换选择状态
        if (selectionMode) {
            if (onSelect) {
                onSelect(bookmark.id, !isSelected);
            }
            return;
        }

        // Don't navigate if clicking on menu button or menu items
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[data-menu]')) {
            return;
        }

        window.open(bookmark.url, '_blank', 'noopener,noreferrer');
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
            <div
                onClick={handleCardClick}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative ${selectionMode ? 'cursor-pointer' : 'cursor-pointer'
                    } ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                    }`}
            >
                {/* 🔥 NEW: Selection Checkbox Overlay */}
                {selectionMode && (
                    <div className="absolute top-3 left-3 z-30">
                        <div
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shadow-lg ${isSelected
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white/90 backdrop-blur-sm border-slate-300 group-hover:border-blue-400'
                                }`}
                        >
                            {isSelected && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                        </div>
                    </div>
                )}

                {/* Three-dot Menu - 只在非选择模式显示 */}
                {!selectionMode && (
                    <div className="absolute top-3 right-3 z-20" ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all"
                            aria-label="More options"
                        >
                            <MoreVertical className="w-5 h-5 text-slate-700" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div
                                data-menu
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        setShowEditModal(true);
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group/item"
                                    title="Edit bookmark"
                                >
                                    <Edit className="w-4 h-4 text-slate-600 group-hover/item:text-blue-600" />
                                    <span className="text-sm text-slate-700 group-hover/item:text-blue-600 font-medium">Edit</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleShare();
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group/item"
                                    title="Share bookmark"
                                >
                                    <Share2 className="w-4 h-4 text-slate-600 group-hover/item:text-green-600" />
                                    <span className="text-sm text-slate-700 group-hover/item:text-green-600 font-medium">Share</span>
                                </button>

                                <div className="border-t border-slate-200 my-1" />

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        handleDelete();
                                    }}
                                    disabled={isDeleting}
                                    className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left group/item disabled:opacity-50"
                                    title="Delete bookmark"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 text-slate-600 group-hover/item:text-red-600" />
                                    )}
                                    <span className="text-sm text-slate-700 group-hover/item:text-red-600 font-medium">Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Thumbnail */}
                <div className="relative overflow-hidden bg-slate-100">
                    {bookmark.thumbnail ? (
                        <img
                            src={bookmark.thumbnail}
                            alt={bookmark.title || 'Bookmark'}
                            referrerPolicy="no-referrer"
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (bookmark.platform?.toLowerCase() === 'facebook') {
                                    target.src = '/logos/facebook.png';
                                } else {
                                    target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%2394a3b8' width='400' height='225'/%3E%3Ctext fill='white' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;
                                }
                                target.onerror = null;
                            }}
                        />
                    ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <p className="text-slate-400 font-medium">无缩略图</p>
                        </div>
                    )}
                    {bookmark.platform && (
                        <div className={`absolute top-3 ${selectionMode ? 'right-3' : 'left-3'} bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium`}>
                            {bookmark.platform}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-2 mb-3 pr-2">
                        {bookmark.title || '未命名书签'}
                    </h3>

                    {/* Description */}
                    {bookmark.description && (
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                            {bookmark.description}
                        </p>
                    )}

                    {/* Category and Date */}
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

                    {/* Tags */}
                    {bookmark.tags && bookmark.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {bookmark.tags.slice(0, 4).map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                            {bookmark.tags.length > 4 && (
                                <span className="text-xs px-2 py-1 text-slate-500 font-medium">
                                    +{bookmark.tags.length - 4} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal - 只在非选择模式显示 */}
            {!selectionMode && showEditModal && (
                <EditBookmarkModal
                    bookmark={bookmark}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        onDelete();
                    }}
                />
            )}
        </>
    );
}