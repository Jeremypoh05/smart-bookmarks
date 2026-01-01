'use client';

import { useState } from 'react';
import { X, Save, Loader2, Tag, Sparkles, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface EditBookmarkModalProps {
    bookmark: {
        id: string;
        url: string;
        title: string | null;
        description: string | null;
        thumbnail: string | null;
        category: string | null;
        tags: string[];
    };
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditBookmarkModal({ bookmark, onClose, onSuccess }: EditBookmarkModalProps) {
    const [title, setTitle] = useState(bookmark.title || '');
    const [description, setDescription] = useState(bookmark.description || '');
    const [thumbnail, setThumbnail] = useState(bookmark.thumbnail || '');
    const [category, setCategory] = useState(bookmark.category || 'Other');
    const [tags, setTags] = useState(bookmark.tags.join(', '));
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const categories = [
        'Learning/Tech',
        'Tools/Resources',
        'Health/Fitness',
        'Entertainment/Leisure',
        'Food/Travel',
        'Other'
    ];

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }

        setIsUploading(true);

        try {
            console.log('🖼️  Original image:', {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                type: file.type
            });

            // 🔥 压缩配置
            const options = {
                maxSizeMB: 1,              // 最大 1MB
                maxWidthOrHeight: 1024,     // 最大宽/高 1024px
                useWebWorker: true,
                fileType: 'image/jpeg',     // 统一转换为 JPEG
            };

            // 压缩图片
            const compressedFile = await imageCompression(file, options);

            console.log('✅ Compressed image:', {
                size: (compressedFile.size / 1024).toFixed(2) + ' KB',
                reduction: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
            });

            // 转换为 Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setThumbnail(base64);
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert('读取文件失败！');
                setIsUploading(false);
            };
            reader.readAsDataURL(compressedFile);

        } catch (error) {
            console.error('❌ Compression error:', error);
            alert('图片压缩失败，请重试！');
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/bookmarks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: bookmark.id,
                    title,
                    description,
                    thumbnail,
                    category,
                    tags: tags.split(',').map(t => t.trim()).filter(t => t),
                }),
            });

            if (!res.ok) throw new Error('Failed to update');
            onSuccess();
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update bookmark');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Edit Bookmark</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Thumbnail Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Thumbnail
                        </label>

                        {thumbnail ? (
                            <div className="relative group">
                                <img
                                    src={thumbnail}
                                    alt="Thumbnail"
                                    className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                                    <label className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                                        <Upload className="w-4 h-4 inline mr-2" />
                                        Change
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setThumbnail('')}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <label className="cursor-pointer">
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all inline-block">
                                        {isUploading ? 'Uploading...' : 'Upload Image'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                </label>
                                <p className="text-sm text-slate-500 mt-2">
                                    PNG, JPG, GIF up to 10MB (will be compressed)
                                </p>
                            </div>
                        )}

                        {isUploading && (
                            <div className="mt-2 flex items-center justify-center space-x-2 text-blue-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Compressing image...</span>
                            </div>
                        )}
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            URL
                        </label>
                        <input
                            type="url"
                            value={bookmark.url}
                            disabled
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Bookmark title"
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description..."
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tags (comma separated)
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., tutorial, react, web"
                                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim() || isUploading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}