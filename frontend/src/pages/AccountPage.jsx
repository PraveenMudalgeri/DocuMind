import { useState } from "react";
import { Header } from "../components/layout/Header";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export function AccountPage() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        // This would typically call an API service
        showToast({
            type: "success",
            message: "Profile settings updated (Simulator)",
        });
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Header />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your profile, preferences, and account security.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg mb-4">
                                    <span className="text-white font-bold text-3xl">
                                        {user?.username?.[0]?.toUpperCase() || "U"}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
                                <p className="text-sm text-gray-500 mt-1">{user?.email || "No email provided"}</p>

                                <div className="mt-6 w-full pt-6 border-t border-gray-50 flex justify-around">
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plan</p>
                                        <p className="text-sm font-bold text-orange-600">Pro</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                        <p className="text-sm font-bold text-green-600">Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Links</h3>
                            <nav className="space-y-2">
                                <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all flex items-center gap-3">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    Notification Settings
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all flex items-center gap-3">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Security & Privacy
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Section */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <h3 className="font-bold text-gray-900">Profile Information</h3>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                            <div className="p-8">
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username</label>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm disabled:cursor-not-allowed disabled:opacity-75"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm disabled:cursor-not-allowed disabled:opacity-75"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 shadow-md shadow-orange-200 transition-all active:scale-95"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Account Security Section */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                                <h3 className="font-bold text-gray-900">Account Security</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Two-Factor Authentication</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Keep your account extra secure.</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all">
                                        Enable
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-red-50/30 rounded-xl border border-red-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-red-400 border border-red-100 shadow-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-red-900">Delete Account</p>
                                            <p className="text-xs text-red-600 mt-0.5">Permanently remove your account and data.</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-md shadow-red-100 transition-all">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
