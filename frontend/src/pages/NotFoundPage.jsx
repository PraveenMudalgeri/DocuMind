import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ROUTES } from '../utils/constants';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-100/30 rounded-full blur-[100px]" />

      <div className="text-center relative z-10 w-full max-w-md">
        <div className="mb-8 relative inline-block">
          <h1 className="text-[120px] font-black text-slate-900/5 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-orange-600 rounded-2xl shadow-2xl shadow-orange-500/20 rotate-12 flex items-center justify-center">
              <svg className="w-10 h-10 text-white -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Lost in the sauce?</h2>
        <p className="text-slate-500 mb-10 font-medium leading-relaxed">
          The page you're searching for seems to have vanished into thin air. Let's get you back on track.
        </p>

        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Home
        </button>
      </div>
    </div>
  );
}
