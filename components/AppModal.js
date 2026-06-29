'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const overlayVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1 },
};

const sheetVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    show: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: 'spring', stiffness: 340, damping: 32 },
    },
    exit: {
        opacity: 0, y: 30, scale: 0.97,
        transition: { duration: 0.18, ease: 'easeIn' },
    },
};

export default function AppModal({ isOpen, onClose, title, children }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        transition={{ duration: 0.22 }}
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        className="relative bg-card-bg border-t sm:border border-card-border w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh]"
                        variants={sheetVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                    >
                        {/* Mobile drag handle */}
                        <div className="sm:hidden flex justify-center pt-4 pb-1 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full bg-foreground/10" />
                        </div>

                        {/* Header */}
                        <div className="flex justify-between items-center px-6 sm:px-7 py-4 sm:py-5 border-b border-card-border flex-shrink-0">
                            <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                                {title}
                            </h2>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-foreground/30 hover:text-brand-gold hover:bg-brand-gold/10 transition-colors"
                            >
                                <X size={16} />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
