import React, { useState } from "react";
import { X, Save, Trash2, Shield, CheckCircle, XCircle } from "lucide-react";
import type { User } from "../../types/admin";

interface UserActionsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onChangeRole: (userId: string, role: string) => Promise<void>;
  onToggleVerification: (userId: string) => Promise<void>;
  currentUserRole: string;
}

const UserActionsModal: React.FC<UserActionsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onChangeRole,
  onToggleVerification,
  currentUserRole,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "role" | "danger">(
    "edit"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit form state
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);

  // Role change state - FIX: Type the selectedRole properly
  const [selectedRole, setSelectedRole] = useState<
    "user" | "admin" | "superadmin"
  >(user.role);

  if (!isOpen) return null;

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await onUpdate(user._id, {
        fullName,
        username,
        email,
      });
      setSuccess("User updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update user";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (selectedRole === user.role) {
      setError("Please select a different role");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await onChangeRole(user._id, selectedRole);
      setSuccess("Role changed successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change role";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVerification = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await onToggleVerification(user._id);
      setSuccess(
        `User ${user.isVerified ? "unverified" : "verified"} successfully!`
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle verification";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onDelete(user._id);
      setSuccess("User deleted successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete user";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Manage User: {user.fullName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "edit"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Edit Details
          </button>
          {currentUserRole === "superadmin" && (
            <button
              onClick={() => setActiveTab("role")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "role"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Change Role
            </button>
          )}
          {currentUserRole === "superadmin" && (
            <button
              onClick={() => setActiveTab("danger")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "danger"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Danger Zone
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle
                size={20}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-green-600 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Edit Details Tab */}
          {activeTab === "edit" && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Verification Status
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user.isVerified
                      ? "User is verified"
                      : "User is not verified"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleVerification}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    user.isVerified
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {user.isVerified ? "Unverify" : "Verify"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                <span>{isLoading ? "Saving..." : "Save Changes"}</span>
              </button>
            </form>
          )}

          {/* Change Role Tab */}
          {activeTab === "role" && currentUserRole === "superadmin" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current Role:</strong> {user.role}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(
                      e.target.value as "user" | "admin" | "superadmin"
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Changing user roles affects their access permissions. Use
                  with caution.
                </p>
              </div>

              <button
                onClick={handleChangeRole}
                disabled={isLoading || selectedRole === user.role}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield size={18} />
                <span>{isLoading ? "Changing Role..." : "Change Role"}</span>
              </button>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && currentUserRole === "superadmin" && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> The following actions are
                  irreversible. Please proceed with caution.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Delete User Account
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete this user and all associated data. This
                  action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteUser}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={18} />
                  <span>{isLoading ? "Deleting..." : "Delete User"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActionsModal;
