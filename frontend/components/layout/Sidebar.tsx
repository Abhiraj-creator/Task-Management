'use client';

import React from 'react';
import { LayoutDashboard, CheckSquare, ListPlus, UserCheck, Plus } from 'lucide-react';

interface SidebarProps {
  activeTab: 'all' | 'my-tasks' | 'created-by-me';
  onTabChange: (tab: 'all' | 'my-tasks' | 'created-by-me') => void;
  onOpenCreateModal: () => void;
  taskCounts: {
    total: number;
    assignedToMe: number;
    createdByMe: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateModal,
  taskCounts,
}) => {
  const navItems = [
    {
      id: 'all' as const,
      label: 'All Dashboard Tasks',
      icon: LayoutDashboard,
      count: taskCounts.total,
    },
    {
      id: 'my-tasks' as const,
      label: 'My Tasks (Assigned to Me)',
      icon: UserCheck,
      count: taskCounts.assignedToMe,
    },
    {
      id: 'created-by-me' as const,
      label: 'Created Tasks',
      icon: ListPlus,
      count: taskCounts.createdByMe,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Create Task Action Button */}
        <button
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Create Task</span>
        </button>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="hidden md:block pt-6 border-t border-slate-100 text-xs text-slate-400">
        <p className="font-semibold text-slate-500">TaskManager v1.0</p>
        <p className="mt-0.5">Google OAuth & Gmail Integrated</p>
      </div>
    </aside>
  );
};
