import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
    workspaceData,
    workspaceOptions
} from "../data/SettingsData.js";

function WorkspaceSettings({ settings, updateSetting }) {
    const [startPage, setStartPage] = useState(
        workspaceData.defaultStartPage
    );

    const [suggestionsEnabled, setSuggestionsEnabled] =
        useState(true);

    return (
        <section className="settings-card workspace-settings-card">
            <div className="settings-card-header">
                <div className="settings-section-icon">
                    <SlidersHorizontal size={12} />
                </div>

                <div>
                    <h2>Workspace</h2>
                </div>
            </div>

            <label className="workspace-select-label">
                Default Start Page

                <select
                    value={settings.startPage}
                    onChange={(e) =>
                        updateSetting(
                            "startPage",
                            e.target.value
                        )
                    }
                >
                    <option>Dashboard Overview</option>
                    <option>Analytics Suggestions</option>
                    <option>Content Creation</option>
                    <option>Student Engagement</option>
                </select>

            </label>

            <div className="workspace-toggle-row">
                <div>
                    <strong>Analytics Suggestions</strong>
                </div>

                <button
                    type="button"
                    className={`settings-toggle ${
                        settings.analyticsSuggestions ? "active" : ""
                    }`}
                    onClick={() =>
                        updateSetting(
                            "analyticsSuggestions",
                            !settings.analyticsSuggestions
                        )
                    }
                >
                    <span />
                </button>
            </div>
        </section>
    );
}

export default WorkspaceSettings;