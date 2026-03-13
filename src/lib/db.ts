export type Visitor = {
  id: string; // School ID or Institutional Email
  name: string;
  college: string;
  office: string;
  type: 'student' | 'faculty' | 'employee';
};

export type Purpose = 'reading books' | 'research in thesis' | 'use of computer' | 'doing assignments';

export type VisitorLog = {
  id: string;
  visitorId: string;
  checkInTime: string;
  purposeOfVisit: Purpose;
  visitorName: string;
  collegeOrOffice: string;
};

export const COLLEGES = [
  'College of Arts and Sciences',
  'College of Engineering',
  'College of Computer Studies',
  'College of Business Administration',
  'College of Education',
  'College of Nursing',
  'College of Criminology',
  'College of Music',
  'Graduate School',
  'University Office',
  'Other'
];

// Seed data
const INITIAL_VISITORS: Visitor[] = [
  { id: '2023-0001', name: 'John Doe', college: 'College of Arts and Sciences', office: 'N/A', type: 'student' },
  { id: '2023-0002', name: 'Jane Smith', college: 'College of Engineering', office: 'N/A', type: 'student' },
  { id: 'prof.smith@neu.edu.ph', name: 'Dr. Robert Smith', college: 'N/A', office: 'Faculty Office', type: 'faculty' },
  { id: 'staff.mary@neu.edu.ph', name: 'Mary Johnson', college: 'N/A', office: 'Registrar', type: 'employee' },
];

const INITIAL_LOGS: VisitorLog[] = [
  { id: '1', visitorId: '2023-0001', checkInTime: new Date(Date.now() - 3600000).toISOString(), purposeOfVisit: 'reading books', visitorName: 'John Doe', collegeOrOffice: 'College of Arts and Sciences' },
  { id: '2', visitorId: '2023-0002', checkInTime: new Date(Date.now() - 7200000).toISOString(), purposeOfVisit: 'research in thesis', visitorName: 'Jane Smith', collegeOrOffice: 'College of Engineering' },
];

// In-memory "database"
let visitors = [...INITIAL_VISITORS];
let logs = [...INITIAL_LOGS];
let blockedIds = new Set<string>();

export const db = {
  getVisitor: (id: string) => visitors.find(v => v.id === id),
  
  isBlocked: (id: string) => blockedIds.has(id),
  
  blockVisitor: (id: string) => {
    blockedIds.add(id);
    return true;
  },
  
  unblockVisitor: (id: string) => {
    blockedIds.delete(id);
    return true;
  },

  getBlockedIds: () => Array.from(blockedIds),
  
  addLog: (log: Omit<VisitorLog, 'id'>) => {
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
    logs.push(newLog);
    return newLog;
  },
  
  getLogs: (startDate?: Date, endDate?: Date) => {
    if (!startDate || !endDate) return [...logs];
    return logs.filter(log => {
      const time = new Date(log.checkInTime).getTime();
      return time >= startDate.getTime() && time <= endDate.getTime();
    });
  },

  getAllVisitors: () => [...visitors],
};
