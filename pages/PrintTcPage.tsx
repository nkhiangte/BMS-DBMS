import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TcRecord } from '../types';
import { BackIcon, HomeIcon, PrinterIcon } from '../components/Icons';

interface PrintTcPageProps {
  tcRecords: TcRecord[];
}

const DetailRow: React.FC<{ num: number; label: string; value?: string | number }> = ({ num, label, value }) => (
    <div className="flex">
        <div className="w-8 flex-shrink-0">{num}.</div>
        <div className="flex-grow border-b border-dotted border-slate-400 flex justify-between">
            <span>{label}</span>
            <span className="font-semibold text-slate-800 pl-2 text-right">{value || 'N/A'}</span>
        </div>
    </div>
);


const PrintTcPage: React.FC<PrintTcPageProps> = ({ tcRecords }) => {
    const { tcId } = useParams<{ tcId: string }>();
    const navigate = useNavigate();

    const record = tcRecords.find(r => r.id === Number(tcId));

    if (!record) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Transfer Certificate Not Found</h2>
                <p className="text-slate-700 mt-2">The requested TC record does not exist or was not saved.</p>
                <button
                    onClick={() => navigate('/transfers')}
                    className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
                >
                    <BackIcon className="w-5 h-5" />
                    Return to Transfers
                </button>
            </div>
        );
    }
    
    const { studentDetails, tcData } = record;

    return (
      <div className="printable-area">
        <div className="mb-6 flex justify-between items-center print:hidden">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
                <BackIcon className="w-5 h-5" />
                Back
            </button>
             <div className="flex items-center gap-4">
                 <Link
                    to="/"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    title="Go to Home/Dashboard"
                >
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                </Link>
                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700"
                >
                    <PrinterIcon className="w-5 h-5" />
                    <span>Print</span>
                </button>
            </div>
        </div>

        {/* --- Printable Certificate --- */}
        <div id="printable-tc" className="bg-white p-8 rounded-xl shadow-lg font-serif print:shadow-none print:rounded-none print:p-4 A4-size">
            <style>{`
                @page {
                    size: A4;
                    margin: 2cm;
                }
                 @media print {
                    #printable-tc { 
                        font-size: 12pt;
                    }
                }
            `}</style>
            
            <header className="text-center mb-8">
                <div className="flex justify-center items-center gap-4">
                    <img src="https://i.postimg.cc/qt00dty5/logo.png" alt="Bethel Mission School Logo" className="h-20 w-20" />
                    <div>
                        <h1 className="text-4xl font-bold text-sky-800 tracking-wide">Bethel Mission School</h1>
                        <p className="text-slate-800">Affiliated with the Council for the Indian School Certificate Examinations</p>
                        <p className="text-slate-700 text-sm">Main Road, Cityville, State, PIN 123456</p>
                    </div>
                </div>
                <div className="mt-6">
                    <h2 className="text-2xl font-semibold inline-block border-b-2 border-slate-700 px-8 pb-1">TRANSFER CERTIFICATE</h2>
                </div>
            </header>

            <div className="flex justify-between text-sm mb-8">
                <p><strong>Ref. No:</strong> {tcData.refNo}</p>
                <p><strong>Student ID:</strong> {studentDetails.studentId}</p>
            </div>

            <main className="space-y-3 text-md leading-relaxed">
                <DetailRow num={1} label="Name of Student" value={studentDetails.name} />
                <DetailRow num={2} label="Father's Name" value={studentDetails.fatherName} />
                <DetailRow num={3} label="Mother's Name" value={studentDetails.motherName} />
                <DetailRow num={4} label="Date of Birth (according to Admission Register)" value={studentDetails.dateOfBirth} />
                <DetailRow num={5} label="Date of Birth in Words" value={tcData.dateOfBirthInWords} />
                <DetailRow num={6} label="Religion & Category" value={`${studentDetails.religion}, ${studentDetails.category}`} />
                <DetailRow num={7} label="Whether dues to the school have been cleared" value={tcData.schoolDues} />
                <DetailRow num={8} label="Whether qualified for promotion to a higher class" value={tcData.qualifiedForPromotion} />
                <DetailRow num={9} label="Date of last attendance at this school" value={tcData.lastAttendanceDate} />
                <DetailRow num={10} label="Date of application for certificate" value={tcData.applicationDate} />
                <DetailRow num={11} label="Date of issue of this certificate" value={tcData.issueDate} />
                <DetailRow num={12} label="Reason for leaving the school" value={tcData.reasonForLeaving} />
                <DetailRow num={13} label="General Conduct" value={tcData.generalConduct} />
                <DetailRow num={14} label="Any other remarks" value={tcData.remarks || 'None'} />
            </main>

            <footer className="mt-20 text-sm">
                <div className="flex justify-between items-end">
                    <div className="text-left">
                        <p>Date: {tcData.issueDate}</p>
                        <p className="mt-2">Place: Cityville</p>
                    </div>
                    <div className="text-center">
                        <div className="h-16"></div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold">Principal's Signature</p>
                        <p className="text-xs">(With School Seal)</p>
                    </div>
                </div>
            </footer>

        </div>
      </div>
    );
};

export default PrintTcPage;
