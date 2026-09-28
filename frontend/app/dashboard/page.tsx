'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TaskCard } from '@/components/tasks/TaskCard';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { User, Task } from '@/types';
import { checkAuth } from '@/lib/auth';
import { getTasks, completeTask, deleteTask } from '@/lib/api';
import { AlertCircle, CheckCircle2, ListTodo, Loader2, Plus, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter tab state
  const [activeTab, setActiveTab] = useState<'all' | 'my-tasks' | 'created-by-me'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTaskData = useCallback(async () => {
    setError(null);
    const res = await getTasks();
    if (res.success && res.data) {
      setTasks(res.data);
    } else if (res.error) {
      setError(res.error.message);
    }
  }, []);

  useEffect(() => {
    checkAuth().then((userData) => {
      if (!userData) {
        window.location.href = '/login';
        return;
      }
      setUser(userData);
      fetchTaskData().finally(() => setLoading(false));
    });
  }, [fetchTaskData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTaskData();
    setRefreshing(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCompleteTask = async (taskId: string) => {
    const res = await completeTask(taskId);
    if (res.success) {
      showToast('Task marked as completed! Notification email sent.');
      fetchTaskData();
    } else {
      setError(res.error?.message || 'Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const res = await deleteTask(taskId);
    if (res.success) {
      showToast('Task deleted successfully.');
      fetchTaskData();
    } else {
      setError(res.error?.message || 'Failed to delete task');
    }
  };

  // Filter tasks based on activeTab
  const filteredTasks = tasks.filter((t) => {
    if (!user) return true;
    if (activeTab === 'my-tasks') return t.assigned_to === user.id;
    if (activeTab === 'created-by-me') return t.created_by === user.id;
    return true;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    assignedToMe: user ? tasks.filter((t) => t.assigned_to === user.id).length : 0,
    createdByMe: user ? tasks.filter((t) => t.created_by === user.id).length : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      {/* Main Content Layout with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          taskCounts={{
            total: stats.total,
            assignedToMe: stats.assignedToMe,
            createdByMe: stats.createdByMe,
          }}
        />

        {/* Dashboard Main Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-emerald-100 hover:text-white text-xs font-bold px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={handleRefresh}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Welcome Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {user?.name || 'User'} 👋
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Here is your live neural task stream & workload overview.
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-xs font-semibold shadow-sm flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats Bar */}
          <StatsCard
            total={stats.total}
            pending={stats.pending}
            completed={stats.completed}
            assignedToMe={stats.assignedToMe}
          />

          {/* Tasks Section Header */}
          <div className="flex items-center justify-between pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-blue-600" />
              <span>
                {activeTab === 'all' && 'All Dashboard Tasks'}
                {activeTab === 'my-tasks' && 'Tasks Assigned To Me'}
                {activeTab === 'created-by-me' && 'Tasks Created By Me'}
              </span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                {filteredTasks.length}
              </span>
            </h2>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>

          {/* Tasks Grid / Empty State */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center my-8 space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <ListTodo className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No tasks found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  {activeTab === 'my-tasks'
                    ? 'No tasks are currently assigned to you.'
                    : activeTab === 'created-by-me'
                    ? 'You have not created any tasks yet.'
                    : 'Get started by creating your first task!'}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUser={user}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  onClick={(t) => setSelectedTask(t)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          showToast('Task created successfully & assignment email sent!');
          fetchTaskData();
        }}
        currentUser={user}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        currentUser={user}
        onComplete={handleCompleteTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
