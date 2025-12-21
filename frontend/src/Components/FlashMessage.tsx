import { useToast } from '@/lib/ToastContext';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function FlashMessage() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-20 right-4 z-[100] w-full max-w-sm flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <Transition
                    key={toast.id}
                    show={true}
                    appear={true}
                    as={Fragment}
                    enter="transform ease-out duration-300 transition"
                    enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                    enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={`pointer-events-auto w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${toast.type === 'success' ? 'border-l-4 border-green-500' : toast.type === 'error' ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'}`}>
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    {toast.type === 'success' ? (
                                        <CheckCircle className="h-6 w-6 text-green-400" aria-hidden="true" />
                                    ) : toast.type === 'error' ? (
                                        <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
                                    ) : (
                                        <Info className="h-6 w-6 text-blue-400" aria-hidden="true" />
                                    )}
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-medium text-gray-900">
                                        {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Notification'}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                                </div>
                                <div className="ml-4 flex flex-shrink-0">
                                    <button
                                        type="button"
                                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        onClick={() => removeToast(toast.id)}
                                    >
                                        <span className="sr-only">Close</span>
                                        <X className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            ))}
        </div>
    );
}
