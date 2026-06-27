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
        <div className="flex flex-col h-full overflow-hidden">
            {/* Board Header */}
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-1">
                        Task <span className="text-brand-gold italic">Board</span>
                    </h1>
                    <p className="text-text-muted font-medium text-xs md:text-sm">Manage your production workflow and photography sessions.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="relative group flex-1 md:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-gold transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-accent-slate border border-card-border rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 md:pr-6 text-xs md:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all w-full md:w-64 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2.5 md:p-3 bg-accent-slate border border-card-border rounded-xl md:rounded-2xl text-text-muted hover:text-brand-gold hover:border-brand-gold/50 transition-all shadow-sm active:scale-90"
                    >
                        <Settings size={18} />
                    </button>
                    <button 
                        onClick={() => handleAddTask()}
                        className="flex items-center justify-center gap-2 bg-brand-gold text-black px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex-1 md:flex-none"
                    >
                        <Plus size={16} />
                        <span className="hidden xs:inline">New Task</span>
                        <span className="xs:hidden">Task</span>
                    </button>
                </div>
            </div>

            {/* Kanban Columns */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-6 md:pb-8 flex snap-x snap-mandatory scrollbar-hide md:scrollbar-default">
                    <div className="flex gap-4 md:gap-6 px-4 md:px-0 min-w-max md:min-w-0 md:flex-1 h-full min-h-[500px]">
                        {columns.map(column => (
                            <div key={column.id} className="snap-center">
                                <KanbanColumn 
                                    column={column} 
                                    tasks={filteredTasks.filter(t => t.status === column.id)}
                                    onAddTask={handleAddTask}
                                    onTaskClick={handleTaskClick}
                                />
                            </div>
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
