function CourseTabs({ activeTab, setActiveTab, courses }) {

    const all = courses.length;

    const published = courses.filter(
        course => course.status === "Published"
    ).length;

    const drafts = courses.filter(
        course => course.status === "Draft"
    ).length;

    const archived = courses.filter(
        course => course.status === "Archived"
    ).length;

    const tabs = [
        {
            name: "All Courses",
            count: all
        },
        {
            name: "Published",
            count: published
        },
        {
            name: "Drafts",
            count: drafts
        },
        {
            name: "Archived",
            count: archived
        }
    ];

    return (

        <div className="course-tabs">

            {tabs.map(tab => (

                <button
                    key={tab.name}
                    className={`tab ${
                        activeTab === tab.name ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.name)}
                >

                    {tab.name}

                    <span className="tab-count">
                        {tab.count}
                    </span>

                </button>

            ))}

        </div>

    );

}

export default CourseTabs;