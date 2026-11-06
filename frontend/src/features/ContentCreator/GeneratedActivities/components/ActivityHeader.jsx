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
                        {activity.course}
                    </span>
                </div>

                <h1>
                    Generated Activities
                </h1>

                <h2>
                    {activity.title}
                </h2>

                <p>
                    Generated recently with
                    AI multi-type choices questions.
                    Review and edit before publishing.
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
                >
                    <Send size={10} />
                    Publish to Lesson
                </button>

            </div>

        </header>
    );
}

export default ActivityHeader;