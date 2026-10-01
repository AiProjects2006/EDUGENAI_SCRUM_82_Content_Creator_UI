import { useState } from "react";
import { Lock, X } from "lucide-react";

function SecuritySettings() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        newPassword: "",
        confirm: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const updatePassword = (key, value) => {
        setPasswords((prev) => ({
            ...prev,
            [key]: value
        }));

        setError("");
        setSuccess(false);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();

        if (
            !passwords.current ||
            !passwords.newPassword ||
            !passwords.confirm
        ) {
            setError("Please complete all password fields.");
            return;
        }

        if (passwords.newPassword.length < 8) {
            setError(
                "New password must contain at least 8 characters."
            );
            return;
        }

        if (passwords.newPassword !== passwords.confirm) {
            setError("New passwords do not match.");
            return;
        }

        setSuccess(true);

        setPasswords({
            current: "",
            newPassword: "",
            confirm: ""
        });

        setTimeout(() => {
            setShowPasswordModal(false);
            setSuccess(false);
        }, 1500);
    };

    return (
        <>
            <section className="settings-card security-settings-card">
                <div className="settings-card-header">
                    <div className="settings-section-icon">
                        <Lock size={15} />
                    </div>

                    <div>
                        <h2>Security</h2>
                        <p>
                            Manage your password and account security.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="change-password-button"
                    onClick={() => {
                        setShowPasswordModal(true);
                        setError("");
                        setSuccess(false);
                    }}
                >
                    Change Password
                </button>
            </section>

            {showPasswordModal && (
                <div
                    className="password-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowPasswordModal(false);
                        }
                    }}
                >
                    <div className="password-modal">
                        <div className="password-modal-header">
                            <div>
                                <h2>Change Password</h2>
                                <p>
                                    Update your account password.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="password-modal-close"
                                onClick={() =>
                                    setShowPasswordModal(false)
                                }
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            className="password-form"
                            onSubmit={handleChangePassword}
                        >
                            <label>
                                Current Password
                                <input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) =>
                                        updatePassword(
                                            "current",
                                            e.target.value
                                        )
                                    }
                                />
                            </label>

                            <label>
                                New Password
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) =>
                                        updatePassword(
                                            "newPassword",
                                            e.target.value
                                        )
                                    }
                                />
                            </label>

                            <label>
                                Confirm New Password
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) =>
                                        updatePassword(
                                            "confirm",
                                            e.target.value
                                        )
                                    }
                                />
                            </label>

                            {error && (
                                <div className="password-error">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="password-success">
                                    Password updated successfully.
                                </div>
                            )}

                            <div className="password-modal-actions">
                                <button
                                    type="button"
                                    className="password-cancel-button"
                                    onClick={() =>
                                        setShowPasswordModal(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="password-save-button"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default SecuritySettings;