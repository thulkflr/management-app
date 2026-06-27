// components/tasks/KanbanBoard.js
'use client';

import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';
import ColumnSettingsModal from './ColumnSettingsModal';
import { useTasks } from '@/context/TasksContext';
import { Loader2, Search, Filter, Plus, Settings } from 'lucide-react';

import { DragDropContext } from '@hello-pangea/dnd';

export default function KanbanBoard() {
    const { tasks, columns, loading, addTask, moveTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTasks = tasks.filter(t => 
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistic update already handled by moveTask in context (which calls updateTask)
        moveTask(draggableId, destination.droppableId);
    };

    const handleAddTask = (status) => {
        const defaultStatus = columns[0]?.id || 'planning';
        setSelectedTask({ status: status || defaultStatus });
        setIsModalOpen(true);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    if (loading && tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="animate-spin text-brand-gold mb-4" size={40} />
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Board...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Board Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Task <span className="text-brand-gold italic">Board</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">Manage your production workflow and photography sessions.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-gold transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all w-64"
                        />
                    </div>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-brand-gold hover:border-brand-gold/50 transition-all shadow-sm active:scale-90"
                    >
                        <Settings size={20} />
                    </button>
                    <button 
                        onClick={() => handleAddTask()}
                        className="flex items-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={18} />
                        New Task
                    </button>
                </div>
            </div>

            {/* Kanban Columns */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <div className="flex gap-6 h-full min-h-[500px]">
                        {columns.map(column => (
                            <KanbanColumn 
                                key={column.id} 
                                column={column} 
                                tasks={filteredTasks.filter(t => t.status === column.id)}
                                onAddTask={handleAddTask}
                                onTaskClick={handleTaskClick}
                            />
                        ))}
                    </div>
                </div>
            </DragDropContext>

            {isSettingsOpen && (
                <ColumnSettingsModal 
                    onClose={() => setIsSettingsOpen(false)} 
                />
            )}

            {isModalOpen && (
                <TaskModal 
                    task={selectedTask} 
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTask(null);
                    }} 
                />
            )}
        </div>
    );
}
