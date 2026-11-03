import { Sparkles } from "lucide-react";

function GenerationDetails({ activity }) {
    return (
        <section className="generation-details-card">

            <div className="details-card-title">
                <Sparkles size={10} />
                Activity Details
            </div>

            <div className="details-section">
                <span className="details-label">
                    ACTIVITY TYPE
                </span>

                <strong>
                    {activity?.activityType || "N/A"}
                </strong>
            </div>

            <div className="details-section">
                <span className="details-label">
                    DIFFICULTY LEVEL
                </span>

                <strong>
                    {activity?.difficulty || "N/A"}
                </strong>
            </div>

            <div className="details-section">
                <span className="details-label">
                    ACTIVITY STATUS
                </span>

                <strong>
                    {activity?.status || "N/A"}
                </strong>
            </div>

        </section>
    );
}

export default GenerationDetails;