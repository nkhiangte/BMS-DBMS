
import { Grade, Student, Gender, Exam, Role, User, StudentStatus, Category, GradeDefinition, Staff, MaritalStatus, Department, Designation, EmployeeType, BloodGroup, EmploymentStatus, StaffType, InventoryItem, InventoryCategory, InventoryStatus, HostelBlock, HostelRoom, RoomType, HostelResident, HostelStaff, HostelStaffRole, PaymentStatus, HostelInventoryItem, HostelInventoryCategory, StockLog, StockLogType } from './types';

export const USERS: User[] = [
    { id: 1, username: 'admin', password_plaintext: 'password', name: 'Principal', role: Role.ADMIN },
    { id: 2, username: 'teacher1', password_plaintext: 'teacher1', name: 'Mrs. Davis', role: Role.TEACHER },
    { id: 3, username: 'teacher2', password_plaintext: 'teacher2', name: 'Mr. Smith', role: Role.TEACHER },
];

export const MARITAL_STATUS_LIST: MaritalStatus[] = Object.values(MaritalStatus);
export const DEPARTMENT_LIST: Department[] = Object.values(Department);
export const DESIGNATION_LIST: Designation[] = Object.values(Designation);
export const EMPLOYEE_TYPE_LIST: EmployeeType[] = Object.values(EmployeeType);
export const BLOOD_GROUP_LIST: BloodGroup[] = Object.values(BloodGroup);
export const EMPLOYMENT_STATUS_LIST: EmploymentStatus[] = Object.values(EmploymentStatus);
export const STAFF_TYPE_LIST: StaffType[] = ['Teaching', 'Non-Teaching'];

export const INITIAL_STAFF: Staff[] = [
    {
        id: 1,
        staffType: 'Teaching',
        employeeId: 'BMS-T-001',
        firstName: 'Evelyn',
        lastName: 'Reed',
        gender: Gender.FEMALE,
        dateOfBirth: '1985-03-12',
        nationality: 'Indian',
        maritalStatus: MaritalStatus.MARRIED,
        photographUrl: 'https://i.pravatar.cc/150?u=t1',
        bloodGroup: BloodGroup.A_POSITIVE,
        aadhaarNumber: '111122223333',
        contactNumber: '9988776655',
        emailAddress: 'evelyn.reed@bms.edu',
        permanentAddress: "12, Teacher's Colony, Cityville",
        currentAddress: "12, Teacher's Colony, Cityville",
        educationalQualification: 'M.A. in English, B.Ed',
        specialization: 'English Literature',
        yearsOfExperience: 10,
        previousExperience: '5 years at City Public School.',
        dateOfJoining: '2018-06-15',
        department: Department.LANGUAGES,
        designation: Designation.TEACHER,
        employeeType: EmployeeType.FULL_TIME,
        status: EmploymentStatus.ACTIVE,
        subjectsTaught: ['English'],
        emergencyContactName: 'Robert Reed',
        emergencyContactRelationship: 'Spouse',
        emergencyContactNumber: '9988776650',
    },
    {
        id: 2,
        staffType: 'Teaching',
        employeeId: 'BMS-T-002',
        firstName: 'Samuel',
        lastName: 'Grant',
        gender: Gender.MALE,
        dateOfBirth: '1990-11-25',
        nationality: 'Indian',
        maritalStatus: MaritalStatus.SINGLE,
        photographUrl: 'https://i.pravatar.cc/150?u=t2',
        bloodGroup: BloodGroup.O_POSITIVE,
        aadhaarNumber: '444455556666',
        contactNumber: '9988776654',
        emailAddress: 'samuel.grant@bms.edu',
        permanentAddress: '45, Scholars Avenue, Cityville',
        currentAddress: '45, Scholars Avenue, Cityville',
        educationalQualification: 'M.Sc. in Mathematics, B.Ed',
        specialization: 'Algebra',
        yearsOfExperience: 5,
        previousExperience: '2 years as a substitute teacher.',
        dateOfJoining: '2020-08-01',
        department: Department.MATHEMATICS,
        designation: Designation.TEACHER,
        employeeType: EmployeeType.FULL_TIME,
        status: EmploymentStatus.ACTIVE,
        subjectsTaught: ['Mathematics'],
        emergencyContactName: 'Maria Grant',
        emergencyContactRelationship: 'Mother',
        emergencyContactNumber: '9988776651',
    },
    {
        id: 3,
        staffType: 'Teaching',
        employeeId: 'BMS-T-003',
        firstName: 'Clara',
        lastName: 'Oswald',
        gender: Gender.FEMALE,
        dateOfBirth: '1992-07-19',
        nationality: 'Indian',
        maritalStatus: MaritalStatus.SINGLE,
        photographUrl: 'https://i.pravatar.cc/150?u=t3',
        bloodGroup: BloodGroup.B_POSITIVE,
        aadhaarNumber: '777788889999',
        contactNumber: '9988776653',
        emailAddress: 'clara.oswald@bms.edu',
        permanentAddress: '78, Park Street, Cityville',
        currentAddress: '78, Park Street, Cityville',
        educationalQualification: 'M.Sc. in Physics, B.Ed',
        specialization: 'Quantum Mechanics',
        yearsOfExperience: 4,
        previousExperience: '1 year at Riverdale High.',
        dateOfJoining: '2021-07-22',
        department: Department.SCIENCE,
        designation: Designation.TEACHER,
        employeeType: EmployeeType.FULL_TIME,
        status: EmploymentStatus.ACTIVE,
        subjectsTaught: ['Physics', 'Chemistry'],
        emergencyContactName: 'Amy Pond',
        emergencyContactRelationship: 'Friend',
        emergencyContactNumber: '9988776652',
    },
    {
        id: 4,
        staffType: 'Non-Teaching',
        employeeId: 'BMS-NT-001',
        firstName: 'Ramesh',
        lastName: 'Kumar',
        gender: Gender.MALE,
        dateOfBirth: '1980-01-15',
        nationality: 'Indian',
        maritalStatus: MaritalStatus.MARRIED,
        photographUrl: 'https://i.pravatar.cc/150?u=nt1',
        bloodGroup: BloodGroup.AB_POSITIVE,
        aadhaarNumber: '123412341234',
        contactNumber: '9123456789',
        emailAddress: 'ramesh.kumar@bms.edu',
        permanentAddress: '100, Admin Block, Cityville',
        currentAddress: '100, Admin Block, Cityville',
        educationalQualification: 'B.Com',
        specialization: 'Accounting',
        yearsOfExperience: 15,
        previousExperience: '10 years at a government office.',
        dateOfJoining: '2015-04-01',
        department: Department.ADMINISTRATION,
        designation: Designation.CLERK,
        employeeType: EmployeeType.FULL_TIME,
        status: EmploymentStatus.ACTIVE,
        subjectsTaught: [],
        emergencyContactName: 'Sita Kumar',
        emergencyContactRelationship: 'Spouse',
        emergencyContactNumber: '9123456780',
    }
];

export const GRADES_LIST: Grade[] = Object.values(Grade);
export const GENDER_LIST: Gender[] = Object.values(Gender);
export const CATEGORY_LIST: Category[] = Object.values(Category);

export const TERMINAL_EXAMS = [
  { id: 'terminal1', name: 'First Terminal Exam' },
  { id: 'terminal2', name: 'Second Terminal Exam' },
  { id: 'terminal3', name: 'Final Terminal Exam' },
];

export const GRADE_DEFINITIONS: Record<Grade, GradeDefinition> = {
    [Grade.NURSERY]: { classTeacherId: 1, subjects: [{ name: 'Pre-Reading', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Pre-Writing', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Numbers', examFullMarks: 100, activityFullMarks: 0 }] },
    [Grade.KINDERGARTEN]: { subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'General Knowledge', examFullMarks: 100, activityFullMarks: 0 }] },
    [Grade.I]: { subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Environmental Science', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 }] },
    [Grade.II]: { subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Environmental Science', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 }] },
    [Grade.III]: { classTeacherId: 2, subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }] },
    [Grade.IV]: { subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }] },
    [Grade.V]: { subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 }] },
    [Grade.VI]: { subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 }] },
    [Grade.VII]: { subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 }] },
    [Grade.VIII]: { classTeacherId: 3, subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 }] },
    [Grade.IX]: { subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Science', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Social Studies', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 }] },
    [Grade.X]: { subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Science', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Social Studies', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 }] },
};

export const academicMonths = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

export const FEE_STRUCTURE = {
  set1: { admissionFee: 5000, tuitionFee: 1500, examFee: 500 },
  set2: { admissionFee: 6000, tuitionFee: 2000, examFee: 600 },
  set3: { admissionFee: 7000, tuitionFee: 2500, examFee: 700 },
};

const defaultFeePayments = {
    admissionFeePaid: true,
    tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: true }), {}),
    examFeesPaid: { terminal1: true, terminal2: true, terminal3: true },
};
const dueFeePayments = {
    admissionFeePaid: true,
    tuitionFeesPaid: academicMonths.reduce((acc, month, i) => ({ ...acc, [month]: i < 10 }), {}),
    examFeesPaid: { terminal1: true, terminal2: true, terminal3: false },
};

export const INITIAL_STUDENTS: Student[] = [
    { id: 1, rollNo: 1, name: 'Aarav Sharma', grade: Grade.V, contact: '9876543210', photographUrl: 'https://i.pravatar.cc/150?u=s1', dateOfBirth: '2014-05-20', gender: Gender.MALE, address: '123 Main St, Cityville', aadhaarNumber: '111122223333', pen: '123456789', category: Category.GENERAL, religion: 'Hinduism', fatherName: 'Rohan Sharma', fatherOccupation: 'Engineer', fatherAadhaar: '222233334444', motherName: 'Priya Sharma', motherOccupation: 'Doctor', motherAadhaar: '333344445555', status: StudentStatus.ACTIVE, feePayments: defaultFeePayments, academicPerformance: [] },
    { id: 2, rollNo: 2, name: 'Diya Patel', grade: Grade.V, contact: '9876543211', photographUrl: 'https://i.pravatar.cc/150?u=s2', dateOfBirth: '2014-08-15', gender: Gender.FEMALE, address: '456 Oak Ave, Cityville', aadhaarNumber: '444455556666', pen: '987654321', category: Category.OBC, religion: 'Hinduism', fatherName: 'Manish Patel', fatherOccupation: 'Businessman', fatherAadhaar: '555566667777', motherName: 'Kavita Patel', motherOccupation: 'Homemaker', motherAadhaar: '666677778888', status: StudentStatus.ACTIVE, feePayments: dueFeePayments, academicPerformance: [] },
    { id: 3, rollNo: 1, name: 'Zoya Khan', grade: Grade.III, contact: '9876543212', photographUrl: 'https://i.pravatar.cc/150?u=s3', dateOfBirth: '2016-02-10', gender: Gender.FEMALE, address: '789 Pine Ln, Cityville', aadhaarNumber: '777788889999', pen: '456789123', category: Category.GENERAL, religion: 'Islam', fatherName: 'Imran Khan', fatherOccupation: 'Architect', fatherAadhaar: '888899990000', motherName: 'Sana Khan', motherOccupation: 'Teacher', motherAadhaar: '999900001111', status: StudentStatus.ACTIVE, feePayments: defaultFeePayments, academicPerformance: [] },
    { id: 4, rollNo: 1, name: 'Mary Johnson', grade: Grade.X, contact: '9876543213', photographUrl: 'https://i.pravatar.cc/150?u=s4', dateOfBirth: '2009-11-30', gender: Gender.FEMALE, address: '101 Maple Dr, Cityville', aadhaarNumber: '123456789012', pen: '321654987', category: Category.GENERAL, religion: 'Christianity', fatherName: 'David Johnson', fatherOccupation: 'Manager', fatherAadhaar: '234567890123', motherName: 'Sarah Johnson', motherOccupation: 'Nurse', motherAadhaar: '345678901234', status: StudentStatus.TRANSFERRED, transferDate: '2023-03-31', feePayments: defaultFeePayments, academicPerformance: [] },
];

export const INVENTORY_CATEGORY_LIST: InventoryCategory[] = Object.values(InventoryCategory);
export const INVENTORY_STATUS_LIST: InventoryStatus[] = Object.values(InventoryStatus);

export const INITIAL_INVENTORY: InventoryItem[] = [
    { id: 1, name: 'Student Desk (Dual)', category: InventoryCategory.CLASSROOM, quantity: 50, status: InventoryStatus.GOOD, location: 'Class V', purchaseDate: '2022-04-10' },
    { id: 2, name: 'Whiteboard (8x4 ft)', category: InventoryCategory.CLASSROOM, quantity: 10, status: InventoryStatus.GOOD, location: 'All Classes', purchaseDate: '2022-04-10' },
    { id: 3, name: 'Dell Optiplex 3080', category: InventoryCategory.AV_TECH, subCategory: 'Computer Lab', quantity: 20, status: InventoryStatus.GOOD, location: 'Computer Lab', purchaseDate: '2021-06-15' },
    { id: 4, name: 'Projector (Epson)', category: InventoryCategory.AV_TECH, quantity: 2, status: InventoryStatus.NEEDS_REPAIR, location: 'AV Room', purchaseDate: '2020-01-20', lastMaintenanceDate: '2023-05-01', notes: 'Lamp is flickering' },
];

export const HOSTEL_BLOCK_LIST: HostelBlock[] = Object.values(HostelBlock);

export const INITIAL_HOSTEL_ROOMS: HostelRoom[] = [
    { id: 1, block: HostelBlock.A, roomNumber: 101, type: RoomType.DORMITORY, capacity: 4, facilities: ['Fan'] },
    { id: 2, block: HostelBlock.A, roomNumber: 102, type: RoomType.DORMITORY, capacity: 4, facilities: ['Fan'] },
    { id: 3, block: HostelBlock.C, roomNumber: 101, type: RoomType.DOUBLE, capacity: 2, facilities: ['Fan', 'Attached Bathroom'] },
];

export const INITIAL_HOSTEL_RESIDENTS: HostelResident[] = [];

export const INITIAL_HOSTEL_STAFF: HostelStaff[] = [
    { id: 1, name: 'Mr. John Doe', gender: Gender.MALE, role: HostelStaffRole.WARDEN, photographUrl: 'https://i.pravatar.cc/150?u=hw1', contactNumber: '9876543210', dateOfJoining: '2020-01-01', dutyShift: 'Morning (6 AM - 2 PM)', assignedBlock: HostelBlock.A, salary: 25000, paymentStatus: PaymentStatus.PAID, attendancePercent: 98 },
    { id: 2, name: 'Mrs. Jane Smith', gender: Gender.FEMALE, role: HostelStaffRole.WARDEN, photographUrl: 'https://i.pravatar.cc/150?u=hw2', contactNumber: '9876543211', dateOfJoining: '2021-03-15', dutyShift: 'Evening (2 PM - 10 PM)', assignedBlock: HostelBlock.C, salary: 25000, paymentStatus: PaymentStatus.PAID, attendancePercent: 99 },
];

export const HOSTEL_INVENTORY_CATEGORY_LIST: HostelInventoryCategory[] = Object.values(HostelInventoryCategory);

export const INITIAL_HOSTEL_INVENTORY: HostelInventoryItem[] = [
    { id: 1, name: 'Bedsheets (Single)', category: HostelInventoryCategory.FURNITURE_BEDDING_ELECTRICAL, currentStock: 100, reorderLevel: 20 },
    { id: 2, name: 'Pillows', category: HostelInventoryCategory.FURNITURE_BEDDING_ELECTRICAL, currentStock: 50, reorderLevel: 10 },
    { id: 3, name: 'Rice (kg)', category: HostelInventoryCategory.GROCERIES_FOOD, currentStock: 200, reorderLevel: 50 },
    { id: 4, name: 'Lentils (kg)', category: HostelInventoryCategory.GROCERIES_FOOD, currentStock: 45, reorderLevel: 20 },
];

export const INITIAL_STOCK_LOGS: StockLog[] = [
    { id: Date.now() - 10000, itemId: 3, itemName: 'Rice (kg)', type: StockLogType.IN, quantity: 50, date: new Date(Date.now() - 10000).toISOString(), notes: 'Weekly purchase' },
    { id: Date.now() - 5000, itemId: 4, itemName: 'Lentils (kg)', type: StockLogType.OUT, quantity: 5, date: new Date(Date.now() - 5000).toISOString(), notes: 'Issued for dinner' },
];
