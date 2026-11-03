import {
    RefreshCw,
    Save,
    Send
} from "lucide-react";

function ActivityHeader({
                            activity,
                            onRegenerate,
                            onSaveTemplate,
                            onPublish,
                            isRegenerating
                        }) {
    return (
        <header className="generated-activity-header">

            <div className="generated-activity-title-area">

                <div className="generated-activity-breadcrumb">
                    <span>
                        Module ID: {activity.moduleId}
                    </span>
                </div>

                <h1>
                    Generated Activities
                </h1>

                <h2>
                    {activity.title}
                </h2>

                <p>
                    {activity.description?.trim() ||
                        "Review and edit this activity before publishing."}
                </p>

            </div>

            <div className="generated-activity-actions">

                <button
                    type="button"
                    className="activity-secondary-button"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                >
                    <RefreshCw
                        size={10}
                        className={
                            isRegenerating
                                ? "activity-spin"
                                : ""
                        }
                    />

                    {isRegenerating
                        ? "Regenerating"
                        : "Regenerate"}
                </button>

                <button
                    type="button"
                    className="activity-secondary-button"
                    onClick={onSaveTemplate}
                >
                    <Save size={10} />
                    Save as Template
                </button>

                <button
                    type="button"
                    className="activity-publish-button"
                    onClick={onPublish}
                    disabled={["PUBLISHED", "ARCHIVED"].includes(activity.status)}
                >
                    <Send size={12} />
                    {activity.status === "PUBLISHED"
                        ? "Published"
                        : activity.status === "ARCHIVED"
                            ? "Archived"
                            : "Publish Activity"}
                </button>

            </div>

        </header>
    );
}

export default ActivityHeader;