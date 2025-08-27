import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType, ServiceCertificateRecord, PaymentStatus, StaffAttendanceRecord, AttendanceStatus, DailyStudentAttendance, StudentAttendanceRecord } from './types';
import { GRADE_DEFINITIONS, TERMINAL_EXAMS, GRADES_LIST } from './constants';
import { getNextGrade, createDefaultFeePayments, calculateStudentResult } from './utils';

import { auth, db, firebaseConfig } from './firebaseConfig';
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
import StaffFormModal from './components/StaffFormModal';
import StaffDetailPage from './pages/StaffDetailPage';
import FeeManagementPage from './pages/FeeManagementPage';
import ClassMarkStatementPage from './pages/ClassMarkStatementPage';
import PromotionPage from './pages/PromotionPage';
import InventoryPage from './pages/InventoryPage';
import InventoryFormModal from './components/InventoryFormModal';
import ImportStudentsModal from './components/ImportStudentsModal';
import TransferStudentModal from './components/TransferStudentModal';
import StudentAttendancePage from './pages/StudentAttendancePage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Staff Certificate Pages
import StaffDocumentsPage from './pages/StaffDocumentsPage';
import GenerateServiceCertificatePage from './pages/GenerateServiceCertificatePage';
import PrintServiceCertificatePage from './pages/PrintServiceCertificatePage';
import StaffAttendancePage from './pages/StaffAttendancePage';

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
import HostelResidentFormModal from './components/HostelResidentFormModal';
import AcademicYearForm from './components/AcademicYearForm';
import { UserManagementPage } from './pages/UserManagementPage';

// IMPORTANT: Replace with your own imgbb API key.
// You can get a free key from https://api.imgbb.com/
// FIX: Explicitly type IMGBB_API_KEY as string to resolve a TypeScript error.
// TypeScript infers a `const` initialized with a string literal as that literal type.
// This caused an error when comparing it to a different string literal ("YOUR_IMGBB_API_KEY")
// because the types had no overlap. Widening the type to `string` makes the comparison valid.
const IMGBB_API_KEY: string = "ceadbeb666f524f8f5705e118af9210f";

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
    const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord | null>(null);
    const [studentAttendance, setStudentAttendance] = useState<DailyStudentAttendance | null>(null);


    // --- MODAL & UI STATE ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [newStudentTargetGrade, setNewStudentTargetGrade] = useState<Grade | null>(null);
    const [isStaffFormModalOpen, setIsStaffFormModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
    const [isInventoryFormModalOpen, setIsInventoryFormModalOpen] = useState(false);
    const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
    const [deletingInventoryItem, setDeletingInventoryItem] = useState<InventoryItem | null>(null);
    const [isHostelStaffFormModalOpen, setIsHostelStaffFormModalOpen] = useState(false);
    const [editingHostelStaff, setEditingHostelStaff] = useState<HostelStaff | null>(null);
    const [deletingHostelStaff, setDeletingHostelStaff] = useState<HostelStaff | null>(null);
    const [isHostelResidentFormModalOpen, setIsHostelResidentFormModalOpen] = useState(false);
    const [editingHostelResident, setEditingHostelResident] = useState<HostelResident | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);
    const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);

    // --- DERIVED STATE (for Role-Based Access) ---
    const assignedGrade = useMemo(() => {
        if (user?.role !== 'user' || !staff.length || !user.email) return null;
        const currentUserStaffProfile = staff.find(s => s.emailAddress.toLowerCase() === user.email?.toLowerCase());
        if (!currentUserStaffProfile) return null;
        const gradeEntry = Object.entries(gradeDefinitions).find(([, def]) => def.classTeacherId === currentUserStaffProfile.id);
        return gradeEntry ? gradeEntry[0] as Grade : null;
    }, [user, staff, gradeDefinitions]);


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
            setStudents([]); setStaff([]); setTcRecords([]); setServiceCertificateRecords([]); setGradeDefinitions(GRADE_DEFINITIONS); setInventory([]); setHostelStaff([]); setHostelInventory([]); setHostelStockLogs([]); setAllUsers([]); setAcademicYear(null); setHostelResidents([]); setHostelRooms([]); setStaffAttendance(null); setStudentAttendance(null);
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
        
        const unsubscribers = collectionsToSync.map(([path, setter]) => {
            let query: firebase.firestore.Query = db.collection(path);

            // To prevent Firestore index errors, server-side sorting is applied conservatively.
            // Most sorting is handled client-side for robustness.
            if (path === 'students') {
                query = query.orderBy('name');
            } else if (path === 'staff') {
                query = query.orderBy('firstName');
            } else if (path === 'hostelStockLogs') {
                query = query.orderBy('date', 'desc').limit(200);
            }

            return query.onSnapshot(snapshot => {
                setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, error => {
                console.error(`[Firestore Listener Error] Failed to fetch collection '${path}':`, error);
                alert(`Could not fetch real-time data for ${path}. The list may not be up-to-date. Please check the console for details.`);
            });
        });

        unsubscribers.push(db.collection('settings').doc('academic').onSnapshot(
            doc => setAcademicYear(doc.data()?.year || null),
            error => {
                console.error(`[Firestore Listener Error] Failed to fetch settings 'academic':`, error);
                alert(`Could not fetch academic year settings.`);
            }
        ));
        unsubscribers.push(db.collection('settings').doc('gradeDefinitions').onSnapshot(
            doc => {
                const data = doc.data();
                if (data && Object.keys(data).length > 0) {
                    setGradeDefinitions(data as Record<Grade, GradeDefinition>);
                } else {
                    setGradeDefinitions(GRADE_DEFINITIONS);
                }
            },
            error => {
                console.error(`[Firestore Listener Error] Failed to fetch settings 'gradeDefinitions':`, error);
                alert(`Could not fetch grade definition settings.`);
            }
        ));
        
        const today = new Date().toISOString().split('T')[0];
        unsubscribers.push(db.collection('staffAttendance').doc(today).onSnapshot(
            doc => {
                setStaffAttendance(doc.exists ? (doc.data() as StaffAttendanceRecord) : null);
            },
            error => {
                console.error(`[Firestore Listener Error] Failed to fetch staff attendance:`, error);
                alert(`Could not fetch staff attendance data.`);
            }
        ));

        unsubscribers.push(db.collection('studentAttendance').doc(today).onSnapshot(
            doc => {
                setStudentAttendance(doc.exists ? (doc.data() as DailyStudentAttendance) : {});
            },
            error => {
                console.error(`[Firestore Listener Error] Failed to fetch student attendance:`, error);
                alert(`Could not fetch student attendance data.`);
            }
        ));


        if (user.role === 'admin') {
            unsubscribers.push(db.collection('users').onSnapshot(
                snapshot => {
                    setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[]);
                },
                error => {
                    console.error(`[Firestore Listener Error] Failed to fetch collection 'users':`, error);
                    alert(`Could not fetch user list.`);
                }
            ));
        }

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user, isFirebaseConfigured]);

    // --- UI & MODAL HANDLERS ---
    const closeModal = useCallback(() => {
        setIsFormModalOpen(false); setEditingStudent(null); setDeletingStudent(null); setNewStudentTargetGrade(null);
        setIsStaffFormModalOpen(false); setEditingStaff(null); setDeletingStaff(null);
        setIsInventoryFormModalOpen(false); setEditingInventoryItem(null); setDeletingInventoryItem(null);
        setIsHostelStaffFormModalOpen(false); setEditingHostelStaff(null); setDeletingHostelStaff(null);
        setIsHostelResidentFormModalOpen(false); setEditingHostelResident(null);
        setIsImportModalOpen(false); setImportTargetGrade(null); setTransferringStudent(null);
    }, []);

    const handleAddStudent = () => {
        setNewStudentTargetGrade(null);
        setEditingStudent(null);
        setIsFormModalOpen(true);
    };
    
    const handleAddStudentToClass = (grade: Grade) => {
        setNewStudentTargetGrade(grade);
        setEditingStudent(null);
        setIsFormModalOpen(true);
    };

    const uploadPhoto = async (photoDataUrl: string): Promise<string> => {
        if (!photoDataUrl || !photoDataUrl.startsWith('data:image')) {
            return photoDataUrl;
        }
    
        if (IMGBB_API_KEY === "YOUR_IMGBB_API_KEY") {
            console.warn("imgbb API key is not configured. Photo will not be uploaded. Please add your key in App.tsx.");
            alert("Image upload is not configured. Please contact the administrator.");
            return ''; 
        }
    
        try {
            const base64img = photoDataUrl.split(',')[1];
            const formData = new FormData();
            formData.append('image', base64img);
    
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
    
            if (result.data && result.data.url) {
                return result.data.url;
            } else {
                throw new Error('imgbb API did not return an image URL.');
            }
        } catch (error) {
            console.error('Error uploading photo to imgbb:', error);
            alert(`There was an error uploading the photo. Please try again. Error: ${error instanceof Error ? error.message : String(error)}`);
            return '';
        }
    };

    // --- DATA MUTATION FUNCTIONS (to Firestore) ---
    const handleSetAcademicYear = async (year: string) => { await db.collection('settings').doc('academic').set({ year }); };
    const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => {
        const newGradeDefinitions = { ...gradeDefinitions, [grade]: newDefinition };
        await db.collection('settings').doc('gradeDefinitions').set(newGradeDefinitions);
    };
    
    const handleFormSubmit = useCallback(async (studentData: Omit<Student, 'id'>) => {
        try {
            const dataToSave: { [key: string]: any } = { ...studentData };
    
            if (dataToSave.photographUrl && dataToSave.photographUrl.startsWith('data:image')) {
                dataToSave.photographUrl = await uploadPhoto(dataToSave.photographUrl);
            }
    
            // Clean the data: Firestore cannot store 'undefined' values.
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });
    
            if (editingStudent) {
                // Use update to avoid overwriting fields not in the form (e.g., academicPerformance)
                await db.collection('students').doc(editingStudent.id).update(dataToSave);
            } else {
                await db.collection('students').add(dataToSave);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving student data:", error);
            alert(`Failed to save student data. Please check the console for details. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [editingStudent, closeModal]);

    const handleDeleteConfirm = useCallback(async () => {
        if (deletingStudent) {
            await db.collection('students').doc(deletingStudent.id).delete();
            closeModal();
        }
    }, [deletingStudent, closeModal]);

    const handleStaffFormSubmit = useCallback(async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
        try {
            const dataToSave: { [key: string]: any } = { ...staffData };
            
            if (dataToSave.photographUrl && dataToSave.photographUrl.startsWith('data:image')) {
                dataToSave.photographUrl = await uploadPhoto(dataToSave.photographUrl);
            }
            
            // Clean the data: Firestore cannot store 'undefined' values.
            // This is a safeguard, as the form modal should also perform cleaning.
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });
    
            let staffId = editingStaff?.id;
            if (editingStaff) {
                // Use update to avoid overwriting fields not in the form
                await db.collection('staff').doc(editingStaff.id).update(dataToSave);
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
            alert(`Failed to save staff member. Please check the developer console for more details. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [editingStaff, closeModal, gradeDefinitions]);

    const handleDeleteStaffConfirm = useCallback(async () => {
        if (deletingStaff) {
            await db.collection('staff').doc(deletingStaff.id).delete();
            const assignedGradeKey = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === deletingStaff.id) as Grade | null;
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
    
    // --- Hostel and Inventory Handlers (wired up) ---
    const handleHostelStaffFormSubmit = useCallback(async (staffData: Omit<HostelStaff, 'id'>) => {
        try {
            const dataToSave = { ...staffData };
            if (dataToSave.photographUrl) {
                dataToSave.photographUrl = await uploadPhoto(dataToSave.photographUrl);
            }
    
            if (editingHostelStaff) {
                await db.collection('hostelStaff').doc(editingHostelStaff.id).set(dataToSave);
            } else {
                await db.collection('hostelStaff').add(dataToSave);
            }
            
            closeModal();
        } catch (error) {
            console.error("Error saving hostel staff member:", error);
            alert(`Failed to save hostel staff member. Error: ${error}`);
        }
    }, [editingHostelStaff, closeModal]);

    const handleDeleteHostelStaffConfirm = useCallback(async () => {
        if (deletingHostelStaff) {
            await db.collection('hostelStaff').doc(deletingHostelStaff.id).delete();
            closeModal();
        }
    }, [deletingHostelStaff, closeModal]);

    const handleHostelResidentFormSubmit = useCallback(async (residentData: Omit<HostelResident, 'id'>) => {
        try {
            if (editingHostelResident) {
                await db.collection('hostelResidents').doc(editingHostelResident.id).set(residentData);
            } else {
                await db.collection('hostelResidents').add(residentData);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving hostel resident:", error);
            alert(`Failed to save hostel resident. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [editingHostelResident, closeModal]);

    const handleInventoryFormSubmit = useCallback(async (itemData: Omit<InventoryItem, 'id'>) => {
        try {
            if (editingInventoryItem) {
                await db.collection('inventory').doc(editingInventoryItem.id).set(itemData);
            } else {
                await db.collection('inventory').add(itemData);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving inventory item:", error);
            alert(`Failed to save inventory item. Error: ${error}`);
        }
    }, [editingInventoryItem, closeModal]);
    
    const handleDeleteInventoryItemConfirm = useCallback(async () => {
        if (deletingInventoryItem) {
            await db.collection('inventory').doc(deletingInventoryItem.id).delete();
            closeModal();
        }
    }, [deletingInventoryItem, closeModal]);
    
    const handleUpdateHostelStock = useCallback(async (itemId: string, change: number, notes: string) => {
        const itemRef = db.collection('hostelInventory').doc(itemId);
        const logRef = db.collection('hostelStockLogs').doc();
        
        try {
            await db.runTransaction(async (transaction) => {
                const itemDoc = await transaction.get(itemRef);
                if (!itemDoc.exists) { throw new Error("Item does not exist!"); }
                const itemData = itemDoc.data() as HostelInventoryItem;
                const newStock = itemData.currentStock + change;
    
                if (newStock < 0) { throw new Error("Stock cannot be negative."); }
                
                transaction.update(itemRef, { currentStock: newStock });
    
                const logEntry: Omit<StockLog, 'id'> = {
                    itemId: itemId,
                    itemName: itemData.name,
                    type: change > 0 ? StockLogType.IN : StockLogType.OUT,
                    quantity: Math.abs(change),
                    date: new Date().toISOString(),
                    notes: notes,
                };
                transaction.set(logRef, logEntry);
            });
        } catch (error) {
            console.error("Error updating stock:", error);
            alert(`Failed to update stock. Error: ${error}`);
        }
    }, []);
    
    const handleMarkStaffAttendance = async (staffId: string, status: AttendanceStatus) => {
        const today = new Date().toISOString().split('T')[0];
        const attendanceRef = db.collection('staffAttendance').doc(today);
        await attendanceRef.set({ [staffId]: status }, { merge: true });
    };
    
    const handleUpdateStudentAttendance = async (grade: Grade, records: StudentAttendanceRecord) => {
        const today = new Date().toISOString().split('T')[0];
        const attendanceRef = db.collection('studentAttendance').doc(today);
        await attendanceRef.set({ [grade]: records }, { merge: true });
    };

    const fetchStaffAttendanceForMonth = async (year: number, month: number): Promise<{ [date: string]: StaffAttendanceRecord }> => {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
        
        const snapshot = await db.collection('staffAttendance')
            .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
            .where(firebase.firestore.FieldPath.documentId(), '<=', endDate)
            .get();
            
        const data: { [date: string]: StaffAttendanceRecord } = {};
        snapshot.forEach(doc => {
            data[doc.id] = doc.data() as StaffAttendanceRecord;
        });
        return data;
    };

    const fetchStudentAttendanceForMonth = async (grade: Grade, year: number, month: number): Promise<{ [date: string]: StudentAttendanceRecord }> => {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
        
        const snapshot = await db.collection('studentAttendance')
            .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
            .where(firebase.firestore.FieldPath.documentId(), '<=', endDate)
            .get();
            
        const data: { [date: string]: StudentAttendanceRecord } = {};
        snapshot.forEach(doc => {
            const dailyData = doc.data() as DailyStudentAttendance;
            if (dailyData[grade]) {
                data[doc.id] = dailyData[grade];
            }
        });
        return data;
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
                        <Route path="/" element={<DashboardPage user={user} onAddStudent={handleAddStudent} studentCount={students.filter(s => s.status === 'Active').length} academicYear={academicYear} onSetAcademicYear={handleSetAcademicYear} allUsers={allUsers} assignedGrade={assignedGrade}/>} />
                        <Route path="/students" element={<StudentListPage students={students.filter(s => s.status === 'Active')} onAdd={handleAddStudent} onEdit={(s) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear} user={user} assignedGrade={assignedGrade} />} />
                        <Route path="/student/:studentId" element={<StudentDetailPage students={students} onEdit={(s) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear} user={user} assignedGrade={assignedGrade} />} />
                        <Route path="/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleAcademicUpdate} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user} assignedGrade={assignedGrade} />} />
                        <Route path="/reports/search" element={<ReportSearchPage students={students} academicYear={academicYear} />} />
                        <Route path="/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} user={user} />} />
                        <Route path="/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} onOpenTransferModal={(s) => setTransferringStudent(s)} onDelete={(s) => setDeletingStudent(s)} user={user} assignedGrade={assignedGrade} onAddStudentToClass={handleAddStudentToClass} />} />
                        <Route path="/classes/:grade/attendance" element={<StudentAttendancePage students={students} allAttendance={studentAttendance} onUpdateAttendance={handleUpdateStudentAttendance} user={user} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} academicYear={academicYear} assignedGrade={assignedGrade} />} />
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
                        <Route path="/staff/attendance" element={<StaffAttendancePage user={user} staff={staff.filter(s => s.status === EmploymentStatus.ACTIVE)} attendance={staffAttendance} onMarkAttendance={handleMarkStaffAttendance} fetchStaffAttendanceForMonth={fetchStaffAttendanceForMonth} academicYear={academicYear} />} />
                        
                        {/* Hostel */}
                        <Route path="/hostel" element={<HostelDashboardPage />} />
                        <Route path="/hostel/students" element={<HostelStudentListPage residents={hostelResidents} rooms={hostelRooms} students={students} onAdd={() => { setEditingHostelResident(null); setIsHostelResidentFormModalOpen(true); }} user={user} />} />
                        <Route path="/hostel/rooms" element={<HostelRoomListPage rooms={hostelRooms} residents={hostelResidents} students={students} />} />
                        <Route path="/hostel/fees" element={<HostelFeePage />} />
                        <Route path="/hostel/attendance" element={<HostelAttendancePage />} />
                        <Route path="/hostel/mess" element={<HostelMessPage />} />
                        <Route path="/hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={() => { setEditingHostelStaff(null); setIsHostelStaffFormModalOpen(true); }} onEdit={(s) => { setEditingHostelStaff(s); setIsHostelStaffFormModalOpen(true); }} onDelete={(s) => setDeletingHostelStaff(s)} user={user}/>} />
                        <Route path="/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={handleUpdateHostelStock} user={user}/>} />
                        <Route path="/hostel/discipline" element={<HostelDisciplinePage />} />
                        <Route path="/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/hostel/settings" element={<HostelSettingsPage />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                {isFormModalOpen && <StudentFormModal isOpen={isFormModalOpen} onClose={closeModal} onSubmit={handleFormSubmit} student={editingStudent} newStudentTargetGrade={newStudentTargetGrade} />}
                {deletingStudent && <ConfirmationModal isOpen={!!deletingStudent} onClose={closeModal} onConfirm={handleDeleteConfirm} title="Delete Student"><p>Are you sure you want to delete <span className="font-bold">{deletingStudent.name}</span>? This action cannot be undone.</p></ConfirmationModal>}
                {isStaffFormModalOpen && <StaffFormModal isOpen={isStaffFormModalOpen} onClose={closeModal} onSubmit={handleStaffFormSubmit} staffMember={editingStaff} allStaff={staff} gradeDefinitions={gradeDefinitions} />}
                {deletingStaff && <ConfirmationModal isOpen={!!deletingStaff} onClose={closeModal} onConfirm={handleDeleteStaffConfirm} title="Delete Staff Member"><p>Are you sure you want to delete <span className="font-bold">{deletingStaff.firstName} {deletingStaff.lastName}</span>? This action cannot be undone.</p></ConfirmationModal>}
                {isInventoryFormModalOpen && <InventoryFormModal isOpen={isInventoryFormModalOpen} onClose={closeModal} onSubmit={handleInventoryFormSubmit} item={editingInventoryItem} />}
                {deletingInventoryItem && <ConfirmationModal isOpen={!!deletingInventoryItem} onClose={closeModal} onConfirm={handleDeleteInventoryItemConfirm} title="Delete Inventory Item"><p>Are you sure you want to delete <span className="font-bold">{deletingInventoryItem.name}</span>? This action cannot be undone.</p></ConfirmationModal>}
                {isHostelStaffFormModalOpen && <HostelStaffFormModal isOpen={isHostelStaffFormModalOpen} onClose={closeModal} onSubmit={handleHostelStaffFormSubmit} staffMember={editingHostelStaff} />}
                {deletingHostelStaff && <ConfirmationModal isOpen={!!deletingHostelStaff} onClose={closeModal} onConfirm={handleDeleteHostelStaffConfirm} title="Delete Hostel Staff"><p>Are you sure you want to delete <span className="font-bold">{deletingHostelStaff.name}</span>? This action cannot be undone.</p></ConfirmationModal>}
                {isHostelResidentFormModalOpen && <HostelResidentFormModal isOpen={isHostelResidentFormModalOpen} onClose={closeModal} onSubmit={handleHostelResidentFormSubmit} resident={editingHostelResident} allStudents={students} allRooms={hostelRooms} allResidents={hostelResidents} />}
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
