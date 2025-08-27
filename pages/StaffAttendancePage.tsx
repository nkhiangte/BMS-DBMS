
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Staff, StaffAttendanceRecord, AttendanceStatus } from '../types';
import { BackIcon, HomeIcon, CalendarDaysIcon, CheckIcon, XIcon, SpinnerIcon, CheckCircleIcon } from '../components/Icons';
import { getDistanceFromLatLonInM } from '../utils';

interface StaffAttendancePageProps {
  user: User;
  staff: Staff[];
  attendance: StaffAttendanceRecord | null;
  onMarkAttendance: (staffId: string, status: AttendanceStatus) => void;
}

const SCHOOL_COORDS = {
    lat: 23.484294,
    lon: 93.3257024,
};
const MAX_DISTANCE_METERS = 30;

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void; }> = ({ message, type, onDismiss }) => {
    return (
        <div className="fixed top-20 right-5 bg-white shadow-lg rounded-lg p-4 flex items-center gap-3 z-50 animate-fade-in">
            {type === 'success' ? <CheckCircleIcon className="w-6 h-6 text-emerald-500" /> : <XIcon className="w-6 h-6 text-red-500" />}
            <p className={`text-sm font-semibold ${type === 'success' ? 'text-slate-800' : 'text-red-700'}`}>{message}</p>
            <button onClick={onDismiss} className="ml-4 text-slate-500 hover:text-slate-800">&times;</button>
        </div>
    );
};

const StaffAttendancePage: React.FC<StaffAttendancePageProps> = ({ user, staff, attendance, onMarkAttendance }) => {
    const navigate = useNavigate();
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const currentUserStaffProfile = staff.find(s => s.emailAddress.toLowerCase() === user.email?.toLowerCase());

    const handleMarkSelfAttendance = () => {
        if (!currentUserStaffProfile) {
            setNotification({ message: 'Your staff profile could not be found.', type: 'error' });
            return;
        }

        setIsLoadingLocation(true);
        setNotification(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const distance = getDistanceFromLatLonInM(latitude, longitude, SCHOOL_COORDS.lat, SCHOOL_COORDS.lon);

                if (distance <= MAX_DISTANCE_METERS) {
                    onMarkAttendance(currentUserStaffProfile.id, AttendanceStatus.PRESENT);
                    setNotification({ message: `Attendance marked successfully! You are ${distance.toFixed(0)}m from the school.`, type: 'success' });
                } else {
                    setNotification({ message: `Failed: You are ${distance.toFixed(0)}m away. You must be within ${MAX_DISTANCE_METERS}m.`, type: 'error' });
                }
                setIsLoadingLocation(false);
            },
            (error) => {
                let errorMessage = 'Could not get your location.';
                if(error.code === 1) errorMessage = 'Geolocation permission denied.';
                if(error.code === 2) errorMessage = 'Location information is unavailable.';
                setNotification({ message: errorMessage, type: 'error' });
                setIsLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };
    
    const getStatusStyles = (status?: AttendanceStatus) => {
        switch(status) {
            case AttendanceStatus.PRESENT: return 'bg-emerald-100 text-emerald-800';
            case AttendanceStatus.ABSENT: return 'bg-rose-100 text-rose-800';
            case AttendanceStatus.LEAVE: return 'bg-amber-100 text-amber-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };
    
    return (
        <>
            {notification && <Toast message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                        <HomeIcon className="w-5 h-5" /> <span>Home</span>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Staff Attendance</h1>
                        <p className="text-slate-600 mt-1">{formattedDate}</p>
                    </div>
                    {currentUserStaffProfile && (
                        <button 
                            onClick={handleMarkSelfAttendance} 
                            disabled={isLoadingLocation || !!attendance?.[currentUserStaffProfile.id]}
                            className="btn btn-primary text-base px-6 py-3 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoadingLocation ? <SpinnerIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                            <span>{isLoadingLocation ? 'Getting Location...' : (attendance?.[currentUserStaffProfile.id] ? 'You are Marked' : 'Mark My Attendance')}</span>
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Staff Member</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Status</th>
                                {user.role === 'admin' && <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {staff.map(member => {
                                const currentStatus = attendance?.[member.id];
                                return (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img className="w-10 h-10 rounded-full object-cover" src={member.photographUrl || `https://i.pravatar.cc/150?u=${member.id}`} alt={member.firstName} />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{member.firstName} {member.lastName}</p>
                                                    <p className="text-xs text-slate-600">{member.designation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusStyles(currentStatus)}`}>
                                                {currentStatus || 'Unmarked'}
                                            </span>
                                        </td>
                                        {user.role === 'admin' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => onMarkAttendance(member.id, AttendanceStatus.PRESENT)}
                                                        className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full hover:bg-emerald-200 disabled:opacity-50"
                                                        disabled={currentStatus === AttendanceStatus.PRESENT}
                                                    >
                                                        Present
                                                    </button>
                                                    <button 
                                                        onClick={() => onMarkAttendance(member.id, AttendanceStatus.ABSENT)}
                                                        className="px-3 py-1 text-xs font-bold text-rose-700 bg-rose-100 rounded-full hover:bg-rose-200 disabled:opacity-50"
                                                         disabled={currentStatus === AttendanceStatus.ABSENT}
                                                    >
                                                        Absent
                                                    </button>
                                                     <button 
                                                        onClick={() => onMarkAttendance(member.id, AttendanceStatus.LEAVE)}
                                                        className="px-3 py-1 text-xs font-bold text-amber-700 bg-amber-100 rounded-full hover:bg-amber-200 disabled:opacity-50"
                                                         disabled={currentStatus === AttendanceStatus.LEAVE}
                                                    >
                                                        Leave
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    );
};

export default StaffAttendancePage;
