export default function BookmarkSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
            {/* Thumbnail skeleton */}
            <div className="w-full h-48 bg-slate-200"></div>

            {/* Content skeleton */}
            <div className="p-5 space-y-3">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>

                <div className="flex items-center justify-between pt-2">
                    <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                </div>

                <div className="flex gap-2">
                    <div className="h-6 bg-slate-200 rounded-lg w-16"></div>
                    <div className="h-6 bg-slate-200 rounded-lg w-20"></div>
                </div>
            </div>
        </div>
    );
}