import "./AIQuickActions.css";

import {
    Brain,
    FileText,
    Layers,
    ClipboardList
} from "lucide-react";

function AIQuickActions() {

    return (

        <section className="quick-actions">

            <h2>AI Quick Actions</h2>

            <p>
                Create educational content instantly using AI.
            </p>

            <div className="actions-grid">

                <button className="action-card">

                    <Brain size={28}/>

                    <span>Generate Quiz</span>

                </button>

                <button className="action-card">

                    <FileText size={28}/>

                    <span>Create Lesson</span>

                </button>

                <button className="action-card">

                    <Layers size={28}/>

                    <span>Generate Flashcards</span>

                </button>

                <button className="action-card">

                    <ClipboardList size={28}/>

                    <span>Create Assessment</span>

                </button>

            </div>

        </section>

    );

}

export default AIQuickActions;