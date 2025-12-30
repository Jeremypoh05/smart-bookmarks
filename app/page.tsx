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
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-xl hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Bookmarks
              </span>
            </Link>

            {/* Clerk Auth Links - 修复点击无效的问题 */}
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
                  Go to App
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 relative">
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
            <span>AI-Powered Smart Bookmark Management</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-2 leading-tight"
            style={{
              opacity: Math.max(0, 1 - scrollY / 400),
              transform: `translateY(${scrollY * 0.2}px)`
            }}
          >
            Let AI Help You
            <AnimatedText />
          </h1>

          <p
            className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 px-4"
            style={{
              opacity: Math.max(0, 1 - scrollY / 500),
              transform: `translateY(${scrollY * 0.15}px)`
            }}
          >
            Save content from YouTube, TikTok, Xiaohongshu, or any website.
            AI automatically categorizes — never lose what you saved again.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-6"
            style={{
              opacity: Math.max(0, 1 - scrollY / 600),
              transform: `translateY(${scrollY * 0.1}px)`
            }}
          >
            <SignedOut>
              <Link href="/sign-up" className="group bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden text-center">
                <span className="relative z-10">Start for Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link href="/sign-in" className="bg-white text-slate-700 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all duration-300 text-center">
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 text-center">
                Open Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Demo Preview */}
        <ScrollReveal>
          <div className="mt-18 sm:mt-26 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-2xl sm:blur-3xl opacity-20 animate-pulse" />
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-2 sm:p-4 border border-slate-200 hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden">
                <img
                  src="/feature_preview.png"
                  alt="App Interface Preview"
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `
                        <div class="bg-gradient-to-br from-slate-100 to-slate-200 aspect-video flex items-center justify-center">
                          <div class="text-center p-6">
                            <div class="w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-4 flex items-center justify-center">
                              <svg class="w-12 h-12 sm:w-20 sm:h-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </div>
                            <p class="text-slate-500 text-sm sm:text-lg">App Interface Preview</p>
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

      {/* Features - 优化网格在手机端的显示 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4 px-2">
              Why Choose Smart Bookmarks?
            </h2>
            <p className="text-base sm:text-xl text-slate-600 px-4">
              Powerful features designed for effortless organization
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard icon={<Brain />} title="AI Smart Categorization" description="AI automatically understands and categorizes your links into learning, tools, health, and more — no manual sorting required." gradient="from-blue-500 to-indigo-500" delay={0} />
          <FeatureCard icon={<Zap />} title="Auto Extraction" description="Instantly fetch titles, descriptions, and thumbnails so every bookmark is easy to recognize at a glance." gradient="from-purple-500 to-pink-500" delay={100} />
          <FeatureCard icon={<Globe />} title="All-Platform" description="Works seamlessly with YouTube, TikTok, Xiaohongshu, Douyin, and any website — all in one place." gradient="from-green-500 to-emerald-500" delay={200} />
          <FeatureCard icon={<BookmarkPlus />} title="Fast Search" description="Find any saved content in seconds with advanced filters." gradient="from-orange-500 to-red-500" delay={300} />
          <FeatureCard icon={<Shield />} title="Privacy First" description="Your data is fully private and accessible only to you. Sync safely across all your devices." gradient="from-cyan-500 to-blue-500" delay={400} />
          <FeatureCard icon={<Sparkles />} title="Free to Use" description="Core features are completely free — no credit card required. Start organizing today." gradient="from-violet-500 to-purple-500" delay={500} />
        </div>
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
            <p className="text-slate-600 text-sm">© 2025 Smart Bookmarks. Made with JP!</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 修改后的 AnimatedText：修复了 y/g 字母被切掉的问题，并减小了手机端字号
function AnimatedText() {
  const text = 'Organize Everything You Save';
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

// 通用的 ScrollReveal
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

// 响应式 FeatureCard
function FeatureCard({ icon, title, description, gradient, delay }: { icon: React.ReactNode; title: string; description: string; gradient: string; delay: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 relative overflow-hidden h-full">
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