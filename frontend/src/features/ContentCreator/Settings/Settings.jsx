import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BackofficeLayout from "../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";
import { useCreatorAuth } from "../../../context/CreatorAuthContext";
import { syncCreatorProfileAcrossCourses } from "../../../services/backofficeService";

import ProfileSettings from "./components/ProfileSettings.jsx";
import SecuritySettings from "./components/SecuritySettings.jsx";
import NotificationPreferences from "./components/NotificationPreferences.jsx";
import WorkspaceSettings from "./components/WorkspaceSettings.jsx";
import DangerZone from "./components/DangerZone.jsx";

import "./Settings.css";

function buildSettingsFromUser(user) {
    const resolvedName =
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
        user?.username ||
        "Content Creator";

    return {
        fullName: resolvedName,
        email: user?.email || "",
        bio: user?.bio || "",
        avatarUrl: user?.avatarUrl || "",
        aiActivity: true,
        contentPublishing: true,
        performanceInsights: false,
        systemNotifications: true,
        startPage: "Dashboard Overview",
        analyticsSuggestions: true
    };
}

function Settings() {
    const navigate = useNavigate();
    const { user, updateProfile, logout } = useCreatorAuth();

    const [settings, setSettings] = useState(() => buildSettingsFromUser(user));
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setSettings((prev) => ({
            ...prev,
            ...buildSettingsFromUser(user)
        }));
    }, [user?.id, user?.email, user?.fullName, user?.avatarUrl]);

    const updateSetting = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const updatedUser = await updateProfile({
                fullName: settings.fullName,
                email: settings.email,
                bio: settings.bio,
                avatarUrl: settings.avatarUrl || null
            });

            await syncCreatorProfileAcrossCourses({
                creatorId: updatedUser?.id,
                creatorEmail: updatedUser?.email,
                creatorName: updatedUser?.fullName,
                creatorAvatar: updatedUser?.avatarUrl || null
            });

            setSaved(true);
            setTimeout(() => {
                setSaved(false);
            }, 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setSettings(buildSettingsFromUser(user));
        setSaved(false);
    };

    const handleLogout = async () => {
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (confirmed) {
            await logout();
            navigate("/login");
        }
    };

    const handleDeactivate = () => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this account?"
        );
        if (confirmed) {
            console.log("Account deactivation requested");
        }
    };

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>
            <div className="settings-page">
                <div className="settings-page-header">
                    <div>
                        <h1>Creator Settings</h1>
                        <p>
                            Manage your profile picture, creator identity, preferences, and workspace parameters.
                        </p>
                    </div>
                </div>

                <div className="settings-content">
                    <div className="settings-main-column">

                        <ProfileSettings
                            settings={settings}
                            updateSetting={updateSetting}
                        />

                        <NotificationPreferences
                            settings={settings}
                            updateSetting={updateSetting}
                        />

                        <DangerZone
                            onLogout={handleLogout}
                            onDeactivate={handleDeactivate}
                        />

                    </div>

                    <div className="settings-side-column">

                        <SecuritySettings />

                        <WorkspaceSettings
                            settings={settings}
                            updateSetting={updateSetting}
                        />

                    </div>
                </div>
            </div>

            <div className="settings-footer">
                <button
                    type="button"
                    className="settings-cancel-button"
                    onClick={handleCancel}
                >
                    Cancel Changes
                </button>

                {saved && (
                    <span className="settings-saved-message">
                        Profile & settings saved successfully!
                    </span>
                )}

                <button
                    type="button"
                    className="settings-save-button"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save All Settings"}
                </button>
            </div>
        </BackofficeLayout>
    );
}

export default Settings;
