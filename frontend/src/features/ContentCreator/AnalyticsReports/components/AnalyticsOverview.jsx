import {
    Target,
    CheckCircle2,
    Users,
    Clock3
} from "lucide-react";

import {
    analyticsOverview
} from "../data/AnalyticsReportsData.js";

const iconMap = {
    score: Target,
    completion: CheckCircle2,
    students: Users,
    time: Clock3
};

function AnalyticsOverview({ data }) {
    return (
        <div className="analytics-overview">

            {analyticsOverview.map((item) => {
                const Icon = iconMap[item.icon];

                return (
                    <div
                        className="analytics-kpi-card"
                        key={item.id}
                    >
                        <div className="analytics-kpi-icon">
                            <Icon size={12} />
                        </div>

                        <div className="analytics-kpi-content">

                            <span>
                                {item.label}
                            </span>

                            <strong>
                                {item.value}

                                {item.suffix && (
                                    <small>
                                        {item.suffix}
                                    </small>
                                )}
                            </strong>

                        </div>
                    </div>
                );
            })}

        </div>
    );
}

export default AnalyticsOverview;