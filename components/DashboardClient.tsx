'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { Plus, Search, Grid, List, Sparkles, Loader2, Download, Upload } from 'lucide-react';
import BookmarkCard from './BookmarkCard';
import AddBookmarkModal from './AddBookmarkModal';
import BookmarkSkeleton from './BookmarkSkeleton';
import ImportExportModal from './ImportExportModal';

interface Bookmark {
    id: string;
    url: string;
    title: string | null;
    description: string | null;
    thumbnail: string | null;
    category: string | null;
    tags: string[];
    platform: string | null;
    createdAt: Date;
    userId: string;
}

export default function DashboardClient() {
    const { user } = useUser();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showImportExportModal, setShowImportExportModal] = useState(false);

    const categories = [
        '全部',
        'Learning/Tech',
        'Tools/Resources',
        'Health/Fitness',
        'Entertainment/Leisure',
        'Food/Travel',
        'Other'
    ];

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/bookmarks');
            if (res.ok) {
                const data = await res.json();
                setBookmarks(data);
            } else {
                console.error('Failed to fetch bookmarks:', res.status);
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Stats calculation
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const categoriesSet = new Set(
            bookmarks.map(b => b.category).filter(Boolean)
        );

        return {
            total: bookmarks.length,
            today: bookmarks.filter(
                b => new Date(b.createdAt).toDateString() === today
            ).length,
            categoriesCount: categoriesSet.size,
        };
    }, [bookmarks]);

    // Optimized filtering
    const filteredBookmarks = useMemo(() => {
        return bookmarks.filter(bookmark => {
            const matchesCategory =
                selectedCategory === '全部' || bookmark.category === selectedCategory;
            const matchesSearch =
                bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [bookmarks, searchQuery, selectedCategory]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-2">
                        {/* 左侧：Logo 和 标题 */}
                        <div className="flex items-center min-w-0 space-x-2">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg shadow-md flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                                    Smart Bookmarks
                                </h1>
                                {/* 手机端隐藏欢迎语或缩短它 */}
                                <p className="text-xs text-slate-500 truncate">
                                    Welcome back, {user?.firstName || 'User'}!
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
                            {/* 🔥 NEW: Import/Export 按钮 */}
                            <button
                                onClick={() => setShowImportExportModal(true)}
                                className="bg-white text-slate-700 p-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center group"
                            >
                                {/* 使用 flex 和 gap 确保图标不重叠 */}
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    <Download className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                                    <Upload className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                {/* 只有在较大屏幕才显示文字，避免挤压按钮区域 */}
                                <span className="hidden lg:inline ml-2 text-sm font-medium">Import/Export</span>
                            </button>

                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 text-white p-2 flex sm:px-4 sm:py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-all active:scale-95"
                            >
                                <Plus className="w-6 h-6 sm:w-5 sm:h-5" />
                                <span className="hidden md:inline ml-1.5 font-medium">Add Bookmark</span>
                            </button>
                            {/* 用户按钮 */}
                            <div className="flex-shrink-0 mt-2">
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: "w-9 h-9 sm:w-10 sm:h-10", // 调整头像框的大小
                                            userButtonTrigger: "focus:shadow-none",        // 可选：移除点击时的阴影
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search bookmarks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid View"
                                className={`p-3 rounded-xl transition-all ${viewMode === 'grid'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                aria-label="List View"
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${selectedCategory === category
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    <div className="bg-white rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-slate-600 mb-1">Total Bookmarks</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-slate-600 mb-1">Added Today</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-slate-600 mb-1">Categories</p>
                        <p className="text-3xl font-bold text-indigo-600">
                            {stats.categoriesCount}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-slate-600 mb-1">Status</p>
                        <p className="text-3xl font-bold text-green-600">Active</p>
                    </div>
                </div>

                {/* Bookmarks Display */}
                {loading ? (
                    <div
                        className={`grid gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1'
                            }`}
                    >
                        {[...Array(6)].map((_, i) => (
                            <BookmarkSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredBookmarks.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                            {searchQuery || selectedCategory !== '全部' ? (
                                <Search className="w-10 h-10 text-blue-600" />
                            ) : (
                                <Sparkles className="w-10 h-10 text-blue-600" />
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                            {searchQuery || selectedCategory !== '全部'
                                ? 'No bookmarks found'
                                : 'Start Your Bookmark Journey'}
                        </h3>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            {searchQuery || selectedCategory !== '全部'
                                ? 'Try adjusting your search or filters'
                                : 'Add your first bookmark and let AI organize it for you'}
                        </p>
                        {!searchQuery && selectedCategory === '全部' && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 inline-flex items-center space-x-3"
                            >
                                <Plus className="w-6 h-6" />
                                <span>Add Your First Bookmark</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        className={`grid gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1'
                            }`}
                    >
                        {filteredBookmarks.map((bookmark) => (
                            <BookmarkCard
                                key={bookmark.id}
                                bookmark={bookmark}
                                onDelete={fetchBookmarks}
                            />
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <AddBookmarkModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        fetchBookmarks();
                        setShowModal(false);
                    }}
                />
            )}

            {/* Import/Export Modal */}
            {showImportExportModal && (
                <ImportExportModal
                    onClose={() => setShowImportExportModal(false)}
                    onImportSuccess={() => {
                        fetchBookmarks();
                        setShowImportExportModal(false);
                    }}
                />
            )}
        </div>
    );
}