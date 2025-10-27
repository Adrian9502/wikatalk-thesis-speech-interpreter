import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");
      const adminUser = localStorage.getItem("adminUser");

      if (!token || !adminUser) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const user = JSON.parse(adminUser);

        // Use VITE_API_URL
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

        // Verify token is still valid by making a test request
        const response = await fetch(`${apiUrl}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (
          response.ok &&
          (user.role === "admin" || user.role === "superadmin")
        ) {
          setIsAuthenticated(true);
        } else {
          // Token invalid or not admin
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
