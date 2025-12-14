import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types/models';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { Transition } from '@headlessui/react';

export default function FlashMessage() {
    const { flash } = usePage<PageProps>().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error' | 'info'>('success');

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
        } else if (flash?.message) {
            setMessage(flash.message);
            setType('info');
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleClose = () => setVisible(false);

    return (
        <div className="fixed top-20 right-4 z-[100] w-full max-w-sm flex flex-col gap-2 pointer-events-none">
            <Transition
                show={visible}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className={`pointer-events-auto w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${type === 'success' ? 'border-l-4 border-green-500' : type === 'error' ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'}`}>
                    <div className="p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                {type === 'success' ? (
                                    <CheckCircle className="h-6 w-6 text-green-400" aria-hidden="true" />
                                ) : type === 'error' ? (
                                    <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
                                ) : (
                                    <Info className="h-6 w-6 text-blue-400" aria-hidden="true" />
                                )}
                            </div>
                            <div className="ml-3 w-0 flex-1 pt-0.5">
                                <p className="text-sm font-medium text-gray-900">
                                    {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification'}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">{message}</p>
                            </div>
                            <div className="ml-4 flex flex-shrink-0">
                                <button
                                    type="button"
                                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    onClick={handleClose}
                                >
                                    <span className="sr-only">Close</span>
                                    <X className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    );
}
