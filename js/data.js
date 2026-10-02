// AI Campus Copilot - Comprehensive Campus Demo Data & Knowledge Base

export const campusData = {
  student: {
    name: "Sophia Chen",
    id: "#CS-2024-884",
    rollNumber: "24CS0142",
    program: "B.Tech Computer Science",
    term: "Term 4 (Fall 2024)",
    department: "Computer Science & Engineering",
    email: "sophia.chen@campus.edu",
    avatar: "assets/avatars/student.svg",
    cgpa: "3.82",
    creditsCompleted: 64,
    totalCredits: 128,
    attendanceOverall: "89.4%",
    academicAdvisor: "Prof. Dr. Alan Vance",
    hostel: "Block B, Room 412"
  },

  attendance: [
    { code: "CS-204", name: "Data Structures & Algorithms", attended: 26, total: 28, percentage: 92.8, status: "safe" },
    { code: "CS-206", name: "Database Management Systems", attended: 24, total: 28, percentage: 85.7, status: "safe" },
    { code: "CS-208", name: "Operating Systems", attended: 25, total: 28, percentage: 89.3, status: "safe" },
    { code: "MA-202", name: "Discrete Mathematics", attended: 21, total: 26, percentage: 80.7, status: "warning" },
    { code: "CS-210", name: "Computer Networks Lab", attended: 14, total: 14, percentage: 100, status: "safe" },
    { code: "HS-201", name: "Technical Communication & Ethics", attended: 12, total: 14, percentage: 85.7, status: "safe" }
  ],

  timetable: [
    {
      day: "Monday",
      classes: [
        { time: "09:00 - 10:00", code: "CS-208", name: "Operating Systems", room: "Room 205, Turing Hall", faculty: "Prof. Marcus Reed", type: "Lecture" },
        { time: "10:15 - 11:15", code: "CS-204", name: "Data Structures & Algorithms", room: "Room 302, Turing Hall", faculty: "Prof. Dr. Alan Vance", type: "Lecture", isCurrent: true },
        { time: "11:30 - 12:30", code: "MA-202", name: "Discrete Mathematics", room: "Room 110, Euler Hall", faculty: "Dr. Elena Rostova", type: "Lecture" },
        { time: "13:30 - 15:30", code: "CS-210", name: "Computer Networks Lab", room: "Networking Lab 2, Shannon Block", faculty: "Er. Kevin Miller", type: "Lab" }
      ]
    },
    {
      day: "Tuesday",
      classes: [
        { time: "09:00 - 10:00", code: "CS-206", name: "Database Management Systems", room: "Room 302, Turing Hall", faculty: "Dr. Priya Sharma", type: "Lecture" },
        { time: "10:15 - 11:15", code: "CS-208", name: "Operating Systems", room: "Room 205, Turing Hall", faculty: "Prof. Marcus Reed", type: "Lecture" },
        { time: "11:30 - 12:30", code: "HS-201", name: "Technical Communication & Ethics", room: "Seminar Hall B, Admin Block", faculty: "Dr. Sarah Jenkins", type: "Tutorial" },
        { time: "14:00 - 16:00", code: "CS-204", name: "DSA Algorithms Lab", room: "Software Lab 3, Turing Hall", faculty: "Prof. Dr. Alan Vance", type: "Lab" }
      ]
    },
    {
      day: "Wednesday",
      classes: [
        { time: "09:00 - 10:00", code: "MA-202", name: "Discrete Mathematics", room: "Room 110, Euler Hall", faculty: "Dr. Elena Rostova", type: "Lecture" },
        { time: "10:15 - 11:15", code: "CS-204", name: "Data Structures & Algorithms", room: "Room 302, Turing Hall", faculty: "Prof. Dr. Alan Vance", type: "Lecture" },
        { time: "11:30 - 12:30", code: "CS-206", name: "Database Management Systems", room: "Room 302, Turing Hall", faculty: "Dr. Priya Sharma", type: "Lecture" },
        { time: "14:00 - 15:00", code: "TUT-01", name: "Open Problem Solving & Mentorship", room: "Room 105, Turing Hall", faculty: "Dept. TAs", type: "Tutorial" }
      ]
    },
    {
      day: "Thursday",
      classes: [
        { time: "09:00 - 10:00", code: "CS-208", name: "Operating Systems", room: "Room 205, Turing Hall", faculty: "Prof. Marcus Reed", type: "Lecture" },
        { time: "10:15 - 11:15", code: "MA-202", name: "Discrete Mathematics", room: "Room 110, Euler Hall", faculty: "Dr. Elena Rostova", type: "Lecture" },
        { time: "13:30 - 16:30", code: "CS-206", name: "DBMS Lab & SQL Project", room: "Database Lab 1, Shannon Block", faculty: "Dr. Priya Sharma", type: "Lab" }
      ]
    },
    {
      day: "Friday",
      classes: [
        { time: "10:15 - 11:15", code: "CS-204", name: "Data Structures & Algorithms", room: "Room 302, Turing Hall", faculty: "Prof. Dr. Alan Vance", type: "Lecture" },
        { time: "11:30 - 12:30", code: "CS-206", name: "Database Management Systems", room: "Room 302, Turing Hall", faculty: "Dr. Priya Sharma", type: "Lecture" },
        { time: "14:00 - 15:00", code: "HS-201", name: "Technical Communication Seminar", room: "Seminar Hall B, Admin Block", faculty: "Dr. Sarah Jenkins", type: "Seminar" }
      ]
    }
  ],

  notices: [
    {
      id: "N-101",
      title: "Midterm Examination Schedule Released - Fall 2024",
      category: "Examinations",
      badgeClass: "bg-error-container text-on-error-container",
      date: "Oct 01, 2024",
      author: "Office of the Controller of Examinations",
      urgent: true,
      summary: "The official midterm schedule for B.Tech Terms 3, 4, 5, and 7 is now published. Exams begin Nov 05, 2024. Hall tickets must be downloaded from SIS by Oct 30.",
      attachment: "Midterm_DateSheet_Fall2024.pdf",
      fileSize: "1.4 MB",
      read: false
    },
    {
      id: "N-102",
      title: "CS-204 Programming Assignment 3 Deadline Extension",
      category: "Academic",
      badgeClass: "bg-primary-fixed text-on-primary-fixed",
      date: "Oct 02, 2024",
      author: "Department of Computer Science",
      urgent: false,
      summary: "In response to the upcoming national hackathon, the submission window for CS-204 Assignment 3 (AVL Trees & Red-Black Trees) has been extended to Oct 28 at 11:59 PM.",
      attachment: "CS204_A3_UpdatedRubric.pdf",
      fileSize: "840 KB",
      read: false
    },
    {
      id: "N-103",
      title: "Hostel Wi-Fi Upgrades & Scheduled Power Maintenance",
      category: "Facilities",
      badgeClass: "bg-secondary-fixed text-on-secondary-fixed",
      date: "Sep 30, 2024",
      author: "Campus Infrastructure & IT Services",
      urgent: false,
      summary: "Hostel Block B and Block C will undergo fiber optic router upgrades on Saturday, Oct 05 between 02:00 AM and 06:00 AM. Internet access will be temporarily interrupted.",
      attachment: "IT_Maintenance_Schedule.pdf",
      fileSize: "410 KB",
      read: true
    },
    {
      id: "N-104",
      title: "Google & Microsoft Fall Campus Placement & Internship Briefing",
      category: "Placements",
      badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed",
      date: "Sep 28, 2024",
      author: "Training & Placement Cell (T&P)",
      urgent: false,
      summary: "Eligible students for Summer 2025 Software Engineering Internships must register on the T&P portal before Oct 10, 2024. Pre-placement talk scheduled for Oct 18 in Main Auditorium.",
      attachment: "Placement_Drive_2025_Guidelines.pdf",
      fileSize: "2.1 MB",
      read: true
    }
  ],

  tasks: [
    {
      id: "T-1",
      title: "Implement AVL Tree balance rotations in C++",
      course: "CS-204 DSA",
      dueDate: "Oct 28, 2024",
      dueBadge: "Due in 4 days",
      priority: "High",
      priorityClass: "bg-error-container text-on-error-container",
      status: "in-progress"
    },
    {
      id: "T-2",
      title: "Download & print Midterm Hall Ticket via SIS",
      course: "Examinations",
      dueDate: "Oct 30, 2024",
      dueBadge: "Due in 6 days",
      priority: "High",
      priorityClass: "bg-error-container text-on-error-container",
      status: "todo"
    },
    {
      id: "T-3",
      title: "Complete SQL Schema & Normalization Worksheet 4",
      course: "CS-206 DBMS",
      dueDate: "Nov 02, 2024",
      dueBadge: "Due in 9 days",
      priority: "Medium",
      priorityClass: "bg-secondary-container text-on-secondary-container",
      status: "todo"
    },
    {
      id: "T-4",
      title: "Review Peterson's Algorithm for Critical Section Problem",
      course: "CS-208 OS",
      dueDate: "Nov 04, 2024",
      dueBadge: "Due in 11 days",
      priority: "Medium",
      priorityClass: "bg-secondary-container text-on-secondary-container",
      status: "todo"
    },
    {
      id: "T-5",
      title: "Submit Medical Leave Certificate to Student Affairs (Counter 3)",
      course: "Administrative",
      dueDate: "Sep 25, 2024",
      dueBadge: "Completed",
      priority: "High",
      priorityClass: "bg-surface-container-high text-on-surface-variant",
      status: "completed"
    }
  ],

  events: [
    {
      id: "E-1",
      title: "HackCampus 2024: 36-Hour National Collegiate Hackathon",
      category: "Hackathon",
      date: "Oct 14 – 16, 2024",
      time: "Starts 09:00 AM",
      venue: "Turing Innovation & Maker Lab",
      attendees: 380,
      image: "assets/logo.svg",
      description: "Build cutting-edge AI, Web3, and IoT solutions with \$25,000 in prizes and direct mentorship from premier tech companies.",
      tags: ["AI", "Innovation", "Cash Prizes"]
    },
    {
      id: "E-2",
      title: "Distinguished Lecture: Modern Neural Architectures & LLM Reasoning",
      category: "Tech Talk",
      date: "Oct 18, 2024",
      time: "03:00 PM – 05:00 PM",
      venue: "Dr. Vikram Sarabhai Main Auditorium",
      attendees: 520,
      description: "Keynote presentation by visiting DeepMind AI research scientists discussing multi-agent systems and real-world deployment.",
      tags: ["Deep Learning", "Guest Keynote", "Certificate"]
    },
    {
      id: "E-3",
      title: "Annual University Cultural & Tech Fest - Synapse 2024",
      category: "Cultural",
      date: "Nov 10 – 12, 2024",
      time: "All Day",
      venue: "Campus Open Air Amphitheater & Student Grounds",
      attendees: 1800,
      description: "Three exhilarating days of music concerts, competitive robotics, esports leagues, battle of the bands, and art installations.",
      tags: ["Flagship Fest", "Concert", "Competitions"]
    },
    {
      id: "E-4",
      title: "Workshop: Cracking Big Tech Coding & System Design Interviews",
      category: "Career",
      date: "Oct 22, 2024",
      time: "05:00 PM – 07:30 PM",
      venue: "Shannon Seminar Hall 2",
      attendees: 210,
      description: "Interactive live problem solving covering LeetCode Hard paradigms, concurrency patterns, and microservices scaling.",
      tags: ["Placement Prep", "Mock Interviews", "Algorithms"]
    }
  ],

  venues: [
    {
      name: "Turing Hall (Computer Science Building)",
      type: "Academic Block",
      hours: "07:30 AM - 09:30 PM",
      occupancy: "Moderate (64%)",
      location: "North Academic Zone, Gate 2",
      facilities: ["Computer Labs 1 to 6", "AI & Robotics Lab", "Faculty Cabins", "Elevators & Filtered Water"],
      contact: "cs.dept@campus.edu • Ext. 401"
    },
    {
      name: "Central Knowledge Center & Library",
      type: "Library",
      hours: "24/7 (Reading Hall) • 08:00 AM - 10:00 PM (Issuing)",
      occupancy: "High (82%)",
      location: "Campus Central Plaza",
      facilities: ["Silent Study Pods", "Digital Archive", "Book Issue Kiosks", "High-speed Wi-Fi", "Café Corner"],
      contact: "library.desk@campus.edu • Ext. 108"
    },
    {
      name: "Shannon Electronics & Networking Block",
      type: "Academic Block",
      hours: "08:00 AM - 08:00 PM",
      occupancy: "Low (38%)",
      location: "East Academic Ring",
      facilities: ["Cisco Networking Center", "VLSI Research Lab", "IoT Prototyping Bench"],
      contact: "shannon.office@campus.edu • Ext. 312"
    },
    {
      name: "Campus Health & Wellness Center",
      type: "Medical Care",
      hours: "Open 24/7 (Emergency & Doctor On Duty)",
      occupancy: "Low (15%)",
      location: "Residential Sector, Near Hostel Block A",
      facilities: ["2 Resident Physicians", "Ambulance on Standby", "Pharmacy", "Counseling & Mental Health"],
      contact: "health.emergency@campus.edu • Hotline: +1 (800) 555-0199"
    },
    {
      name: "University Sports Arena & Olympic Pool",
      type: "Athletics",
      hours: "06:00 AM - 09:00 AM, 04:30 PM - 09:30 PM",
      occupancy: "Moderate (55%)",
      location: "South Sports Complex",
      facilities: ["6 Indoor Badminton Courts", "Weight Training Gym", "Olympic 50m Pool", "Squash Courts"],
      contact: "sports.council@campus.edu • Ext. 550"
    }
  ],

  shuttles: [
    { route: "Route 1 (North Ring)", interval: "Every 12 mins", path: "North Gate ↔ Turing Hall ↔ Central Library ↔ Admin Block", status: "Active • On Time" },
    { route: "Route 2 (Hostel Express)", interval: "Every 8 mins", path: "Hostel Blocks A-E ↔ Dining Pavilion ↔ Turing Hall ↔ Sports Complex", status: "Active • High Frequency" },
    { route: "Route 3 (Metro Link)", interval: "Every 20 mins", path: "Campus Main Circle ↔ Metro Station Central ↔ Tech Park Gate", status: "Active • Scheduled" },
    { route: "Route 4 (Night Escort)", interval: "Every 15 mins (After 09:00 PM)", path: "Library ↔ Labs ↔ Hostels ↔ 24/7 Cafeteria", status: "Night Service Only" }
  ],

  studyModules: [
    {
      code: "CS-204",
      name: "Data Structures & Algorithms",
      credits: 4,
      faculty: "Prof. Dr. Alan Vance",
      progress: 68,
      units: [
        { title: "Unit 1: Asymptotic Notation & Amortized Analysis", status: "Completed" },
        { title: "Unit 2: Linear Structures (Stacks, Queues, Deques)", status: "Completed" },
        { title: "Unit 3: Balanced Search Trees (AVL, Red-Black Trees)", status: "In Progress (Current)" },
        { title: "Unit 4: Heap Sort, Priority Queues & Disjoint Sets", status: "Upcoming" },
        { title: "Unit 5: Graph Traversals (BFS, DFS, Dijkstra, Prim's)", status: "Upcoming" }
      ],
      aiTools: ["Generate AVL Rotation Cheat Sheet", "Quiz on Balance Factors", "Explain Worst-Case Big-O Bounds"]
    },
    {
      code: "CS-206",
      name: "Database Management Systems",
      credits: 4,
      faculty: "Dr. Priya Sharma",
      progress: 58,
      units: [
        { title: "Unit 1: ER Modeling & Relational Algebra", status: "Completed" },
        { title: "Unit 2: SQL Complex Queries & Window Functions", status: "Completed" },
        { title: "Unit 3: Normalization & Normal Forms (1NF, 2NF, 3NF, BCNF)", status: "In Progress (Current)" },
        { title: "Unit 4: Transaction Processing & ACID Properties", status: "Upcoming" },
        { title: "Unit 5: Concurrency Control & Crash Recovery", status: "Upcoming" }
      ],
      aiTools: ["Normalize Schema to 3NF", "Generate SQL Practice Queries", "Explain 2-Phase Locking"]
    },
    {
      code: "CS-208",
      name: "Operating Systems",
      credits: 4,
      faculty: "Prof. Marcus Reed",
      progress: 62,
      units: [
        { title: "Unit 1: OS Structures & System Calls", status: "Completed" },
        { title: "Unit 2: Process Scheduling & Context Switching", status: "Completed" },
        { title: "Unit 3: Synchronization, Semaphores & Deadlocks", status: "In Progress (Current)" },
        { title: "Unit 4: Memory Management & Paging Algorithms", status: "Upcoming" },
        { title: "Unit 5: File Systems & Storage Architecture", status: "Upcoming" }
      ],
      aiTools: ["Visualize Banker's Algorithm", "Compare CPU Scheduling Algorithms", "Explain Virtual Memory & TLB"]
    }
  ],

  // Knowledge base responses for the AI Copilot
  aiResponses: {
    "What is my next class and what topics are being covered according to the syllabus?": {
      type: "schedule",
      content: `According to your Week 7 course schedule, today's lecture begins the advanced balanced search tree module in CS-204.`,
      schedule: {
        time: "10:15 AM",
        code: "CS-204",
        name: "Data Structures & Algorithms",
        room: "Room 302, Turing Hall",
        faculty: "Prof. Dr. Alan Vance"
      },
      topics: [
        { id: "01", title: "AVL Tree Rotations", desc: "Single (LL, RR) & Double (LR, RL) balance mechanics" },
        { id: "02", title: "Balance Factor Calcs", desc: "Height recalculation criteria: {-1, 0, +1} invariant" },
        { id: "03", title: "Insertion Complexity", desc: "Logarithmic bounds verification & memory footprint" }
      ],
      citation: {
        doc: "CS204_Syllabus_Fall2024.pdf",
        meta: "Page 4, Section 3.2 • Registrar Schedule Feed API #2411"
      }
    },
    "Where can I submit my medical leave certificate?": {
      type: "policy",
      content: `Medical certificates must be submitted through one of two official university channels within **3 working days** of returning to campus:`,
      options: [
        {
          title: "Option 1: Digital Upload (Recommended)",
          desc: "Submit via the **Student Affairs Portal**. Upload scanned hospital doctor stamp and admission slip in PDF format (<10MB).",
          action: "Open Student Portal"
        },
        {
          title: "Option 2: Physical Submission",
          desc: "**Admin Block A, Room 104** (Counter 3)<br>Operating Hours: Monday – Friday<br>**10:00 AM – 4:00 PM**",
          badge: "Counter currently open"
        }
      ],
      citation: {
        doc: "Student Handbook 2024–25",
        meta: "Section 8.4: Attendance Regulations & Medical Leaves"
      }
    },
    "What is my attendance percentage in CS-204?": {
      type: "stats",
      content: `Here is your verified attendance audit for **CS-204 (Data Structures & Algorithms)** as of today:`,
      stats: [
        { label: "Lectures Attended", value: "26 / 28 sessions" },
        { label: "Attendance Ratio", value: "92.8%", highlight: true },
        { label: "University Minimum", value: "75.0% required" },
        { label: "Safety Margin", value: "You can miss up to 5 more lectures without falling below 75%" }
      ],
      citation: {
        doc: "SIS Attendance Registrar Feed",
        meta: "Synced 15 mins ago • Verified by Department Coordinator"
      }
    },
    "When is the next midterm exam?": {
      type: "exam",
      content: `The Fall 2024 Midterm Examinations commence on **Tuesday, November 05, 2024**. Your first exam is:`,
      exam: {
        code: "CS-204",
        title: "Data Structures & Algorithms",
        date: "Nov 05, 2024 (10:00 AM - 12:00 PM)",
        venue: "Hall B, Examination Complex",
        hallTicketNotice: "Hall tickets will be available for download in SIS on Oct 30."
      },
      citation: {
        doc: "Midterm_DateSheet_Fall2024.pdf",
        meta: "Controller of Examinations Notice Ref #COE-2024-F4"
      }
    },
    "Where is the nearest open computer lab right now?": {
      type: "lab",
      content: `Currently available computer labs with active open access seats:`,
      labs: [
        { name: "Software Lab 2 (Turing Hall, 2nd Floor)", openUntil: "08:00 PM", freeSeats: "24 / 60 seats available", status: "Quiet & Air-Conditioned" },
        { name: "Central Library Digital Media Lab (1st Floor)", openUntil: "10:00 PM", freeSeats: "12 / 40 seats available", status: "Headphones Allowed" }
      ],
      citation: {
        doc: "Campus IoT Lab Seat Sensor Feed",
        meta: "Live Telemetry • Updated 2 minutes ago"
      }
    },
    "Summarize lecture notes for AVL Trees": {
      type: "summary",
      content: `### AVL Trees Quick Summary\n\n- **Definition**: Self-balancing Binary Search Tree where height difference between left and right subtrees (Balance Factor = Height(Left) - Height(Right)) cannot exceed $\\pm 1$.\n- **Four Rotation Cases**:\n  1. **LL (Left-Left)**: Single Right Rotation\n  2. **RR (Right-Right)**: Single Left Rotation\n  3. **LR (Left-Right)**: Left Rotation on left child, then Right Rotation on node\n  4. **RL (Right-Left)**: Right Rotation on right child, then Left Rotation on node\n- **Time Complexity**:\n  - Search: $\\mathcal{O}(\\log n)$\n  - Insertion: $\\mathcal{O}(\\log n)$ (with at most 2 rotations)\n  - Deletion: $\\mathcal{O}(\\log n)$ (may require up to $\\mathcal{O}(\\log n)$ rotations)`,
      citation: {
        doc: "CS204_Lecture_Notes_Week7.pdf",
        meta: "Prof. Dr. Alan Vance • Slide Deck 7.1"
      }
    }
  }
};
