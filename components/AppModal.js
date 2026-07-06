'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Info, Pencil, Sparkles } from 'lucide-react';

const overlayVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1 },
};

const sheetVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.95, filter: 'blur(8px)' },
    show: {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
        transition: { type: 'spring', stiffness: 360, damping: 34, mass: 0.9 },
    },
    exit: {
        opacity: 0, y: 18, scale: 0.96, filter: 'blur(6px)',
        transition: { duration: 0.16, ease: 'easeIn' },
    },
};

function DefaultTitleIcon({ title }) {
    const lower = String(title || '').toLowerCase();
    if (lower.includes('edit')) return <Pencil size={18} />;
    if (lower.includes('detail')) return <Eye size={18} />;
    if (lower.includes('new') || lower.includes('create')) return <Sparkles size={18} />;
    return <Info size={18} />;
}

export function ModalFooter({ children, className = '' }) {
    return (
        <div className={`premium-modal-footer -mx-6 -mb-6 mt-7 px-6 py-4 sm:-mx-7 sm:-mb-7 sm:px-7 ${className}`}>
            {children}
        </div>
    );
}

export function ModalButton({ variant = 'secondary', className = '', children, ...props }) {
    const variants = {
        primary: 'premium-modal-button-primary',
        secondary: 'premium-modal-button-secondary',
        danger: 'premium-modal-button-danger',
    };

    return (
        <button className={`premium-modal-button ${variants[variant] || variants.secondary} ${className}`} {...props}>
            {children}
        </button>
    );
}

export function DetailCard({ icon: Icon, label, children, className = '' }) {
    return (
        <div className={`premium-detail-card ${className}`}>
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className="premium-detail-icon">
                        <Icon size={15} />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="premium-detail-label">{label}</p>
                    <div className="premium-detail-value">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default function AppModal({ isOpen, onClose, title, children, description, icon }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <motion.div
                        className="absolute inset-0 bg-black/72 backdrop-blur-xl"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={onClose}
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[86vh] overflow-hidden rounded-t-[2rem] sm:rounded-[28px] border border-white/10 bg-card-bg/95 shadow-[0_32px_110px_rgba(0,0,0,0.62)] backdrop-blur-2xl flex flex-col"
                        variants={sheetVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                    >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/8 to-transparent" />
                        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/45 to-transparent" />

                        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0 relative z-10">
                            <div className="w-10 h-1 rounded-full bg-foreground/15" />
                        </div>

                        <div className="relative z-10 flex items-start justify-between gap-4 px-6 sm:px-7 py-5 sm:py-6 border-b border-white/10 flex-shrink-0">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-2xl bg-brand-gold/12 border border-brand-gold/25 text-brand-gold flex items-center justify-center shadow-lg shadow-brand-gold/5 flex-shrink-0">
                                    {icon || <DefaultTitleIcon title={title} />}
                                </div>
                                <div className="min-w-0 pt-0.5">
                                    <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-tight truncate">
                                        {title}
                                    </h2>
                                    {description && (
                                        <p className="text-xs text-foreground/42 font-semibold mt-1 leading-relaxed">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <motion.button
                                type="button"
                                onClick={onClose}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.94 }}
                                className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/5 border border-white/8 text-foreground/45 hover:text-foreground hover:bg-white/10 hover:border-white/15 transition-colors flex-shrink-0"
                                aria-label="Close modal"
                            >
                                <X size={17} />
                            </motion.button>
                        </div>

                        <div className="premium-modal-content relative z-10 p-6 sm:p-7 overflow-y-auto overflow-x-hidden custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
