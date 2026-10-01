import { useState } from "react";

import BackofficeLayout from "../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";

import ProfileSettings from "./components/ProfileSettings.jsx";
import SecuritySettings from "./components/SecuritySettings.jsx";
import NotificationPreferences from "./components/NotificationPreferences.jsx";
import WorkspaceSettings from "./components/WorkspaceSettings.jsx";
import DangerZone from "./components/DangerZone.jsx";

import "./Settings.css";

function Settings() {
    const initialSettings = {
        fullName: "Alex Rivera",
        email: "alex@edugenai.studio",
        aiActivity: true,
        contentPublishing: true,
        performanceInsights: false,
        systemNotifications: true,
        startPage: "Dashboard Overview",
        analyticsSuggestions: true
    };

    const [settings, setSettings] = useState(initialSettings);
    const [saved, setSaved] = useState(false);

    const updateSetting = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value
        }));

        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 3000);
    };

    const handleCancel = () => {
        setSettings(initialSettings);
        setSaved(false);
    };

    const handleLogout = () => {
        const confirmed = window.confirm(
            "Are you sure you want to log out?"
        );

        if (confirmed) {
            console.log("Logout requested");
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
                            Manage your account, preferences, and workspace
                            parameters.
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
                        Settings saved successfully
                    </span>
                )}

                <button
                    type="button"
                    className="settings-save-button"
                    onClick={handleSave}
                >
                    Save All Settings
                </button>
            </div>
        </BackofficeLayout>
    );
}

export default Settings;