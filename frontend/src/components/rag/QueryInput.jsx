import { useState, useRef, useEffect } from 'react';
import { VoiceInput } from './VoiceInput';

export function QueryInput({ onSend, disabled, onExportChat, responseStyle = 'auto', onResponseStyleChange }) {
  const [query, setQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const textareaRef = useRef(null);
  const exportMenuRef = useRef(null);
  const styleMenuRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [query]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (styleMenuRef.current && !styleMenuRef.current.contains(event.target)) {
        setShowStyleMenu(false);
      }
    };

    if (showExportMenu || showStyleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu, showStyleMenu]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSend(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleExport = (format) => {
    if (onExportChat) {
      onExportChat(format);
    }
    setShowExportMenu(false);
  };

  const handleSearch = () => {
    // Placeholder for future search functionality
    console.log('Search functionality - coming soon');
  };

  const handleStyleChange = (style) => {
    if (onResponseStyleChange) {
      onResponseStyleChange(style);
    }
    setShowStyleMenu(false);
  };

  const getStyleIcon = (style = responseStyle) => {
    switch (style) {
      case 'detailed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case 'concise':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8M4 18h4" />
          </svg>
        );
      case 'balanced':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        );
      default: // auto
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getStyleLabel = () => {
    const labels = {
      auto: 'Auto',
      detailed: 'Detailed',
      concise: 'Concise',
      balanced: 'Balanced'
    };
    return labels[responseStyle] || 'Auto';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <form onSubmit={handleSubmit}>
          {/* Textarea Area */}
          <div className="px-4 pt-2 pb-0.5">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message DocuMind..."
              disabled={disabled}
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-gray-800 placeholder-gray-400 resize-none text-[14px] leading-snug py-1 max-h-[100px] overflow-y-auto font-sans"
              style={{ minHeight: '32px' }}
            />
          </div>

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="flex items-center gap-0.5">
              {/* Style Selector */}
              <div className="relative" ref={styleMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowStyleMenu(!showStyleMenu)}
                  disabled={disabled}
                  className={`
                    p-2 rounded-lg transition-all flex items-center gap-2
                    ${showStyleMenu ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
                  `}
                  title={`Style: ${getStyleLabel()}`}
                >
                  <div className={`
                    p-1 rounded-md
                    ${responseStyle === 'auto' ? 'text-slate-600 bg-slate-50' : ''}
                    ${responseStyle === 'detailed' ? 'text-green-500 bg-green-50' : ''}
                    ${responseStyle === 'balanced' ? 'text-orange-500 bg-orange-50' : ''}
                    ${responseStyle === 'concise' ? 'text-purple-500 bg-purple-50' : ''}
                  `}>
                    {getStyleIcon()}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline-block">
                    {getStyleLabel()}
                  </span>
                </button>

                {showStyleMenu && (
                  <div className="absolute bottom-full md:bottom-full left-0 mb-2 md:mb-2 w-52 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200 max-h-[60vh] overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                      Response Style
                    </div>
                    {[
                      { id: 'auto', label: 'Auto', color: 'slate', desc: 'Smarter defaults' },
                      { id: 'detailed', label: 'Detailed', color: 'green', desc: 'In-depth analysis' },
                      { id: 'balanced', label: 'Balanced', color: 'orange', desc: 'Best for general use' },
                      { id: 'concise', label: 'Concise', color: 'purple', desc: 'Short and sweet' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleStyleChange(item.id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all
                          ${responseStyle === item.id
                            ? `bg-${item.color}-50 text-${item.color}-700 font-medium`
                            : 'text-gray-600 hover:bg-gray-50'}
                        `}
                      >
                        <div className={`
                          p-1.5 rounded-lg
                          ${responseStyle === item.id
                            ? `text-${item.color}-600 bg-${item.color}-100/50`
                            : `text-gray-400 bg-gray-50 group-hover:bg-${item.color}-50`}
                        `}>
                          {getStyleIcon(item.id)}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="capitalize">{item.label}</span>
                          <span className="text-[10px] opacity-60 font-normal leading-tight">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Button */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={disabled}
                  className={`
                    p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all
                    ${showExportMenu ? 'bg-gray-100 text-gray-900 border-gray-200' : 'border-transparent'}
                  `}
                  title="Export Chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>

                {showExportMenu && (
                  <div className="absolute bottom-full md:bottom-full left-0 mb-2 md:mb-2 w-52 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200 max-h-[60vh] overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                      Export Options
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExport('markdown')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">Markdown File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('pdf')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-1.5 bg-red-50 rounded-lg text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">PDF Document</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Input */}
              <VoiceInput
                onTranscribe={(text) => setQuery(prev => prev + (prev ? ' ' : '') + text)}
                disabled={disabled}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={disabled || !query.trim()}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300
                  ${query.trim()
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-200 active:scale-95'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
      <p className="text-[11px] text-gray-400 text-center mt-2 tracking-tight">
        DocuMind can make mistakes. Check important info.
      </p>
    </div>
  );
}
