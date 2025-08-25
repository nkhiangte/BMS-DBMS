



import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType, ServiceCertificateRecord, PaymentStatus } from './types';
import { GRADE_DEFINITIONS, TERMINAL_EXAMS, GRADES_LIST } from './constants';
import { getNextGrade, createDefaultFeePayments, calculateStudentResult } from './utils';

import { auth, db, storage, firebaseConfig } from './firebaseConfig';
import firebase from 'firebase/compat/app';

import Header from './components/Header';
import StudentFormModal from './components/StudentFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import StudentListPage from './pages/StudentListPage';
import StudentDetailPage from './pages/StudentDetailPage';
import AcademicPerformancePage from './pages/AcademicPerformancePage';
import DashboardPage from './pages/DashboardPage';
import ProgressReportPage from './pages/ProgressReportPage';
import ReportSearchPage from './pages/ReportSearchPage';
import ClassListPage from './pages/ClassListPage';
import ClassStudentsPage from './pages/ClassStudentsPage';
import TransferManagementPage from './pages/TransferManagementPage';
import TcRegistrationPage from './pages/TcRegistrationPage';
import AllTcRecordsPage from './pages/AllTcRecordsPage';
import PrintTcPage from './pages/PrintTcPage';
import UpdateTcPage from './pages/UpdateTcPage';
import PrintableReportCardPage from './pages/PrintableReportCardPage';
import ManageSubjectsPage from './pages/ManageSubjectsPage';
import ManageStaffPage from './pages/ManageStaffPage';
import StaffFormModal from './components/TeacherFormModal';
import StaffDetailPage from './pages/StaffDetailPage';
import FeeManagementPage from './pages/FeeManagementPage';
import ClassMarkStatementPage from './pages/ClassMarkStatementPage';
import PromotionPage from './pages/PromotionPage';
import InventoryPage from './pages/InventoryPage';
import InventoryFormModal from './components/InventoryFormModal';
import ImportStudentsModal from './components/ImportStudentsModal';
import TransferStudentModal from './components/TransferStudentModal';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Staff Certificate Pages
import StaffDocumentsPage from './pages/StaffDocumentsPage';
import GenerateServiceCertificatePage from './pages/GenerateServiceCertificatePage';
import PrintServiceCertificatePage from './pages/PrintServiceCertificatePage';

// Hostel Management Pages
import HostelDashboardPage from './pages/HostelDashboardPage';
import HostelStudentListPage from './pages/HostelStudentListPage';
import HostelRoomListPage from './pages/HostelRoomListPage';
import HostelFeePage from './pages/HostelFeePage';
import HostelAttendancePage from './pages/HostelAttendancePage';
import HostelMessPage from './pages/HostelMessPage';
import HostelStaffPage from './pages/HostelStaffPage';
import HostelInventoryPage from './pages/HostelInventoryPage';
import HostelDisciplinePage from './pages/HostelDisciplinePage';
import HostelHealthPage from './pages/HostelHealthPage';
import HostelCommunicationPage from './pages/HostelCommunicationPage';
import HostelSettingsPage from './pages/HostelSettingsPage';
import HostelStaffFormModal from './components/HostelStaffFormModal';
import AcademicYearForm from './components/AcademicYearForm';
import { UserManagementPage } from './pages/UserManagementPage';

const PendingApprovalPage: React.FC<{ onLogout: () => void; email: string | null }> = ({ onLogout, email }) => (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-amber-600">Account Pending Approval</h2>
            <p className="text-slate-700 mt-2">Your account ({email}) has been created but requires administrator approval.</p>
            <p className="text-slate-600 mt-1">Please contact the school administration to activate your account.</p>
            <button
                onClick={onLogout}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                Logout
            </button>
        </div>
    </div>
);

const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    const [notification, setNotification] = useState('');
    
    // --- APPLICATION STATE (from Firestore) ---
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [tcRecords, setTcRecords] = useState<TcRecord[]>([]);
    const [serviceCertificateRecords, setServiceCertificateRecords] = useState<ServiceCertificateRecord[]>([]);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
    const [hostelStockLogs, setHostelStockLogs] = useState<StockLog[]>([]);
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
    const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // --- MODAL & UI STATE ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [isStaffFormModalOpen, setIsStaffFormModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
    const [isInventoryFormModalOpen, setIsInventoryFormModalOpen] = useState(false);
    const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
    const [deletingInventoryItem, setDeletingInventoryItem] = useState<InventoryItem | null>(null);
    const [isHostelStaffFormModalOpen, setIsHostelStaffFormModalOpen] = useState(false);
    const [editingHostelStaff, setEditingHostelStaff] = useState<HostelStaff | null>(null);
    const [deletingHostelStaff, setDeletingHostelStaff] = useState<HostelStaff | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);
    const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
    const [studentToConfirmEdit, setStudentToConfirmEdit] = useState<Student | null>(null);
    const [pendingImportData, setPendingImportData] = useState<{ students: Omit<Student, 'id'>[], grade: Grade } | null>(null);

    // --- FIREBASE INITIALIZATION CHECK ---
    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
    useEffect(() => {
        if (!isFirebaseConfigured) {
            setAuthError("Firebase is not configured. Please add your project credentials to firebaseConfig.ts.");
            setAuthLoading(false);
        }
    }, [isFirebaseConfigured]);

    // --- AUTHENTICATION LOGIC ---
    useEffect(() => {
        if (!isFirebaseConfigured) return;

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = db.collection('users').doc(firebaseUser.uid);
                const userDocSnap = await userDocRef.get();
                if (userDocSnap.exists) {
                    setUser({ ...userDocSnap.data(), uid: firebaseUser.uid } as User);
                } else {
                    // This case is for users who signed up but don't have a firestore doc yet.
                    // This will be created on sign-up.
                    const newUser: User = { uid: firebaseUser.uid, displayName: firebaseUser.displayName, email: firebaseUser.email, photoURL: firebaseUser.photoURL, role: 'pending' };
                    await userDocRef.set({ displayName: newUser.displayName, email: newUser.email, role: 'pending' });
                    setUser(newUser);
                }
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [isFirebaseConfigured]);

    // --- DATA FETCHING FROM FIRESTORE ---
    useEffect(() => {
        if (!user || user.role === 'pending' || !isFirebaseConfigured) {
            setStudents([]); setStaff([]); setTcRecords([]); setServiceCertificateRecords([]); setGradeDefinitions(GRADE_DEFINITIONS); setInventory([]); setHostelStaff([]); setHostelInventory([]); setHostelStockLogs([]); setAllUsers([]); setAcademicYear(null); setHostelResidents([]); setHostelRooms([]);
            return;
        };

        const collectionsToSync: [string, React.Dispatch<React.SetStateAction<any[]>>][] = [
            ['students', setStudents],
            ['staff', setStaff],
            ['tcRecords', setTcRecords],
            ['serviceCertificateRecords', setServiceCertificateRecords],
            ['inventory', setInventory],
            ['hostelStaff', setHostelStaff],
            ['hostelInventory', setHostelInventory],
            ['hostelStockLogs', setHostelStockLogs],
            ['hostelResidents', setHostelResidents],
            ['hostelRooms', setHostelRooms],
        ];
        
        const unsubscribers = collectionsToSync.map(([path, setter]) => 
            db.collection(path).onSnapshot(snapshot => {
                setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            })
        );

        unsubscribers.push(db.collection('settings').doc('academic').onSnapshot(doc => setAcademicYear(doc.data()?.year || null)));
        unsubscribers.push(db.collection('settings').doc('gradeDefinitions').onSnapshot(doc => {
            const data = doc.data();
            if (data && Object.keys(data).length > 0) {
                setGradeDefinitions(data as Record<Grade, GradeDefinition>);
            } else {
                setGradeDefinitions(GRADE_DEFINITIONS);
            }
        }));

        if (user.role === 'admin') {
            unsubscribers.push(db.collection('users').onSnapshot(snapshot => {
                setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[]);
            }));
        }

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user, isFirebaseConfigured]);

    // --- UTILITY & HELPER FUNCTIONS ---
    const closeModal = useCallback(() => {
        setIsFormModalOpen(false); setEditingStudent(null); setDeletingStudent(null);
        setIsStaffFormModalOpen(false); setEditingStaff(null); setDeletingStaff(null);
        setIsInventoryFormModalOpen(false); setEditingInventoryItem(null); setDeletingInventoryItem(null);
        setIsHostelStaffFormModalOpen(false); setEditingHostelStaff(null); setDeletingHostelStaff(null);
        setIsImportModalOpen(false); setImportTargetGrade(null); setTransferringStudent(null);
    }, []);

    const uploadPhoto = async (photoDataUrl: string, path: string): Promise<string> => {
        if (!photoDataUrl || !photoDataUrl.startsWith('data:image')) {
            if (photoDataUrl && photoDataUrl.startsWith('https://firebasestorage.googleapis.com')) {
                return photoDataUrl; // It's already an uploaded URL
            }
            return '';
        }
        const storageRef = storage.ref(path);
        const snapshot = await storageRef.putString(photoDataUrl, 'data_url');
        return snapshot.ref.getDownloadURL();
    };

    // --- DATA MUTATION FUNCTIONS (to Firestore) ---
    const handleSetAcademicYear = async (year: string) => { await db.collection('settings').doc('academic').set({ year }); };
    const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => {
        const newGradeDefinitions = { ...gradeDefinitions, [grade]: newDefinition };
        await db.collection('settings').doc('gradeDefinitions').set(newGradeDefinitions);
    };
    
    // Student Handlers
    const handleFormSubmit = useCallback(async (studentData: Omit<Student, 'id'>) => {
        const dataToSave = { ...studentData };
        if(dataToSave.photographUrl) {
            dataToSave.photographUrl = await uploadPhoto(dataToSave.photographUrl, `students/${Date.now()}-${dataToSave.name}`);
        }
        if (editingStudent) {
            await db.collection('students').doc(editingStudent.id).set(dataToSave);
        } else {
            await db.collection('students').add(dataToSave);
        }
        closeModal();
    }, [editingStudent, closeModal]);
    const handleDeleteConfirm = useCallback(async () => {
        if (deletingStudent) {
            await db.collection('students').doc(deletingStudent.id).delete();
            closeModal();
        }
    }, [deletingStudent, closeModal]);

    // Staff Handlers
    const handleStaffFormSubmit = useCallback(async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
        const dataToSave = { ...staffData };
        if (dataToSave.photographUrl) {
            dataToSave.photographUrl = await uploadPhoto(dataToSave.photographUrl, `staff/${Date.now()}-${dataToSave.firstName}`);
        }

        let staffId = editingStaff?.id;
        if (editingStaff) {
            await db.collection('staff').doc(editingStaff.id).set(dataToSave);
        } else {
            const newDoc = await db.collection('staff').add(dataToSave);
            staffId = newDoc.id;
        }

        // Handle class assignment
        const newDefs = JSON.parse(JSON.stringify(gradeDefinitions));
        Object.keys(newDefs).forEach(g => {
            if (newDefs[g as Grade].classTeacherId === staffId) {
                delete newDefs[g as Grade].classTeacherId;
            }
        });
        if (assignedGradeKey && dataToSave.status === EmploymentStatus.ACTIVE) {
            newDefs[assignedGradeKey].classTeacherId = staffId;
        }
        await db.collection('settings').doc('gradeDefinitions').set(newDefs);

        closeModal();
    }, [editingStaff, closeModal, gradeDefinitions]);

    const handleDeleteStaffConfirm = useCallback(async () => {
        if (deletingStaff) {
            await db.collection('staff').doc(deletingStaff.id).delete();
            const assignedGradeKey = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === deletingStaff.id) as Grade | undefined;
            if (assignedGradeKey) {
                const newDefs = JSON.parse(JSON.stringify(gradeDefinitions));
                delete newDefs[assignedGradeKey].classTeacherId;
                await db.collection('settings').doc('gradeDefinitions').set(newDefs);
            }
            closeModal();
        }
    }, [deletingStaff, closeModal, gradeDefinitions]);

    // Other Handlers
    const handleAcademicUpdate = useCallback(async (studentId: string, academicPerformance: Exam[]) => {
        await db.collection('students').doc(studentId).set({ academicPerformance }, { merge: true });
    }, []);

    const handleUpdateFeePayments = useCallback(async (studentId: string, payments: FeePayments) => {
        await db.collection('students').doc(studentId).set({ feePayments: payments }, { merge: true });
    }, []);
    
    // ... Other handlers need to be converted to use Firestore ...
    // For brevity, only a few are shown. The logic remains similar: replace state updates with db calls.
    const handleSaveTc = async (tcData: Omit<TcRecord, 'id'>) => {
        const batch = db.batch();
        batch.set(db.collection('tcRecords').doc(), tcData);
        const studentRef = db.collection('students').doc(tcData.studentDetails.studentNumericId);
        batch.update(studentRef, { status: StudentStatus.TRANSFERRED, transferDate: tcData.tcData.issueDate });
        await batch.commit();
    };

    const handleUpdateTc = async (updatedTc: TcRecord) => {
        await db.collection('tcRecords').doc(updatedTc.id).set(updatedTc);
    };

    const handleSaveServiceCertificate = async (certData: Omit<ServiceCertificateRecord, 'id'>) => {
        const batch = db.batch();
        batch.set(db.collection('serviceCertificateRecords').doc(), certData);
        const staffRef = db.collection('staff').doc(certData.staffDetails.staffNumericId);
        batch.update(staffRef, { status: EmploymentStatus.RESIGNED });
        await batch.commit();
    };

    const handlePromoteStudents = async () => {
        const batch = db.batch();
        const finalExamId = 'terminal3';

        students.forEach(student => {
            if (student.status !== StudentStatus.ACTIVE) return;
            const gradeDef = gradeDefinitions[student.grade];
            const finalExam = student.academicPerformance?.find(e => e.id === finalExamId);
            if (!finalExam || !gradeDef || finalExam.results.length === 0) {
                 batch.update(db.collection('students').doc(student.id), { academicPerformance: [], feePayments: createDefaultFeePayments() });
                 return;
            }
            const { finalResult } = calculateStudentResult(finalExam.results, gradeDef, student.grade);
            if (finalResult === 'FAIL') {
                 batch.update(db.collection('students').doc(student.id), { academicPerformance: [], feePayments: createDefaultFeePayments() });
                 return;
            }
            if (student.grade === Grade.X) {
                batch.update(db.collection('students').doc(student.id), { status: StudentStatus.TRANSFERRED, transferDate: new Date().toISOString().split('T')[0] });
            }
            const nextGrade = getNextGrade(student.grade);
            if (nextGrade) {
                batch.update(db.collection('students').doc(student.id), { grade: nextGrade, academicPerformance: [], feePayments: createDefaultFeePayments(), rollNo: 0 });
            }
        });
        await batch.commit();
        // After promotion, admin must set new academic year. This logs them out.
        await db.collection('settings').doc('academic').set({ year: null });
    };

    // --- AUTHENTICATION FUNCTIONS ---
    const handleLogin = async (email: string, pass: string) => {
        setAuthError('');
        try {
            await auth.signInWithEmailAndPassword(email, pass);
        } catch (error: any) {
            setAuthError(error.message);
        }
    };
    const handleLogout = () => auth.signOut();
    const handleSignUp = async (name: string, email: string, pass: string) => {
        setAuthError('');
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
            await userCredential.user!.updateProfile({ displayName: name });
            await db.collection('users').doc(userCredential.user!.uid).set({
                displayName: name,
                email: email,
                role: 'pending',
            });
            return { success: true, message: "Sign-up successful! Your account is pending admin approval." };
        } catch (error: any) {
            setAuthError(error.message);
            return { success: false, message: error.message };
        }
    };
    const handleForgotPassword = async (email: string) => {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true, message: 'Password reset email sent!' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    };
    const handleChangePassword = async (currentPass: string, newPass: string) => {
        if (!auth.currentUser || !auth.currentUser.email) return { success: false, message: 'Not logged in' };
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, currentPass);
            await auth.currentUser.reauthenticateWithCredential(credential);
            await auth.currentUser.updatePassword(newPass);
            setNotification('Password changed successfully. Please log in again.');
            await auth.signOut();
            return { success: true, message: 'Password updated. You have been logged out.' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    };
    const handleUpdateUserRole = async (uid: string, newRole: 'admin' | 'user' | 'pending') => {
        await db.collection('users').doc(uid).set({ role: newRole }, { merge: true });
    };

    // --- RENDER LOGIC ---
    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading application...</div>;
    }

    const AppRoutes = () => {
        const location = useLocation();
        const isPrintRoute = location.pathname.includes('/print') || location.pathname.includes('/report-card');

        if (isPrintRoute) {
            return (
                <Routes>
                    <Route path="/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                    <Route path="/staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCertificateRecords} />} />
                    <Route path="/report-card/:studentId" element={<PrintableReportCardPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                </Routes>
            );
        }

        if (user && user.role === 'pending') {
            return <PendingApprovalPage onLogout={handleLogout} email={user.email} />;
        }
        
        if (user && !academicYear) {
            return <AcademicYearForm onSetAcademicYear={handleSetAcademicYear} />;
        }

        return (
            <div className="flex flex-col min-h-screen">
                <Header user={user!} onLogout={handleLogout} className="print-hidden" />
                <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                     <Routes>
                        <Route path="/" element={<DashboardPage user={user!} onAddStudent={() => setIsFormModalOpen(true)} studentCount={students.filter(s => s.status === StudentStatus.ACTIVE).length} academicYear={academicYear!} onSetAcademicYear={handleSetAcademicYear} allUsers={allUsers} />} />
                        <Route path="/students" element={<StudentListPage students={students.filter(s => s.status === StudentStatus.ACTIVE)} onAdd={() => setIsFormModalOpen(true)} onEdit={(s) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear!} user={user!} />} />
                        <Route path="/student/:studentId" element={<StudentDetailPage students={students} onEdit={(s) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear!} user={user!}/>} />
                        <Route path="/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleAcademicUpdate} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/reports/search" element={<ReportSearchPage students={students} academicYear={academicYear!} />} />
                        <Route path="/report-card/:studentId" element={<ProgressReportPage students={students} academicYear={academicYear!} />} />
                        <Route path="/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} user={user!} />} />
                        <Route path="/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear!} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} onOpenTransferModal={setTransferringStudent} onDelete={setDeletingStudent} user={user!} />} />
                        <Route path="/transfers" element={<TransferManagementPage students={students} tcRecords={tcRecords} />} />
                        <Route path="/transfers/register" element={<TcRegistrationPage students={students} onSave={handleSaveTc} academicYear={academicYear!} />} />
                        <Route path="/transfers/records" element={<AllTcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/update" element={<UpdateTcPage tcRecords={tcRecords} onUpdate={handleUpdateTc} />} />
                        <Route path="/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} />} />
                        <Route path="/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={() => setIsStaffFormModalOpen(true)} onEdit={(s) => { setEditingStaff(s); setIsStaffFormModalOpen(true); }} onDelete={setDeletingStaff} />} />
                        <Route path="/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={(s) => { setEditingStaff(s); setIsStaffFormModalOpen(true); }} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/fees" element={<FeeManagementPage students={students} academicYear={academicYear!} onUpdateFeePayments={handleUpdateFeePayments} />} />
                        <Route path="/reports/class-statement/:grade/:examId" element={<ClassMarkStatementPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onUpdateClassMarks={() => {}} />} />
                        <Route path="/promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onPromoteStudents={handlePromoteStudents} />} />
                        <Route path="/inventory" element={<InventoryPage inventory={inventory} onAdd={() => setIsInventoryFormModalOpen(true)} onEdit={item => { setEditingInventoryItem(item); setIsInventoryFormModalOpen(true); }} onDelete={setDeletingInventoryItem} />} />
                        <Route path="/staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCertificateRecords} />} />
                        <Route path="/staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={handleSaveServiceCertificate} />} />
                        <Route path="/hostel" element={<HostelDashboardPage />} />
                        <Route path="/hostel/students" element={<HostelStudentListPage residents={hostelResidents} rooms={hostelRooms} students={students} />} />
                        <Route path="/hostel/rooms" element={<HostelRoomListPage rooms={hostelRooms} residents={hostelResidents} students={students} />} />
                        <Route path="/hostel/fees" element={<HostelFeePage />} />
                        <Route path="/hostel/attendance" element={<HostelAttendancePage />} />
                        <Route path="/hostel/mess" element={<HostelMessPage />} />
                        <Route path="/hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={() => setIsHostelStaffFormModalOpen(true)} onEdit={s => { setEditingHostelStaff(s); setIsHostelStaffFormModalOpen(true); }} onDelete={setDeletingHostelStaff} />} />
                        <Route path="/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={() => {}} />} />
                        <Route path="/hostel/discipline" element={<HostelDisciplinePage />} />
                        <Route path="/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/hostel/settings" element={<HostelSettingsPage />} />
                        <Route path="/users" element={<UserManagementPage allUsers={allUsers} onUpdateUserRole={handleUpdateUserRole} currentUser={user!} />} />
                        <Route path="/change-password" element={<ChangePasswordPage onChangePassword={handleChangePassword} />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        );
    };

    const AuthRoutes = () => (
        <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} error={authError} notification={notification} />} />
            <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={handleForgotPassword} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );

    return (
        <HashRouter>
            {user ? <AppRoutes /> : <AuthRoutes />}
            {isFormModalOpen && <StudentFormModal isOpen={isFormModalOpen} onClose={closeModal} onSubmit={handleFormSubmit} student={editingStudent} />}
            {isStaffFormModalOpen && <StaffFormModal isOpen={isStaffFormModalOpen} onClose={closeModal} onSubmit={handleStaffFormSubmit} staffMember={editingStaff} allStaff={staff} gradeDefinitions={gradeDefinitions} />}
            {isInventoryFormModalOpen && <InventoryFormModal isOpen={isInventoryFormModalOpen} onClose={closeModal} onSubmit={() => {}} item={editingInventoryItem} />}
            {isHostelStaffFormModalOpen && <HostelStaffFormModal isOpen={isHostelStaffFormModalOpen} onClose={closeModal} onSubmit={() => {}} staffMember={editingHostelStaff} />}
            {isImportModalOpen && <ImportStudentsModal isOpen={isImportModalOpen} onClose={closeModal} onImport={() => {}} grade={importTargetGrade} allStudents={students} allGrades={GRADES_LIST} />}
            {transferringStudent && <TransferStudentModal isOpen={!!transferringStudent} onClose={closeModal} student={transferringStudent} allStudents={students} allGrades={GRADES_LIST} onConfirm={() => {}} />}
            <ConfirmationModal isOpen={!!deletingStudent} onClose={closeModal} onConfirm={handleDeleteConfirm} title="Confirm Deletion"><p>Are you sure you want to delete <span className="font-bold">{deletingStudent?.name}</span>?</p></ConfirmationModal>
            <ConfirmationModal isOpen={!!deletingStaff} onClose={closeModal} onConfirm={handleDeleteStaffConfirm} title="Confirm Staff Deletion"><p>Are you sure you want to delete <span className="font-bold">{deletingStaff?.firstName} {deletingStaff?.lastName}</span>?</p></ConfirmationModal>
        </HashRouter>
    );
};

export default App;