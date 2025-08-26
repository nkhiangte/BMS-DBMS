
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
    const [isImporting, setIsImporting] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);
    const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);

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
                return photoDataUrl;
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

    const handleStaffFormSubmit = useCallback(async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
        try {
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
        } catch (error) {
            console.error("Error saving staff member:", error);
            alert(`Failed to save staff member. Please check the developer console for more details. Error: ${error}`);
        }
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

    const handleImportStudents = useCallback(async (newStudents: Omit<Student, 'id'>[], grade: Grade) => {
        setIsImporting(true);
        const CHUNK_SIZE = 400;
        try {
            for (let i = 0; i < newStudents.length; i += CHUNK_SIZE) {
                const chunk = newStudents.slice(i, i + CHUNK_SIZE);
                const batch = db.batch();
                chunk.forEach(studentData => {
                    const studentDocRef = db.collection('students').doc();
                    const finalStudentData = { ...studentData, grade };
                    batch.set(studentDocRef, finalStudentData);
                });
                await batch.commit();
            }
            closeModal();
        } catch (error) {
            console.error("Error importing students:", error);
            alert(`Failed to import students. Please check the console for details. Error: ${error}`);
        } finally {
            setIsImporting(false);
        }
    }, [closeModal]);

    const handleAcademicUpdate = useCallback(async (studentId: string, academicPerformance: Exam[]) => {
        await db.collection('students').doc(studentId).set({ academicPerformance }, { merge: true });
    }, []);

    const handleUpdateFeePayments = useCallback(async (studentId: string, payments: FeePayments) => {
        await db.collection('students').doc(studentId).set({ feePayments: payments }, { merge: true });
    }, []);
    
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
    const handleDeleteUser = async (uid: string) => {
        if (uid === user?.uid) {
            console.error("Admin cannot delete themselves.");
            return;
        }
        await db.collection('users').doc(uid).delete();
    };

    const RouterContent = () => {
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
        
        if (!user) {
             return (
                <Routes>
                    <Route path="/login" element={<LoginPage onLogin={handleLogin} error={authError} notification={notification} />} />
                    <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={handleForgotPassword} />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            );
        }

        if (user.role === 'pending') {
            return <PendingApprovalPage onLogout={handleLogout} email={user.email} />;
        }
        
        if (!academicYear) {
            return <AcademicYearForm onSetAcademicYear={handleSetAcademicYear} />;
        }

        return (
            <div className="flex flex-col min-h-screen">
                <Header user={user} onLogout={handleLogout} />
                <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                    <Routes>
                        <Route path="/" element={<DashboardPage user={user} onAddStudent={() => { setEditingStudent(null); setIsFormModalOpen(true); }} studentCount={students.filter(s => s.status === 'Active').length} academicYear={academicYear} onSetAcademicYear={handleSetAcademicYear} allUsers={allUsers}/>} />
                        <Route path="/students" element={<StudentListPage students={students.filter(s => s.status === 'Active')} onAdd={() => { setEditingStudent(null); setIsFormModalOpen(true); }} onEdit={(s) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear} user={user} />} />
                        <Route path="/student/:studentId" element={<StudentDetailPage students={students} onEdit={(s) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear} user={user} />} />
                        <Route path="/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleAcademicUpdate} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user} />} />
                        <Route path="/reports/search" element={<ReportSearchPage students={students} academicYear={academicYear} />} />
                        <Route path="/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} user={user} />} />
                        <Route path="/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} onOpenTransferModal={(s) => setTransferringStudent(s)} onDelete={(s) => setDeletingStudent(s)} user={user} />} />
                        <Route path="/transfers" element={<TransferManagementPage students={students} tcRecords={tcRecords} />} />
                        <Route path="/transfers/register" element={<TcRegistrationPage students={students} onSave={handleSaveTc} academicYear={academicYear} user={user} />} />
                        <Route path="/transfers/records" element={<AllTcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/update" element={<UpdateTcPage tcRecords={tcRecords} onUpdate={handleUpdateTc} user={user} />} />
                        <Route path="/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} user={user} />} />
                        <Route path="/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={() => { setEditingStaff(null); setIsStaffFormModalOpen(true); }} onEdit={(s) => { setEditingStaff(s); setIsStaffFormModalOpen(true); }} onDelete={(s) => setDeletingStaff(s)} user={user} />} />
                        <Route path="/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={(s) => { setEditingStaff(s); setIsStaffFormModalOpen(true); }} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/fees" element={<FeeManagementPage students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} user={user} />} />
                        <Route path="/reports/class-statement/:grade/:examId" element={<ClassMarkStatementPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onUpdateClassMarks={() => {}} />} />
                        <Route path="/promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onPromoteStudents={handlePromoteStudents} user={user} />} />
                        <Route path="/inventory" element={<InventoryPage inventory={inventory} onAdd={() => { setEditingInventoryItem(null); setIsInventoryFormModalOpen(true); }} onEdit={(i) => { setEditingInventoryItem(i); setIsInventoryFormModalOpen(true); }} onDelete={(i) => setDeletingInventoryItem(i)} user={user} />} />
                        <Route path="/change-password" element={<ChangePasswordPage onChangePassword={handleChangePassword} />} />
                        <Route path="/users" element={<UserManagementPage allUsers={allUsers} currentUser={user} onUpdateUserRole={handleUpdateUserRole} onDeleteUser={handleDeleteUser} />} />

                        {/* Staff Docs */}
                        <Route path="/staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCertificateRecords} user={user} />} />
                        <Route path="/staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={handleSaveServiceCertificate} user={user} />} />
                        
                        {/* Hostel */}
                        <Route path="/hostel" element={<HostelDashboardPage />} />
                        <Route path="/hostel/students" element={<HostelStudentListPage residents={hostelResidents} rooms={hostelRooms} students={students} />} />
                        <Route path="/hostel/rooms" element={<HostelRoomListPage rooms={hostelRooms} residents={hostelResidents} students={students} />} />
                        <Route path="/hostel/fees" element={<HostelFeePage />} />
                        <Route path="/hostel/attendance" element={<HostelAttendancePage />} />
                        <Route path="/hostel/mess" element={<HostelMessPage />} />
                        <Route path="/hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={() => { setEditingHostelStaff(null); setIsHostelStaffFormModalOpen(true); }} onEdit={(s) => { setEditingHostelStaff(s); setIsHostelStaffFormModalOpen(true); }} onDelete={(s) => setDeletingHostelStaff(s)} user={user}/>} />
                        <Route path="/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={() => {}} user={user}/>} />
                        <Route path="/hostel/discipline" element={<HostelDisciplinePage />} />
                        <Route path="/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/hostel/settings" element={<HostelSettingsPage />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                {isFormModalOpen && <StudentFormModal isOpen={isFormModalOpen} onClose={closeModal} onSubmit={handleFormSubmit} student={editingStudent} />}
                {deletingStudent && <ConfirmationModal isOpen={!!deletingStudent} onClose={closeModal} onConfirm={handleDeleteConfirm} title="Delete Student"><p>Are you sure you want to delete <span className="font-bold">{deletingStudent.name}</span>? This action cannot be undone.</p></ConfirmationModal>}
                {isStaffFormModalOpen && <StaffFormModal isOpen={isStaffFormModalOpen} onClose={closeModal} onSubmit={handleStaffFormSubmit} staffMember={editingStaff} allStaff={staff} gradeDefinitions={gradeDefinitions} />}
                {deletingStaff && <ConfirmationModal isOpen={!!deletingStaff} onClose={closeModal} onConfirm={handleDeleteStaffConfirm} title="Delete Staff Member"><p>Are you sure you want to delete <span className="font-bold">{deletingStaff.firstName} {deletingStaff.lastName}</span>? This action cannot be undone.</p></ConfirmationModal>}
                {isInventoryFormModalOpen && <InventoryFormModal isOpen={isInventoryFormModalOpen} onClose={closeModal} onSubmit={() => {}} item={editingInventoryItem} />}
                {deletingInventoryItem && <ConfirmationModal isOpen={!!deletingInventoryItem} onClose={closeModal} onConfirm={() => {}} title="Delete Inventory Item"><p>Are you sure you want to delete <span className="font-bold">{deletingInventoryItem.name}</span>? This action cannot be undone.</p></ConfirmationModal>}
                {isHostelStaffFormModalOpen && <HostelStaffFormModal isOpen={isHostelStaffFormModalOpen} onClose={closeModal} onSubmit={() => {}} staffMember={editingHostelStaff} />}
                {deletingHostelStaff && <ConfirmationModal isOpen={!!deletingHostelStaff} onClose={closeModal} onConfirm={() => {}} title="Delete Hostel Staff"><p>Are you sure you want to delete <span className="font-bold">{deletingHostelStaff.name}</span>? This action cannot be undone.</p></ConfirmationModal>}
                {isImportModalOpen && <ImportStudentsModal isOpen={isImportModalOpen} onClose={closeModal} onImport={handleImportStudents} grade={importTargetGrade} allStudents={students} allGrades={GRADES_LIST} isImporting={isImporting} />}
                {transferringStudent && <TransferStudentModal isOpen={!!transferringStudent} onClose={closeModal} onConfirm={() => {}} student={transferringStudent} allStudents={students} allGrades={GRADES_LIST} />}
            </div>
        );
    }
    
    // --- RENDER LOGIC ---
    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading application...</div>;
    }
    
    if (authError && isFirebaseConfigured) {
        return <div className="flex items-center justify-center h-screen bg-red-50 text-red-700 p-4">{authError}</div>;
    }
    
    if (!isFirebaseConfigured) {
         return <div className="flex items-center justify-center h-screen bg-red-50 text-red-700 p-4">{authError}</div>;
    }

    return (
        <HashRouter>
            <RouterContent />
        </HashRouter>
    );
};

export default App;
