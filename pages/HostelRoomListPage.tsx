import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HostelRoom, HostelResident, Student, HostelBlock } from '../types';
import { BackIcon, HomeIcon, BedIcon } from '../components/Icons';
import { HOSTEL_BLOCK_LIST } from '../constants';

interface HostelRoomListPageProps {
    rooms: HostelRoom[];
    residents: HostelResident[];
    students: Student[];
}

const HostelRoomListPage: React.FC<HostelRoomListPageProps> = ({ rooms, residents, students }) => {
    const navigate = useNavigate();

    const roomDetails = useMemo(() => {
        return rooms.map(room => {
            const occupants = residents
                .filter(res => res.roomId === room.id)
                .map(res => students.find(stu => stu.id === res.studentId))
                .filter((stu): stu is Student => !!stu);

            let status: 'Vacant' | 'Full' | 'Partially Occupied' = 'Vacant';
            if (occupants.length === room.capacity) {
                status = 'Full';
            } else if (occupants.length > 0) {
                status = 'Partially Occupied';
            }

            return {
                ...room,
                occupants,
                status,
            };
        });
    }, [rooms, residents, students]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Full': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'Partially Occupied': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Vacant': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

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

            <div className="mb-6 flex items-center gap-4">
                 <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                    <BedIcon className="w-8 h-8" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold text-slate-800">Room & Bed Management</h1>
                    <p className="text-slate-600 mt-1">Overview of all hostel rooms and their occupancy status.</p>
                </div>
            </div>

            <div className="space-y-8">
                {HOSTEL_BLOCK_LIST.map(block => {
                    const blockRooms = roomDetails.filter(room => room.block === block).sort((a,b) => a.roomNumber - b.roomNumber);
                    if (blockRooms.length === 0) return null;

                    return (
                        <div key={block}>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2">{block}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {blockRooms.map(room => (
                                    <div key={room.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-slate-800">Room {room.roomNumber}</h3>
                                            <div className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(room.status)}`}>
                                                {room.status}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600">{room.type}</p>
                                        <p className="text-sm text-slate-600 font-semibold">Capacity: {room.occupants.length} / {room.capacity}</p>
                                        
                                        <div className="mt-4 pt-3 border-t">
                                            <h4 className="font-semibold text-sm text-slate-800 mb-2">Occupants:</h4>
                                            {room.occupants.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {room.occupants.map(occ => (
                                                        <li key={occ.id} className="text-sm text-sky-800">
                                                           <Link to={`/student/${occ.id}`} className="hover:underline">{occ.name}</Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-slate-500 italic">No occupants</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HostelRoomListPage;