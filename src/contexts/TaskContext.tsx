import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskContextType } from '../types';
import { taskAPI } from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch tasks from API
  const fetchTasks = async (params?: { search?: string; status?: string }) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await taskAPI.getTasks({
        limit: 100, // Get all tasks for now
        ...params
      });
      
      // Convert API response to frontend format
      const formattedTasks = response.tasks.map((task: any) => ({
        id: task._id,
        title: task.name,
        description: task.description,
        status: task.status,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user]);

  const addTask = async (title: string, description?: string) => {
    try {
      const response = await taskAPI.createTask(title, description);
      
      // Add new task to local state
      const newTask: Task = {
        id: response.task._id,
        title: response.task.name,
        description: response.task.description,
        status: response.task.status,
        createdAt: new Date(response.task.createdAt),
        updatedAt: new Date(response.task.updatedAt)
      };
      
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Update local state optimistically
      setTasks(prev => prev.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert on error
      fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskAPI.deleteTask(id);
      
      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const updateTaskStatus = async (id: string, status: 'pending' | 'in-progress' | 'completed') => {
    try {
      await taskAPI.updateTaskStatus(id, status);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === id 
          ? { ...task, status, updatedAt: new Date() }
          : task
      ));
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert on error
      fetchTasks();
      throw error;
    }
  };

  const value: TaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    isLoading,
    fetchTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};