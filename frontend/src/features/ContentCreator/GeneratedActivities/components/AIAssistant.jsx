import {
    Sparkles,
    Lightbulb,
    Plus
} from "lucide-react";

import {
    assistantSuggestions
} from "../data/GeneratedActivitiesData.js";

function AIAssistant() {
    return (
        <section className="ai-assistant-card">

            <div className="ai-assistant-title">

                <div className="ai-assistant-icon">
                    <Sparkles size={10} />
                </div>

                <span>
                    AI ASSISTANT
                </span>

            </div>

            <p className="ai-assistant-intro">
                The optimized these questions for
                clarity and balance. Would you like
                to generate 3 additional high-order
                questions?
            </p>

            <div className="ai-suggestion-list">

                {assistantSuggestions.map(
                    (suggestion) => (
                        <button
                            type="button"
                            className="ai-suggestion"
                            key={suggestion}
                        >
                            <Lightbulb size={9} />

                            <span>
                                {suggestion}
                            </span>

                            <Plus size={8} />
                        </button>
                    )
                )}

            </div>

            <button
                type="button"
                className="ai-add-question-button"
            >
                <Plus size={10} />
                Add Question
            </button>

        </section>
    );
}

export default AIAssistant;