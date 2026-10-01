import { AlertTriangle, LogOut, UserX } from "lucide-react";

function DangerZone({ onLogout, onDeactivate }) {
    const handleLogout = () => {
        alert("Logout flow will be connected here.");
    };

    const handleDeactivate = () => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate your account?"
        );

        if (confirmed) {
            alert("Account deactivation flow will be connected here.");
        }
    };

    return (
        <section className="danger-zone">
            <div className="danger-zone-header">
                <AlertTriangle size={11} />
                <span>Danger Zone</span>
            </div>

            <div className="danger-zone-divider" />

            <div className="danger-zone-actions">
                <button
                    type="button"
                    className="danger-secondary-button"
                    onClick={onLogout}
                >
                    Logout Session
                </button>

                <button
                    type="button"
                    className="danger-primary-button"
                    onClick={onDeactivate}
                >
                    Deactivate Account
                </button>

            </div>
        </section>
    );
}

export default DangerZone;