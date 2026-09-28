'use client';

import React from 'react';
import { User } from '@/types';
import { LogOut, User as UserIcon, CheckSquare } from 'lucide-react';
import { logout } from '@/lib/api';

interface NavbarProps {
  user: User | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">TaskManager</span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                  {user.name ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
