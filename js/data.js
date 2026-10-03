// AI Campus Copilot - Live data container
// Demo/sample campus records have been removed.
// Student, academic and campus records should come from Supabase.
// Google Forms/Sheets can be used as the data-entry source and synced into Supabase.

export const campusData = {
  student: {
    name: 'Student',
    id: '',
    rollNumber: '',
    program: '',
    term: '',
    section: '',
    department: '',
    email: '',
    avatar: 'assets/avatars/student.svg',
    cgpa: '',
    creditsCompleted: 0,
    totalCredits: 0,
    attendanceOverall: '',
    academicAdvisor: '',
    hostel: ''
  },
  attendance: [],
  timetable: [],
  notices: [],
  tasks: [],
  events: [],
  venues: [],
  shuttles: [],
  studyModules: [],
  aiResponses: {}
};
