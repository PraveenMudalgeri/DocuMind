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
            message: "Profile settings saved successfully",
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

                <div className="max-w-2xl mx-auto">
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-8 md:p-10">
                            <div className="flex flex-col items-center mb-10">
                                <div className="w-20 h-20 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg mb-4">
                                    <span className="text-white font-bold text-3xl">
                                        {user?.username?.[0]?.toUpperCase() || "U"}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{user?.username || "Account"}</h2>
                                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm disabled:cursor-not-allowed disabled:opacity-75 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm disabled:cursor-not-allowed disabled:opacity-75 font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-4 pt-6">
                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-95"
                                        >
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 w-full">
                                            <button
                                                type="submit"
                                                className="flex-1 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-95"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    <div className="pt-8 border-t border-gray-50 w-full flex justify-center">
                                        <button
                                            type="button"
                                            className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
