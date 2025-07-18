import { SearchIcon, LogOutIcon, TrashIcon, ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { useTask } from "../../contexts/TaskContext";
import { DeleteTaskModal } from "../../components/DeleteTaskModal";

export const DashboardWelcome = (): JSX.Element => {
  const { user, logout } = useAuth();
  const { tasks, updateTaskStatus, deleteTask } = useTask();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  
  const TASKS_PER_PAGE = 6;
  
  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  // Get current tasks based on active tab
  const currentTasks = activeTab === 'pending' ? pendingTasks : completedTasks;
  
  // Calculate pagination
  const totalPages = Math.ceil(currentTasks.length / TASKS_PER_PAGE);
  const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
  const endIndex = startIndex + TASKS_PER_PAGE;
  const currentPageTasks = currentTasks.slice(startIndex, endIndex);
  
  // Reset to page 1 when switching tabs
  const handleTabChange = (tab: 'pending' | 'completed') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-pink-100 text-[#ec4c7d] border-pink-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-600 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {/* Search bar */}
            <div className="flex items-center gap-4 px-6 py-3 border border-gray-300 rounded-full w-96">
              <SearchIcon className="w-4 h-4 text-gray-400" />
              <Input
                className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto placeholder:text-gray-400"
                type="text"
                placeholder="Search for tasks"
              />
            </div>

            {/* User profile section */}
            <div className="flex items-center gap-6">
              <span className="font-semibold text-black">
                {user?.name || 'Selam Girma'}
              </span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100"
              >
                <LogOutIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Show empty state if no tasks exist */}
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <h2 className="text-2xl font-bold text-black mb-4">No Task Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md">
                No tasks created yet, You can start by clicking the add new button below to create one
              </p>
              <Button
                onClick={() => navigate('/add-task')}
                className="bg-[#ec4c7d] hover:bg-[#d43e6b] text-white px-8 py-3 rounded-lg flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Add New
              </Button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-0 mb-8">
                <button
                  onClick={() => handleTabChange('pending')}
                  className={`px-6 py-3 font-medium rounded-l-lg border ${
                    activeTab === 'pending'
                      ? 'bg-[#ec4c7d] text-white border-[#ec4c7d]'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleTabChange('completed')}
                  className={`px-6 py-3 font-medium rounded-r-lg border-t border-r border-b ${
                    activeTab === 'completed'
                      ? 'bg-[#ec4c7d] text-white border-[#ec4c7d]'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'pending' ? (
                <div>
                  {/* Header with task count and Add New button */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">
                        You've got <span className="text-[#ec4c7d]">{pendingTasks.length} task</span> today
                      </h2>
                      <h3 className="text-xl font-semibold text-black">On Hold</h3>
                    </div>
                    <Button
                      onClick={() => navigate('/add-task')}
                      className="bg-[#ec4c7d] hover:bg-[#d43e6b] text-white px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                      <span className="text-lg">+</span>
                      Add New
                    </Button>
                  </div>

                  {/* Tasks list */}
                  {currentPageTasks.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-500 text-lg">No pending tasks</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentPageTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-[#ec4c7d] rounded-full"></div>
                            <div className="relative">
                              <span 
                                className="text-black font-medium cursor-pointer hover:text-[#ec4c7d] transition-colors"
                                onMouseEnter={() => setHoveredTask(task.id)}
                                onMouseLeave={() => setHoveredTask(null)}
                              >
                                {task.title}
                              </span>
                              {hoveredTask === task.id && task.description && (
                                <div className="absolute left-0 top-full mt-2 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg z-10 max-w-xs whitespace-normal">
                                  {task.description}
                                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                                className={`appearance-none px-4 py-2 rounded-lg border text-sm font-medium pr-8 ${getStatusColor(task.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                            <Button
                              onClick={() => handleDeleteClick(task.id)}
                              variant="ghost"
                              size="sm"
                              className="p-2 text-red-500 hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {pendingTasks.length > TASKS_PER_PAGE && (
                    <div className="flex items-center justify-between mt-8">
                      <span className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, pendingTasks.length)} of {pendingTasks.length} entries
                      </span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#ec4c7d] disabled:opacity-50" 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant="ghost"
                            size="sm"
                            className={page === currentPage ? "bg-[#ec4c7d] text-white" : ""}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#ec4c7d] disabled:opacity-50" 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Completed tab content */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">Completed</h2>
                      <span className="inline-block px-3 py-1 bg-pink-100 text-[#ec4c7d] rounded-full text-sm">
                        Inactive
                      </span>
                    </div>
                  </div>

                  {/* Completed tasks list */}
                  {currentPageTasks.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-500 text-lg">No completed tasks</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentPageTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-[#ec4c7d] rounded-full"></div>
                            <div className="relative">
                              <span 
                                className="text-gray-500 font-medium cursor-pointer hover:text-[#ec4c7d] transition-colors"
                                onMouseEnter={() => setHoveredTask(task.id)}
                                onMouseLeave={() => setHoveredTask(null)}
                              >
                                {task.title}
                              </span>
                              {hoveredTask === task.id && task.description && (
                                <div className="absolute left-0 top-full mt-2 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg z-10 max-w-xs whitespace-normal">
                                  {task.description}
                                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                                className={`appearance-none px-4 py-2 rounded-lg border text-sm font-medium pr-8 ${getStatusColor(task.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                            <Button
                              onClick={() => handleDeleteClick(task.id)}
                              variant="ghost"
                              size="sm"
                              className="p-2 text-red-500 hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination for completed */}
                  {completedTasks.length > TASKS_PER_PAGE && (
                    <div className="flex items-center justify-between mt-8">
                      <span className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, completedTasks.length)} of {completedTasks.length} entries
                      </span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#ec4c7d] disabled:opacity-50" 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant="ghost"
                            size="sm"
                            className={page === currentPage ? "bg-[#ec4c7d] text-white" : ""}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#ec4c7d] disabled:opacity-50" 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <DeleteTaskModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        taskTitle={taskToDelete ? tasks.find(t => t.id === taskToDelete)?.title || '' : ''}
      />
    </>
  );
};