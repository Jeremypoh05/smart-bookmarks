"use client"

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
    Sparkles,
    BookmarkPlus,
    Brain,
    Zap,
    Shield,
    Globe,
    ChevronDown,
    Check,
    ArrowRight,
    FileJson,
    FileSpreadsheet,
    Clock,
    TrendingUp,
    Users,
} from "lucide-react";

export default function HomePage() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Navigation */}
            <nav className={`bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'shadow-lg' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-xl hover:scale-110 transition-transform duration-300">
                                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Smart Bookmarks
                            </span>
                        </Link>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <SignedOut>
                                <Link href="/sign-in" className="text-sm sm:text-base text-slate-700 hover:text-slate-900 font-medium transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/sign-up" className="text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
                                    Get Started
                                </Link>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard" className="text-sm sm:text-base text-slate-700 hover:text-slate-900 font-medium transition-colors">
                                    Dashboard
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="text-center relative z-10">
                    <div
                        className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 hover:scale-105 transition-transform duration-300"
                        style={{
                            opacity: Math.max(0, 1 - scrollY / 300),
                            transform: `translateY(${scrollY * 0.3}px)`
                        }}
                    >
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" style={{ animationDuration: '3s' }} />
                        <span>AI-Powered • Zero Effort • 100% Smart</span>
                    </div>

                    <h1
                        className="text-3xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-2 leading-tight"
                        style={{
                            opacity: Math.max(0, 1 - scrollY / 400),
                            transform: `translateY(${scrollY * 0.2}px)`
                        }}
                    >
                        Never Lose A Link Again
                        <AnimatedText />
                    </h1>

                    <p
                        className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 px-4"
                        style={{
                            opacity: Math.max(0, 1 - scrollY / 500),
                            transform: `translateY(${scrollY * 0.15}px)`
                        }}
                    >
                        Save from <strong>any platform</strong> with one click. AI automatically organizes, categorizes, and makes everything searchable. Your digital life, perfectly organized.
                    </p>

                    {/* CTA Buttons */}
                    <div
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-6 mb-8"
                        style={{
                            opacity: Math.max(0, 1 - scrollY / 600),
                            transform: `translateY(${scrollY * 0.1}px)`
                        }}
                    >
                        <SignedOut>
                            <Link href="/sign-up" className="group bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden text-center inline-flex items-center justify-center">
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>
                            <Link href="/sign-in" className="bg-white text-slate-700 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all duration-300 text-center">
                                Sign In
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 text-center inline-flex items-center justify-center gap-2">
                                Open Dashboard <ArrowRight className="w-5 h-5" />
                            </Link>
                        </SignedIn>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Free forever</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Privacy first</span>
                        </div>
                    </div>
                </div>

                {/* Demo Preview */}
                <ScrollReveal>
                    <div className="mt-12 sm:mt-20 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-2xl sm:blur-3xl opacity-20 animate-pulse" />
                        <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-2 sm:p-4 border border-slate-200 hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                            <div className="rounded-xl sm:rounded-2xl overflow-hidden">
                                <img
                                    src="/feature_preview.png"
                                    alt="Smart Bookmarks Dashboard Preview"
                                    className="w-full h-auto"
                                    onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = 'none';
                                        if (target.parentElement) {
                                            target.parentElement.innerHTML = `
                        <div class="bg-gradient-to-br from-slate-100 to-slate-200 aspect-video flex items-center justify-center">
                          <div class="text-center p-6">
                            <svg class="w-12 h-12 sm:w-20 sm:h-20 text-slate-400 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <p class="text-slate-500 text-sm sm:text-lg font-medium">Your bookmarks, beautifully organized</p>
                          </div>
                        </div>
                      `;
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* Stats Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <ScrollReveal>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                        <StatCard icon={<Clock />} value="< 5 sec" label="Average save time" color="blue" />
                        <StatCard icon={<Users />} value="100%" label="Free to use" color="green" />
                        <StatCard icon={<TrendingUp />} value="AI-Powered" label="Smart categories" color="purple" />
                        <StatCard icon={<Shield />} value="Private" label="Your data only" color="indigo" />
                    </div>
                </ScrollReveal>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                <ScrollReveal>
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4 px-2">
                            Built for the Way You Actually Work
                        </h2>
                        <p className="text-base sm:text-xl text-slate-600 px-4 max-w-2xl mx-auto">
                            Stop wasting time organizing bookmarks. Let AI do the heavy lifting while you focus on what matters.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <FeatureCard
                        icon={<Brain />}
                        title="AI That Actually Works"
                        description="Just paste a link. AI reads the content, understands the context, and files it perfectly. No folders, no tags, no thinking required."
                        gradient="from-blue-500 to-indigo-500"
                        delay={0}
                    />
                    <FeatureCard
                        icon={<Zap />}
                        title="Instant Everything"
                        description="Automatic titles, descriptions, and thumbnails. One click to save, zero clicks to organize. It's like magic, but actually useful."
                        gradient="from-purple-500 to-pink-500"
                        delay={100}
                    />
                    <FeatureCard
                        icon={<Globe />}
                        title="Works Everywhere"
                        description="YouTube, TikTok, Instagram, Xiaohongshu, Douyin, Reddit, or your favorite blog. If it has a URL, we've got you covered."
                        gradient="from-green-500 to-emerald-500"
                        delay={200}
                    />
                    <FeatureCard
                        icon={<BookmarkPlus />}
                        title="Find Anything, Fast"
                        description="Powerful search that actually finds what you're looking for. Filter by category, tags, platform, or date. Never dig through folders again."
                        gradient="from-orange-500 to-red-500"
                        delay={300}
                    />
                    <FeatureCard
                        icon={<Shield />}
                        title="Your Data, Your Rules"
                        description="End-to-end privacy. No tracking, no selling your data. Export everything anytime. Leave whenever you want."
                        gradient="from-cyan-500 to-blue-500"
                        delay={400}
                    />
                    <FeatureCard
                        icon={<FileJson />}
                        title="Export Anywhere"
                        description="Take your bookmarks with you. Export to JSON, CSV, HTML, or Markdown. Import from any browser. Total freedom."
                        gradient="from-violet-500 to-purple-500"
                        delay={500}
                    />
                </div>
            </section>

            {/* How It Works */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                <ScrollReveal>
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-base sm:text-xl text-slate-600">
                            Three steps. Zero effort. Perfect organization.
                        </p>
                    </div>
                </ScrollReveal>

                {/* 增加一个外层 div，设置为 relative */}
                <div className="relative">
                    {/* 背景连接线：仅在桌面端 (md) 显示 */}
                    <div className="hidden md:block absolute top-6 lg:top-8 left-[18%] right-[18%] h-[3px] z-0 overflow-hidden bg-slate-200">
                        {/* 流动的光束 */}
                        <div className="absolute inset-y-0 left-0 w-[300%] h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent -translate-x-full animate-[flow_5s_linear_infinite]" />
                        {/* 静态的基础渐变（可选，让线条不流动时也有颜色） */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-indigo-600/20" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
                        <StepCard
                            number="1"
                            title="Paste & Save"
                            description="Drop any link into Smart Bookmarks. That's it. We handle the rest."
                            delay={0}
                        />
                        <StepCard
                            number="2"
                            title="AI Organizes"
                            description="Our AI reads the content, extracts metadata, and categorizes everything automatically."
                            delay={200}
                        />
                        <StepCard
                            number="3"
                            title="Find Instantly"
                            description="Search by keywords, filter by category, or browse your beautifully organized collection."
                            delay={400}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                <ScrollReveal>
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
                                Ready to Get Organized?
                            </h2>
                            <p className="text-base sm:text-xl mb-6 sm:mb-8 text-blue-100 max-w-2xl mx-auto">
                                Join thousands who&apos;ve already ditched messy bookmark folders. Start free, no credit card needed.
                            </p>
                            <SignedOut>
                                <Link href="/sign-up" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                    Get Started Free <ArrowRight className="w-5 h-5" />
                                </Link>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                    Open Dashboard <ArrowRight className="w-5 h-5" />
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-lg mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-xl">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900">Smart Bookmarks</span>
                        </div>
                        <p className="text-slate-600 text-sm">© 2025 Smart Bookmarks. Made with ❤️ by JP</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function AnimatedText() {
    const text = 'Let AI Organize Everything';
    const chars = text.split('');

    return (
        <span className="block relative py-2 sm:py-4 overflow-visible">
            <span className="relative inline-block leading-tight">
                {chars.map((char, i) => (
                    <span
                        key={i}
                        className="inline-block font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-bounce pb-1 sm:pb-2"
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '2s',
                            background: `linear-gradient(120deg, #3b82f6 ${i * 3}%, #8b5cf6 ${50 + i * 2}%, #6366f1 ${100 - i * 3}%)`,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </span>
        </span>
    );
}

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setTimeout(() => setIsVisible(true), delay);
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, [delay]);

    return (
        <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {children}
        </div>
    );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        indigo: 'from-indigo-500 to-indigo-600',
    };

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100">
            <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6 text-white">{icon}</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{value}</div>
            <div className="text-xs sm:text-sm text-slate-600">{label}</div>
        </div>
    );
}

function StepCard({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) {
    return (
        <ScrollReveal delay={delay}>
            <div className="flex flex-col items-center text-center group">
                <div className="relative">
                    {/* 呼吸灯光晕：仅在 Hover 时加强，或者保持常态微弱呼吸 */}
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity" />

                    {/* 主圆圈 */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl mb-6 shadow-[0_0_20px_rgba(59,130,246,0.5)] relative z-20 group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700">
                        {number}
                        {/* 圆圈内部的微光 */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                    </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 max-w-[250px] leading-relaxed">
                    {description}
                </p>
            </div>
        </ScrollReveal>
    );
}
function FeatureCard({ icon, title, description, gradient, delay }: { icon: React.ReactNode; title: string; description: string; gradient: string; delay: number }) {
    return (
        <ScrollReveal delay={delay}>
            <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                    <div className={`bg-gradient-to-br ${gradient} w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <div className="w-5 h-5 sm:w-7 sm:h-7 text-white">{icon}</div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </ScrollReveal>
    );
}