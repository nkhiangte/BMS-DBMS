import { Student, Staff, Grade, FeePayments, SubjectMark, GradeDefinition, StaffAttendanceRecord, StudentAttendanceRecord, AttendanceStatus, StudentAttendanceStatus } from './types';
import { FEE_STRUCTURE, academicMonths, GRADES_LIST } from './constants';

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

export const getFeeDetails = (grade: Grade) => {
    const set1Grades: Grade[] = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II];
    const set2Grades: Grade[] = [Grade.III, Grade.IV, Grade.V, Grade.VI];

    if (set1Grades.includes(grade)) return FEE_STRUCTURE.set1;
    if (set2Grades.includes(grade)) return FEE_STRUCTURE.set2;
    return FEE_STRUCTURE.set3;
};

export const calculateDues = (student: Student): string[] => {
    // If a student record was created before the feePayments feature, it might be undefined.
    // We create a default state assuming no fees are paid.
    const defaultPayments: FeePayments = {
        admissionFeePaid: false,
        tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
        examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
    };
    const feePayments = student.feePayments || defaultPayments;

    const duesMessages: string[] = [];

    if (!feePayments.admissionFeePaid) {
        duesMessages.push('Admission Fee');
    }

    const unpaidTuitionMonths = academicMonths.filter(month => !feePayments.tuitionFeesPaid[month]);
    if (unpaidTuitionMonths.length > 0) {
        duesMessages.push(`Tuition Fee: ${unpaidTuitionMonths.length} month(s) pending`);
    }

    const unpaidExams: string[] = [];
    if (!feePayments.examFeesPaid.terminal1) unpaidExams.push('Term 1');
    if (!feePayments.examFeesPaid.terminal2) unpaidExams.push('Term 2');
    if (!feePayments.examFeesPaid.terminal3) unpaidExams.push('Term 3');
    if (unpaidExams.length > 0) {
        duesMessages.push(`Exam Fee: ${unpaidExams.join(', ')}`);
    }

    return duesMessages;
};

export const createDefaultFeePayments = (): FeePayments => ({
    admissionFeePaid: true,
    tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
});

export const calculateStudentResult = (
    finalTermResults: SubjectMark[],
    gradeDef: GradeDefinition,
    grade: Grade
): { finalResult: 'PASS' | 'FAIL' | 'SIMPLE PASS', failedSubjects: string[] } => {
    if (!finalTermResults || !gradeDef) {
        return { finalResult: 'FAIL', failedSubjects: ['No data'] };
    }

    const failedSubjects: string[] = [];
    const hasActivityMarks = gradeDef.subjects.some(s => s.activityFullMarks > 0);
    const gradeCategory = [Grade.IX, Grade.X].includes(grade) ? 'IX-X'
        : [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(grade) ? 'NUR-II'
        : 'III-VIII';

    gradeDef.subjects
      .filter(s => s.gradingSystem !== 'OABC')
      .forEach(subject => {
        const result = finalTermResults.find(r => r.subject === subject.name);
        const examMarks = result?.examMarks ?? 0;
        const singleMark = result?.marks ?? 0;
        const obtained = hasActivityMarks ? (examMarks + (result?.activityMarks ?? 0)) : singleMark;
        const full = subject.examFullMarks + (hasActivityMarks ? subject.activityFullMarks : 0);

        if (full > 0) {
            let failed = false;
            if (gradeCategory === 'III-VIII') {
                if (hasActivityMarks) {
                    // Fail if exam marks are below 20 OR total is below 33
                    if (examMarks < 20 || obtained < 33) {
                        failed = true;
                    }
                } else { // Fallback for old system without activities
                    if (singleMark < 33) {
                         failed = true;
                    }
                }
            } else {
                if (obtained < 33) {
                    failed = true;
                }
            }
            if (failed) {
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

  // Filter for students who passed (including simple pass) and sort them by marks
  const passedAndRankableStudents = studentScores
    .filter(s => s.result === 'PASS' || s.result === 'SIMPLE PASS')
    .sort((a, b) => b.totalMarks - a.totalMarks);

  // Set rank to 'NA' for everyone who failed
  studentScores.forEach(s => {
    if (s.result === 'FAIL') {
      ranks.set(s.studentId, 'NA');
    }
  });
  
  // Assign ranks to the passed students, handling ties
  if (passedAndRankableStudents.length > 0) {
      let rank = 1;
      ranks.set(passedAndRankableStudents[0].studentId, rank);
      for (let i = 1; i < passedAndRankableStudents.length; i++) {
          if (passedAndRankableStudents[i].totalMarks === passedAndRankableStudents[i - 1].totalMarks) {
              ranks.set(passedAndRankableStudents[i].studentId, rank);
          } else {
              rank = i + 1;
              ranks.set(passedAndRankableStudents[i].studentId, rank);
          }
      }
  }

  return ranks;
};