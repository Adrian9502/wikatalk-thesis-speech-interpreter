import React from "react";
import { Menu, Bell, User } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Menu toggle (mobile) + Title */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onMenuClick}
          >
            <Menu size={24} className="text-gray-600" />
          </button>

          <h1 className="text-xl lg:text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Admin Profile */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <User size={20} className="text-gray-600" />
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
