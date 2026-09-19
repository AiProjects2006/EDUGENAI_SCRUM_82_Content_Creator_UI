import { Filter, Download } from "lucide-react";

function CourseHeader() {
    return (
        <div className="course-header">

            <div className="header-text">
                <h1>Course Management</h1>

                <p>
                    Design and manage your high-performance Science, Mathematics, and ICT modules.
                </p>
            </div>

            <div className="header-actions">

                <button className="filter-btn">
                    <Filter size={18} />
                    Filter
                </button>

                <button className="export-btn">
                    <Download size={18} />
                    Export
                </button>

            </div>

        </div>
    );
}

export default CourseHeader;