import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackIcon, HomeIcon, MessageIcon, WhatsappIcon, SpinnerIcon } from '../components/Icons';
import { Student, Grade, StudentStatus, User } from '../types';
import { GRADES_LIST } from '../constants';
import { formatPhoneNumberForWhatsApp } from '../utils';

interface CommunicationPageProps {
    students: Student[];
    user: User;
}

const CommunicationPage: React.FC<CommunicationPageProps> = ({ students, user }) => {
    const navigate = useNavigate();
    const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);
    const [messageType, setMessageType] = useState<'sms' | 'whatsapp'>('whatsapp');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const values: Grade[] = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                values.push(options[i].value as Grade);
            }
        }
        setSelectedGrades(values);
    };

    const recipients = useMemo(() => {
        if (selectedGrades.length === 0) return [];
        return students.filter(s => s.status === StudentStatus.ACTIVE && selectedGrades.includes(s.grade) && s.contact);
    }, [students, selectedGrades]);

    const handleSend = async () => {
        if (recipients.length === 0) {
            alert("No recipients selected or found in the selected class(es).");
            return;
        }

        const confirmed = window.confirm(
            `You are about to send a message to ${recipients.length} recipients.\n` +
            `Your browser may ask for permission to open multiple tabs or applications. Please allow this to continue.\n\n` +
            `Do you want to proceed?`
        );

        if (!confirmed) return;
        
        setIsSending(true);

        for (let i = 0; i < recipients.length; i++) {
            const student = recipients[i];
            const encodedMessage = encodeURIComponent(message);
            let url = '';

            if (messageType === 'whatsapp') {
                const phone = formatPhoneNumberForWhatsApp(student.contact);
                url = `https://wa.me/${phone}?text=${encodedMessage}`;
            } else {
                url = `sms:${student.contact}?body=${encodedMessage}`;
            }

            window.open(url, '_blank');
            // Add a small delay to prevent browsers from blocking all popups
            await new Promise(resolve => setTimeout(resolve, 200)); 
        }

        setIsSending(false);
        setMessage('');
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">Bulk Communication</h1>
            <p className="text-slate-700 mb-8">Send SMS or WhatsApp messages to parents of selected classes.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="grade-select" className="block text-sm font-bold text-slate-800 mb-2">1. Select Classes (Hold Ctrl/Cmd to select multiple)</label>
                        <select
                            id="grade-select"
                            multiple
                            value={selectedGrades}
                            onChange={handleGradeChange}
                            className="w-full h-48 border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        >
                            {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div>
                         <h3 className="block text-sm font-bold text-slate-800 mb-2">2. Choose Message Type</h3>
                         <div className="flex gap-4">
                            <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer w-full ${messageType === 'whatsapp' ? 'bg-emerald-50 border-emerald-400' : 'bg-white'}`}>
                                <input type="radio" name="messageType" value="whatsapp" checked={messageType === 'whatsapp'} onChange={() => setMessageType('whatsapp')} className="form-radio text-emerald-600 focus:ring-emerald-500"/>
                                <WhatsappIcon className="w-6 h-6 text-emerald-600"/>
                                <span className="font-semibold">WhatsApp</span>
                            </label>
                             <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer w-full ${messageType === 'sms' ? 'bg-sky-50 border-sky-400' : 'bg-white'}`}>
                                <input type="radio" name="messageType" value="sms" checked={messageType === 'sms'} onChange={() => setMessageType('sms')} className="form-radio text-sky-600 focus:ring-sky-500"/>
                                <MessageIcon className="w-6 h-6 text-sky-600"/>
                                <span className="font-semibold">SMS</span>
                            </label>
                         </div>
                    </div>
                     <div>
                        <label htmlFor="message-content" className="block text-sm font-bold text-slate-800 mb-2">3. Compose Message</label>
                        <textarea
                            id="message-content"
                            rows={6}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Type your message here..."
                        ></textarea>
                    </div>
                </div>

                {/* Recipients Section */}
                <div className="bg-slate-50 p-4 rounded-lg border">
                     <h3 className="text-lg font-bold text-slate-800 mb-3">Recipients ({recipients.length})</h3>
                     <div className="overflow-y-auto max-h-96 space-y-2">
                        {recipients.length > 0 ? (
                            recipients.map(student => (
                                <div key={student.id} className="bg-white p-2 rounded border border-slate-200 text-sm">
                                    <p className="font-semibold">{student.name} ({student.grade})</p>
                                    <p className="text-slate-600">Parent Contact: {student.contact}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-600 text-center py-8">Select a class to see the list of recipients.</p>
                        )}
                     </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSend}
                    disabled={isSending || recipients.length === 0 || !message || user.role !== 'admin'}
                    className="btn btn-primary text-base px-6 py-3 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isSending ? (
                        <>
                            <SpinnerIcon className="w-5 h-5"/>
                            <span>Sending...</span>
                        </>
                    ) : `Send Message to ${recipients.length} Parents`}
                </button>
            </div>
        </div>
    );
};

export default CommunicationPage;
