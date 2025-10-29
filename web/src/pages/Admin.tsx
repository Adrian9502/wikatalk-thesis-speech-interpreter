import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminThemeProvider } from "../context/AdminThemeProvider";
import { useAdminTheme } from "../hooks/useAdminTheme";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import DashboardOverview from "../components/admin/DashboardOverview";
import UserManagement from "../components/admin/UserManagement";
import ContentManagement from "../components/admin/ContentManagement";
import AnalyticsView from "../components/admin/AnalyticsView";
import SystemSettings from "../components/admin/SystemSettings";

type AdminView = "dashboard" | "users" | "content" | "analytics" | "settings";

const AdminContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useAdminTheme();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as AdminView);
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UserManagement />;
      case "content":
        return <ContentManagement />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return <SystemSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div
      className={`
        flex min-h-screen transition-colors duration-200 font-[family-name:var(--font-roboto)]
        ${
          isDark
            ? "bg-[var(--color-admin-bg-dark)]"
            : "bg-[var(--color-admin-bg-light)]"
        }
      `}
    >
      <AdminSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto admin-scrollbar">
          <div className="max-w-7xl mx-auto animate-[var(--animate-fade-in)]">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

const Admin: React.FC = () => {
  return (
    <AdminThemeProvider>
      <AdminContent />
    </AdminThemeProvider>
  );
};

export default Admin;
