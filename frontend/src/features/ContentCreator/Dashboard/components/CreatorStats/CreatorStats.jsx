import "./CreatorStats.css";

function CreatorStats({ title, value, icon: Icon }) {
    return (
        <div className="creator-stat-card">

            <div className="creator-stat-icon">
                <Icon />
            </div>

            <h2 className="creator-stat-value">
                {value}
            </h2>

            <p className="creator-stat-title">
                {title}
            </p>

        </div>
    );
}

export default CreatorStats;