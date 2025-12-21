import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    loading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Procced',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}: ConfirmModalProps) {
    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <AlertTriangle className="w-6 h-6 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-6 h-6 text-amber-600" />;
            case 'primary':
                return <HelpCircle className="w-6 h-6 text-primary-600" />;
            default:
                return <AlertTriangle className="w-6 h-6 text-red-600" />;
        }
    };

    const getIconContainerClass = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-50';
            case 'warning':
                return 'bg-amber-50';
            case 'primary':
                return 'bg-primary-50';
            default:
                return 'bg-red-50';
        }
    };

    const getConfirmButtonVariant = () => {
        switch (variant) {
            case 'danger':
                return 'danger';
            case 'warning':
                return 'warning';
            case 'primary':
                return 'primary';
            default:
                return 'danger';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            maxWidth="sm"
        >
            <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-2xl ${getIconContainerClass()} mb-4`}>
                    {getIcon()}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {title}
                </h3>
                
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                    {message}
                </p>

                <div className="mt-8 flex flex-col md:flex-row gap-3 w-full">
                    <Button
                        variant="soft"
                        onClick={onClose}
                        className="flex-1 border-slate-200 text-slate-600 font-semibold"
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={getConfirmButtonVariant()}
                        onClick={onConfirm}
                        className="flex-1 font-bold uppercase tracking-widest text-[11px]"
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
