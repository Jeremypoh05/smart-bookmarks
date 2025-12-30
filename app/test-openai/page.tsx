'use client'; // <--- Add this line at the very top

import React from 'react';

export default function TestOpenAI() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold mb-6 text-slate-900">
                        Test OpenAI API
                    </h1>

                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/analyze', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        url: 'https://www.youtube.com/watch?v=test',
                                        title: 'Learn React in 2024 - Complete Tutorial',
                                        description: 'A comprehensive guide to learning React.js'
                                    })
                                });

                                const data = await res.json();
                                console.log('API Response:', data);
                                alert(JSON.stringify(data, null, 2));
                            } catch (error) {
                                console.error('Test failed:', error);
                                alert('Failed to call API. Check console.');
                            }
                        }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        Test API Call
                    </button>

                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600 mb-2">Instructions:</p>
                        <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
                            <li>Click the button above</li>
                            <li>Check browser console (F12)</li>
                            <li>Check terminal/console output</li>
                            <li>Check OpenAI dashboard for usage</li>
                        </ol>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm font-medium text-blue-900 mb-2">
                            Expected Console Output:
                        </p>
                        <pre className="text-xs text-blue-800 overflow-auto">
                            {`🤖 Calling OpenAI API...
✅ OpenAI response: {category: "...", tags: [...]}
📊 Tokens used: {...}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}