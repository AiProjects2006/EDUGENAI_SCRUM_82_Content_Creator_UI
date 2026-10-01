import "./ContentCreation.css";

import BackofficeLayout from "../../../components/layout/BackofficeLayout.jsx";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";

import { Plus } from "lucide-react";

function ContentCreation() {

    return (

        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="content-page">

                <div className="content-header">

                    <div>

                        <h1>Content Creation</h1>

                        <p>
                            Create and manage AI-powered educational content.
                        </p>

                    </div>

                    <button className="new-content-btn">

                        <Plus size={18} />

                        <span>New Content</span>

                    </button>

                </div>

            </div>

        </BackofficeLayout>

    );

}

export default ContentCreation;