'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { Plus, Search, Grid, List, Sparkles, Download, Upload, CheckSquare, X, Menu } from 'lucide-react';
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
    const [showImportExportModal, setShowImportExportModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // 🔥 选择模式相关
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());

    // 🔥 移动端菜单
    const [showMobileMenu, setShowMobileMenu] = useState(false);

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
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

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

    // 选择功能
    const handleToggleSelection = (id: string, selected: boolean) => {
        setSelectedBookmarks(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        setSelectedBookmarks(new Set(filteredBookmarks.map(b => b.id)));
    };

    const handleDeselectAll = () => {
        setSelectedBookmarks(new Set());
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedBookmarks(new Set());
        setShowMobileMenu(false);
    };

    const handleExportClick = () => {
        setShowImportExportModal(true);
        setShowMobileMenu(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20 md:pb-8">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Smart Bookmarks
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">
                                    Welcome back, {user?.firstName || user?.username || 'User'}!
                                </p>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center space-x-3">
                            {!selectionMode && (
                                <>
                                    <button
                                        onClick={toggleSelectionMode}
                                        className="bg-white text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-100 transition-all duration-200 flex items-center space-x-2 border border-slate-200"
                                    >
                                        <CheckSquare className="w-4 h-4" />
                                        <span>Select</span>
                                    </button>

                                    <button
                                        onClick={() => setShowImportExportModal(true)}
                                        className="bg-white text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-100 transition-all duration-200 flex items-center space-x-2 border border-slate-200"
                                    >
                                        <Download className="w-4 h-4" />
                                        <Upload className="w-4 h-4 -ml-1" />
                                        <span>Import/Export</span>
                                    </button>

                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Add Bookmark</span>
                                    </button>
                                </>
                            )}

                            {selectionMode && (
                                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                                    <span className="text-sm font-medium text-blue-900">
                                        {selectedBookmarks.size} selected
                                    </span>

                                    {selectedBookmarks.size > 0 && (
                                        <button
                                            onClick={() => setShowImportExportModal(true)}
                                            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export
                                        </button>
                                    )}

                                    <div className="h-6 w-px bg-blue-300 mx-2" />

                                    <button
                                        onClick={handleSelectAll}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium px-2"
                                    >
                                        All
                                    </button>

                                    <button
                                        onClick={handleDeselectAll}
                                        className="text-sm text-slate-600 hover:text-slate-700 font-medium px-2"
                                    >
                                        None
                                    </button>

                                    <button
                                        onClick={toggleSelectionMode}
                                        className="ml-2 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-600" />
                                    </button>
                                </div>
                            )}

                            {!selectionMode && <UserButton afterSignOutUrl="/" />}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center space-x-2">
                            {!selectionMode && (
                                <button
                                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <Menu className="w-6 h-6 text-slate-700" />
                                </button>
                            )}
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {showMobileMenu && (
                        <div className="md:hidden mt-4 pb-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                                onClick={toggleSelectionMode}
                                className="w-full flex items-center space-x-3 px-4 py-3 bg-white rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <CheckSquare className="w-5 h-5 text-slate-600" />
                                <span className="font-medium text-slate-700">Select Bookmarks</span>
                            </button>

                            <button
                                onClick={handleExportClick}
                                className="w-full flex items-center space-x-3 px-4 py-3 bg-white rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <Download className="w-5 h-5 text-slate-600" />
                                <span className="font-medium text-slate-700">Import/Export</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Search and Filters */}
                {!selectionMode && (
                    <>
                        <div className="mb-6 sm:mb-8 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
                                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Grid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-3 rounded-xl transition-all ${viewMode === 'list'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Categories - Horizontal scroll on mobile */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${selectedCategory === category
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                                            : 'bg-white text-slate-700 hover:bg-slate-100 hover:scale-105'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats - Grid responsive */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs sm:text-sm text-slate-600 mb-1">Total Bookmarks</p>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs sm:text-sm text-slate-600 mb-1">Added Today</p>
                                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.today}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs sm:text-sm text-slate-600 mb-1">Categories</p>
                                <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.categoriesCount}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs sm:text-sm text-slate-600 mb-1">Status</p>
                                <p className="text-2xl sm:text-3xl font-bold text-green-600">Active</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Selection Mode Info - Mobile */}
                {selectionMode && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-blue-900">
                                {selectedBookmarks.size} bookmark{selectedBookmarks.size !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={toggleSelectionMode}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSelectAll}
                                className="flex-1 px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                            >
                                Select All
                            </button>
                            <button
                                onClick={handleDeselectAll}
                                className="flex-1 px-4 py-2 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>
                )}

                {/* Bookmarks Grid */}
                {loading ? (
                    <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {[...Array(6)].map((_, i) => <BookmarkSkeleton key={i} />)}
                    </div>
                ) : filteredBookmarks.length === 0 ? (
                    <div className="text-center py-12 sm:py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4 sm:mb-6">
                            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">Start Your Bookmark Journey</h3>
                        <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">Add your first bookmark and let AI organize it for you</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 inline-flex items-center space-x-2 sm:space-x-3"
                        >
                            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Add Your First Bookmark</span>
                        </button>
                    </div>
                ) : (
                    <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {filteredBookmarks.map((bookmark) => (
                            <BookmarkCard
                                key={bookmark.id}
                                bookmark={bookmark}
                                onDelete={fetchBookmarks}
                                selectionMode={selectionMode}
                                isSelected={selectedBookmarks.has(bookmark.id)}
                                onSelect={handleToggleSelection}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* 🔥 Mobile Floating Action Button - Only show when not in selection mode */}
            {!selectionMode && (
                <div className="md:hidden fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-200"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* 🔥 Mobile Selection Mode Bottom Bar */}
            {selectionMode && selectedBookmarks.size > 0 && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
                    <button
                        onClick={() => setShowImportExportModal(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3"
                    >
                        <Download className="w-5 h-5" />
                        <span>Export {selectedBookmarks.size} Selected</span>
                    </button>
                </div>
            )}

            {/* Modals */}
            {showModal && (
                <AddBookmarkModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        fetchBookmarks();
                        setShowModal(false);
                    }}
                />
            )}

            {showImportExportModal && (
                <ImportExportModal
                    onClose={() => setShowImportExportModal(false)}
                    onImportSuccess={() => {
                        fetchBookmarks();
                        setShowImportExportModal(false);
                    }}
                    selectedBookmarkIds={selectionMode ? Array.from(selectedBookmarks) : undefined}
                />
            )}

            {/* 🔥 Add CSS for horizontal scroll */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}