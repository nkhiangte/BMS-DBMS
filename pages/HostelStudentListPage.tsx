

import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HostelResident, HostelRoom, Student, User } from '../types';
import { BackIcon, HomeIcon, UsersIcon, PlusIcon } from '../components/Icons';

interface HostelStudentListPageProps {
    residents: HostelResident[];
    rooms: HostelRoom[];
    students: Student[];
    onAdd: () => void;
    user: User;
}

const HostelStudentListPage: React.FC<HostelStudentListPageProps> = ({ residents, rooms, students, onAdd, user }) => {
    const navigate = useNavigate();

    const residentDetails = useMemo(() => {
        return residents.map(resident => {
            const student = students.find(s => s.id === resident.studentId);
            const room = rooms.find(r => r.id === resident.roomId);
            return {
                ...resident,
                studentName: student?.name || 'N/A',
                studentClass: student?.grade || 'N/A',
                roomNumber: room?.roomNumber || 'N/A',
                block: room?.block || 'N/A',
            };
        }).sort((a, b) => a.studentName.localeCompare(b.studentName));
    }, [residents, rooms, students]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <UsersIcon className="w-10 h-10 text-sky-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Student Hostel Records</h1>
                        <p className="text-slate-600 mt-1">List of all registered students in the hostel.</p>
                    </div>
                </div>
                <button 
                    onClick={onAdd} 
                    disabled={user.role !== 'admin'}
                    className="btn btn-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Inmate
                </button>
            </div>

            {residentDetails.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-700 text-lg font-semibold">No students are currently registered in the hostel.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Hostel ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Student Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Class</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Room No.</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Block</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Date of Joining</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {residentDetails.map(resident => (
                                <tr key={resident.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{resident.hostelRegistrationId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Link to={`/student/${resident.studentId}`} className="font-medium text-sky-700 hover:underline">
                                            {resident.studentName}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{resident.studentClass}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{resident.roomNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{resident.block}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{resident.dateOfJoining}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HostelStudentListPage;
