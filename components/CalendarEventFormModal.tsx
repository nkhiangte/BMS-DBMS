import React, { useState, useEffect, FormEvent } from 'react';
import { CalendarEvent, CalendarEventType } from '../types';
import { CALENDAR_EVENT_TYPE_LIST } from '../constants';
import { formatDateForDisplay, formatDateForStorage } from '../utils';

interface CalendarEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<CalendarEvent, 'id'>) => void;
  event: CalendarEvent | null;
}

const CalendarEventFormModal: React.FC<CalendarEventFormModalProps> = ({ isOpen, onClose, onSubmit, event }) => {
    const getInitialFormData = () => ({
        title: '',
        date: formatDateForDisplay(new Date().toISOString().split('T')[0]),
        endDate: '',
        type: CalendarEventType.EVENT,
        description: '',
    });

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            if (event) {
                setFormData({
                    title: event.title,
                    date: formatDateForDisplay(event.date),
                    endDate: event.endDate ? formatDateForDisplay(event.endDate) : '',
                    type: event.type,
                    description: event.description || '',
                });
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [event, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            date: formatDateForStorage(formData.date),
            endDate: formData.endDate ? formatDateForStorage(formData.endDate) : undefined,
            type: formData.type as CalendarEventType,
        };
        onSubmit(dataToSubmit);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-slate-800">{event ? 'Edit Event' : 'Add New Event'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-bold text-slate-800">Event Title</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-bold text-slate-800">Start Date</label>
                                <input type="text" name="date" id="date" placeholder="DD/MM/YYYY" pattern="\d{1,2}/\d{1,2}/\d{4}" value={formData.date} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                             <div>
                                <label htmlFor="endDate" className="block text-sm font-bold text-slate-800">End Date (Optional)</label>
                                <input type="text" name="endDate" id="endDate" placeholder="DD/MM/YYYY" pattern="\d{1,2}/\d{1,2}/\d{4}" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="type" className="block text-sm font-bold text-slate-800">Event Type</label>
                            <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required>
                                {CALENDAR_EVENT_TYPE_LIST.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-slate-800">Description (Optional)</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary">{event ? 'Save Changes' : 'Add Event'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CalendarEventFormModal;