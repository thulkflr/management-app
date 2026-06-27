// components/tasks/KanbanColumn.js
'use client';

import TaskCard from './TaskCard';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

export default function KanbanColumn({ column, tasks, onAddTask, onTaskClick }) {
    return (
        <div className="flex flex-col w-full min-w-[300px] max-w-[350px] h-full bg-slate-100/50 rounded-3xl border border-slate-200/60 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-200/40 bg-white/40 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-700">
                        {column.label} 
                        <span className="ml-2 text-slate-400 font-bold opacity-50">{tasks.length}</span>
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => onAddTask(column.id)}
                        className="p-1.5 text-slate-400 hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-all"
                    >
                        <Plus size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                    <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-3 flex-1 overflow-y-auto scrollbar-hide space-y-1 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-brand-gold/5' : ''}`}
                    >
                        {tasks.length > 0 ? (
                            tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <TaskCard 
                                                task={task} 
                                                onClick={onTaskClick} 
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))
                        ) : (
                            <div className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                Empty Column
                            </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
