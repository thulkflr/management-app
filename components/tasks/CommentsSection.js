'use client';
import { useState, useEffect } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { useTasks } from '@/context/TasksContext';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';

export default function CommentsSection({ taskId }) {
    const { data: session } = useSession();
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
        if (!newComment.trim() || !session?.user) return;

        setIsSubmitting(true);
        try {
            await addComment(taskId, {
                content: newComment,
                author: session.user.name || 'Anonymous',
                authorImage: session.user.image || '',
                timestamp: new Date().toISOString(),
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
            <form onSubmit={handleAddComment} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-slate flex items-center justify-center text-brand-gold border border-card-border flex-shrink-0 overflow-hidden shadow-lg">
                    {session?.user?.image ? (
                        <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={18} />
                    )}
                </div>
                <div className="flex-1 relative">
                    <textarea 
                        rows={1}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full bg-accent-slate border border-card-border rounded-xl py-3 pl-4 pr-12 text-sm font-medium text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all resize-none min-h-[48px]"
                    />
                    <button 
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-brand-gold text-black rounded-lg shadow-md hover:scale-110 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {taskComments.length > 0 ? (
                    taskComments
                        .filter(c => c && (c.id || c.content)) 
                        .map((comment, index) => (
                            <div key={comment.id || `comment-${index}`} className="flex gap-4 group animate-in slide-in-from-bottom-2 duration-300">
                                <div className="w-10 h-10 rounded-xl bg-accent-slate flex items-center justify-center text-text-muted border border-card-border flex-shrink-0 shadow-sm overflow-hidden p-0.5">
                                    {comment.authorImage ? (
                                        <img src={comment.authorImage} alt={comment.author} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
                                            {comment.author}
                                        </h4>
                                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">
                                            {comment.timestamp ? formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true }) : 'just now'}
                                        </span>
                                    </div>
                                    <div className="bg-accent-slate/50 border border-card-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                                        <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                    )).reverse()
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center opacity-30">
                        <MessageSquare size={32} className="text-text-muted mb-3" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">No communication yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
