'use client';

import { useState } from 'react';
import { X, Save, Loader2, Tag, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

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

    const categories = [
        'Learning/Tech',
        'Tools/Resources',
        'Health/Fitness',
        'Entertainment/Leisure',
        'Food/Travel',
        'Other'
    ];

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
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setThumbnail('')}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                                <UploadButton<OurFileRouter, "imageUploader">
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        if (res && res[0]) {
                                            setThumbnail(res[0].url);
                                            alert('Image uploaded successfully!');
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        alert(`Upload failed: ${error.message}`);
                                    }}
                                    appearance={{
                                        button: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all",
                                        allowedContent: "text-slate-600 text-sm mt-2"
                                    }}
                                />
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
                            disabled={isLoading || !title.trim()}
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