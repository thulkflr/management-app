'use client';
import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import AppModal, { ModalButton, ModalFooter } from '@/components/AppModal';
import Loader from '@/components/Loader';

export default function ConfirmDialog({
    isOpen,
    title = 'Confirm action',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}) {
    const [isConfirming, setIsConfirming] = useState(false);
    const icon = variant === 'danger' ? <Trash2 size={18} /> : <AlertTriangle size={18} />;

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm?.();
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <AppModal isOpen={isOpen} onClose={onCancel} title={title} icon={icon} description="This action needs your confirmation.">
            <div className="space-y-5">
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold leading-relaxed text-foreground/72">
                    {message}
                </div>
                <ModalFooter>
                    <ModalButton type="button" variant="secondary" onClick={onCancel} disabled={isConfirming}>
                        {cancelLabel}
                    </ModalButton>
                    <ModalButton type="button" variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} disabled={isConfirming}>
                        {isConfirming && <Loader size={14} />}
                        {confirmLabel}
                    </ModalButton>
                </ModalFooter>
            </div>
        </AppModal>
    );
}
