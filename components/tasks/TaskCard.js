// components/tasks/TaskCard.js
'use client';

import { Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { TASK_PRIORITIES, TASK_TYPES } from '@/constants/taskConstants';
import { format } from 'date-fns';

export default function TaskCard({ task, onClick }) {
    const priority = TASK_PRIORITIES[task.priority?.toUpperCase()] || TASK_PRIORITIES.MEDIUM;
    const taskType = TASK_TYPES.find(t => t.id === task.type) || TASK_TYPES[0];

    return (
        <div
            onClick={() => onClick(task)}
            className="group bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-brand-gold/50 transition-all duration-300 cursor-pointer active:scale-95 mb-3"
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${priority.bg} ${priority.color}`}>
                    {priority.label}
                </span>
                <span className="text-slate-400 group-hover:text-brand-gold transition-colors">
                    <Clock size={14} />
                </span>
            </div>

            <h4 className="font-bold text-slate-800 mb-1 line-clamp-2 leading-snug group-hover:text-brand-gold transition-colors">
                {task.title}
            </h4>
            
            <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                {task.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600">
                    <span className="text-slate-400 group-hover:text-brand-gold transition-colors">⚡</span>
                    {taskType.label}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold border border-brand-gold/10">
                        <User size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">
                        {task.assignee || 'Unassigned'}
                    </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                        <Calendar size={12} />
                        {format(new Date(task.dueDate), 'MMM d')}
                    </div>
                  )}
                  {task.commentCount > 0 && (
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                        <MessageSquare size={12} />
                        {task.commentCount}
                    </div>
                  )}
                </div>
            </div>
        </div>
    );
}
