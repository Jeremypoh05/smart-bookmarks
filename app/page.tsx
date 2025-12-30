"use client"

import { useState, useEffect, useRef } from 'react';
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
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Bookmarks
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
                Sign In
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="text-center relative z-10">
          <div
            className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 hover:scale-105 transition-transform duration-300"
            style={{
              opacity: Math.max(0, 1 - scrollY / 300),
              transform: `translateY(${scrollY * 0.3}px)`
            }}
          >
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span>AI-Powered Smart Bookmark Management</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-2"
            style={{
              opacity: Math.max(0, 1 - scrollY / 400),
              transform: `translateY(${scrollY * 0.2}px)`
            }}
          >
            Let AI Help You
            <AnimatedText />
          </h1>

          <p
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-10"
            style={{
              opacity: Math.max(0, 1 - scrollY / 500),
              transform: `translateY(${scrollY * 0.15}px)`
            }}
          >
            Save content from YouTube, TikTok, Xiaohongshu, or any website.
            One click to collect, AI automatically categorizes — never lose
            what you saved again.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{
              opacity: Math.max(0, 1 - scrollY / 600),
              transform: `translateY(${scrollY * 0.1}px)`
            }}
          >
            <button className="group bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <span className="relative z-10">Start for Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all duration-300">
              Sign In
            </button>
          </div>

          <div className="mt-12 animate-bounce">
            <ChevronDown className="w-8 h-8 text-slate-400 mx-auto" />
          </div>
        </div>

        {/* Demo Preview with your image */}
        <ScrollReveal>
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-3xl opacity-20 animate-pulse" />
            <div className="relative bg-white rounded-3xl shadow-2xl p-4 border border-slate-200 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="rounded-2xl overflow-hidden">
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
                          <div class="text-center">
                            <div class="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                              <svg class="w-20 h-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </div>
                            <p class="text-slate-500 text-lg">App Interface Preview</p>
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

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose Smart Bookmarks?
            </h2>
            <p className="text-xl text-slate-600">
              Powerful features designed for effortless organization
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ScrollReveal delay={0}>
            <FeatureCard
              icon={<Brain />}
              title="AI Smart Categorization"
              description="AI automatically understands and categorizes your links into learning, tools, health, and more — no manual sorting required."
              gradient="from-blue-500 to-indigo-500"
            />
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <FeatureCard
              icon={<Zap />}
              title="Automatic Metadata Extraction"
              description="Instantly fetch titles, descriptions, and thumbnails so every bookmark is easy to recognize at a glance."
              gradient="from-purple-500 to-pink-500"
            />
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <FeatureCard
              icon={<Globe />}
              title="All-Platform Support"
              description="Works seamlessly with YouTube, TikTok, Xiaohongshu, Douyin, and any website — all in one place."
              gradient="from-green-500 to-emerald-500"
            />
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <FeatureCard
              icon={<BookmarkPlus />}
              title="Fast Search"
              description="Advanced search and filtering help you find any saved content in seconds."
              gradient="from-orange-500 to-red-500"
            />
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <FeatureCard
              icon={<Shield />}
              title="Privacy & Security"
              description="Your data is fully private and accessible only to you. Sync safely across all your devices."
              gradient="from-cyan-500 to-blue-500"
            />
          </ScrollReveal>

          <ScrollReveal delay={500}>
            <FeatureCard
              icon={<Sparkles />}
              title="Free to Use"
              description="Core features are completely free — no credit card required. Start organizing today."
              gradient="from-violet-500 to-purple-500"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal>
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Join thousands of users and let AI manage your bookmarks
              </p>
              <button className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Sign Up for Free
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                Smart Bookmarks
              </span>
            </div>
            <p className="text-slate-600">
              © 2025 Smart Bookmarks. Made with JP!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AnimatedText() {
  const text = 'Organize Everything You Save';
  const chars = text.split('');

  return (
    <span className="block relative py-4 overflow-visible">
      <span className="relative inline-block leading-normal">
        {chars.map((char, i) => (
          <span
            key={i}
            className="inline-block font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-bounce"
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

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
}

function ScrollReveal({ children, delay = 0 }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
        }`}
    >
      {children}
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div
          className={`bg-gradient-to-br ${gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
        >
          <div className="w-7 h-7 text-white">{icon}</div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}