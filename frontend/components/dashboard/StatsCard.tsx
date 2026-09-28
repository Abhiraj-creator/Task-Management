'use client';

import React from 'react';
import { CheckCircle2, Clock, ListTodo, UserCheck } from 'lucide-react';

interface StatsCardProps {
  total: number;
  pending: number;
  completed: number;
  assignedToMe: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  total,
  pending,
  completed,
  assignedToMe,
}) => {
  const stats = [
    {
      label: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Assigned To Me',
      value: assignedToMe,
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border ${stat.borderColor} shadow-sm hover:shadow-md transition-all flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3.5 rounded-xl ${stat.bgColor} ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
