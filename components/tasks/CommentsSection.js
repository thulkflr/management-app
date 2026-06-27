// components/tasks/CommentsSection.js
'use client';

import { useState, useEffect } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { useTasks } from '@/context/TasksContext';
import { formatDistanceToNow } from 'date-fns';

export default function CommentsSection({ taskId }) {
    const { comments, loadComments, addComment } = useTasks();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const taskComments = comments[taskId] || [];

    useEffect(() => {
        if (!comments[taskId]) {
            loadComments(taskId);
        }
    }, [taskId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await addComment(taskId, {
                content: newComment,
                author: 'Admin', // In a real app, this would be the logged-in user
            });
            setNewComment('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 space-y-8">
            <div className="flex items-center gap-3 border-b border-brand-gold/10 pb-4">
                <MessageSquare className="text-brand-gold" size={20} />
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">
                    Activity & Comments
                </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20 flex-shrink-0">
                    <User size={18} />
                </div>
                <div className="flex-1 relative">
                    <textarea 
                        rows={1}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all resize-none min-h-[48px]"
                    />
                    <button 
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-brand-gold text-black rounded-xl shadow-md hover:scale-110 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {taskComments.length > 0 ? (
                    taskComments
                        .filter(c => c && (c.id || c.content)) // Filter out empty or invalid comments
                        .map((comment, index) => (
                            <div key={comment.id || `comment-${index}`} className="flex gap-4 group animate-in slide-in-from-bottom-2 duration-300">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0 transition-all group-hover:bg-brand-gold/10 group-hover:text-brand-gold group-hover:border-brand-gold/20">
                                <User size={18} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-baseline justify-between mb-1">
                                    <h4 className="text-xs font-black text-slate-900 tracking-tight">{comment.author}</h4>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {comment.timestamp ? formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true }) : 'just now'}
                                    </span>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none">
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )).reverse()
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center opacity-40">
                        <MessageSquare size={32} className="text-slate-300 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No comments yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
