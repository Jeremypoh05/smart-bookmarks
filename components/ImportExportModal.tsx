// components/ImportExportModal.tsx
'use client';

import { useState } from 'react';
import { X, Download, Upload, FileJson, FileSpreadsheet, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ImportExportModalProps {
    onClose: () => void;
    onImportSuccess: () => void;
    selectedBookmarkIds?: string[]; // 🔥 支持选择性导出
}

interface ImportResult {
    success: number;
    failed: number;
    duplicates: number;
    errors?: string[];
}

export default function ImportExportModal({ onClose, onImportSuccess, selectedBookmarkIds }: ImportExportModalProps) {
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState('');

    // 🔥 检查是否是选择性导出
    const isSelectiveExport = selectedBookmarkIds && selectedBookmarkIds.length > 0;

    // 导出书签
    const handleExport = async (format: string) => {
        try {
            setExporting(true);
            setError('');

            // 🔥 如果是选择性导出，发送选中的 ID
            let url = `/api/bookmarks/export?format=${format}`;
            let options: RequestInit = {};

            if (isSelectiveExport) {
                url = `/api/bookmarks/export`;
                options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        format,
                        bookmarkIds: selectedBookmarkIds,
                    }),
                };
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;

            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `bookmarks.${format}`;

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            setError('Failed to export bookmarks');
            console.error(err);
        } finally {
            setExporting(false);
        }
    };

    // 导入书签
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>, format: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setImporting(true);
            setError('');
            setImportResult(null);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('format', format);

            const response = await fetch('/api/bookmarks/import', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Import failed');
            }

            const result = await response.json();
            setImportResult(result);

            // 2秒后自动关闭并刷新
            if (result.success > 0) {
                setTimeout(() => {
                    onImportSuccess();
                }, 2000);
            }
        } catch (err) {
            setError('Failed to import bookmarks');
            console.error(err);
        } finally {
            setImporting(false);
            // Reset file input
            event.target.value = '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isSelectiveExport ? 'Export Selected Bookmarks' : 'Import & Export'}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {isSelectiveExport
                                ? `Export ${selectedBookmarkIds?.length} selected bookmark${selectedBookmarkIds?.length !== 1 ? 's' : ''}`
                                : 'Backup or transfer your bookmarks'
                            }
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* 错误提示 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-red-800 font-medium">Error</p>
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* 导入结果 */}
                    {importResult && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <p className="text-green-800 font-medium">Import Complete!</p>
                                <div className="text-green-700 text-sm mt-2 space-y-1">
                                    <p>✅ Successfully imported: {importResult.success}</p>
                                    {importResult.duplicates > 0 && (
                                        <p>⚠️ Skipped duplicates: {importResult.duplicates}</p>
                                    )}
                                    {importResult.failed > 0 && (
                                        <p>❌ Failed: {importResult.failed}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`grid ${isSelectiveExport ? 'grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
                        {/* 导出部分 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Download className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Export</h3>
                                    <p className="text-xs text-slate-600">Download your bookmarks</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => handleExport('json')}
                                    disabled={exporting}
                                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                >
                                    <FileJson className="text-purple-600 flex-shrink-0" size={18} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 text-sm">JSON</p>
                                        <p className="text-xs text-slate-600 truncate">Best for re-importing</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleExport('csv')}
                                    disabled={exporting}
                                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                >
                                    <FileSpreadsheet className="text-green-600 flex-shrink-0" size={18} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 text-sm">CSV</p>
                                        <p className="text-xs text-slate-600 truncate">Edit in Excel/Sheets</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleExport('html')}
                                    disabled={exporting}
                                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                >
                                    <FileText className="text-orange-600 flex-shrink-0" size={18} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 text-sm">HTML</p>
                                        <p className="text-xs text-slate-600 truncate">Browser compatible</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleExport('markdown')}
                                    disabled={exporting}
                                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                >
                                    <FileText className="text-blue-600 flex-shrink-0" size={18} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 text-sm">Markdown</p>
                                        <p className="text-xs text-slate-600 truncate">Documentation friendly</p>
                                    </div>
                                </button>
                            </div>

                            {exporting && (
                                <div className="flex items-center justify-center gap-2 py-2 text-blue-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Exporting...</span>
                                </div>
                            )}
                        </div>

                        {/* 导入部分 - 只在非选择模式显示 */}
                        {!isSelectiveExport && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Upload className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Import</h3>
                                        <p className="text-xs text-slate-600">Upload bookmarks file</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block">
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={(e) => handleImport(e, 'json')}
                                            disabled={importing}
                                            className="hidden"
                                        />
                                        <div className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-left">
                                            <FileJson className="text-purple-600 flex-shrink-0" size={18} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 text-sm">Import JSON</p>
                                                <p className="text-xs text-slate-600 truncate">From this app</p>
                                            </div>
                                        </div>
                                    </label>

                                    <label className="block">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => handleImport(e, 'csv')}
                                            disabled={importing}
                                            className="hidden"
                                        />
                                        <div className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-left">
                                            <FileSpreadsheet className="text-green-600 flex-shrink-0" size={18} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 text-sm">Import CSV</p>
                                                <p className="text-xs text-slate-600 truncate">From spreadsheets</p>
                                            </div>
                                        </div>
                                    </label>

                                    <label className="block">
                                        <input
                                            type="file"
                                            accept=".html"
                                            onChange={(e) => handleImport(e, 'html')}
                                            disabled={importing}
                                            className="hidden"
                                        />
                                        <div className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-left">
                                            <FileText className="text-orange-600 flex-shrink-0" size={18} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 text-sm">Import HTML</p>
                                                <p className="text-xs text-slate-600 truncate">From browsers</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {importing && (
                                    <div className="flex items-center justify-center gap-2 py-2 text-green-600">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Importing...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 提示信息 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 text-sm mb-2">💡 Tips</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Importing automatically detects and skips duplicate bookmarks</li>
                            <li>• AI analyzes imported bookmarks without categories</li>
                            <li>• HTML format works with Chrome, Firefox, and Edge</li>
                            <li>• Export regularly to keep a backup</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}