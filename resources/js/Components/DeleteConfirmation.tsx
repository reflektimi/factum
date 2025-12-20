import ConfirmModal from './ui/ConfirmModal';

interface DeleteConfirmationProps {
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'primary';
}

export default function DeleteConfirmation({
    show,
    title,
    message,
    confirmText = 'Procced',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'danger',
}: DeleteConfirmationProps) {
    return (
        <ConfirmModal
            isOpen={show}
            onClose={onCancel}
            onConfirm={onConfirm}
            title={title}
            message={message}
            confirmText={confirmText}
            cancelText={cancelText}
            variant={type}
        />
    );
}
