import { useRef } from "react";
import { UserRound, Camera, Trash2 } from "lucide-react";

function resizeImageToDataUrl(file, maxSize = 240, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;
                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    }
                } else if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = reject;
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function getInitials(name = "") {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "CC";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProfileSettings({ settings, updateSetting }) {
    const fileInputRef = useRef(null);

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const dataUrl = await resizeImageToDataUrl(file);
            updateSetting("avatarUrl", dataUrl);
        } catch (err) {
            console.error("Failed reading profile photo:", err);
        } finally {
            e.target.value = "";
        }
    };

    return (
        <section className="settings-card profile-settings-card">
            <div className="settings-card-header">
                <div className="settings-section-icon">
                    <UserRound size={14} />
                </div>

                <div>
                    <h2>Profile Settings</h2>
                    <p>Your name and profile picture appear on course cards in the Student Portal.</p>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-avatar-column">
                    <div className="profile-avatar">
                        {settings.avatarUrl ? (
                            <img
                                src={settings.avatarUrl}
                                alt={settings.fullName || "Creator Avatar"}
                                className="profile-avatar-img"
                            />
                        ) : (
                            getInitials(settings.fullName)
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                    />

                    <div className="profile-photo-actions">
                        <button
                            type="button"
                            className="profile-photo-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera size={13} />
                            <span>{settings.avatarUrl ? "Change" : "Upload"}</span>
                        </button>

                        {settings.avatarUrl && (
                            <button
                                type="button"
                                className="profile-photo-remove-btn"
                                onClick={() => updateSetting("avatarUrl", "")}
                                title="Remove photo"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
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
                            placeholder="Enter your full name"
                        />
                    </label>

                    <label>
                        Email
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) =>
                                updateSetting("email", e.target.value)
                            }
                            placeholder="creator@edugenai.com"
                        />
                    </label>

                    <label>
                        Headline
                        <input
                            type="text"
                            value={settings.bio || ""}
                            onChange={(e) =>
                                updateSetting("bio", e.target.value)
                            }
                            placeholder="e.g. Primary Mathematics & ICT Educator"
                        />
                    </label>
                </div>
            </div>
        </section>
    );
}

export default ProfileSettings;
