

import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackIcon, HomeIcon, BriefcaseIcon, UserIcon, PhoneIcon, UserGroupIcon, CalendarDaysIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';
import { HostelStaff, HostelStaffRole, PaymentStatus, User } from '../types';

interface HostelStaffPageProps {
    staff: HostelStaff[];
    onAdd: () => void;
    onEdit: (staffMember: HostelStaff) => void;
    onDelete: (staffMember: HostelStaff) => void;
    user: User;
}

const StaffCard: React.FC<{
    staffMember: HostelStaff;
    onEdit: (staffMember: HostelStaff) => void;
    onDelete: (staffMember: HostelStaff) => void;
    user: User;
}> = ({ staffMember, onEdit, onDelete, user }) => {
    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID: return 'bg-emerald-100 text-emerald-800';
            case PaymentStatus.PENDING: return 'bg-amber-100 text-amber-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <img src={staffMember.photographUrl || `https://i.pravatar.cc/150?u=hs${staffMember.id}`} alt={staffMember.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-slate-800">{staffMember.name}</h3>
                    <p className="text-sm font-semibold text-sky-700">{staffMember.role}</p>
                    <p className="text-sm text-slate-600">{staffMember.dutyShift}</p>
                </div>
                {user.role === 'admin' && (
                  <div className="flex flex-col gap-1">
                      <button onClick={() => onEdit(staffMember)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full" title="Edit Staff">
                          <EditIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(staffMember)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete Staff">
                          <TrashIcon className="w-4 h-4" />
                      </button>
                  </div>
                )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-sm flex-grow">
                <div className="flex items-center gap-2 text-slate-700">
                    <PhoneIcon className="w-4 h-4 text-slate-500" />
                    <span>{staffMember.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                    <CalendarDaysIcon className="w-4 h-4 text-slate-500" />
                    <span>Joined: {staffMember.dateOfJoining}</span>
                </div>
                 <div className="flex items-center gap-2 text-slate-700">
                    <BriefcaseIcon className="w-4 h-4 text-slate-500" />
                    <span>Block: {staffMember.assignedBlock || 'N/A'}</span>
                </div>
            </div>
             <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                <div>
                    <span className="font-semibold text-slate-700">Salary: </span>
                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(staffMember.salary)}</span>
                </div>
                 <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(staffMember.paymentStatus)}`}>
                    {staffMember.paymentStatus}
                </span>
            </div>
        </div>
    );
};

const HostelStaffPage: React.FC<HostelStaffPageProps> = ({ staff, onAdd, onEdit, onDelete, user }) => {
    const navigate = useNavigate();

    const wardens = useMemo(() => staff.filter(s => s.role === HostelStaffRole.WARDEN), [staff]);
    const otherStaff = useMemo(() => staff.filter(s => s.role !== HostelStaffRole.WARDEN), [staff]);

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

            <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-100 text-sky-600 rounded-lg">
                        <BriefcaseIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Hostel Staff Management</h1>
                        <p className="text-slate-600 mt-1">Manage records for wardens, mess staff, and their duties.</p>
                    </div>
                 </div>
                 {user.role === 'admin' && (
                    <button onClick={onAdd} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5" />
                        Add New Staff
                    </button>
                 )}
            </div>

            <div className="space-y-10">
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-3">
                        <UserIcon className="w-7 h-7 text-sky-700" />
                        Wardens
                    </h2>
                    {wardens.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wardens.map(member => <StaffCard key={member.id} staffMember={member} onEdit={onEdit} onDelete={onDelete} user={user} />)}
                        </div>
                    ) : (
                        <p className="text-slate-600">No wardens have been added yet.</p>
                    )}
                </section>
                <section>
                     <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-3">
                        <UserGroupIcon className="w-7 h-7 text-rose-700" />
                        Other Staff (Mess, Security, etc.)
                    </h2>
                     {otherStaff.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherStaff.map(member => <StaffCard key={member.id} staffMember={member} onEdit={onEdit} onDelete={onDelete} user={user} />)}
                        </div>
                    ) : (
                         <p className="text-slate-600">No other staff members have been added yet.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default HostelStaffPage;