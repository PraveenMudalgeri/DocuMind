import { useState, useEffect } from "react";
import { Header } from "../components/layout/Header";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { authService } from "../services/authService";

export function AccountPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("profile");

    // Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");

    // API Key State
    const [apiKeys, setApiKeys] = useState({
        google_api_key: "",
        sarvam_api_key: ""
    });
    const [configuredProviders, setConfiguredProviders] = useState([]);
    const [isSavingKeys, setIsSavingKeys] = useState(false);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const userData = await authService.getCurrentUser();
                if (userData?.user?.configured_providers) {
                    setConfiguredProviders(userData.user.configured_providers);
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
        }
        fetchUserData();
    }, []);

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        showToast({
            type: "success",
            message: "Profile updated successfully (Simulation)",
        });
        setIsEditing(false);
    };

    const handleApiKeyChange = (provider, value) => {
        setApiKeys(prev => ({ ...prev, [provider]: value }));
    };

    const handleSaveApiKeys = async (e) => {
        e.preventDefault();

        // Filter out empty keys to prevent accidental deletion of existing keys
        const keysToUpdate = {};
        Object.entries(apiKeys).forEach(([key, value]) => {
            if (value && value.trim() !== "") {
                keysToUpdate[key] = value;
            }
        });

        if (Object.keys(keysToUpdate).length === 0) {
            showToast({ type: "info", message: "No new API keys entered to save" });
            return;
        }

        setIsSavingKeys(true);
        try {
            await authService.updateApiKeys(keysToUpdate);
            showToast({ type: "success", message: "API keys updated successfully" });
            setApiKeys({ google_api_key: "", sarvam_api_key: "" });
            const userData = await authService.getCurrentUser();
            if (userData?.user?.configured_providers) {
                setConfiguredProviders(userData.user.configured_providers);
            }
        } catch (error) {
            console.error("Error saving API keys:", error);
            showToast({ type: "error", message: "Failed to save API keys" });
        } finally {
            setIsSavingKeys(false);
        }
    };

    const handleRemoveKey = async (provider) => {
        if (!window.confirm("Are you sure you want to remove this API key?")) return;

        setIsSavingKeys(true);
        try {
            // Update with empty string to remove the keys
            await authService.updateApiKeys({ [provider]: "" });
            showToast({ type: "success", message: "API key removed successfully" });

            // Refresh user data
            const userData = await authService.getCurrentUser();
            if (userData?.user?.configured_providers) {
                setConfiguredProviders(userData.user.configured_providers);
            }

            // Clear local input if it matches
            setApiKeys(prev => ({ ...prev, [provider]: "" }));
        } catch (error) {
            console.error("Error removing API key:", error);
            showToast({ type: "error", message: "Failed to remove API key" });
        } finally {
            setIsSavingKeys(false);
        }
    };

    const getKeyStatus = (provider) => {
        const isConfigured = configuredProviders.includes(provider);
        return (
            <div className="flex items-center gap-2">
                {isConfigured ? (
                    <>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Configured</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveKey(provider)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                        >
                            Remove
                        </button>
                    </>
                ) : (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Not Set</span>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
                <h1 className="text-2xl font-semibold text-gray-900 mb-8">Account Settings</h1>

                {/* Tabs */}
                <div className="flex items-center space-x-8 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "profile"
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("configuration")}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "configuration"
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Configuration
                    </button>
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in-up">
                    {activeTab === "profile" && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-base font-medium text-gray-900 mb-1">Personal Information</h2>
                                <p className="text-sm text-gray-500 mb-6">Update your personal details here.</p>

                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        {!isEditing ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(true)}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <h2 className="text-base font-medium text-red-600 mb-4">Danger Zone</h2>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                                >
                                    Delete Account
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                    Permanently remove your account and all of its contents from our platform. This action is not reversible.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "configuration" && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-base font-medium text-gray-900 mb-1">API Configuration</h2>
                                <p className="text-sm text-gray-500">Configure your API keys for search and AI capabilities.</p>
                            </div>

                            <form onSubmit={handleSaveApiKeys} className="space-y-6 max-w-lg">
                                {/* Gemini */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-sm font-medium text-gray-700">Google Gemini API Key</label>
                                        {getKeyStatus("google_api_key")}
                                    </div>
                                    <input
                                        type="password"
                                        placeholder={configuredProviders.includes("google_api_key") ? "••••••••••••••••••••••••" : "Enter API Key"}
                                        value={apiKeys.google_api_key}
                                        onChange={(e) => handleApiKeyChange("google_api_key", e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-mono placeholder:text-gray-300"
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5">Required for advanced reasoning and content generation.</p>
                                </div>

                                {/* Sarvam */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-sm font-medium text-gray-700">Sarvam API Key</label>
                                        {getKeyStatus("sarvam_api_key")}
                                    </div>
                                    <input
                                        type="password"
                                        placeholder={configuredProviders.includes("sarvam_api_key") ? "••••••••••••••••••••••••" : "Enter API Key"}
                                        value={apiKeys.sarvam_api_key}
                                        onChange={(e) => handleApiKeyChange("sarvam_api_key", e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-mono placeholder:text-gray-300"
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5">Optional. Enables specialized Indic language speech & text processing.</p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSavingKeys}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSavingKeys ? "Saving..." : "Save Configuration"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
