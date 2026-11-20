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

                        <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />

                        <XAxis dataKey="month" stroke="#7B6C92" />

                        <YAxis stroke="#7B6C92" />

                        <Tooltip />

                        <Area
                            type="monotone"
                            dataKey="views"
                            stroke="#6D28D9"
                            fill="#DDD6FE"
                        />

                    </AreaChart>

                </ResponsiveContainer>
            </div>

        </div>

    );

}

export default CreatorAnalytics;