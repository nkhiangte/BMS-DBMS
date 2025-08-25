



import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType, ServiceCertificateRecord, PaymentStatus } from './types';
import { GRADE_DEFINITIONS, TERMINAL_EXAMS, GRADES_LIST } from './constants';

// Firebase Imports
import { auth, db } from './firebaseConfig';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, createUserWithEmailAndPassword, updateProfile } from '@firebase/auth';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch, getDoc, setDoc, query } from '@firebase/firestore';


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
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import InventoryPage from './pages/InventoryPage';
import InventoryFormModal from './components/InventoryFormModal';
import ImportStudentsModal from './components/ImportStudentsModal';
import TransferStudentModal from './components/TransferStudentModal';
import { calculateStudentResult, getNextGrade, createDefaultFeePayments } from './utils';

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

const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');

    // --- APPLICATION STATE & LOGIC ---
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [tcRecords, setTcRecords] = useState<TcRecord[]>([]);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);

    // --- Staff Management State ---
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isStaffFormModalOpen, setIsStaffFormModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
    const [serviceCertificateRecords, setServiceCertificateRecords] = useState<ServiceCertificateRecord[]>([]);
    
    // --- Inventory Management State ---
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isInventoryFormModalOpen, setIsInventoryFormModalOpen] = useState(false);
    const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
    const [deletingInventoryItem, setDeletingInventoryItem] = useState<InventoryItem | null>(null);

    // --- Hostel Management State ---
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
    const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>([]);
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
    const [hostelStockLogs, setHostelStockLogs] = useState<StockLog[]>([]);
    const [isHostelStaffFormModalOpen, setIsHostelStaffFormModalOpen] = useState(false);
    const [editingHostelStaff, setEditingHostelStaff] = useState<HostelStaff | null>(null);
    const [deletingHostelStaff, setDeletingHostelStaff] = useState<HostelStaff | null>(null);

    // --- Import Modal State ---
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);

    // --- Transfer Modal State ---
    const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
    
    // --- Confirmation Modal States ---
    const [studentToConfirmEdit, setStudentToConfirmEdit] = useState<Student | null>(null);
    const [pendingImportData, setPendingImportData] = useState<{ students: Omit<Student, 'id'>[], grade: Grade } | null>(null);

    // --- Data Fetching from Firestore ---
    const fetchData = async () => {
        try {
            const collectionsToFetch = {
                students: setStudents,
                staff: setStaff,
                tcRecords: setTcRecords,
                serviceCertificateRecords: setServiceCertificateRecords,
                inventory: setInventory,
                hostelResidents: setHostelResidents,
                hostelRooms: setHostelRooms,
                hostelStaff: setHostelStaff,
                hostelInventory: setHostelInventory,
                hostelStockLogs: setHostelStockLogs,
            };

            const promises = Object.keys(collectionsToFetch).map(async (collectionName) => {
                const q = query(collection(db, collectionName));
                const querySnapshot = await getDocs(q);
                return {
                    name: collectionName,
                    data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                };
            });

            // Handle Grade Definitions separately for potential seeding
            const gradeDefsDoc = await getDoc(doc(db, "settings", "gradeDefinitions"));
            if (gradeDefsDoc.exists()) {
                setGradeDefinitions(gradeDefsDoc.data() as Record<Grade, GradeDefinition>);
            } else {
                // Seed the database if it doesn't exist
                await setDoc(doc(db, "settings", "gradeDefinitions"), GRADE_DEFINITIONS);
                setGradeDefinitions(GRADE_DEFINITIONS);
            }

            const results = await Promise.all(promises);
            results.forEach(result => {
                const setState = collectionsToFetch[result.name as keyof typeof collectionsToFetch];
                setState(result.data as any);
            });
            
        } catch (err) {
            console.error("Error fetching data from Firestore:", err);
            setError("Could not load data from the database.");
        }
    };


    // --- AUTHENTICATION LOGIC ---
     useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const appUser: User = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                };
                setUser(appUser);
                await fetchData();
            } else {
                setUser(null);
                // Clear all data on logout
                setStudents([]);
                setStaff([]);
                setTcRecords([]);
                // ... reset all other states
            }
            setLoading(false);
        });
        
        const storedYear = localStorage.getItem('academicYear');
        if (storedYear) {
            setAcademicYear(storedYear);
        }

        return () => unsubscribe();
    }, []);

    const handleLogin = useCallback(async (email: string, password: string, rememberMe: boolean) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
            } else {
                localStorage.removeItem('rememberedUser');
            }
            setError('');
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        }
    }, []);

    const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });
                // onAuthStateChanged will handle setting user and fetching data
            }
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }, []);


    const handleLogout = useCallback(async () => {
        await signOut(auth);
        setAcademicYear(null);
        localStorage.removeItem('academicYear');
    }, []);

    const handleForgotPassword = useCallback(async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true, message: 'Password reset email sent. Please check your inbox.' };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }, []);

    const handleChangePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        if (!auth.currentUser) return { success: false, message: 'No user is logged in.' };
        
        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPassword);
            await signOut(auth); // Force sign out for security
            return { success: true, message: 'Password updated successfully. Please log in again.' };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }, []);

    const handleSetAcademicYear = useCallback((year: string) => {
        setAcademicYear(year);
        localStorage.setItem('academicYear', year);
    }, []);

    const handleUpdateGradeDefinition = useCallback(async (grade: Grade, newDefinition: GradeDefinition) => {
        const newGradeDefinitions = {
            ...gradeDefinitions,
            [grade]: newDefinition,
        };
        setGradeDefinitions(newGradeDefinitions);
        await setDoc(doc(db, "settings", "gradeDefinitions"), newGradeDefinitions, { merge: true });
    }, [gradeDefinitions]);

    const handleAssignClassToStaff = useCallback(async (staffId: string, newGradeKey: Grade | null) => {
        const newDefs = JSON.parse(JSON.stringify(gradeDefinitions));
            
        const oldGradeKey = Object.keys(newDefs).find(g => newDefs[g as Grade]?.classTeacherId === staffId) as Grade | undefined;
        if (oldGradeKey) {
            delete newDefs[oldGradeKey].classTeacherId;
        }

        if (newGradeKey) {
            const otherStaffAssigned = Object.keys(newDefs).find(g => newDefs[g as Grade]?.classTeacherId && g === newGradeKey);
            if(otherStaffAssigned) {
                delete newDefs[otherStaffAssigned as Grade].classTeacherId;
            }
            newDefs[newGradeKey].classTeacherId = staffId;
        }
        
        setGradeDefinitions(newDefs);
        await setDoc(doc(db, "settings", "gradeDefinitions"), newDefs);
    }, [gradeDefinitions]);

    const openAddModal = useCallback(() => {
        setEditingStudent(null);
        setIsFormModalOpen(true);
    }, []);

    const openEditModal = useCallback((student: Student) => {
        setEditingStudent(student);
        setIsFormModalOpen(true);
    }, []);

    const openDeleteConfirm = useCallback((student: Student) => {
        setDeletingStudent(student);
    }, []);

    const closeModal = useCallback(() => {
        setIsFormModalOpen(false);
        setEditingStudent(null);
        setDeletingStudent(null);
        setIsStaffFormModalOpen(false);
        setEditingStaff(null);
        setDeletingStaff(null);
        setIsInventoryFormModalOpen(false);
        setEditingInventoryItem(null);
        setDeletingInventoryItem(null);
        setIsImportModalOpen(false);
        setImportTargetGrade(null);
        setTransferringStudent(null);
        setIsHostelStaffFormModalOpen(false);
        setEditingHostelStaff(null);
        setDeletingHostelStaff(null);
    }, []);

    const handleFormSubmit = useCallback(async (studentData: Omit<Student, 'id'>) => {
        if (editingStudent) {
            setStudentToConfirmEdit({ ...studentData, id: editingStudent.id });
        } else {
            const docRef = await addDoc(collection(db, 'students'), studentData);
            setStudents(prev => [
                ...prev,
                { ...studentData, id: docRef.id },
            ]);
        }
        closeModal();
    }, [editingStudent, closeModal]);

    const handleConfirmEdit = useCallback(async () => {
        if (studentToConfirmEdit) {
            const { id, ...dataToUpdate } = studentToConfirmEdit;
            await updateDoc(doc(db, 'students', id), dataToUpdate);
            setStudents(prev =>
                prev.map(s =>
                    s.id === studentToConfirmEdit.id ? studentToConfirmEdit : s
                )
            );
            setStudentToConfirmEdit(null);
        }
    }, [studentToConfirmEdit]);

    const handleDeleteConfirm = useCallback(async () => {
        if (deletingStudent) {
            await deleteDoc(doc(db, 'students', deletingStudent.id));
            setStudents(prev => prev.filter(s => s.id !== deletingStudent.id));
            closeModal();
        }
    }, [deletingStudent, closeModal]);

    const handleBulkAddStudents = useCallback((studentsData: Omit<Student, 'id'>[], grade: Grade) => {
        setPendingImportData({ students: studentsData, grade });
        closeModal();
    }, [closeModal]);

    const handleConfirmImport = useCallback(async () => {
        if (pendingImportData) {
            const batch = writeBatch(db);
            const newStudentsWithIds: Student[] = [];

            pendingImportData.students.forEach(studentData => {
                const docRef = doc(collection(db, 'students'));
                batch.set(docRef, studentData);
                newStudentsWithIds.push({ ...studentData, id: docRef.id });
            });
            
            await batch.commit();
            setStudents(prev => [...prev, ...newStudentsWithIds]);
            setPendingImportData(null);
        }
    }, [pendingImportData]);


    const handleAcademicUpdate = useCallback(async (studentId: string, academicPerformance: Exam[]) => {
        await updateDoc(doc(db, 'students', studentId), { academicPerformance });
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId
                    ? { ...s, academicPerformance }
                    : s
            )
        );
    }, []);

    // --- Staff Handlers ---
    const openAddStaffModal = useCallback(() => {
        setEditingStaff(null);
        setIsStaffFormModalOpen(true);
    }, []);

    const openEditStaffModal = useCallback((staffMember: Staff) => {
        setEditingStaff(staffMember);
        setIsStaffFormModalOpen(true);
    }, []);

    const openDeleteStaffConfirm = useCallback((staffMember: Staff) => {
        setDeletingStaff(staffMember);
    }, []);

    const handleDeleteStaffConfirm = useCallback(async () => {
        if (deletingStaff) {
            await deleteDoc(doc(db, 'staff', deletingStaff.id));
            setStaff(prev => prev.filter(s => s.id !== deletingStaff.id));
            
            const assignedGradeKey = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === deletingStaff.id) as Grade | undefined;
            if (assignedGradeKey) {
                await handleAssignClassToStaff(deletingStaff.id, null);
            }
            closeModal();
        }
    }, [deletingStaff, closeModal, gradeDefinitions, handleAssignClassToStaff]);

    const handleStaffFormSubmit = useCallback(async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
        let updatedStaffId: string;
        const finalAssignedGradeKey = staffData.status === EmploymentStatus.ACTIVE ? assignedGradeKey : null;

        if (editingStaff) {
            updatedStaffId = editingStaff.id;
            const { id, ...dataToUpdate } = { ...staffData, id: editingStaff.id };
            await updateDoc(doc(db, 'staff', id), dataToUpdate);
            setStaff(prev =>
                prev.map(t =>
                    t.id === editingStaff.id ? { ...t, ...staffData, id: t.id } : t
                )
            );
        } else {
            const docRef = await addDoc(collection(db, 'staff'), staffData);
            updatedStaffId = docRef.id;
            setStaff(prev => [
                ...prev,
                { ...staffData, id: docRef.id },
            ]);
        }

        await handleAssignClassToStaff(updatedStaffId, finalAssignedGradeKey);
        closeModal();
    }, [editingStaff, closeModal, handleAssignClassToStaff]);

    const handleSaveServiceCertificate = useCallback(async (certData: Omit<ServiceCertificateRecord, 'id'>) => {
        const docRef = await addDoc(collection(db, 'serviceCertificateRecords'), certData);
        const newRecord: ServiceCertificateRecord = { ...certData, id: docRef.id };
        setServiceCertificateRecords(prev => [...prev, newRecord]);
        
        await updateDoc(doc(db, 'staff', certData.staffDetails.staffNumericId), { status: EmploymentStatus.RESIGNED });
        setStaff(prevStaff =>
            prevStaff.map(s => 
                s.id === certData.staffDetails.staffNumericId
                ? { ...s, status: EmploymentStatus.RESIGNED }
                : s
            )
        );
    }, []);
    
    // --- Inventory Handlers ---
    const openAddInventoryModal = useCallback(() => {
        setEditingInventoryItem(null);
        setIsInventoryFormModalOpen(true);
    }, []);

    const openEditInventoryModal = useCallback((item: InventoryItem) => {
        setEditingInventoryItem(item);
        setIsInventoryFormModalOpen(true);
    }, []);

    const openDeleteInventoryConfirm = useCallback((item: InventoryItem) => {
        setDeletingInventoryItem(item);
    }, []);

    const handleInventoryFormSubmit = useCallback(async (itemData: Omit<InventoryItem, 'id'>) => {
        if (editingInventoryItem) {
            const { id, ...dataToUpdate } = { ...itemData, id: editingInventoryItem.id };
            await updateDoc(doc(db, 'inventory', id), dataToUpdate);
            setInventory(prev =>
                prev.map(i =>
                    i.id === editingInventoryItem.id ? { ...i, ...itemData, id: i.id } : i
                )
            );
        } else {
            const docRef = await addDoc(collection(db, 'inventory'), itemData);
            setInventory(prev => [
                ...prev,
                { ...itemData, id: docRef.id },
            ]);
        }
        closeModal();
    }, [editingInventoryItem, closeModal]);

    const handleDeleteInventoryConfirm = useCallback(async () => {
        if (deletingInventoryItem) {
            await deleteDoc(doc(db, 'inventory', deletingInventoryItem.id));
            setInventory(prev => prev.filter(i => i.id !== deletingInventoryItem.id));
            closeModal();
        }
    }, [deletingInventoryItem, closeModal]);

    // --- Hostel Handlers ---
    const handleUpdateHostelStock = useCallback(async (itemId: string, change: number, notes: string) => {
        const itemToUpdate = hostelInventory.find(item => item.id === itemId);
        if(!itemToUpdate) return;
        
        const newStock = itemToUpdate.currentStock + change;
        await updateDoc(doc(db, 'hostelInventory', itemId), { currentStock: newStock });

        const newLogData: Omit<StockLog, 'id'> = {
            itemId: itemId,
            itemName: itemToUpdate.name,
            type: change > 0 ? StockLogType.IN : StockLogType.OUT,
            quantity: Math.abs(change),
            date: new Date().toISOString(),
            notes: notes,
        };
        const logDocRef = await addDoc(collection(db, 'hostelStockLogs'), newLogData);

        setHostelInventory(prev => 
            prev.map(item => item.id === itemId ? { ...item, currentStock: newStock } : item)
        );
        setHostelStockLogs(prev => [{...newLogData, id: logDocRef.id}, ...prev]);
    }, [hostelInventory]);
    
    const openAddHostelStaffModal = useCallback(() => {
        setEditingHostelStaff(null);
        setIsHostelStaffFormModalOpen(true);
    }, []);

    const openEditHostelStaffModal = useCallback((staffMember: HostelStaff) => {
        setEditingHostelStaff(staffMember);
        setIsHostelStaffFormModalOpen(true);
    }, []);

    const openDeleteHostelStaffConfirm = useCallback((staffMember: HostelStaff) => {
        setDeletingHostelStaff(staffMember);
    }, []);

    const handleHostelStaffFormSubmit = useCallback(async (staffData: Omit<HostelStaff, 'id' | 'paymentStatus' | 'attendancePercent'>) => {
        if (editingHostelStaff) {
            const { id, ...dataToUpdate } = { ...editingHostelStaff, ...staffData };
            await updateDoc(doc(db, 'hostelStaff', id), dataToUpdate);
            setHostelStaff(prev =>
                prev.map(s =>
                    s.id === editingHostelStaff.id ? { ...s, ...staffData, id: s.id } : s
                )
            );
        } else {
            const newData = { ...staffData, paymentStatus: PaymentStatus.PENDING, attendancePercent: 100 };
            const docRef = await addDoc(collection(db, 'hostelStaff'), newData);
            setHostelStaff(prev => [
                ...prev,
                { ...newData, id: docRef.id },
            ]);
        }
        closeModal();
    }, [editingHostelStaff, closeModal]);

    const handleDeleteHostelStaffConfirm = useCallback(async () => {
        if (deletingHostelStaff) {
            await deleteDoc(doc(db, 'hostelStaff', deletingHostelStaff.id));
            setHostelStaff(prev => prev.filter(s => s.id !== deletingHostelStaff.id));
            closeModal();
        }
    }, [deletingHostelStaff, closeModal]);


    const handleSaveTc = useCallback(async (tcData: Omit<TcRecord, 'id'>) => {
        const docRef = await addDoc(collection(db, 'tcRecords'), tcData);
        const newRecord: TcRecord = { ...tcData, id: docRef.id };
        setTcRecords(prev => [...prev, newRecord]);
        
        await updateDoc(doc(db, 'students', tcData.studentDetails.studentNumericId), {
            status: StudentStatus.TRANSFERRED,
            transferDate: tcData.tcData.issueDate
        });
        setStudents(prevStudents =>
            prevStudents.map(s => 
                s.id === tcData.studentDetails.studentNumericId
                ? { ...s, status: StudentStatus.TRANSFERRED, transferDate: tcData.tcData.issueDate }
                : s
            )
        );
    }, []);

    const handleUpdateTc = useCallback(async (updatedTc: TcRecord) => {
        const { id, ...dataToUpdate } = updatedTc;
        await updateDoc(doc(db, 'tcRecords', id), dataToUpdate);
        setTcRecords(prev => 
            prev.map(record => record.id === updatedTc.id ? updatedTc : record)
        );
    }, []);

    const handleUpdateFeePayments = useCallback(async (studentId: string, feePayments: FeePayments) => {
        await updateDoc(doc(db, 'students', studentId), { feePayments });
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId ? { ...s, feePayments } : s
            )
        );
    }, []);

    const handleUpdateClassMarks = useCallback(async (marksByStudentId: Map<string, SubjectMark[]>, examId: string) => {
        const batch = writeBatch(db);
        const updatedStudentsState = [...students];

        marksByStudentId.forEach((newMarks, studentId) => {
            const studentIndex = updatedStudentsState.findIndex(s => s.id === studentId);
            if (studentIndex === -1) return;
            
            const student = updatedStudentsState[studentIndex];
            const performance = student.academicPerformance ? JSON.parse(JSON.stringify(student.academicPerformance)) : [];
            const examIndex = performance.findIndex((e: Exam) => e.id === examId);
            const examName = TERMINAL_EXAMS.find(e => e.id === examId)?.name || 'Unknown Exam';
            const cleanedNewMarks = newMarks.filter(m => m.marks != null || m.examMarks != null || m.activityMarks != null);

            if (examIndex > -1) {
                performance[examIndex].results = cleanedNewMarks;
            } else {
                performance.push({ id: examId, name: examName, results: cleanedNewMarks });
            }
            updatedStudentsState[studentIndex] = { ...student, academicPerformance: performance };
            
            const studentRef = doc(db, 'students', studentId);
            batch.update(studentRef, { academicPerformance: performance });
        });

        await batch.commit();
        setStudents(updatedStudentsState);
    }, [students]);

    const handlePromoteStudents = useCallback(async () => {
        const batch = writeBatch(db);
        const finalExamId = 'terminal3';
        
        students.forEach(student => {
            if (student.status !== StudentStatus.ACTIVE) return;
            const gradeDef = gradeDefinitions[student.grade];
            const finalExam = student.academicPerformance?.find(e => e.id === finalExamId);
            const studentRef = doc(db, 'students', student.id);
            
            const newFeePayments = createDefaultFeePayments();

            if (!finalExam || !gradeDef) {
                batch.update(studentRef, { academicPerformance: [], feePayments: newFeePayments });
                return;
            }
    
            const { finalResult } = calculateStudentResult(finalExam.results, gradeDef, student.grade);
    
            if (finalResult === 'FAIL') {
                batch.update(studentRef, { academicPerformance: [], feePayments: newFeePayments });
            } else {
                if (student.grade === Grade.X) {
                    batch.update(studentRef, { 
                        status: StudentStatus.TRANSFERRED, 
                        transferDate: `Graduated in ${academicYear}`, 
                        academicPerformance: [], 
                        feePayments: newFeePayments 
                    });
                } else {
                    const nextGrade = getNextGrade(student.grade);
                    if (nextGrade) {
                        batch.update(studentRef, { 
                            grade: nextGrade, 
                            academicPerformance: [], 
                            feePayments: newFeePayments 
                        });
                    }
                }
            }
        });

        await batch.commit();
        await handleLogout();
    }, [students, gradeDefinitions, academicYear, handleLogout]);

    const openImportModal = useCallback((grade: Grade | null) => {
        setImportTargetGrade(grade);
        setIsImportModalOpen(true);
    }, []);

    const openTransferModal = useCallback((student: Student) => {
        setTransferringStudent(student);
    }, []);

    const handleTransferStudent = useCallback(async (studentId: string, newGrade: Grade, newRollNo: number) => {
        await updateDoc(doc(db, 'students', studentId), { grade: newGrade, rollNo: newRollNo });
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId
                    ? { ...s, grade: newGrade, rollNo: newRollNo }
                    : s
            )
        );
        closeModal();
    }, [closeModal]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl font-semibold">Loading Application...</div>
            </div>
        )
    }

    const MainAppContent = () => {
        const location = useLocation();
        const navigate = useNavigate();
        const isPrintPage = (location.pathname.startsWith('/report-card/') && location.pathname.split('/').length > 3) || location.pathname.startsWith('/transfers/print') || location.pathname.startsWith('/reports/class-statement') || location.pathname.startsWith('/staff/certificates/print');
        const notificationMessage = (location.state as { message?: string })?.message;

        useEffect(() => {
            if (notificationMessage) {
                navigate(location.pathname, { replace: true });
            }
        }, [notificationMessage, location.pathname, navigate]);

        return (
            <div className="min-h-screen">
                <Header user={user!} onLogout={handleLogout} className={isPrintPage ? 'print:hidden' : ''} />
                <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                    {notificationMessage && (
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-r-lg relative mb-6 shadow-md" role="alert">
                            <span className="font-bold">Success!</span> {notificationMessage}
                        </div>
                    )}
                    <Routes>
                        <Route path="/" element={<DashboardPage user={user!} onAddStudent={openAddModal} studentCount={students.filter(s => s.status === StudentStatus.ACTIVE).length} academicYear={academicYear!} onSetAcademicYear={handleSetAcademicYear} />} />
                        <Route path="/students" element={<StudentListPage students={students.filter(s => s.status === StudentStatus.ACTIVE)} onAdd={openAddModal} onEdit={openEditModal} academicYear={academicYear!} />} />
                        <Route path="/student/:studentId" element={<StudentDetailPage students={students} onEdit={openEditModal} academicYear={academicYear!} />} />
                        <Route path="/reports/search" element={<ReportSearchPage students={students} academicYear={academicYear!} />} />
                        <Route path="/reports/class-statement/:grade/:examId" element={<ClassMarkStatementPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onUpdateClassMarks={handleUpdateClassMarks} />} />
                        <Route path="/report-card/:studentId" element={<ProgressReportPage students={students} academicYear={academicYear!} />} />
                        <Route path="/report-card/:studentId/:examId" element={<PrintableReportCardPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleAcademicUpdate} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={openImportModal} />} />
                        <Route path="/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear!} onOpenImportModal={openImportModal} onOpenTransferModal={openTransferModal} onDelete={openDeleteConfirm} />} />
                        <Route path="/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={openAddStaffModal} onEdit={openEditStaffModal} onDelete={openDeleteStaffConfirm} />} />
                        <Route path="/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={openEditStaffModal} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCertificateRecords} />} />
                        <Route path="/staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={handleSaveServiceCertificate} />} />
                        <Route path="/staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCertificateRecords} />} />
                        <Route path="/transfers" element={<TransferManagementPage students={students} tcRecords={tcRecords} />} />
                        <Route path="/transfers/register" element={<TcRegistrationPage students={students} onSave={handleSaveTc} academicYear={academicYear!} />} />
                        <Route path="/transfers/records" element={<AllTcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/update" element={<UpdateTcPage tcRecords={tcRecords} onUpdate={handleUpdateTc} />} />
                        <Route path="/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} />} />
                        <Route path="/fees" element={<FeeManagementPage students={students} academicYear={academicYear!} onUpdateFeePayments={handleUpdateFeePayments} />} />
                        <Route path="/promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onPromoteStudents={handlePromoteStudents} />} />
                        <Route path="/inventory" element={<InventoryPage inventory={inventory} onAdd={openAddInventoryModal} onEdit={openEditInventoryModal} onDelete={openDeleteInventoryConfirm} />} />
                        <Route path="/change-password" element={<ChangePasswordPage onChangePassword={handleChangePassword} />} />

                        
                        {/* Hostel Routes */}
                        <Route path="/hostel" element={<HostelDashboardPage />} />
                        <Route path="/hostel/students" element={<HostelStudentListPage residents={hostelResidents} rooms={hostelRooms} students={students} />} />
                        <Route path="/hostel/rooms" element={<HostelRoomListPage rooms={hostelRooms} residents={hostelResidents} students={students} />} />
                        <Route path="/hostel/fees" element={<HostelFeePage />} />
                        <Route path="/hostel/attendance" element={<HostelAttendancePage />} />
                        <Route path="/hostel/mess" element={<HostelMessPage />} />
                        <Route path="/hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={openAddHostelStaffModal} onEdit={openEditHostelStaffModal} onDelete={openDeleteHostelStaffConfirm} />} />
                        <Route path="/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={handleUpdateHostelStock} />} />
                        <Route path="/hostel/discipline" element={<HostelDisciplinePage />} />
                        <Route path="/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/hostel/settings" element={<HostelSettingsPage />} />

                    </Routes>
                </main>
            </div>
        );
    }

    const LoginRedirect = () => {
        const location = useLocation();
        return <Navigate to={(location.state as { from?: string })?.from || '/'} />;
    };

    return (
        <Router>
            <Routes>
                <Route path="/*" element={
                    user ? <MainAppContent /> : <Navigate to="/login" state={{ from: window.location.hash.substring(1) || '/' }} />
                }/>
                <Route path="/login" element={
                    !user ? <LoginPage onLogin={handleLogin} error={error} /> : <LoginRedirect />
                }/>
                <Route path="/signup" element={!user ? <SignUpPage onSignUp={handleSignUp} /> : <Navigate to="/" />}/>
                <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={handleForgotPassword} />} />
            </Routes>
            {isFormModalOpen && (
                <StudentFormModal
                    isOpen={isFormModalOpen}
                    onClose={closeModal}
                    onSubmit={handleFormSubmit}
                    student={editingStudent}
                />
            )}
             {deletingStudent && (
                <ConfirmationModal
                    isOpen={!!deletingStudent}
                    onClose={closeModal}
                    onConfirm={handleDeleteConfirm}
                    title="Remove Student Record"
                >
                    <p>Are you sure you want to remove <strong>{deletingStudent.name}</strong>? This action is for correcting incorrect entries and cannot be undone.</p>
                </ConfirmationModal>
            )}
            {studentToConfirmEdit && (
                <ConfirmationModal
                    isOpen={!!studentToConfirmEdit}
                    onClose={() => setStudentToConfirmEdit(null)}
                    onConfirm={handleConfirmEdit}
                    title="Confirm Changes"
                >
                    <p>Are you sure you want to save the changes for <strong>{studentToConfirmEdit.name}</strong>?</p>
                </ConfirmationModal>
            )}
             {isStaffFormModalOpen && (
                <StaffFormModal
                    isOpen={isStaffFormModalOpen}
                    onClose={closeModal}
                    onSubmit={handleStaffFormSubmit}
                    staffMember={editingStaff}
                    allStaff={staff}
                    gradeDefinitions={gradeDefinitions}
                />
            )}
             {deletingStaff && (
                <ConfirmationModal
                    isOpen={!!deletingStaff}
                    onClose={closeModal}
                    onConfirm={handleDeleteStaffConfirm}
                    title="Remove Staff Record"
                >
                    <p>Are you sure you want to remove <strong>{deletingStaff.firstName} {deletingStaff.lastName}</strong>? This action is permanent and cannot be undone.</p>
                </ConfirmationModal>
            )}
            {isInventoryFormModalOpen && (
                <InventoryFormModal
                    isOpen={isInventoryFormModalOpen}
                    onClose={closeModal}
                    onSubmit={handleInventoryFormSubmit}
                    item={editingInventoryItem}
                />
            )}
            {deletingInventoryItem && (
                <ConfirmationModal
                    isOpen={!!deletingInventoryItem}
                    onClose={closeModal}
                    onConfirm={handleDeleteInventoryConfirm}
                    title="Delete Inventory Item"
                >
                    <p>Are you sure you want to delete the item <strong>{deletingInventoryItem.name}</strong>? This action cannot be undone.</p>
                </ConfirmationModal>
            )}
            {isImportModalOpen && (
                <ImportStudentsModal
                    isOpen={isImportModalOpen}
                    onClose={closeModal}
                    onImport={handleBulkAddStudents}
                    grade={importTargetGrade}
                    allStudents={students}
                    allGrades={GRADES_LIST}
                />
            )}
            {pendingImportData && (
                 <ConfirmationModal
                    isOpen={!!pendingImportData}
                    onClose={() => setPendingImportData(null)}
                    onConfirm={handleConfirmImport}
                    title="Confirm Student Import"
                >
                    <p>Are you sure you want to import <strong>{pendingImportData.students.length}</strong> students into <strong>{pendingImportData.grade}</strong>? This action cannot be easily undone.</p>
                </ConfirmationModal>
            )}
            {transferringStudent && (
                <TransferStudentModal
                    isOpen={!!transferringStudent}
                    onClose={closeModal}
                    onConfirm={handleTransferStudent}
                    student={transferringStudent}
                    allStudents={students}
                    allGrades={GRADES_LIST}
                />
            )}
            {isHostelStaffFormModalOpen && (
                <HostelStaffFormModal
                    isOpen={isHostelStaffFormModalOpen}
                    onClose={closeModal}
                    onSubmit={handleHostelStaffFormSubmit}
                    staffMember={editingHostelStaff}
                />
            )}
            {deletingHostelStaff && (
                <ConfirmationModal
                    isOpen={!!deletingHostelStaff}
                    onClose={closeModal}
                    onConfirm={handleDeleteHostelStaffConfirm}
                    title="Remove Hostel Staff"
                >
                    <p>Are you sure you want to remove <strong>{deletingHostelStaff.name}</strong>? This action cannot be undone.</p>
                </ConfirmationModal>
            )}
        </Router>
    );
};

export default App;