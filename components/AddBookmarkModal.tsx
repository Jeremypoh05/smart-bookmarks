'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AddBookmarkModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddBookmarkModal({ onClose, onSuccess }: AddBookmarkModalProps) {
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'input' | 'analyzing' | 'success'>('input');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!url.trim()) {
            setError('请输入有效的 URL');
            return;
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            setError('URL 格式不正确，请检查后重试');
            return;
        }

        setIsAnalyzing(true);
        setStep('analyzing');

        try {
            // Step 1: Fetch metadata
            const metadataRes = await fetch('/api/fetch-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!metadataRes.ok) {
                throw new Error('无法获取链接信息');
            }

            const metadata = await metadataRes.json();

            // Step 2: AI Analysis
            const analyzeRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    title: metadata.title,
                    description: metadata.description,
                }),
            });

            const analysis = analyzeRes.ok ? await analyzeRes.json() : { category: '其他', tags: [] };

            // Step 3: Save bookmark
            const saveRes = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    title: metadata.title,
                    description: metadata.description,
                    thumbnail: metadata.thumbnail,
                    category: analysis.category,
                    tags: analysis.tags,
                    platform: metadata.platform,
                }),
            });

            if (!saveRes.ok) {
                throw new Error('保存书签失败');
            }

            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (error) {
            console.error('Add bookmark error:', error);
            setError(error instanceof Error ? error.message : '添加失败，请重试');
            setStep('input');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">添加新书签</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isAnalyzing}
                        className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                {step === 'input' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                粘贴链接
                            </label>
                            <input
                                type="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    setError('');
                                }}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                disabled={isAnalyzing}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-slate-700">
                                    <p className="font-medium text-blue-900 mb-1">AI 智能分析</p>
                                    <p>我们会自动抓取标题、描述和缩略图，并使用 AI 为你的书签智能分类</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!url.trim() || isAnalyzing}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            添加书签
                        </button>
                    </form>
                )}

                {step === 'analyzing' && (
                    <div className="py-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">AI 分析中...</h3>
                        <p className="text-slate-600">正在抓取信息并智能分类</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">添加成功！</h3>
                        <p className="text-slate-600">书签已保存并分类</p>
                    </div>
                )}
            </div>
        </div>
    );
}