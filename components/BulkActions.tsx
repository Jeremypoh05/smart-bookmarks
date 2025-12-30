'use client';

import { Trash2, FolderEdit, X } from 'lucide-react';

interface BulkActionsProps {
    selectedCount: number;
    onDelete: () => void;
    onChangeCategory: () => void;
    onClear: () => void;
}

export default function BulkActions({ selectedCount, onDelete, onChangeCategory, onClear }: BulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-slate-200 px-6 py-4 flex items-center space-x-4 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">{selectedCount}</span>
                </div>
                <span className="font-medium text-slate-700">已选择</span>
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <button
                onClick={onChangeCategory}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <FolderEdit className="w-4 h-4" />
                <span className="font-medium">修改分类</span>
            </button>

            <button
                onClick={onDelete}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">删除</span>
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            <button
                onClick={onClear}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}