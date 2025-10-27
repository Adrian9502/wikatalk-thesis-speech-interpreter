import React from "react";
import { Clock } from "lucide-react";

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Recent Activity
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
              {activity.user.charAt(0).toUpperCase()}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                <strong className="font-semibold">{activity.user}</strong>{" "}
                <span className="text-gray-600">{activity.action}</span>
              </p>
              <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock size={12} />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
