export const profileData = {
    fullName: "Alex Rivera",
    email: "alex@edugenai.studio",
    role: "Content Creator"
};

export const workspaceData = {
    defaultStartPage: "Dashboard Overview"
};

export const notificationPreferences = [
    {
        id: "activity",
        label: "AI Activity Generation",
        description: "Get notified when your AI activity finishes processing.",
        enabled: true
    },
    {
        id: "publishing",
        label: "Content Publishing Alerts",
        description: "Updates about scheduled and live course materials.",
        enabled: true
    },
    {
        id: "performance",
        label: "Performance Insights",
        description: "Weekly summaries of your student engagement.",
        enabled: false
    },
    {
        id: "system",
        label: "System Notifications",
        description: "Critical platform updates and maintenance info.",
        enabled: true
    }
];

export const workspaceOptions = [
    "Dashboard Overview",
    "Analytics & Reports",
    "Content Creation",
    "Student Engagement"
];