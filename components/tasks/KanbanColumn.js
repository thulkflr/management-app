// components/tasks/KanbanColumn.js
'use client';

import TaskCard from './TaskCard';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

export default function KanbanColumn({ column, tasks, onAddTask, onTaskClick }) {
    return (
        <div className="flex flex-col w-[85vw] md:w-full min-w-[280px] md:min-w-[320px] max-w-[350px] h-full bg-accent-slate/30 rounded-3xl border border-card-border overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-card-border bg-card-bg/60 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shadow-lg ${column.color || 'bg-brand-gold'}`} />
                    <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest text-foreground">
                        {column.label} 
                        <span className="ml-2 text-brand-gold font-bold opacity-40">{tasks.length}</span>
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => onAddTask(column.id)}
                        className="p-1.5 text-text-muted hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-all"
                    >
                        <Plus size={16} />
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
