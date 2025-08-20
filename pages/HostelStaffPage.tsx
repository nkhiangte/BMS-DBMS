import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackIcon, HomeIcon, BriefcaseIcon, UserIcon, PhoneIcon, UserGroupIcon, CalendarDaysIcon } from '../components/Icons';
import { HostelStaff, HostelStaffRole, PaymentStatus } from '../types';

interface HostelStaffPageProps {
    staff: HostelStaff[];
}

const HostelStaffPage: React.FC<HostelStaffPageProps> = ({ staff }) => {
    const navigate = useNavigate();

    const wardens = useMemo(() => staff.filter(s => s.role === HostelStaffRole.WARDEN), [staff]);
    const messStaff = useMemo(() => staff.filter(s => s.role !== HostelStaffRole.WARDEN), [staff]);
    
    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID: return 'bg-emerald-100 text-emerald-800';
            case PaymentStatus.PENDING: return 'bg-amber-100 text-amber-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate('/hostel')} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back to Hostel Dashboard
                </button>
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <div className="mb-8 flex items-center gap-4">
                 <div className="p-3 bg-sky-100 text-sky-600 rounded-lg">
                    <BriefcaseIcon className="w-8 h-8" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold text-slate-800">Hostel Staff Management</h1>
                    <p className="text-slate-600 mt-1">Manage records for wardens, mess staff, and their duties.</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* Wardens Section */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-3">
                        <UserIcon className="w-7 h-7 text-sky-700" />
                        Warden Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wardens.map(warden => (
                            <div key={warden.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                                <img src={warden.photographUrl} alt={warden.name} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-white shadow-md" />
                                <h3 className="font-bold text-slate-800">{warden.name}</h3>
                                <p className="text-sm text-slate-600">{warden.gender}</p>
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-700 mt-2">
                                    <PhoneIcon className="w-4 h-4 text-slate-500" />
                                    <span>{warden.contactNumber}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-xl font-semibold text-slate-800 mt-8 mb-3 flex items-center gap-2">
                        <CalendarDaysIcon className="w-6 h-6 text-slate-600" />
                        Duty Roster
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 border">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Warden Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Assigned Block</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Duty Shift</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {wardens.map(warden => (
                                    <tr key={warden.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{warden.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{warden.assignedBlock}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{warden.dutyShift}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Mess Staff Section */}
                <section>
                     <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-3">
                        <UserGroupIcon className="w-7 h-7 text-rose-700" />
                        Mess Staff Records
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 border">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Staff Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Role</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Date of Joining</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-slate-200">
                                {messStaff.map(member => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{member.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{member.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{member.dateOfJoining}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                
                {/* Payroll Section */}
                <section>
                     <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-3">
                        <CalendarDaysIcon className="w-7 h-7 text-emerald-700" />
                        Payroll & Attendance Summary (Current Month)
                    </h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 border">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Staff Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Role</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Salary</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Payment Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Attendance</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-slate-200">
                                {staff.map(member => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{member.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{member.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(member.salary)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.paymentStatus)}`}>
                                                {member.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">{member.attendancePercent}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HostelStaffPage;
