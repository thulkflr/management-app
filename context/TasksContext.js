// context/TasksContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { tasksService } from '@/services/tasksService';
import { useSession } from 'next-auth/react';

const TasksContext = createContext();

export function TasksProvider({ children }) {
    const { status } = useSession();
    const [tasks, setTasks] = useState([]);
    const [columns, setColumns] = useState([]);
    const [comments, setComments] = useState({}); // Keyed by taskId
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (status !== 'authenticated') return;
        setLoading(true);
        try {
            const [tasksData, columnsData] = await Promise.all([
                tasksService.fetchTasks(),
                tasksService.fetchBoardColumns()
            ]);
            setTasks(tasksData);
            
            if (columnsData && columnsData.length > 0) {
                setColumns(columnsData);
            } else {
                // Fallback to defaults defined in constants if sheet is empty
                const { COLUMNS } = require('@/constants/taskConstants');
                setColumns(COLUMNS);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            loadData();
        } else if (status === 'unauthenticated') {
            setTasks([]);
            setComments({});
            setLoading(false);
        }
    }, [status]);

    // Column Management
    const addColumn = async (column) => {
        try {
            const result = await tasksService.addBoardColumn({
                ...column,
                id: column.id || `col-${Date.now()}`,
                order: columns.length
            });
            setColumns(prev => [...prev, result]);
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const updateColumn = async (id, updates) => {
        try {
            await tasksService.updateBoardColumn(id, updates);
            setColumns(prev => {
                const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
                // Keep it sorted by order
                return [...updated].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const reorderColumns = async (newOrder) => {
        // 1. Update local state immediately for instant feedback
        setColumns(newOrder.map((col, index) => ({ ...col, order: index })));

        // 2. Sync with database
        try {
            await Promise.all(newOrder.map((col, index) => 
                tasksService.updateBoardColumn(col.id, { order: index })
            ));
        } catch (error) {
            console.error("Failed to sync new order", error);
            // Optionally reload to revert to server state
            loadData();
        }
    };

    const deleteColumn = async (id) => {
        try {
            await tasksService.deleteBoardColumn(id);
            setColumns(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const addTask = async (task) => {
        const tempId = `temp-${Date.now()}`;
        const newTask = { 
            ...task, 
            id: tempId, 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString() 
        };

        // Optimistic update
        setTasks(prev => [newTask, ...prev]);

        try {
            const result = await tasksService.createTask({
                ...task,
                id: `${Date.now()}`, // Real ID format
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            // Update tempId with real data
            setTasks(prev => prev.map(t => t.id === tempId ? result : t));
        } catch (error) {
            setTasks(prev => prev.filter(t => t.id !== tempId));
            throw error;
        }
    };

    const updateTask = async (id, updates) => {
        const oldTask = tasks.find(t => t.id === id);
        if (!oldTask) return;

        const updatedTask = { ...oldTask, ...updates, updatedAt: new Date().toISOString() };

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));

        try {
            await tasksService.updateTask(id, { ...updates, updatedAt: new Date().toISOString() });
        } catch (error) {
            setTasks(prev => prev.map(t => t.id === id ? oldTask : t));
            throw error;
        }
    };

    const moveTask = async (taskId, newStatus) => {
        await updateTask(taskId, { status: newStatus });
    };

    const deleteTask = async (id) => {
        const oldTasks = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== id));

        try {
            await tasksService.deleteTask(id);
        } catch (error) {
            setTasks(oldTasks);
            throw error;
        }
    };

    const loadComments = async (taskId) => {
        try {
            const data = await tasksService.fetchComments(taskId);
            setComments(prev => ({ ...prev, [taskId]: data }));
        } catch (error) {
            console.error(error);
        }
    };

    const addComment = async (taskId, commentData) => {
        const tempId = `temp-comm-${Date.now()}`;
        const newComment = {
            ...commentData,
            id: tempId,
            taskId,
            timestamp: new Date().toISOString()
        };

        // Optimistic update
        setComments(prev => ({
            ...prev,
            [taskId]: [...(prev[taskId] || []), newComment]
        }));

        try {
            const result = await tasksService.addComment({
                ...commentData,
                taskId,
                timestamp: new Date().toISOString()
            });
            setComments(prev => ({
                ...prev,
                [taskId]: (prev[taskId] || []).map(c => c.id === tempId ? result : c)
            }));
        } catch (error) {
            setComments(prev => ({
                ...prev,
                [taskId]: (prev[taskId] || []).filter(c => c.id !== tempId)
            }));
            throw error;
        }
    };

    return (
        <TasksContext.Provider value={{
            tasks,
            columns,
            loading,
            refreshTasks: loadData,
            addTask,
            updateTask,
            moveTask,
            deleteTask,
            addColumn,
            updateColumn,
            reorderColumns,
            deleteColumn,
            comments,
            loadComments,
            addComment
        }}>
            {children}
        </TasksContext.Provider>
    );
}

export const useTasks = () => {
    const context = useContext(TasksContext);
    if (!context) throw new Error('useTasks must be used within TasksProvider');
    return context;
};
