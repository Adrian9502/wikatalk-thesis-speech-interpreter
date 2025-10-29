import React from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useAdminTheme } from "../../hooks/useAdminTheme";

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  onViewChange,
  isOpen,
  onToggle,
  onLogout,
}) => {
  const { isDark } = useAdminTheme();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "content", label: "Content", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 
          flex flex-col z-50 transition-all duration-300 border-r
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${
            isDark
              ? "bg-[var(--color-admin-surface-dark)] border-[var(--color-admin-border-dark)]"
              : "bg-[var(--color-admin-surface-light)] border-[var(--color-admin-border-light)]"
          }
        `}
      >
        {/* Logo Section */}
        <div
          className={`
            p-6 border-b
            ${
              isDark
                ? "border-[var(--color-admin-border-dark)]"
                : "border-[var(--color-admin-border-light)]"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-admin-primary-light)] to-[var(--color-admin-primary-hover-light)] flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2
                className={`
                  text-lg font-bold
                  ${
                    isDark
                      ? "text-[var(--color-admin-text-dark)]"
                      : "text-[var(--color-admin-text-light)]"
                  }
                `}
              >
                WikaTalk
              </h2>
              <p
                className={`
                  text-xs
                  ${
                    isDark
                      ? "text-[var(--color-admin-text-tertiary-dark)]"
                      : "text-[var(--color-admin-text-tertiary-light)]"
                  }
                `}
              >
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto admin-scrollbar">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-[var(--color-admin-primary-light)] text-white shadow-lg shadow-[var(--color-admin-primary-light)]/30"
                        : isDark
                        ? "text-[var(--color-admin-text-secondary-dark)] hover:bg-[var(--color-admin-surface-hover-dark)] hover:text-[var(--color-admin-text-dark)]"
                        : "text-[var(--color-admin-text-secondary-light)] hover:bg-[var(--color-admin-surface-hover-light)] hover:text-[var(--color-admin-text-light)]"
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? "animate-pulse" : ""} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Section */}
        <div
          className={`
            p-4 border-t
            ${
              isDark
                ? "border-[var(--color-admin-border-dark)]"
                : "border-[var(--color-admin-border-light)]"
            }
          `}
        >
          <button
            onClick={onLogout}
            className="
              w-full flex items-center gap-3 px-4 py-3 rounded-lg 
              text-sm font-medium transition-all duration-200
              text-[var(--color-admin-error)] hover:bg-[var(--color-admin-error)]/10
            "
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
