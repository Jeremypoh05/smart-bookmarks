import { prisma } from '@/lib/db';

export default async function TestDB() {
    let count: number | null = null;
    let errorMessage: string | null = null;

    try {
        // 1. Only wrap the data fetching in try/catch
        count = await prisma.bookmark.count();
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : String(error);
    }

    // 2. Return JSX normally outside of the try/catch block
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">数据库连接测试</h1>

            {errorMessage ? (
                // Error State
                <>
                    <p className="text-red-600 font-semibold">❌ 连接失败</p>
                    <pre className="mt-4 p-4 bg-red-50 rounded text-sm overflow-auto text-red-800">
                        {errorMessage}
                    </pre>
                </>
            ) : (
                // Success State
                <>
                    <p className="text-green-600 font-semibold">✅ 数据库连接成功!</p>
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <p>数据库中的书签数量: <strong>{count}</strong></p>
                    </div>
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">✅ Prisma Client 初始化成功</p>
                        <p className="text-sm text-gray-600">✅ Neon DB 连接正常</p>
                        <p className="text-sm text-gray-600">✅ Schema 同步完成</p>
                    </div>
                </>
            )}
        </div>
    );
}