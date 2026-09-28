'use client';

import React from 'react';
import { Task, User } from '@/types';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, Clock, Trash2, User as UserIcon, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  currentUser: User | null;
  onComplete?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUser,
  onComplete,
  onDelete,
  onClick,
}) => {
  const isPending = task.status === 'pending';
  const isAssignedToMe = currentUser && task.assigned_to === currentUser.id;
  const isCreatedByMe = currentUser && task.created_by === currentUser.id;

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) onClick(task);
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComplete) onComplete(task.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div className="space-y-3">
        {/* Header: Title & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
            {task.title}
          </h3>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
              isPending
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isPending ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Pending
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Completed
              </>
            )}
          </span>
        </div>

        {/* Description */}
        {task.description ? (
          <p className="text-slate-600 text-sm line-clamp-3">{task.description}</p>
        ) : (
          <p className="text-slate-400 text-sm italic">No description provided</p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
        {/* Creator & Assignee */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-medium text-slate-400 shrink-0">By:</span>
            <span className="font-semibold text-slate-700 truncate">
              {task.creator?.name || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-medium text-slate-400 shrink-0">To:</span>
            <span className="font-semibold text-slate-700 truncate">
              {task.assignee?.name || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Date & Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(task.created_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            {isPending && isAssignedToMe && onComplete && (
              <button
                onClick={handleCompleteClick}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                title="Mark task as completed"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Complete
              </button>
            )}

            {isCreatedByMe && onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
