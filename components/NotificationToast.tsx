import React, { useEffect } from 'react';
import { BellIcon, XIcon } from './Icons';

interface NotificationToastProps {
    message: string;
    onDismiss: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 7000); // Auto-dismiss after 7 seconds

        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-sm flex items-start gap-4 animate-fade-in border-l-4 border-sky-500">
            <div className="flex-shrink-0 text-sky-500 mt-1">
                <BellIcon className="w-6 h-6" />
            </div>
            <div className="flex-grow">
                <p className="font-bold text-slate-800">Upcoming Event Reminder</p>
                <p className="text-sm text-slate-600">{message}</p>
            </div>
            <button onClick={onDismiss} className="p-1 text-slate-500 hover:bg-slate-100 rounded-full flex-shrink-0">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default NotificationToast;
