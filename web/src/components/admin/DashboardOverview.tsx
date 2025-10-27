import React, { useEffect, useState } from "react";
import { Users, BookOpen, MessageSquare, Gamepad2 } from "lucide-react";
import StatCard from "./StatCard";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions";
import { getDashboardStats } from "../../services/adminApi";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTranslations: number;
  totalGameAttempts: number;
  userGrowth: number;
  translationGrowth: number;
  gameGrowth: number;
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
  }>;
}

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-800 font-semibold mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={stats.userGrowth}
          color="#4F46E5"
        />
        <StatCard
          title="Active Users (30d)"
          value={stats.activeUsers.toLocaleString()}
          icon={Users}
          color="#10B981"
        />
        <StatCard
          title="Translations"
          value={stats.totalTranslations.toLocaleString()}
          icon={BookOpen}
          trend={stats.translationGrowth}
          color="#F59E0B"
        />
        <StatCard
          title="Game Attempts"
          value={stats.totalGameAttempts.toLocaleString()}
          icon={Gamepad2}
          trend={stats.gameGrowth}
          color="#8B5CF6"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={stats.recentActivity} />
        <QuickActions />
      </div>
    </div>
  );
};

export default DashboardOverview;
