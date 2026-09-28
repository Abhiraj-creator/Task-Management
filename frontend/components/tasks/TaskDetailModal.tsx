'use client';

import React from 'react';
import { Task, User } from '@/types';
import { formatDate } from '@/lib/utils';
import { X, CheckCircle2, Clock, Trash2, Calendar, User as UserIcon } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onComplete?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  currentUser,
  onComplete,
  onDelete,
}) => {
  if (!isOpen || !task) return null;

  const isPending = task.status === 'pending';
  const isAssignedToMe = currentUser && task.assigned_to === currentUser.id;
  const isCreatedByMe = currentUser && task.created_by === currentUser.id;

  const handleComplete = () => {
    if (onComplete) {
      onComplete(task.id);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
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

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h2>
            {task.description ? (
              <p className="text-slate-600 text-sm whitespace-pre-line">{task.description}</p>
            ) : (
              <p className="text-slate-400 text-sm italic">No detailed description provided.</p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Created By</p>
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  {task.creator?.name?.[0] || 'U'}
                </div>
                <span>{task.creator?.name || 'Unknown'}</span>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigned To</p>
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                  {task.assignee?.name?.[0] || 'U'}
                </div>
                <span>{task.assignee?.name || 'Unknown'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Created Date</p>
              <p className="text-slate-700 font-medium">{formatDate(task.created_at)}</p>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Completed Date</p>
              <p className="text-slate-700 font-medium">
                {task.completed_at ? formatDate(task.completed_at) : 'Not completed yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div>
            {isCreatedByMe && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Task
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            {isPending && isAssignedToMe && (
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
