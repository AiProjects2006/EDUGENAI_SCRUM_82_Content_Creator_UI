import "./CreatorAnalytics.css";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

import { performanceData } from "../../data/creatorDashboardData";

function CreatorAnalytics() {

    return (

        <div className="creator-analytics">

            <h3>Content Performance</h3>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">

                    <AreaChart data={performanceData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="month" />

                        <YAxis />

                        <Tooltip />

                        <Area
                            type="monotone"
                            dataKey="views"
                            stroke="#7c3aed"
                            fill="#c4b5fd"
                        />

                    </AreaChart>

                </ResponsiveContainer>
            </div>

        </div>

    );

}

export default CreatorAnalytics;