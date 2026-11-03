import { Sparkles } from "lucide-react";

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
                AI-powered question suggestions
                are not available on this page yet.
                You can review and edit your
                saved activity questions above.
            </p>

        </section>
    );
}

export default AIAssistant;