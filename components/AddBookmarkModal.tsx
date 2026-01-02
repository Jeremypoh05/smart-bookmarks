// components/AddBookmarkModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Loader2, Sparkles } from 'lucide-react';

interface AddBookmarkModalProps {
    onClose: () => void;
    onSuccess: () => void;
    // 🔥 NEW: 支持预填数据
    initialUrl?: string;
    initialTitle?: string;
    initialDescription?: string;
}

export default function AddBookmarkModal({ 
    onClose, 
    onSuccess,
    initialUrl,
    initialTitle,
    initialDescription 
}: AddBookmarkModalProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 🔥 NEW: 当有预填数据时自动填入
    useEffect(() => {
        if (initialUrl) {
            console.log('📱 Prefilling with shared data:', {
                url: initialUrl,
                title: initialTitle,
                description: initialDescription
            });
            setUrl(initialUrl);
            
            // 如果有 URL，自动触发保存（可选）
            // 或者等待用户手动点击保存
        }
    }, [initialUrl, initialTitle, initialDescription]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        try {
            setLoading(true);
            setError('');

            // 1. 获取元数据 (标题、描述、图片)
            const metadataRes = await fetch('/api/fetch-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() }),
            });
            if (!metadataRes.ok) throw new Error('Failed to fetch metadata');
            const metadata = await metadataRes.json();

            // 🔥 修复：这里必须调用 AI 分析接口获取 tags
            const analyzeRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: url.trim(),
                    title: initialTitle || metadata.title,
                    description: initialDescription || metadata.description,
                }),
            });

            // 如果分析成功用 AI 的，失败用默认值
            const analysis = analyzeRes.ok
                ? await analyzeRes.json()
                : { category: 'Other', tags: [] };

            // 2. 合并数据准备保存
            const bookmarkData = {
                url: url.trim(),
                title: initialTitle || metadata.title || 'Untitled',
                description: initialDescription || metadata.description || '',
                thumbnail: metadata.thumbnail || '',
                platform: metadata.platform || 'Web',
                category: analysis.category, // ✅ 改用分析后的结果
                tags: analysis.tags,         // ✅ 改用分析后的结果
            };

            // 3. 创建书签
            const createRes = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookmarkData),
            });

            if (!createRes.ok) throw new Error('Failed to create bookmark');

            onSuccess();
        } catch (err) {
            console.error('❌ Error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {initialUrl ? 'Save Shared Content' : 'Add New Bookmark'}
                            </h2>
                            <p className="text-sm text-slate-600">
                                {initialUrl ? 'Content shared from another app' : 'AI will automatically organize it'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* 🔥 显示预填提示 */}
                    {initialUrl && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                📱 <strong>Shared content detected!</strong> Review and save below.
                            </p>
                            {initialTitle && (
                                <p className="text-xs text-blue-600 mt-1">
                                    Title: {initialTitle}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                disabled={loading}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                                required
                            />
                        </div>

                        {/* 预填信息预览（可选） */}
                        {initialDescription && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Shared Description
                                </label>
                                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                                    {initialDescription}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !url.trim()}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Save Bookmark
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Info */}
                <div className="px-6 pb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 leading-relaxed">
                            <strong className="text-slate-900">✨ AI Magic:</strong> Our AI will automatically extract the title, description, thumbnail, and categorize your bookmark. Just paste the URL!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}