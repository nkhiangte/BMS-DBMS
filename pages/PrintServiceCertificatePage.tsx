

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ServiceCertificateRecord } from '../types';
import { BackIcon, HomeIcon, PrinterIcon } from '../components/Icons';

interface PrintServiceCertificatePageProps {
  serviceCertificateRecords: ServiceCertificateRecord[];
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


const PrintServiceCertificatePage: React.FC<PrintServiceCertificatePageProps> = ({ serviceCertificateRecords }) => {
    const { certId } = useParams<{ certId: string }>();
    const navigate = useNavigate();

    const record = serviceCertificateRecords.find(r => r.id === certId);

    if (!record) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Certificate Not Found</h2>
                <p className="text-slate-700 mt-2">The requested certificate record does not exist.</p>
                <button
                    onClick={() => navigate('/staff/certificates')}
                    className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
                >
                    <BackIcon className="w-5 h-5" />
                    Return to Records
                </button>
            </div>
        );
    }
    
    const { staffDetails, certData } = record;

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
        <div id="printable-service-cert" className="bg-white p-8 rounded-xl shadow-lg font-serif print:shadow-none print:rounded-none print:p-4 A4-size">
            <style>{`
                @page {
                    size: A4;
                    margin: 2cm;
                }
                 @media print {
                    #printable-service-cert { 
                        font-size: 12pt;
                    }
                }
            `}</style>
            
            <header className="text-center mb-8">
                <img 
                    src="https://i.postimg.cc/KKNZD4NB/bms-letterhead.png" 
                    alt="Bethel Mission School Banner" 
                    className="w-full h-auto"
                />
                <div className="mt-6">
                    <h2 className="text-2xl font-semibold inline-block border-b-2 border-slate-700 px-8 pb-1">SERVICE CERTIFICATE</h2>
                </div>
            </header>

            <div className="flex justify-between text-sm mb-8">
                <p><strong>Ref. No:</strong> {certData.refNo}</p>
                <p><strong>Employee ID:</strong> {staffDetails.staffId}</p>
            </div>

            <main className="space-y-3 text-md leading-relaxed">
                <DetailRow num={1} label="Name of Staff" value={staffDetails.name} />
                <DetailRow num={2} label="Designation" value={staffDetails.designation} />
                <DetailRow num={3} label="Date of Birth" value={staffDetails.dateOfBirth} />
                <DetailRow num={4} label="Date of Joining" value={staffDetails.dateOfJoining} />
                <DetailRow num={5} label="Date of Leaving (Last Working Day)" value={certData.lastWorkingDay} />
                <DetailRow num={6} label="Reason for Leaving" value={certData.reasonForLeaving} />
                <DetailRow num={7} label="General Conduct" value={certData.generalConduct} />
                <DetailRow num={8} label="Any other remarks" value={certData.remarks || 'None'} />
            </main>

            <footer className="mt-20 text-sm">
                <div className="flex justify-between items-end">
                    <div className="text-left">
                        <p>Date: {certData.issueDate}</p>
                        <p className="mt-2">Place: Champhai, Mizoram</p>
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

export default PrintServiceCertificatePage;