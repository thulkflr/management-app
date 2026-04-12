import { Pencil, Trash2, Eye } from 'lucide-react';

export default function ActionButtons({ onView, onEdit, onDelete }) {
    return (
        <div className="flex items-center gap-2">
            {onView && (
                <button
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                    className="p-1.5 text-slate-400 hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg transition"
                    title="View"
                >
                    <Eye size={18} />
                </button>
            )}
            {onEdit && (
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition"
                    title="Edit"
                >
                    <Pencil size={18} />
                </button>
            )}
            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );
}
