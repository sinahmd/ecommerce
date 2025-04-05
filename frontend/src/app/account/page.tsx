"use client";

import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">My Account</h1>
          
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="mt-1">{user?.first_name} {user?.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1">{user?.email}</p>
              </div>
              {user?.username && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Username</label>
                  <p className="mt-1">{user.username}</p>
                </div>
              )}
              {user?.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <p className="mt-1">{user.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-4">
              <button
                className="text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {/* Add functionality */}}
              >
                Change Password
              </button>
              <button
                className="text-blue-600 hover:text-blue-800 font-medium block"
                onClick={() => {/* Add functionality */}}
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 