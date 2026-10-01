import { Bot, ShieldCheck, ArrowRight } from "lucide-react";

function BottomCards() {
    return (
        <div className="bottom-cards">

            {/* AI Generator Card */}
            <div className="info-card">

                <div className="card-icon purple">
                    <Bot size={28} />
                </div>

                <h3>AI Course Generator</h3>

                <p>
                    Leverage AI to generate course outlines, lesson plans,
                    quizzes, and learning activities in minutes.
                </p>

                <button className="card-btn">
                    Try Beta Feature
                    <ArrowRight size={16} />
                </button>

            </div>

            {/* Quality Assurance Card */}
            <div className="info-card">

                <div className="card-icon green">
                    <ShieldCheck size={28} />
                </div>

                <h3>Quality Assurance</h3>

                <p>
                    Review course quality using institution standards before
                    publishing to students.
                </p>

                <button className="card-btn">
                    Review Guidelines
                    <ArrowRight size={16} />
                </button>

            </div>

        </div>
    );
}

export default BottomCards;