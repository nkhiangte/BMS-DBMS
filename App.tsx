
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User, Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType, ServiceCertificateRecord, PaymentStatus } from './types';
import { GRADE_DEFINITIONS, TERMINAL_EXAMS, GRADES_LIST } from './constants';
import { getNextGrade, createDefaultFeePayments, calculateStudentResult } from './utils';

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


// --- MOCK DATA & LOCAL STORAGE ---

const adminUser: User = {
    uid: 'admin01',
    displayName: 'Admin',
    email: 'admin@bms.edu',
    photoURL: null,
    role: 'admin',
};

const saveDataToLocalStorage = <T,>(key: string, data: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving ${key} to localStorage`, e);
    }
}

const loadDataFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.error(`Error loading ${key} from localStorage`, e);
        return defaultValue;
    }
}


const App: React.FC = () => {
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

    // --- Data Initialization from Local Storage ---
    useEffect(() => {
        setAcademicYear(loadDataFromLocalStorage('academicYear', null));
        setStudents(loadDataFromLocalStorage('students', []));
        setStaff(loadDataFromLocalStorage('staff', []));
        setTcRecords(loadDataFromLocalStorage('tcRecords', []));
        setServiceCertificateRecords(loadDataFromLocalStorage('serviceCertificateRecords', []));
        setInventory(loadDataFromLocalStorage('inventory', []));
        setHostelResidents(loadDataFromLocalStorage('hostelResidents', []));
        setHostelRooms(loadDataFromLocalStorage('hostelRooms', []));
        setHostelStaff(loadDataFromLocalStorage('hostelStaff', []));
        setHostelInventory(loadDataFromLocalStorage('hostelInventory', []));
        setHostelStockLogs(loadDataFromLocalStorage('hostelStockLogs', []));
        setGradeDefinitions(loadDataFromLocalStorage('gradeDefinitions', GRADE_DEFINITIONS));
    }, []);

    const handleSetAcademicYear = useCallback((year: string) => {
        saveDataToLocalStorage('academicYear', year);
        setAcademicYear(year);
    }, []);

    const handleUpdateGradeDefinition = useCallback((grade: Grade, newDefinition: GradeDefinition) => {
        const newGradeDefinitions = { ...gradeDefinitions, [grade]: newDefinition };
        saveDataToLocalStorage('gradeDefinitions', newGradeDefinitions);
        setGradeDefinitions(newGradeDefinitions);
    }, [gradeDefinitions]);

    const handleAssignClassToStaff = useCallback((staffId: string, newGradeKey: Grade | null) => {
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
        
        saveDataToLocalStorage('gradeDefinitions', newDefs);
        setGradeDefinitions(newDefs);
    }, [gradeDefinitions]);

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
    
    // --- Student Handlers ---
    const handleFormSubmit = useCallback((studentData: Omit<Student, 'id'>) => {
        if (editingStudent) {
            setStudentToConfirmEdit({ ...studentData, id: editingStudent.id });
        } else {
            const newStudent = { ...studentData, id: Date.now().toString() };
            const newStudents = [...students, newStudent];
            setStudents(newStudents);
            saveDataToLocalStorage('students', newStudents);
        }
        closeModal();
    }, [editingStudent, closeModal, students]);

    const handleConfirmEdit = useCallback(() => {
        if (studentToConfirmEdit) {
            const newStudents = students.map(s => s.id === studentToConfirmEdit.id ? studentToConfirmEdit : s);
            setStudents(newStudents);
            saveDataToLocalStorage('students', newStudents);
            setStudentToConfirmEdit(null);
        }
    }, [studentToConfirmEdit, students]);

    const handleDeleteConfirm = useCallback(() => {
        if (deletingStudent) {
            const newStudents = students.filter(s => s.id !== deletingStudent.id);
            setStudents(newStudents);
            saveDataToLocalStorage('students', newStudents);
            closeModal();
        }
    }, [deletingStudent, closeModal, students]);

    const handleBulkAddStudents = useCallback((studentsData: Omit<Student, 'id'>[], grade: Grade) => {
        setPendingImportData({ students: studentsData, grade });
        closeModal();
    }, [closeModal]);

    const handleConfirmImport = useCallback(() => {
        if (pendingImportData) {
            const newStudentsWithIds = pendingImportData.students.map(s => ({ ...s, id: `${Date.now()}-${Math.random()}` }));
            const updatedStudents = [...students, ...newStudentsWithIds];
            setStudents(updatedStudents);
            saveDataToLocalStorage('students', updatedStudents);
            setPendingImportData(null);
        }
    }, [pendingImportData, students]);

    const handleAcademicUpdate = useCallback((studentId: string, academicPerformance: Exam[]) => {
        const newStudents = students.map(s => s.id === studentId ? { ...s, academicPerformance } : s);
        setStudents(newStudents);
        saveDataToLocalStorage('students', newStudents);
    }, [students]);
    
    const handleUpdateClassMarks = useCallback((marksByStudentId: Map<string, SubjectMark[]>, examId: string) => {
        const updatedStudents = students.map(student => {
            if (marksByStudentId.has(student.id)) {
                const newMarks = marksByStudentId.get(student.id)!;
                const existingPerformance = student.academicPerformance || [];
                const examIndex = existingPerformance.findIndex(e => e.id === examId);

                let newPerformance: Exam[];
                if (examIndex > -1) {
                    newPerformance = [...existingPerformance];
                    newPerformance[examIndex] = { ...newPerformance[examIndex], results: newMarks };
                } else {
                    const examTemplate = TERMINAL_EXAMS.find(e => e.id === examId)!;
                    newPerformance = [...existingPerformance, { ...examTemplate, results: newMarks }];
                }
                return { ...student, academicPerformance: newPerformance };
            }
            return student;
        });
        setStudents(updatedStudents);
        saveDataToLocalStorage('students', updatedStudents);
    }, [students]);

    // --- Staff Handlers ---
    const handleStaffFormSubmit = useCallback((staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
        let updatedStaffId: string;
        const finalAssignedGradeKey = staffData.status === EmploymentStatus.ACTIVE ? assignedGradeKey : null;

        if (editingStaff) {
            updatedStaffId = editingStaff.id;
            const newStaffList = staff.map(t => t.id === editingStaff.id ? { ...staffData, id: t.id } : t);
            setStaff(newStaffList);
            saveDataToLocalStorage('staff', newStaffList);
        } else {
            updatedStaffId = Date.now().toString();
            const newStaff = { ...staffData, id: updatedStaffId };
            const newStaffList = [...staff, newStaff];
            setStaff(newStaffList);
            saveDataToLocalStorage('staff', newStaffList);
        }

        handleAssignClassToStaff(updatedStaffId, finalAssignedGradeKey);
        closeModal();
    }, [editingStaff, closeModal, handleAssignClassToStaff, staff]);
    
     const handleDeleteStaffConfirm = useCallback(() => {
        if (deletingStaff) {
            const newStaffList = staff.filter(s => s.id !== deletingStaff.id);
            setStaff(newStaffList);
            saveDataToLocalStorage('staff', newStaffList);
            
            const assignedGradeKey = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === deletingStaff.id) as Grade | undefined;
            if (assignedGradeKey) {
                handleAssignClassToStaff(deletingStaff.id, null);
            }
            closeModal();
        }
    }, [deletingStaff, closeModal, staff, gradeDefinitions, handleAssignClassToStaff]);

    const handleSaveServiceCertificate = useCallback((certData: Omit<ServiceCertificateRecord, 'id'>) => {
        const newRecord: ServiceCertificateRecord = { ...certData, id: Date.now().toString() };
        
        const staffMember = staff.find(s => s.id === certData.staffDetails.staffNumericId);
        if (staffMember) {
            const updatedStaffMember = { ...staffMember, status: EmploymentStatus.RESIGNED };
            const newStaffList = staff.map(s => s.id === staffMember.id ? updatedStaffMember : s);
            setStaff(newStaffList);
            saveDataToLocalStorage('staff', newStaffList);
        }

        const newRecords = [...serviceCertificateRecords, newRecord];
        setServiceCertificateRecords(newRecords);
        saveDataToLocalStorage('serviceCertificateRecords', newRecords);
    }, [serviceCertificateRecords, staff]);

    const handleSaveTc = useCallback((tcData: Omit<TcRecord, 'id'>) => {
        const newRecord: TcRecord = { ...tcData, id: Date.now().toString() };
        const newRecords = [...tcRecords, newRecord];
        setTcRecords(newRecords);
        saveDataToLocalStorage('tcRecords', newRecords);

        const studentId = tcData.studentDetails.studentNumericId;
        const student = students.find(s => s.id === studentId);
        if (student) {
            const updatedStudent = { 
                ...student, 
                status: StudentStatus.TRANSFERRED, 
                transferDate: tcData.tcData.issueDate 
            };
            const newStudents = students.map(s => s.id === studentId ? updatedStudent : s);
            setStudents(newStudents);
            saveDataToLocalStorage('students', newStudents);
        }
    }, [tcRecords, students]);

    const handleUpdateTc = useCallback((updatedTc: TcRecord) => {
        const newRecords = tcRecords.map(r => r.id === updatedTc.id ? updatedTc : r);
        setTcRecords(newRecords);
        saveDataToLocalStorage('tcRecords', newRecords);
    }, [tcRecords]);
    
    const handleInventoryFormSubmit = useCallback((itemData: Omit<InventoryItem, 'id'>) => {
        if (editingInventoryItem) {
            const newInventory = inventory.map(i => i.id === editingInventoryItem.id ? { ...itemData, id: i.id } : i);
            setInventory(newInventory);
            saveDataToLocalStorage('inventory', newInventory);
        } else {
            const newItem = { ...itemData, id: Date.now().toString() };
            const newInventory = [...inventory, newItem];
            setInventory(newInventory);
            saveDataToLocalStorage('inventory', newInventory);
        }
        closeModal();
    }, [editingInventoryItem, inventory, closeModal]);
    
    const handleDeleteInventoryItemConfirm = useCallback(() => {
        if (deletingInventoryItem) {
            const newInventory = inventory.filter(i => i.id !== deletingInventoryItem.id);
            setInventory(newInventory);
            saveDataToLocalStorage('inventory', newInventory);
            closeModal();
        }
    }, [deletingInventoryItem, inventory, closeModal]);
    
    const handleHostelStaffFormSubmit = useCallback((staffData: Omit<HostelStaff, 'id' | 'paymentStatus' | 'attendancePercent'>) => {
        if (editingHostelStaff) {
            const newStaff = { ...editingHostelStaff, ...staffData };
            const newHostelStaffList = hostelStaff.map(s => s.id === editingHostelStaff.id ? newStaff : s);
            setHostelStaff(newHostelStaffList);
            saveDataToLocalStorage('hostelStaff', newHostelStaffList);
        } else {
            const newStaff = { ...staffData, id: Date.now().toString(), paymentStatus: PaymentStatus.PENDING, attendancePercent: 100 };
            const newHostelStaffList = [...hostelStaff, newStaff];
            setHostelStaff(newHostelStaffList);
            saveDataToLocalStorage('hostelStaff', newHostelStaffList);
        }
        closeModal();
    }, [editingHostelStaff, hostelStaff, closeModal]);

    const handleDeleteHostelStaffConfirm = useCallback(() => {
        if (deletingHostelStaff) {
            const newHostelStaffList = hostelStaff.filter(s => s.id !== deletingHostelStaff.id);
            setHostelStaff(newHostelStaffList);
            saveDataToLocalStorage('hostelStaff', newHostelStaffList);
            closeModal();
        }
    }, [deletingHostelStaff, hostelStaff, closeModal]);

    const handleUpdateHostelStock = useCallback((itemId: string, change: number, notes: string) => {
        const item = hostelInventory.find(i => i.id === itemId);
        if (!item) return;

        const updatedItem = { ...item, currentStock: item.currentStock + change };
        const newInventory = hostelInventory.map(i => i.id === itemId ? updatedItem : i);
        setHostelInventory(newInventory);
        saveDataToLocalStorage('hostelInventory', newInventory);

        const logEntry: StockLog = {
            id: Date.now().toString(),
            itemId: item.id,
            itemName: item.name,
            type: change > 0 ? StockLogType.IN : StockLogType.OUT,
            quantity: Math.abs(change),
            date: new Date().toISOString(),
            notes,
        };
        const newLogs = [logEntry, ...hostelStockLogs];
        setHostelStockLogs(newLogs);
        saveDataToLocalStorage('hostelStockLogs', newLogs);
    }, [hostelInventory, hostelStockLogs]);

    const handleUpdateFeePayments = useCallback((studentId: string, payments: FeePayments) => {
        const newStudents = students.map(s => s.id === studentId ? { ...s, feePayments: payments } : s);
        setStudents(newStudents);
        saveDataToLocalStorage('students', newStudents);
    }, [students]);
    
    const handlePromoteStudents = useCallback(() => {
        const finalExamId = 'terminal3';
        const newStudents = students.map(student => {
            if (student.status !== StudentStatus.ACTIVE) return student;

            const gradeDef = gradeDefinitions[student.grade];
            const finalExam = student.academicPerformance?.find(e => e.id === finalExamId);

            if (!finalExam || !gradeDef || finalExam.results.length === 0) {
                return { ...student, academicPerformance: [], feePayments: createDefaultFeePayments() };
            }

            const { finalResult } = calculateStudentResult(finalExam.results, gradeDef, student.grade);
            
            if (finalResult === 'FAIL') {
                return { ...student, academicPerformance: [], feePayments: createDefaultFeePayments() };
            }

            if (student.grade === Grade.X) {
                return { ...student, status: StudentStatus.TRANSFERRED, transferDate: new Date().toISOString().split('T')[0] };
            }

            const nextGrade = getNextGrade(student.grade);
            if (nextGrade) {
                return { ...student, grade: nextGrade, academicPerformance: [], feePayments: createDefaultFeePayments(), rollNo: 0 };
            }
            
            return student;
        });

        GRADES_LIST.forEach(grade => {
            const studentsInGrade = newStudents.filter(s => s.grade === grade && s.rollNo === 0).sort((a,b) => a.name.localeCompare(b.name));
            let rollNoCounter = 1;
            const existingRollsInGrade = new Set(newStudents.filter(s => s.grade === grade && s.rollNo !== 0).map(s => s.rollNo));
            
            studentsInGrade.forEach(studentToUpdate => {
                while(existingRollsInGrade.has(rollNoCounter)) {
                    rollNoCounter++;
                }
                const index = newStudents.findIndex(s => s.id === studentToUpdate.id);
                if (index !== -1) {
                    newStudents[index].rollNo = rollNoCounter;
                    rollNoCounter++;
                }
            });
        });

        setStudents(newStudents);
        saveDataToLocalStorage('students', newStudents);
        saveDataToLocalStorage('academicYear', null);
        setAcademicYear(null);
    }, [students, gradeDefinitions]);
    
    const handleTransferStudent = useCallback((studentId: string, newGrade: Grade, newRollNo: number) => {
        const newStudents = students.map(s => s.id === studentId ? { ...s, grade: newGrade, rollNo: newRollNo } : s);
        setStudents(newStudents);
        saveDataToLocalStorage('students', newStudents);
        closeModal();
    }, [students, closeModal]);
    
    const user = adminUser;
    
    const AppContent = () => {
        const location = useLocation();
        
        const isPrintRoute = location.pathname.includes('/print');

        if (isPrintRoute) {
             return (
                 <Routes>
                     <Route path="/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                     <Route path="/staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCertificateRecords} />} />
                     <Route path="/report-card/:studentId" element={<PrintableReportCardPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                 </Routes>
             )
        }
        
        return (
            <div className="flex flex-col min-h-screen">
                <Header user={user} onLogout={() => {}} className="print-hidden"/>
                <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                     <Routes>
                        <Route path="/" element={<DashboardPage user={user} onAddStudent={() => setIsFormModalOpen(true)} studentCount={students.filter(s => s.status === StudentStatus.ACTIVE).length} academicYear={academicYear!} onSetAcademicYear={handleSetAcademicYear} allUsers={[user]}/>} />
                        <Route path="/students" element={<StudentListPage students={students.filter(s => s.status === StudentStatus.ACTIVE)} onAdd={() => setIsFormModalOpen(true)} onEdit={(s) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear!} user={user} />} />
                        <Route path="/student/:studentId" element={<StudentDetailPage students={students} onEdit={(s) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear!} user={user}/>} />
                        <Route path="/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleAcademicUpdate} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/reports/search" element={<ReportSearchPage students={students} academicYear={academicYear!} />} />
                        <Route path="/report-card/:studentId" element={<ProgressReportPage students={students} academicYear={academicYear!} />} />
                        <Route path="/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} user={user}/>} />
                        <Route path="/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear!} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} onOpenTransferModal={setTransferringStudent} onDelete={setDeletingStudent} user={user} />} />
                        <Route path="/transfers" element={<TransferManagementPage students={students} tcRecords={tcRecords} />} />
                        <Route path="/transfers/register" element={<TcRegistrationPage students={students} onSave={handleSaveTc} academicYear={academicYear!} />} />
                        <Route path="/transfers/records" element={<AllTcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/update" element={<UpdateTcPage tcRecords={tcRecords} onUpdate={handleUpdateTc} />} />
                        <Route path="/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} />} />
                        <Route path="/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={() => setIsStaffFormModalOpen(true)} onEdit={(s) => { setEditingStaff(s); setIsStaffFormModalOpen(true); }} onDelete={setDeletingStaff} />} />
                        <Route path="/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={(s) => { setEditingStaff(s); setIsStaffFormModalOpen(true); }} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/fees" element={<FeeManagementPage students={students} academicYear={academicYear!} onUpdateFeePayments={handleUpdateFeePayments} />} />
                        <Route path="/reports/class-statement/:grade/:examId" element={<ClassMarkStatementPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onUpdateClassMarks={handleUpdateClassMarks} />} />
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
                        <Route path="/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={handleUpdateHostelStock} />} />
                        <Route path="/hostel/discipline" element={<HostelDisciplinePage />} />
                        <Route path="/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/hostel/settings" element={<HostelSettingsPage />} />
                        <Route path="/users" element={<UserManagementPage allUsers={[user]}/>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        )
    }

    return (
        <HashRouter>
            {!academicYear ? <AcademicYearForm onSetAcademicYear={handleSetAcademicYear} /> : <AppContent />}
            {isFormModalOpen && <StudentFormModal isOpen={isFormModalOpen} onClose={closeModal} onSubmit={handleFormSubmit} student={editingStudent} />}
            {isStaffFormModalOpen && <StaffFormModal isOpen={isStaffFormModalOpen} onClose={closeModal} onSubmit={handleStaffFormSubmit} staffMember={editingStaff} allStaff={staff} gradeDefinitions={gradeDefinitions} />}
            {isInventoryFormModalOpen && <InventoryFormModal isOpen={isInventoryFormModalOpen} onClose={closeModal} onSubmit={handleInventoryFormSubmit} item={editingInventoryItem} />}
            {isHostelStaffFormModalOpen && <HostelStaffFormModal isOpen={isHostelStaffFormModalOpen} onClose={closeModal} onSubmit={handleHostelStaffFormSubmit} staffMember={editingHostelStaff} />}
            {isImportModalOpen && <ImportStudentsModal isOpen={isImportModalOpen} onClose={closeModal} onImport={handleBulkAddStudents} grade={importTargetGrade} allStudents={students} allGrades={GRADES_LIST} />}
            {transferringStudent && <TransferStudentModal isOpen={!!transferringStudent} onClose={closeModal} student={transferringStudent} allStudents={students} allGrades={GRADES_LIST} onConfirm={handleTransferStudent} />}
            <ConfirmationModal isOpen={!!deletingStudent} onClose={closeModal} onConfirm={handleDeleteConfirm} title="Confirm Deletion"><p>Are you sure you want to delete <span className="font-bold">{deletingStudent?.name}</span>? This action cannot be undone.</p></ConfirmationModal>
            <ConfirmationModal isOpen={!!deletingStaff} onClose={closeModal} onConfirm={handleDeleteStaffConfirm} title="Confirm Staff Deletion"><p>Are you sure you want to delete <span className="font-bold">{deletingStaff?.firstName} {deletingStaff?.lastName}</span>? This action cannot be undone.</p></ConfirmationModal>
            <ConfirmationModal isOpen={!!deletingInventoryItem} onClose={closeModal} onConfirm={handleDeleteInventoryItemConfirm} title="Confirm Item Deletion"><p>Are you sure you want to delete <span className="font-bold">{deletingInventoryItem?.name}</span>? This action cannot be undone.</p></ConfirmationModal>
            <ConfirmationModal isOpen={!!deletingHostelStaff} onClose={closeModal} onConfirm={handleDeleteHostelStaffConfirm} title="Confirm Hostel Staff Deletion"><p>Are you sure you want to delete <span className="font-bold">{deletingHostelStaff?.name}</span>? This action cannot be undone.</p></ConfirmationModal>
            <ConfirmationModal isOpen={!!studentToConfirmEdit} onClose={() => setStudentToConfirmEdit(null)} onConfirm={handleConfirmEdit} title="Confirm Edit"><p>Are you sure you want to save changes for <span className="font-bold">{studentToConfirmEdit?.name}</span>?</p></ConfirmationModal>
            <ConfirmationModal isOpen={!!pendingImportData} onClose={() => setPendingImportData(null)} onConfirm={handleConfirmImport} title="Confirm Bulk Import"><p>Are you sure you want to import {pendingImportData?.students.length} new students into {pendingImportData?.grade}?</p></ConfirmationModal>
        </HashRouter>
    );
}

export default App;
