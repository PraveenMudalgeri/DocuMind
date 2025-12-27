import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

export function HomePage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(ROUTES.CHAT, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGetStarted = (e) => {
    e.preventDefault();
    navigate(ROUTES.SIGNUP, { state: { email } });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col">
      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-100 rounded-full mb-8 shadow-sm">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>
            <span className="text-sm text-orange-700 font-semibold tracking-wide">Enterprise AI Assistant</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#1a1c1e] mb-6 leading-[1.1] tracking-tight">
            Meet <span className="text-orange-500">DocuMind</span>
            <br />
            <span className="text-slate-800">Your AI Document Assistant</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Transform static files into interactive conversations. Upload your documents
            and get precise, context-aware answers in seconds.
          </p>

          {/* CTA Form */}
          <form onSubmit={handleGetStarted} className="max-w-lg mx-auto mb-16 px-4">
            <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white border border-slate-200 rounded-2xl">
              <input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 font-medium placeholder-slate-400"
                required
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95"
              >
                Sign Up Free
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-semibold uppercase tracking-widest">No credit card required • Instant access</p>
          </form>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-10 mt-12 pt-12 border-t border-slate-100">
            <div className="group p-6 bg-white/50 rounded-2xl border border-transparent hover:border-orange-100 hover:bg-white transition-all duration-300">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-orange-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Ingestion</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Native support for PDF, DOCX, Markdown, and more.
              </p>
            </div>

            <div className="group p-6 bg-white/50 rounded-2xl border border-transparent hover:border-orange-100 hover:bg-white transition-all duration-300">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-orange-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Neural Search</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Lightning fast RAG architecture for instant chat.
              </p>
            </div>

            <div className="group p-6 bg-white/50 rounded-2xl border border-transparent hover:border-orange-100 hover:bg-white transition-all duration-300">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-orange-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Built-in Citations</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Answers with direct references to your sources.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-40 h-8 overflow-hidden flex items-center justify-center">
                <img src="/brand-logo.png" alt="DocuMind" className="absolute min-w-[120px] min-h-[250px] object-contain scale-[1.2]" />
              </div>
              <span className="text-gray-600">© 2025 DocuMind. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
