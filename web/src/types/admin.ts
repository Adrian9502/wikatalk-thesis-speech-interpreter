export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTranslations: number;
  totalGameAttempts: number;
  userGrowth: number;
  translationGrowth: number;
  gameGrowth: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
}

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  totalPages: number;
  currentPage: number;
  totalUsers: number;
}
