import "../../styles/layout.css";
import AdminSidebar from "./Sidebar/AdminSidebar.jsx";

function BackofficeLayout({ children, sidebar }) {

    return (
        <div className="layout">

            {sidebar || <AdminSidebar />}

            <main className="main-content">
                {children}
            </main>

        </div>
    );

}

export default BackofficeLayout;