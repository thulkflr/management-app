'use client';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

function Btn({ onClick, icon: Icon, title, colorClass }) {
    return (
        <motion.button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            className={`p-1.5 rounded-lg transition-colors text-foreground/25 ${colorClass}`}
            title={title}
        >
            <Icon size={14} strokeWidth={2.2} />
        </motion.button>
    );
}

export default function ActionButtons({ onView, onEdit, onDelete }) {
    const hasButtons = onView || onEdit || onDelete;
    if (!hasButtons) return null;

    return (
        <div className="flex items-center gap-0.5 rounded-xl bg-white/[0.03] border border-white/[0.05] px-1 py-1">
            {onView && (
                <Btn
                    onClick={onView}
                    icon={Eye}
                    title="View"
                    colorClass="hover:text-brand-gold hover:bg-brand-gold/10"
                />
            )}
            {onEdit && (
                <Btn
                    onClick={onEdit}
                    icon={Pencil}
                    title="Edit"
                    colorClass="hover:text-emerald-400 hover:bg-emerald-400/10"
                />
            )}
            {onDelete && (
                <Btn
                    onClick={onDelete}
                    icon={Trash2}
                    title="Delete"
                    colorClass="hover:text-red-400 hover:bg-red-400/10"
                />
            )}
        </div>
    );
}
