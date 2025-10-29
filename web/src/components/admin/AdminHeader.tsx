import React from "react";
import { Menu, Bell, User, Sun, Moon } from "lucide-react";
import { useAdminTheme } from "../../hooks/useAdminTheme";

interface AdminHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const { toggleTheme, isDark } = useAdminTheme();

  return (
    <header
      className={`
        sticky top-0 z-30 border-b backdrop-blur-sm bg-opacity-95
        transition-all duration-200
        ${
          isDark
            ? "bg-[var(--color-admin-surface-dark)] border-[var(--color-admin-border-dark)]"
            : "bg-[var(--color-admin-surface-light)] border-[var(--color-admin-border-light)]"
        }
      `}
    >
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className={`
              lg:hidden p-2 rounded-lg transition-colors
              ${
                isDark
                  ? "text-[var(--color-admin-text-dark)] hover:bg-[var(--color-admin-surface-hover-dark)]"
                  : "text-[var(--color-admin-text-light)] hover:bg-[var(--color-admin-surface-hover-light)]"
              }
            `}
          >
            <Menu size={22} />
          </button>

          <h1
            className={`
              text-lg md:text-xl font-medium
              ${
                isDark
                  ? "text-[var(--color-admin-text-dark)]"
                  : "text-[var(--color-admin-text-light)]"
              }
            `}
          >
            WikaTalk Admin
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              p-2.5 rounded-lg transition-all duration-200 hover:scale-110
              ${
                isDark
                  ? "text-[var(--color-admin-text-dark)] bg-[var(--color-admin-surface-hover-dark)]"
                  : "text-[var(--color-admin-text-light)] bg-[var(--color-admin-surface-hover-light)]"
              }
            `}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button
            className={`
              relative p-2.5 rounded-lg transition-colors
              ${
                isDark
                  ? "text-[var(--color-admin-text-dark)] hover:bg-[var(--color-admin-surface-hover-dark)]"
                  : "text-[var(--color-admin-text-light)] hover:bg-[var(--color-admin-surface-hover-light)]"
              }
            `}
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-admin-error)] rounded-full animate-pulse" />
          </button>

          {/* Profile */}
          <div
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg
              ${
                isDark
                  ? "bg-[var(--color-admin-surface-hover-dark)]"
                  : "bg-[var(--color-admin-surface-hover-light)]"
              }
            `}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-admin-primary-light)] flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <span
              className={`
                hidden sm:inline text-sm font-medium
                ${
                  isDark
                    ? "text-[var(--color-admin-text-dark)]"
                    : "text-[var(--color-admin-text-light)]"
                }
              `}
            >
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
