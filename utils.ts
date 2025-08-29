import { Student, Staff, Grade, FeePayments, SubjectMark, GradeDefinition, StaffAttendanceRecord, StudentAttendanceRecord, AttendanceStatus, StudentAttendanceStatus, SubjectDefinition, FeeStructure } from './types';
import { academicMonths, GRADES_LIST, FEE_SET_GRADES } from './constants';

const getGradeCode = (grade: Grade): string => {
    switch (grade) {
        case Grade.NURSERY: return 'NU';
        case Grade.KINDERGARTEN: return 'KG';
        case Grade.I: return '01';
        case Grade.II: return '02';
        case Grade.III: return '03';
        case Grade.IV: return '04';
        case Grade.V: return '05';
        case Grade.VI: return '06';
        case Grade.VII: return '07';
        case Grade.VIII: return '08';
        case Grade.IX: return '09';
        case Grade.X: return '10';
        default: return 'XX'; // Fallback for any unexpected grade
    }
};

export const formatStudentId = (student: Student, academicYear: string): string => {
    // Prioritize the stored studentId if it exists and is not empty.
    if (student.studentId) {
        return student.studentId;
    }
    
    // Fallback to old generation logic for backward compatibility
    const startYear = academicYear.substring(0, 4);
    const yearSuffix = startYear.slice(-2);
    
    const gradeCode = getGradeCode(student.grade);
    
    // Pad roll number to be at least two digits (e.g., 1 -> "01")
    const paddedRollNo = String(student.rollNo).padStart(2, '0');
    
    return `BMS${yearSuffix}${gradeCode}${paddedRollNo}`;
};

export const getFeeDetails = (grade: Grade, feeStructure: FeeStructure) => {
    if (FEE_SET_GRADES.set1.includes(grade)) {
        return feeStructure.set1;
    }
    if (FEE_SET_GRADES.set2.includes(grade)) {
        return feeStructure.set2;
    }
    if (FEE_SET_GRADES.set3.includes(grade)) {
        return feeStructure.set3;
    }
    // Fallback, though all grades are covered by FEE_SET_GRADES
    return feeStructure.set1;
};

export const calculateDues = (student: Student, feeStructure: FeeStructure): string[] => {
    // If a student record was created before the feePayments feature, it might be undefined.
    // We create a default state assuming no fees are paid.
    const defaultPayments: FeePayments = {
        admissionFeePaid: false,
        tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
        examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
    };
    const feePayments = student.feePayments || defaultPayments;
    const feeDetails = getFeeDetails(student.grade, feeStructure);

    const duesMessages: string[] = [];

    if (!feePayments.admissionFeePaid) {
        duesMessages.push(`Admission Fee: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(feeDetails.admissionFee)}`);
    }

    const unpaidTuitionMonths = academicMonths.filter(month => !feePayments.tuitionFeesPaid[month]);
    if (unpaidTuitionMonths.length > 0) {
        const totalTuitionDue = unpaidTuitionMonths.length * feeDetails.tuitionFee;
        duesMessages.push(`Tuition Fee: ${unpaidTuitionMonths.length} month(s) pending (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalTuitionDue)})`);
    }

    const unpaidExams: string[] = [];
    if (!feePayments.examFeesPaid.terminal1) unpaidExams.push('Term 1');
    if (!feePayments.examFeesPaid.terminal2) unpaidExams.push('Term 2');
    if (!feePayments.examFeesPaid.terminal3) unpaidExams.push('Term 3');
    if (unpaidExams.length > 0) {
        const totalExamDue = unpaidExams.length * feeDetails.examFee;
        duesMessages.push(`Exam Fee: ${unpaidExams.join(', ')} (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalExamDue)})`);
    }

    return duesMessages;
};

export const createDefaultFeePayments = (): FeePayments => ({
    admissionFeePaid: true,
    tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
});

export const isSubjectNumeric = (subjectDef: SubjectDefinition, grade: Grade): boolean => {
    // Explicitly marked as grade-based
    if (subjectDef.gradingSystem === 'OABC') {
        return false;
    }
    // Effectively grade-based if it has no marks
    if (subjectDef.examFullMarks === 0 && subjectDef.activityFullMarks === 0) {
        return false;
    }
    // Special override for Cursive & Drawing in Class I & II
    if ((grade === Grade.I || grade === Grade.II) && (subjectDef.name === 'Cursive' || subjectDef.name === 'Drawing')) {
        return false;
    }
    // Otherwise, it's numeric
    return true;
};


export const calculateStudentResult = (
    finalTermResults: SubjectMark[],
    gradeDef: GradeDefinition,
    grade: Grade
): { finalResult: 'PASS' | 'FAIL' | 'SIMPLE PASS', failedSubjects: string[] } => {
    if (!finalTermResults || !gradeDef) {
        return { finalResult: 'FAIL', failedSubjects: ['No data'] };
    }

    const failedSubjects: string[] = [];

    gradeDef.subjects
      .filter(subject => isSubjectNumeric(subject, grade))
      .forEach(subject => {
        const result = finalTermResults.find(r => r.subject === subject.name);
        
        // Harmonized logic: prioritize 'marks' field, but fallback to summing components.
        // This makes it robust to how data was entered (e.g., single field vs split fields).
        const obtained = result?.marks ?? ((result?.examMarks ?? 0) + (result?.activityMarks ?? 0));
        
        const full = subject.examFullMarks + subject.activityFullMarks;

        if (full > 0) {
            // Uniform pass mark of 33 for all numeric subjects across all grades.
            // A score of 33 is a pass.
            if (obtained < 33) {
                failedSubjects.push(subject.name);
            }
        }
    });

    let finalResult: 'PASS' | 'FAIL' | 'SIMPLE PASS' = 'PASS';
    if (failedSubjects.length > 1) {
        finalResult = 'FAIL';
    } else if (failedSubjects.length === 1) {
        finalResult = 'SIMPLE PASS';
    }
    
    return { finalResult, failedSubjects };
};

export const getNextGrade = (currentGrade: Grade): Grade | null => {
    const currentIndex = GRADES_LIST.indexOf(currentGrade);
    if (currentIndex === -1 || currentIndex >= GRADES_LIST.length - 1) {
        return null;
    }
    return GRADES_LIST[currentIndex + 1];
};

export const formatDateForDisplay = (isoDate?: string): string => {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate || '';
  }
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateForStorage = (displayDate?: string): string => {
  if (!displayDate) {
    return '';
  }
  // If it's already in YYYY-MM-DD, return it.
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) {
    return displayDate;
  }
  // Match D(D)/M(M)/YYYY
  const match = displayDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return ''; // Return empty if format is completely wrong
  }
  const [, day, month, year] = match;
  
  // Pad with leading zeros to ensure YYYY-MM-DD format
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  
  return `${year}-${paddedMonth}-${paddedDay}`;
};

export function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d;
}

export const exportAttendanceToCsv = ({
    people,
    attendanceData,
    month, // YYYY-MM
    entityName,
    entityType,
    academicYear
}: {
    people: (Student | Staff)[];
    attendanceData: { [date: string]: StaffAttendanceRecord | StudentAttendanceRecord };
    month: string;
    entityName: string;
    entityType: 'Student' | 'Staff';
    academicYear: string;
}) => {
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const monthName = new Date(year, monthNum - 1, 1).toLocaleString('default', { month: 'long' });

    const isStaff = entityType === 'Staff';

    const headers = [
        `${entityType} ID`,
        'Name',
        ...Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
        'Present',
        'Absent',
        'Leave',
    ];
    if (isStaff) headers.push('Late');
    
    const rows = people.map(person => {
        const rowData = [
            entityType === 'Student' ? formatStudentId(person as Student, academicYear) : (person as Staff).employeeId,
            entityType === 'Student' ? (person as Student).name : `${(person as Staff).firstName} ${(person as Staff).lastName}`,
        ];

        let presentCount = 0;
        let absentCount = 0;
        let leaveCount = 0;
        let lateCount = 0; // Only for staff

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayRecord = attendanceData[dateStr];
            const status = dayRecord ? dayRecord[person.id] : undefined;
            
            let statusChar = '';
            if (status === AttendanceStatus.PRESENT || status === StudentAttendanceStatus.PRESENT) {
                statusChar = 'P';
                presentCount++;
            } else if (status === AttendanceStatus.ABSENT || status === StudentAttendanceStatus.ABSENT) {
                statusChar = 'A';
                absentCount++;
            } else if (status === AttendanceStatus.LEAVE || status === StudentAttendanceStatus.LEAVE) {
                statusChar = 'LV'; // Using LV for Leave to avoid conflict
                leaveCount++;
            } else if (isStaff && status === AttendanceStatus.LATE) {
                statusChar = 'L';
                lateCount++;
            }
            rowData.push(statusChar);
        }

        rowData.push(String(presentCount), String(absentCount), String(leaveCount));
        if (isStaff) rowData.push(String(lateCount));
        
        return rowData.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${entityType}_Attendance_${entityName.replace(' ', '_')}_${monthName}_${year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const formatPhoneNumberForWhatsApp = (phone: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    // If it already starts with 91 and has 12 digits, assume it's correct.
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
        return digitsOnly;
    }
    // If it has 10 digits, prepend 91.
    if (digitsOnly.length === 10) {
        return `91${digitsOnly}`;
    }
    // Otherwise, return the cleaned number, assuming it might be an international number with a different country code.
    return digitsOnly;
};

export const calculateRanks = (
  studentScores: Array<{ studentId: string; totalMarks: number; result: 'PASS' | 'FAIL' | 'SIMPLE PASS' }>
): Map<string, number | 'NA'> => {
  const ranks = new Map<string, number | 'NA'>();

  // Filter for rankable students and sort them by total marks in descending order.
  const passedStudents = studentScores
    .filter(s => s.result === 'PASS' || s.result === 'SIMPLE PASS')
    .sort((a, b) => b.totalMarks - a.totalMarks);

  // Assign ranks using dense ranking (e.g., 1, 2, 2, 3).
  if (passedStudents.length > 0) {
    let rank = 1;
    ranks.set(passedStudents[0].studentId, rank);
    for (let i = 1; i < passedStudents.length; i++) {
      // If the current student's score is less than the previous one, increment the rank.
      if (passedStudents[i].totalMarks < passedStudents[i - 1].totalMarks) {
        rank++;
      }
      // Assign the current rank. If scores are the same, the rank will be the same as the previous student.
      ranks.set(passedStudents[i].studentId, rank);
    }
  }

  // Set rank to 'NA' for students who failed.
  studentScores.forEach(s => {
    if (s.result === 'FAIL') {
      ranks.set(s.studentId, 'NA');
    }
  });

  return ranks;
};

export const getMonthsForTerm = (examId: string): { month: number, yearOffset: 0 | 1 }[] => {
    switch(examId) {
        case 'terminal1': // Apr, May, Jun, Jul
            return [ { month: 3, yearOffset: 0 }, { month: 4, yearOffset: 0 }, { month: 5, yearOffset: 0 }, { month: 6, yearOffset: 0 } ];
        case 'terminal2': // Aug, Sep, Oct
            return [ { month: 7, yearOffset: 0 }, { month: 8, yearOffset: 0 }, { month: 9, yearOffset: 0 } ];
        case 'terminal3': // Nov, Dec, Jan, Feb, Mar
            return [ { month: 10, yearOffset: 0 }, { month: 11, yearOffset: 0 }, { month: 0, yearOffset: 1 }, { month: 1, yearOffset: 1 }, { month: 2, yearOffset: 1 } ];
        default:
            return [];
    }
}

export const getPerformanceGrade = (percentage: number, result: string, grade: Grade): string => {
    // If the student has failed, the grade is D, regardless of percentage.
    if (result === 'FAIL') {
        return 'D';
    }
    
    // Unified Grading System for all classes from Nursery to Class X for PASS/SIMPLE PASS
    // Based on user request: =IF(%>89,"O",IF(%>79,"A", IF(%>69,"B",IF(%>59,"C","D"))))
    if (percentage > 89) return 'O'; // Outstanding (e.g. 90% and above)
    if (percentage > 79) return 'A'; // (e.g. 80% to 89.99%)
    if (percentage > 69) return 'B'; // (e.g. 70% to 79.99%)
    if (percentage > 59) return 'C'; // (e.g. 60% to 69.99%)
    return 'D'; // (e.g. below 60%)
};

export const getRemarks = (percentage: number, result: string): string => {
    if (result === 'FAIL') return 'Requires serious attention';
    if (percentage >= 90) return 'Outstanding';
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 70) return 'Very Good';
    if (percentage >= 60) return 'Good';
    if (percentage >= 50) return 'Satisfactory';
    return 'Needs Improvement';
};