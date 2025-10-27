import React from "react";
import { Plus, Upload, Download, Settings } from "lucide-react";

const QuickActions: React.FC = () => {
  const actions = [
    { id: 1, label: "Add Quiz Question", icon: Plus, color: "#4F46E5" },
    { id: 2, label: "Import Content", icon: Upload, color: "#10B981" },
    { id: 3, label: "Export Data", icon: Download, color: "#F59E0B" },
    { id: 4, label: "System Settings", icon: Settings, color: "#6B7280" },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-all duration-200 hover:-translate-y-1"
              style={{ borderColor: action.color }}
            >
              <Icon size={24} color={action.color} />
              <span className="text-sm font-medium text-gray-700 text-center">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
