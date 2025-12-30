import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Sparkles,
  BookmarkPlus,
  Brain,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Bookmarks
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
                >
                  Go to App
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Smart Bookmark Management</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6">
            Let AI Help You
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Organize Everything You Save
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Save content from YouTube, TikTok, Xiaohongshu, or any website.
            One click to collect, AI automatically categorizes — never lose
            what you saved again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                Start for Free
              </Link>
              <Link
                href="/sign-in"
                className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
              >
                Already have an account? Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                Open Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-3xl opacity-20" />
          <div className="relative bg-white rounded-3xl shadow-2xl p-4 border border-slate-200">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <BookmarkPlus className="w-20 h-20 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  App Interface Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Why Choose Smart Bookmarks?
          </h2>
          <p className="text-xl text-slate-600">
            Powerful features designed for effortless organization
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <FeatureCard
            icon={<Brain />}
            title="AI Smart Categorization"
            description="AI automatically understands and categorizes your links into learning, tools, health, and more — no manual sorting required."
            gradient="from-blue-500 to-indigo-500"
          />

          {/* Feature 2 */}
          <FeatureCard
            icon={<Zap />}
            title="Automatic Metadata Extraction"
            description="Instantly fetch titles, descriptions, and thumbnails so every bookmark is easy to recognize at a glance."
            gradient="from-purple-500 to-pink-500"
          />

          {/* Feature 3 */}
          <FeatureCard
            icon={<Globe />}
            title="All-Platform Support"
            description="Works seamlessly with YouTube, TikTok, Xiaohongshu, Douyin, and any website — all in one place."
            gradient="from-green-500 to-emerald-500"
          />

          {/* Feature 4 */}
          <FeatureCard
            icon={<BookmarkPlus />}
            title="Fast Search"
            description="Advanced search and filtering help you find any saved content in seconds."
            gradient="from-orange-500 to-red-500"
          />

          {/* Feature 5 */}
          <FeatureCard
            icon={<Shield />}
            title="Privacy & Security"
            description="Your data is fully private and accessible only to you. Sync safely across all your devices."
            gradient="from-cyan-500 to-blue-500"
          />

          {/* Feature 6 */}
          <FeatureCard
            icon={<Sparkles />}
            title="Free to Use"
            description="Core features are completely free — no credit card required. Start organizing today."
            gradient="from-violet-500 to-purple-500"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users and let AI manage your bookmarks
          </p>
          <SignedOut>
            <Link
              href="/sign-up"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Sign Up for Free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Open Dashboard
            </Link>
          </SignedIn>
        </div>
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
              © 2024 Smart Bookmarks. Made with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Reusable Feature Card */
function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
      <div
        className={`bg-gradient-to-br ${gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-6`}
      >
        <div className="w-7 h-7 text-white">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}