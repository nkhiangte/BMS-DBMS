import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CalendarEvent, CalendarEventType } from '../types';
import { BackIcon, HomeIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';
import { MIZORAM_HOLIDAYS } from '../constants';

interface CalendarPageProps {
    events: CalendarEvent[];
    user: User;
    onAdd: () => void;
    onEdit: (event: CalendarEvent) => void;
    onDelete: (event: CalendarEvent) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ events, user, onAdd, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const getEventColor = (type: CalendarEventType) => {
        switch (type) {
            case CalendarEventType.HOLIDAY: return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
            case CalendarEventType.EXAM: return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
            case CalendarEventType.EVENT: return 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200';
            case CalendarEventType.MEETING: return 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
        }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const calendarDays = [];

        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`pad-start-${i}`} className="border-r border-b bg-slate-50"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const currentDayDate = new Date(dateStr);
            currentDayDate.setHours(0, 0, 0, 0);

            const dayEvents: CalendarEvent[] = [];

            // 1. Check for database events (single and multi-day)
            events.forEach(event => {
                const eventStart = new Date(event.date);
                const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
                eventStart.setHours(0,0,0,0);
                eventEnd.setHours(0,0,0,0);
                if(currentDayDate >= eventStart && currentDayDate <= eventEnd) {
                    dayEvents.push(event);
                }
            });

            // 2. Check for Mizoram Government Holidays
            const govHoliday = MIZORAM_HOLIDAYS.find(h => h.date === dateStr);
            if (govHoliday) {
                dayEvents.push({
                    id: `gov-${dateStr}`,
                    title: govHoliday.title,
                    date: dateStr,
                    type: CalendarEventType.HOLIDAY
                });
            }

            // 3. Check for weekends (Saturday & Sunday)
            const dayOfWeek = currentDayDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                 dayEvents.push({
                    id: `weekend-${dateStr}`,
                    title: 'Holiday',
                    date: dateStr,
                    type: CalendarEventType.HOLIDAY
                });
            }

            // Deduplicate events by title to avoid showing "Holiday" twice
            const uniqueDayEvents = Array.from(new Map(dayEvents.map(e => [e.title, e])).values());

            const isHoliday = uniqueDayEvents.some(event => event.type === CalendarEventType.HOLIDAY);
            const eventsToShow = uniqueDayEvents.filter(event => !event.id.startsWith('weekend-'));
            
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            const dayNumberClasses = ['font-semibold'];
            if(isToday) {
                dayNumberClasses.push('bg-sky-600 text-white rounded-full w-7 h-7 flex items-center justify-center');
            } else if (isHoliday) {
                dayNumberClasses.push('text-red-600');
            } else {
                dayNumberClasses.push('text-slate-800');
            }

            calendarDays.push(
                <div key={day} className="border-r border-b p-2 min-h-[120px] flex flex-col relative group transition-colors hover:bg-sky-50">
                    <span className={dayNumberClasses.join(' ')}>
                        {day}
                    </span>
                    <div className="mt-1 space-y-1 overflow-y-auto">
                        {eventsToShow.map(event => (
                            <div key={event.id} className={`p-1.5 rounded-md text-xs font-semibold border ${event.id.startsWith('gov-') ? '' : 'cursor-pointer'} ${getEventColor(event.type)}`} title={`${event.type}: ${event.title}`}>
                                <p className="truncate">{event.title}</p>
                                {user.role === 'admin' && !event.id.startsWith('gov-') && (
                                    <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                        <button onClick={() => onEdit(event)} className="p-1 bg-white/50 rounded-full hover:bg-white"><EditIcon className="w-4 h-4 text-slate-600"/></button>
                                        <button onClick={() => onDelete(event)} className="p-1 bg-white/50 rounded-full hover:bg-white"><TrashIcon className="w-4 h-4 text-red-600"/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        
        const totalCells = firstDay + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remainingCells; i++) {
             calendarDays.push(<div key={`pad-end-${i}`} className="border-r border-b bg-slate-50"></div>);
        }

        return calendarDays;
    };


    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="btn btn-secondary">&lt; Prev</button>
                    <h1 className="text-2xl font-bold text-slate-800 text-center w-48">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h1>
                    <button onClick={() => changeMonth(1)} className="btn btn-secondary">Next &gt;</button>
                    <button onClick={() => setCurrentDate(new Date())} className="btn btn-secondary">Today</button>
                </div>
                 {user.role === 'admin' && (
                    <button onClick={onAdd} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5" />
                        Add Event
                    </button>
                 )}
            </div>

            <div className="border-t border-l border-slate-200">
                <div className="grid grid-cols-7">
                    {daysOfWeek.map(day => (
                        <div key={day} className="text-center font-bold text-slate-800 p-2 border-r border-b border-slate-200 bg-slate-50">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {renderCalendar()}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;