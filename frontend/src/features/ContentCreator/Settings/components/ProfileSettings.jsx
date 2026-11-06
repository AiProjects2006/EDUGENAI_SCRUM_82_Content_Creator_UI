import { UserRound } from "lucide-react";

function ProfileSettings({ settings, updateSetting }) {
    return (
        <section className="settings-card profile-settings-card">
            <div className="settings-card-header">
                <div className="settings-section-icon">
                    <UserRound size={12} />
                </div>

                <div>
                    <h2>Profile Settings</h2>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-avatar">
                    AR
                </div>

                <div className="profile-details">
                    <span className="profile-role">Content Creator</span>

                    <label>
                        Full Name
                        <input
                            type="text"
                            value={settings.fullName}
                            onChange={(e) =>
                                updateSetting("fullName", e.target.value)
                            }
                        />
                    </label>

                    <label>
                        Email Address
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) =>
                                updateSetting("email", e.target.value)
                            }
                        />
                    </label>
                </div>
            </div>
        </section>
    );
}

export default ProfileSettings;