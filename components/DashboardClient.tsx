'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { Plus, Search, Grid, List, Sparkles, Loader2 } from 'lucide-react';
import { Bookmark } from '@prisma/client'; // Assuming you ran npx prisma generate
import BookmarkCard from './BookmarkCard';
import AddBookmarkModal from './AddBookmarkModal';

export default function DashboardClient() {
    const { user } = useUser();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const categories = ['全部', '学习/科技', '工具/资源', '健康/运动', '娱乐/休闲', '美食/旅游', '其他'];

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
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculation for Stats
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        return {
            total: bookmarks.length,
            today: bookmarks.filter(b => new Date(b.createdAt).toDateString() === today).length,
            categoriesCount: new Set(bookmarks.map(b => b.category).filter(Boolean)).size
        };
    }, [bookmarks]);

    // Optimized filtering
    const filteredBookmarks = useMemo(() => {
        return bookmarks.filter(bookmark => {
            const matchesCategory = selectedCategory === '全部' || bookmark.category === selectedCategory;
            const matchesSearch =
                bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [bookmarks, searchQuery, selectedCategory]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Smart Bookmarks
                                </h1>
                                <p className="text-sm text-slate-600">Welcome back, {user?.firstName || user?.username}!</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">Add Bookmark</span>
                            </button>
                            <UserButton afterSignOutUrl="/" />
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
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                aria-label="List View"
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                    : 'bg-white text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-slate-600 mb-1">Total</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-slate-600 mb-1">Added Today</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-slate-600 mb-1">Categories</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.categoriesCount}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-slate-600 mb-1">Status</p>
                        <p className="text-2xl font-bold text-green-600">Active</p>
                    </div>
                </div>

                {/* Bookmarks Display */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-600">Loading...</p>
                    </div>
                ) : filteredBookmarks.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {searchQuery || selectedCategory !== '全部' ? 'No bookmarks found' : 'No bookmarks yet'}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            {searchQuery || selectedCategory !== '全部'
                                ? 'Try adjusting your filters'
                                : 'Start by adding your first bookmark above'}
                        </p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                        }`}>
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
        </div>
    );
}