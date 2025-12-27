import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { ROUTES } from '../utils/constants';

export function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, signup, isAuthenticated, isLoading } = useAuth();
    const { showToast } = useToast();

    const [isLogin, setIsLogin] = useState(!location.pathname.includes('signup'));
    const [loading, setLoading] = useState(false);

    // Form State
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(location.state?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate(ROUTES.CHAT, { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(username, password);
            navigate(ROUTES.CHAT);
        } catch (error) {
            showToast({
                type: 'error',
                message: error.response?.data?.detail || 'Login failed. Please check your credentials.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        if (password.length < 6) {
            showToast({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);

        try {
            await signup({ username, email, password });
            showToast({ type: 'success', message: 'Account created successfully! You can now sign in.' });
            setIsLogin(true);
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            showToast({
                type: 'error',
                message: error.response?.data?.detail || 'Signup failed. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col items-center justify-center px-6 overflow-hidden">
            <div className="w-full max-w-md flex flex-col pt-4">

                {/* Return to Home Button */}
                <button
                    onClick={() => navigate(ROUTES.HOME)}
                    className="mb-4 flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors group self-start ml-2"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-medium">Return to Home</span>
                </button>

                {/* Logo - Optimized for the vertical image provided */}
                <div className="flex flex-col items-center mb-4">
                    <div className="relative h-20 w-80 overflow-hidden flex items-center justify-center">
                        <img
                            src="/brand-logo.png"
                            alt="DocuMind"
                            className="absolute min-w-[400px] min-h-[400px] object-contain scale-[1]"
                        />
                    </div>
                </div>

                <Card padding="lg">
                    <div className="mb-8 pb-2 border-b border-slate-100 flex gap-8 justify-center">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`text-lg font-bold transition-all ${isLogin ? 'text-slate-900 border-b-2 border-orange-500 -mb-[9px]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`text-lg font-bold transition-all ${!isLogin ? 'text-slate-900 border-b-2 border-orange-500 -mb-[9px]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    <p className="text-slate-600 mb-6">
                        {isLogin
                            ? "Welcome back! Sign in to continue."
                            : "Join DocuMind to start chatting with your documents."}
                    </p>

                    <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                        <Input
                            label="Username"
                            type="text"
                            placeholder={isLogin ? "Enter your username" : "Choose a username"}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        {!isLogin && (
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        )}

                        <Input
                            label="Password"
                            type="password"
                            placeholder={isLogin ? "Enter your password" : "Create a password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {!isLogin && (
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        )}

                        <Button type="submit" loading={loading} className="w-full mt-2 py-3.5">
                            {isLogin ? "Sign In" : "Create Account"}
                        </Button>
                    </form>

                    {isLogin && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsLogin(false)}
                                className="text-sm text-slate-500 hover:text-orange-600 transition-colors"
                            >
                                Don't have an account? <span className="text-orange-500 font-bold">Sign up</span>
                            </button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
