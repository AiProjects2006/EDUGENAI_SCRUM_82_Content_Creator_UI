import { BellRing } from "lucide-react";
import { notificationPreferences } from "../data/SettingsData.js";

function NotificationPreferences({ settings, updateSetting }) {
    const settingKeys = [
        "aiActivity",
        "contentPublishing",
        "performanceInsights",
        "systemNotifications"
    ];

    return (
        <section className="settings-card notification-settings-card">
            <div className="settings-card-header">
                <div className="settings-section-icon">
                    <BellRing size={12} />
                </div>

                <div>
                    <h2>Notification Preferences</h2>
                </div>
            </div>

            <div className="notification-list">
                {notificationPreferences.map((item, index) => {
                    const settingKey = settingKeys[index];

                    return (
                        <div
                            className="notification-setting-row"
                            key={item.id}
                        >
                            <div className="notification-setting-text">
                                <strong>{item.label}</strong>
                                <span>{item.description}</span>
                            </div>

                            <button
                                type="button"
                                className={`settings-toggle ${
                                    settings[settingKey] ? "active" : ""
                                }`}
                                onClick={() =>
                                    updateSetting(
                                        settingKey,
                                        !settings[settingKey]
                                    )
                                }
                            >
                                <span />
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default NotificationPreferences;