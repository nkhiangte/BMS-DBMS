import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Staff, StaffAttendanceRecord, AttendanceStatus } from '../types';
import { BackIcon, HomeIcon, CalendarDaysIcon, CheckIcon, XIcon, SpinnerIcon, CheckCircleIcon, InboxArrowDownIcon } from '../components/Icons';
import { getDistanceFromLatLonInM, exportAttendanceToCsv } from '../utils';

interface StaffAttendancePageProps {
  user: User;
  staff: Staff[];
  attendance: StaffAttendanceRecord | null;
  onMarkAttendance: (staffId: string, status: AttendanceStatus) => void;
  fetchStaffAttendanceForMonth: (year: number, month: number) => Promise<{ [date: string]: StaffAttendanceRecord }>;
  academicYear: string;
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

const StaffAttendancePage: React.FC<StaffAttendancePageProps> = ({ user, staff, attendance, onMarkAttendance, fetchStaffAttendanceForMonth, academicYear }) => {
    const navigate = useNavigate();
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isExporting, setIsExporting] = useState(false);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const currentUserStaffProfile = useMemo(() => staff.find(s => s.emailAddress.toLowerCase() === user.email?.toLowerCase()), [staff, user.email]);

    const staffToDisplay = useMemo(() => {
        if (user.role === 'admin') {
            return staff;
        }
        return currentUserStaffProfile ? [currentUserStaffProfile] : [];
    }, [user, staff, currentUserStaffProfile]);

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
                if(error.code === 1) errorMessage = 'Location access denied. Please allow location access in your browser settings.';
                setNotification({ message: errorMessage, type: 'error' });
                setIsLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };
    
    const handleExport = async () => {
        if (!exportMonth) {
            alert("Please select a month to export.");
            return;
        }
        setIsExporting(true);
        try {
            const [year, month] = exportMonth.split('-').map(Number);
            const attendanceData = await fetchStaffAttendanceForMonth(year, month);
            exportAttendanceToCsv({
                people: staff,
                attendanceData,
                month: exportMonth,
                entityName: 'All_Staff',
                entityType: 'Staff',
                academicYear,
            });
        } catch (error) {
            console.error("Failed to export staff attendance:", error);
            alert("An error occurred while exporting data. Please check the console.");
        } finally {
            setIsExporting(false);
        }
    };

    const StatusButton: React.FC<{ staffId: string, status: AttendanceStatus, label: string }> = ({ staffId, status, label }) => {
        const currentStatus = attendance?.[staffId];
        const isActive = currentStatus === status;
        
        const colors = {
            [AttendanceStatus.PRESENT]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            [AttendanceStatus.ABSENT]: 'bg-rose-100 text-rose-800 border-rose-300',
            [AttendanceStatus.LEAVE]: 'bg-slate-100 text-slate-800 border-slate-300',
        };
        const activeColors = {
            [AttendanceStatus.PRESENT]: 'bg-emerald-500 text-white',
            [AttendanceStatus.ABSENT]: 'bg-rose-500 text-white',
            [AttendanceStatus.LEAVE]: 'bg-slate-500 text-white',
        }

        return (
            <button
                onClick={() => onMarkAttendance(staffId, status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${isActive ? activeColors[status] : `hover:bg-slate-200 ${colors[status]}`}`}
            >
                {label}
            </button>
        );
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

                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
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
                            {isLoadingLocation ? <SpinnerIcon className="w-5 h-5"/> : <CalendarDaysIcon className="w-5 h-5" />}
                            <span>{attendance?.[currentUserStaffProfile.id] ? "Attendance Marked" : "Mark My Attendance"}</span>
                        </button>
                    )}
                </div>
                
                 {user.role === 'admin' && (
                    <div className="my-6 p-4 bg-slate-50 border rounded-lg">
                        <h3 className="font-bold text-slate-800">Monthly Attendance Export</h3>
                        <p className="text-sm text-slate-600 mb-2">Download a CSV report for all staff for a specific month.</p>
                        <div className="flex items-center gap-3">
                            <input 
                                type="month" 
                                value={exportMonth}
                                onChange={(e) => setExportMonth(e.target.value)}
                                className="form-input px-3 py-2 border-slate-300 rounded-md shadow-sm"
                            />
                            <button 
                                onClick={handleExport}
                                disabled={isExporting}
                                className="btn btn-secondary disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isExporting ? <SpinnerIcon className="w-5 h-5" /> : <InboxArrowDownIcon className="w-5 h-5" />}
                                <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="overflow-x-auto border rounded-lg">
                     <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Staff Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Designation</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Status Today</th>
                                {user.role === 'admin' && <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {staffToDisplay.map(member => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{member.firstName} {member.lastName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{member.designation}</td>
                                    <td className="px-6 py-4 text-center text-sm font-semibold">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            attendance?.[member.id] === AttendanceStatus.PRESENT ? 'bg-emerald-100 text-emerald-800' :
                                            attendance?.[member.id] === AttendanceStatus.ABSENT ? 'bg-rose-100 text-rose-800' :
                                            attendance?.[member.id] === AttendanceStatus.LEAVE ? 'bg-slate-200 text-slate-800' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {attendance?.[member.id] || 'Not Marked'}
                                        </span>
                                    </td>
                                    {user.role === 'admin' && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <StatusButton staffId={member.id} status={AttendanceStatus.PRESENT} label="P"/>
                                                <StatusButton staffId={member.id} status={AttendanceStatus.ABSENT} label="A"/>
                                                <StatusButton staffId={member.id} status={AttendanceStatus.LEAVE} label="L"/>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                     </table>
                     {staffToDisplay.length === 0 && (
                        <p className="text-center py-8 text-slate-600">Your staff profile could not be found.</p>
                     )}
                </div>
            </div>
        </>
    );
};

export default StaffAttendancePage;
