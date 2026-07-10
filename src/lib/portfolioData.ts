export interface HeroData {
  name: string;
  lastName: string;
  description: string;
  github: string;
  linkedin: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface AboutHighlight {
  iconType: "education" | "focus" | "lookingFor";
  title: string;
  desc: string;
}

export interface AboutData {
  bio: string;
  highlights: AboutHighlight[];
  objective?: string;
  journey?: string;
  interests?: string[];
  goals?: string;
  whatIEnjoyBuilding?: string;
  learningTimeline?: { date: string; title: string; desc: string }[];
}

export interface SkillItem {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  percentage: number;
  description: string;
  usedInProjects: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[]; // for backward compatibility with Admin page
  skillItems?: SkillItem[]; // expanded details for Skills page
}

export interface ProjectData {
  id: string; // unique ID for route /projects/:id
  title: string;
  subtitle: string;
  tech: string[];
  desc: string;
  features: string[];
  link: string;
  // Case Study fields
  image?: string;
  status?: "Completed" | "In Progress" | "Planned";
  duration?: string;
  role?: string;
  featured?: boolean;
  problemStatement?: string;
  businessGoal?: string;
  architectureDiagram?: string;
  folderStructure?: string;
  authenticationFlow?: string;
  securityFeatures?: string[];
  performanceOptimizations?: string[];
  challengesFaced?: string[];
  solutionsImplemented?: string[];
  lessonsLearned?: string[];
  timeline?: string;
  teamSize?: string;
  keyAchievements?: string[];
  testingStrategy?: string;
  seoOptimization?: string;
  futureEnhancements?: string[];
  databaseSchema?: string;
  apiFlow?: string;
}

export interface CertificationData {
  id: string;
  name: string;
  org: string;
  image?: string;
  issueDate?: string;
  credentialId?: string;
  skillsLearned?: string[];
  verifyUrl?: string;
  downloadUrl?: string;
  category?: string;
}

export interface ExperienceData {
  id: string;
  companyLogo?: string;
  companyName: string;
  role: string;
  duration: string;
  location: string;
  responsibilities: string[];
  technologiesUsed: string[];
  achievements: string[];
  projectsWorkedOn: string[];
  skillsGained: string[];
}

export interface EducationData {
  id: string;
  college: string;
  degree: string;
  department: string;
  duration: string;
  cgpa: string;
  relevantCoursework: string[];
  projects: string[];
  achievements: string[];
  activities: string[];
  certificates: string[];
}

export interface AchievementItem {
  id: string;
  category: "Award" | "Hackathon" | "Contest" | "Contribution" | "Volunteer" | "Leadership";
  title: string;
  organization: string;
  date: string;
  description: string;
  badge?: string;
  link?: string;
}

export interface ResumeData {
  resumeUrl: string;
  atsContent: string;
}

export interface ContactExtraData {
  availability: string;
  responseTime: string;
  location: string;
}

export interface SectionVisibility {
  about: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  experience: boolean;
  education: boolean;
  achievements: boolean;
  resume: boolean;
  contact: boolean;
}

export interface PortfolioData {
  hero: HeroData;
  about: AboutData;
  skills: SkillCategory[];
  projects: ProjectData[];
  certifications: CertificationData[];
  experience: ExperienceData[];
  education: EducationData[];
  achievements: AchievementItem[];
  resume: ResumeData;
  contactExtra: ContactExtraData;
  sectionVisibility?: SectionVisibility;
}

export const getSectionVisibility = (data: PortfolioData): SectionVisibility => {
  return data.sectionVisibility || {
    about: true,
    skills: true,
    projects: true,
    certifications: true,
    experience: true,
    education: true,
    achievements: true,
    resume: true,
    contact: true,
  };
};

export const defaultPortfolioData: PortfolioData = {
  sectionVisibility: {
    about: true,
    skills: true,
    projects: true,
    certifications: true,
    experience: true,
    education: true,
    achievements: true,
    resume: true,
    contact: true,
  },
  hero: {
    name: "Vishnu",
    lastName: "V",
    description: "Java / Full-Stack Developer — Specializing in building clean, scalable enterprise web applications with Spring Boot, React, and MySQL.",
    github: "https://github.com/Mr-Vishnu-145/",
    linkedin: "https://www.linkedin.com/in/vishnu145/",
    email: "Vishnuvenkat014@gmail.com",
    phone: "+91-9500861022",
    avatarUrl: "",
  },
  about: {
    bio: "Motivated and enthusiastic engineering student seeking to build a stellar career as a Java / Full-Stack Developer. I possess a strong foundation in Java, Spring Boot, React.js, and SQL, developed through rigorous academic studies and hands-on projects. Passionate about writing clean, modular, and maintainable code.",
    objective: "To obtain a challenging position as a Full-Stack Developer, where I can apply my expertise in Spring Boot and React to deliver high-quality, scalable web platforms, while learning and growing with senior engineering mentors.",
    journey: "My passion for coding sparked during my first year at Karpagam Institute of Technology, where I studied C and basic OOP principles. From there, I moved quickly to Java, falling in love with its structural safety and multi-threading capabilities. Realizing the power of enterprise applications, I taught myself Spring Boot, and subsequently React, to bridge the gap between back-end robustness and modern, reactive interfaces.",
    interests: ["Enterprise Architectures", "Web Security (OAuth/JWT)", "Database Tuning", "Clean Code practices", "React State Management"],
    goals: "My short-term goal is to secure an entry-level full-stack engineering role. Long term, I aim to become a solution architect designing distributed cloud-native microservices.",
    whatIEnjoyBuilding: "I enjoy building automated portals, full-cycle ERP solutions, and interactive tools that simplify day-to-day coordination. Translating complex business logic into clean databases and REST endpoints is my creative outlet.",
    highlights: [
      {
        iconType: "education",
        title: "Education",
        desc: "B.Tech – Information Technology\nKarpagam Institute of Technology\n2023 – 2027",
      },
      {
        iconType: "focus",
        title: "Focus Areas",
        desc: "Full-Stack Development\nJava & Spring Boot\nReact.js & SQL Databases",
      },
      {
        iconType: "lookingFor",
        title: "Looking For",
        desc: "Entry-Level Positions\nFull-Stack / Java Developer Roles\nCo-ops & Internships",
      },
    ],
    learningTimeline: [
      { date: "2023", title: "C & Logic Foundations", desc: "Learned variables, loops, arrays, pointers, and manual memory principles at college." },
      { date: "2024 (Early)", title: "Java OOP Core", desc: "Mastered polymorphism, inheritance, collections, interface designs, and multithreading in Java." },
      { date: "2024 (Mid)", title: "SQL & RDBMS", desc: "Practiced complex joins, constraints, indexing, transactions, and ER designs with MySQL." },
      { date: "2025 (Early)", title: "Vite + React & Tailwind", desc: "Dove into state, effects, reusable layouts, components, hooks, and responsive design systems." },
      { date: "2025 (Mid)", title: "Spring Boot RESTful APIs", desc: "Engineered MVC, Spring Security, dependency injection, JPA/Hibernate repositories, and REST endpoints." },
      { date: "2026", title: "Full-Stack Integrations", desc: "Constructing ERP applications, deploying microservices, and setting up automated CI/CD pipelines." },
    ]
  },
  skills: [
    {
      title: "Programming Languages",
      skills: ["Java", "Python", "C", "JavaScript", "SQL"],
      skillItems: [
        { name: "Java", level: "Expert", percentage: 90, description: "Object-oriented concepts, multithreading, collections, streams, generic programming.", usedInProjects: ["ERP Management System", "Hospital Management System", "Employee Management System"] },
        { name: "JavaScript", level: "Advanced", percentage: 80, description: "ES6 syntax, DOM manipulation, promises, async/await, fetch APIs.", usedInProjects: ["ERP Management System", "Hospital Management System", "Guess Game"] },
        { name: "SQL", level: "Advanced", percentage: 85, description: "Schema design, writing complex joins, query optimization, triggers, indices, views.", usedInProjects: ["ERP Management System", "Hospital Management System"] },
        { name: "Python", level: "Intermediate", percentage: 70, description: "File handling, scripting, scripting tools, basic data analysis.", usedInProjects: [] },
        { name: "C", level: "Advanced", percentage: 80, description: "Pointers, dynamic allocations, algorithm design, standard libraries.", usedInProjects: ["Problem Solving in C"] }
      ]
    },
    {
      title: "Frontend",
      skills: ["React.js", "HTML", "CSS", "Tailwind CSS"],
      skillItems: [
        { name: "React.js", level: "Advanced", percentage: 85, description: "Hooks (useState, useEffect, useContext), routing, conditional rendering, state management.", usedInProjects: ["ERP Management System", "Hospital Management System"] },
        { name: "HTML5 & CSS3", level: "Expert", percentage: 90, description: "Semantic markup, CSS grids, flexbox layout, responsive typography, media queries.", usedInProjects: ["ERP Management System", "Hospital Management System", "Guess Game"] },
        { name: "Tailwind CSS", level: "Advanced", percentage: 85, description: "Utility-first design, layout custom utilities, dark/light themes, custom animations.", usedInProjects: ["ERP Management System", "Hospital Management System"] }
      ]
    },
    {
      title: "Backend & DBs",
      skills: ["Spring Boot", "REST APIs", "MVC Architecture", "MySQL"],
      skillItems: [
        { name: "Spring Boot", level: "Advanced", percentage: 85, description: "Spring Data JPA, Spring Security, REST controller, dependency injection, service mapping.", usedInProjects: ["ERP Management System", "Hospital Management System"] },
        { name: "REST APIs", level: "Advanced", percentage: 85, description: "Endpoint design, HTTP methods, JSON responses, error handling middleware.", usedInProjects: ["ERP Management System", "Hospital Management System"] },
        { name: "MySQL", level: "Advanced", percentage: 85, description: "Relational database model, foreign keys, transaction logs, relational schemas.", usedInProjects: ["ERP Management System", "Hospital Management System"] }
      ]
    },
    {
      title: "Tools & DevOps",
      skills: ["Git", "GitHub", "VS Code", "MySQL Workbench", "Postman"],
      skillItems: [
        { name: "Git & GitHub", level: "Advanced", percentage: 85, description: "Branching workflows, staging commits, resolving merge conflicts, remote repo management.", usedInProjects: ["All major projects"] },
        { name: "Postman", level: "Advanced", percentage: 80, description: "API request collection testing, environment variables, authentication header simulation.", usedInProjects: ["ERP Management System", "Hospital Management System"] },
        { name: "VS Code & IntelliJ", level: "Expert", percentage: 90, description: "Integrated dev setups, extension configs, quick shortcuts, terminal configs.", usedInProjects: ["All major projects"] }
      ]
    }
  ],
  projects: [
    {
      id: "erp-management-system",
      title: "ERP Management System",
      subtitle: "Enterprise Resource Planning",
      tech: ["React.js", "Spring Boot", "MySQL", "Tailwind CSS"],
      desc: "A full-stack enterprise application automating organizational operations across HR, Finance, Inventory, and Admin roles.",
      features: [
        "Interactive Dashboard with real-time financial summaries",
        "Role-Based Access Control (Admin, Employee, Manager)",
        "Employee directory management with complete CRUD capabilities",
        "Live Inventory audit trails and restock requests"
      ],
      link: "https://github.com/Mr-Vishnu-145/Portfolio",
      status: "Completed",
      duration: "4 Months",
      role: "Lead Full-Stack Developer",
      featured: true,
      problemStatement: "Many growing organizations rely on split spreadsheets for HR records, stock, and finances. This fragments data, causes human synchronization errors, and prevents accurate operational forecasts.",
      businessGoal: "Centralize business domains into a singular, unified platform. Enable managers to track cross-department tasks, track inventory status in real-time, and run dynamic billing analyses.",
      architectureDiagram: `
+------------------+     +------------------------+     +-------------------+
|                  |     |                        |     |                   |
|   React Frontend |<===>|  Spring Boot REST API  |<===>|   MySQL Database  |
|  (Client Browser)|     |   (Security/Security)  |     |   (RDBMS Schema)  |
+------------------+     +------------------------+     +-------------------+
      `,
      folderStructure: `
erp-management/
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI widgets
│   │   ├── pages/       # Dashboard and Forms
│   │   └── hooks/       # API call controllers
├── backend/
│   ├── src/main/java/
│   │   ├── controller/  # REST Endpoints
│   │   ├── service/     # Business calculations
│   │   ├── model/       # JPA Entities
│   │   └── repository/  # Database Operations
      `,
      authenticationFlow: "JWT (JSON Web Token) flow. User signs in with username/password, backend generates a secure token, client stores it in local storage/cookies and sends it on subsequent authorization headers.",
      securityFeatures: [
        "Spring Security JWT token authentication",
        "Hashed password storage using BCrypt encoder",
        "Method-level authority checks using @PreAuthorize annotators",
        "SQL injection mitigation via JPA parameter bindings"
      ],
      performanceOptimizations: [
        "Implemented database table indexing on critical fields like employee emails and stock serials",
        "React lazy loading for domain sections to reduce entry JS asset footprint",
        "Connection pool tuning using HikariCP for high query concurrency"
      ],
      challengesFaced: [
        "Managing consistent concurrent inventory counts when multiple managers tried to approve stock items at once.",
        "Constructing high-performance cross-table joins on SQL when querying full annual finance ledgers."
      ],
      solutionsImplemented: [
        "Applied database transaction locks (Pessimistic locking) during the inventory decrease operations.",
        "Refactored complex loops in service files to utilize MySQL VIEWs with pre-indexed aggregates."
      ],
      lessonsLearned: [
        "Pre-designing endpoint schemas prevents frontend-backend mismatch issues later.",
        "JPA queries need monitoring to avoid the typical N+1 query problem."
      ],
      timeline: "Jan 2025 - May 2025",
      teamSize: "Individual Academic Project",
      keyAchievements: [
        "99.8% database uptime under mock loads of 500 concurrent connections.",
        "Reduces simulated restock approval cycles from 4 hours to instantaneous button presses."
      ],
      testingStrategy: "Unit tested REST API layers with JUnit and Mockito; manual end-to-end user validations in browser developer tools.",
      seoOptimization: "Structured HTML headers and semantic tags; configured Vite meta values.",
      futureEnhancements: [
        "Integrate Spring Mail sender to trigger PDF invoice alerts automatically",
        "Add chart visualizations with Recharts for financial analysis dashboards"
      ]
    },
    {
      id: "hospital-management-system",
      title: "Hospital Management System",
      subtitle: "Healthcare Administration",
      tech: ["React.js", "Spring Boot", "MySQL", "REST APIs"],
      desc: "Developed a secure full-stack medical records and scheduling portal managing patient visits, clinical data, and doctor schedules.",
      features: [
        "Patient registration and medical history repository",
        "Doctor appointment booking and schedule conflicts blocker",
        "Dynamic prescription writer dashboard",
        "Billing module with automated invoice generators"
      ],
      link: "https://github.com/Mr-Vishnu-145/Portfolio",
      status: "Completed",
      duration: "3 Months",
      role: "Full-Stack Engineer",
      featured: true,
      problemStatement: "Inefficient scheduling systems lead to long patient wait times, double-booked doctors, and delayed access to crucial patient medical logs.",
      businessGoal: "Create an integrated portal connecting Patients, Doctors, and Receptionists to streamline scheduling and medical charting while strictly securing patient data.",
      architectureDiagram: `
+-------------------+     +-------------------------+     +-------------------+
|  Patient Portal   |     |    Spring Boot App      |     |                   |
|  Doctor Dashboard |<===>|  - Controller Mapping   |<===>|   MySQL Database  |
|  (React App UI)   |     |  - Medical Record Logic |     |  (Patient Schema) |
+-------------------+     +-------------------------+     +-------------------+
      `,
      folderStructure: `
hospital-system/
├── web-ui/
│   ├── src/components/
│   └── src/pages/Appointments.tsx
├── core-api/
│   ├── src/main/java/com/hospital/
│   │   ├── config/SecurityConfig.java
│   │   ├── controllers/AppointmentController.java
│   │   ├── entity/Patient.java
│   │   └── service/BillingService.java
      `,
      authenticationFlow: "Session validation using HTTPS cookies and tokens, ensuring secure credentials management for sensitive records.",
      securityFeatures: [
        "Encrypted record storage for patient diagnostic histories",
        "Role checks (e.g. only doctors can write prescriptions)",
        "CORS configurations allowing only verified domains"
      ],
      performanceOptimizations: [
        "Lazy loaded dashboard tables to handle large patient lists",
        "Query caches on doctor profiles to reduce database load"
      ],
      challengesFaced: [
        "Handling complex calendar logic to prevent doctor double-booking during overlaps.",
        "Translating multi-table patient bills into accurate PDFs."
      ],
      solutionsImplemented: [
        "Designed custom SQL checks utilizing BETWEEN and TIME boundaries during insert operations.",
        "Used a modular layout in React to group items dynamically before calculations."
      ],
      lessonsLearned: [
        "Data normalization prevents inconsistencies, especially with medical histories.",
        "Error boundaries in React prevent full app crashes on missing properties."
      ],
      timeline: "Sep 2024 - Dec 2024",
      teamSize: "Solo academic project",
      keyAchievements: [
        "Zero scheduling overlaps during manual testing of 100 concurrent bookings.",
        "Responsive interface allows doctors to update patient prescriptions from mobile devices."
      ],
      testingStrategy: "API verification using Postman collection scripts; UI compatibility checks across Chrome, Firefox, and Safari.",
      seoOptimization: "Not indexable (closed system layout); index.html standard meta headers applied.",
      futureEnhancements: [
        "Add video consult integration utilizing WebRTC APIs",
        "Integrate SMS notification reminders for upcoming appointments"
      ]
    },
    {
      id: "employee-management-system",
      title: "Employee Management System",
      subtitle: "Java Console Tool",
      tech: ["Java", "OOPs", "File Handling"],
      desc: "A CLI-based data manager demonstrating robust application of core Java, collections, streams, and file-based persistence.",
      features: [
        "Add, search, modify, and delete employee details via shell UI",
        "Permanent data persistence utilizing object serialization/file storage",
        "Salary structure aggregations utilizing Java Streams API",
        "Robust input checkers to prevent terminal runtime exceptions"
      ],
      link: "https://github.com/Mr-Vishnu-145/Portfolio",
      status: "Completed",
      duration: "1 Month",
      role: "Solo Developer",
      featured: false,
      problemStatement: "Learning OOP principles requires writing structured systems without relying heavily on abstract frameworks. Text-based systems clarify internal references, polymorphism, and serialization structures.",
      businessGoal: "Build a reliable CLI tool that manages records without a database, saving values in structured plain-text/JSON formats.",
      architectureDiagram: `
+------------------+     +--------------------------+     +-------------------+
|   Terminal CLI   |     |   Java Core Application  |     |   Local Data File |
|   (System.in)    |<===>|   - Employee Collection  |<===>|   (serialized.bin |
|   (System.out)   |     |   - Serialization Manager|     |    or csv/txt)    |
+------------------+     +--------------------------+     +-------------------+
      `,
      folderStructure: `
employee-cli/
├── src/
│   ├── Main.java
│   ├── model/
│   │   ├── Employee.java
│   │   ├── Developer.java
│   │   └── Manager.java
│   ├── service/
│   │   └── EmployeeService.java
│   └── util/
│       └── FileHandler.java
      `,
      authenticationFlow: "Simple admin PIN check on terminal start.",
      securityFeatures: [
        "Data encapsulation (private variables, public getters/setters)",
        "Input validations against type mismatch or negative range values"
      ],
      performanceOptimizations: [
        "Used Buffered Reader and Writer for fast I/O processing",
        "Loaded employee references into a HashMap in-memory for instant search lookup times"
      ],
      challengesFaced: [
        "Handling Object Serialization version mismatch when fields were renamed.",
        "Formatting tabular outputs nicely in standard terminal screens."
      ],
      solutionsImplemented: [
        "Declared a static serialVersionUID in serializable classes.",
        "Utilized System.out.printf with fixed width flags to align table output margins."
      ],
      lessonsLearned: [
        "Stream API decreases boilerplate code significantly when filtering records.",
        "Exceptions should be caught locally to avoid terminal app crashes."
      ],
      timeline: "May 2024",
      teamSize: "Individual learning project",
      keyAchievements: [
        "Developed custom sorting models to display records by departments or salaries.",
        "Demonstrated a fully functional application built entirely with Vanilla Java SE."
      ],
      testingStrategy: "Manual terminal checks inputting outlier values (empty lines, invalid formats, high numbers).",
      seoOptimization: "None (local terminal app).",
      futureEnhancements: [
        "Connect to a local SQLite database using JDBC drivers",
        "Build a simple swing UI panel wrapper"
      ]
    },
    {
      id: "guess-game",
      title: "Guess Game",
      subtitle: "Web Minigame",
      tech: ["HTML", "CSS", "JavaScript"],
      desc: "Interactive browser-based game with responsive UI, dynamic scoreboards, and custom game status animations.",
      features: [
        "Dynamic hot-and-cold tips indicator based on score offsets",
        "High score preservation utilizing LocalStorage API",
        "Smooth CSS layouts adapting to mobile viewport scales",
        "Dynamic reset triggers without reloading browser context"
      ],
      link: "https://github.com/Mr-Vishnu-145/Portfolio",
      status: "Completed",
      duration: "2 Weeks",
      role: "Front-End Developer",
      featured: false,
      problemStatement: "Learning Javascript DOM manipulation requires constructing lightweight interactive platforms that listen and update elements instantaneously.",
      businessGoal: "Build an addictive, quick browser game with crisp visuals and game logic states that run entirely in the browser client.",
      architectureDiagram: `
+--------------------------+     +--------------------------+
|      HTML/CSS Page       |<===>|   Javascript Controller  |
|  (User Input & Rendering)|     |  (DOM Event Listeners)   |
+--------------------------+     +--------------------------+
      `,
      folderStructure: `
guess-game/
├── index.html
├── style.css
└── script.js
      `,
      authenticationFlow: "None (Public static page).",
      securityFeatures: [
        "Sanitized inputs to prevent cross-site scripting (XSS) injections in scoreboard elements"
      ],
      performanceOptimizations: [
        "Single file structure minimizes network requests during asset load",
        "Efficient animations utilizing CSS transition transforms"
      ],
      challengesFaced: [
        "Ensuring layout proportions looked identical on mobile screens and wide monitors."
      ],
      solutionsImplemented: [
        "Utilized flexbox centering and viewport height (vh) scale properties."
      ],
      lessonsLearned: [
        "Simple CSS variables allow theme coloring to be updated instantly.",
        "Vanilla JS event listeners work beautifully for basic UI interactions."
      ],
      timeline: "Mar 2024",
      teamSize: "Self-study practice project",
      keyAchievements: [
        "Achieved responsive frame rendering under 2ms.",
        "Created an intuitive and engaging user interface with minimalist assets."
      ],
      testingStrategy: "Checked mobile responsive configurations inside Chrome DevTools inspector.",
      seoOptimization: "Vibrant meta descriptions added to standard metadata tags.",
      futureEnhancements: [
        "Add online global highscore leaderboards utilizing Firebase",
        "Incorporate retro sound effects using Web Audio API"
      ]
    }
  ],
  certifications: [
    {
      id: "aws-academy-graduate",
      name: "AWS Academy Graduate – Cloud Foundations",
      org: "AWS Academy",
      issueDate: "2025-03",
      credentialId: "AWS-ACAD-GRAD-129482",
      skillsLearned: ["Cloud Services", "IAM Security", "Amazon EC2", "AWS S3", "Relational Database Service (RDS)", "Cloud Cost Tuning"],
      verifyUrl: "https://www.credly.com",
      downloadUrl: "#",
      category: "Cloud"
    },
    {
      id: "java-programming",
      name: "Java Programming",
      org: "Great Learning",
      issueDate: "2024-06",
      credentialId: "GL-JVPRG-83274",
      skillsLearned: ["OOP Concepts", "Collections Framework", "Java Syntax", "Method Overloading", "Inheritance Models"],
      verifyUrl: "https://www.greatlearning.in",
      downloadUrl: "#",
      category: "Programming"
    },
    {
      id: "website-node-express",
      name: "Building a Website with Node.js and Express.js",
      org: "LinkedIn Learning",
      issueDate: "2024-11",
      credentialId: "LI-NODEEXP-940294",
      skillsLearned: ["Express Middleware", "Node.js core runtime", "EJS templates", "Routing setup", "JSON processing"],
      verifyUrl: "https://www.linkedin.com/learning",
      downloadUrl: "#",
      category: "Programming"
    },
    {
      id: "learning-mongodb",
      name: "Learning MongoDB",
      org: "LinkedIn Learning",
      issueDate: "2024-12",
      credentialId: "LI-MONGO-837492",
      skillsLearned: ["NoSQL design", "BSON documents", "Aggregations", "MongoDB Atlas setup", "Mongoose schema mapping"],
      verifyUrl: "https://www.linkedin.com/learning",
      downloadUrl: "#",
      category: "Database"
    },
    {
      id: "sql-relational-databases",
      name: "SQL and Relational Databases 101",
      org: "IBM (Cognitive Class)",
      issueDate: "2024-05",
      credentialId: "IBM-SQL-101-8392",
      skillsLearned: ["RDBMS structure", "CREATE TABLE statements", "INSERT & UPDATE", "Keys and Constraints", "Aggregate functions"],
      verifyUrl: "https://cognitiveclass.ai",
      downloadUrl: "#",
      category: "Database"
    },
    {
      id: "problem-solving-c",
      name: "Problem Solving Through Programming in C",
      org: "NPTEL (IIT Kharagpur)",
      issueDate: "2024-04",
      credentialId: "NPTEL-IITK-CPROG-8394",
      skillsLearned: ["Algorithmic design", "Memory layout", "Array processing", "Recursion", "File buffers"],
      verifyUrl: "https://nptel.ac.in",
      downloadUrl: "#",
      category: "Programming"
    },
    {
      id: "software-testing-nptel",
      name: "Software Testing",
      org: "NPTEL (IIIT Bangalore / IIT Madras)",
      issueDate: "2024-10",
      credentialId: "NPTEL-SWTEST-9384",
      skillsLearned: ["Black Box Testing", "White Box Testing", "Control Flow Graphs", "Integration tests", "Mutation testing"],
      verifyUrl: "https://nptel.ac.in",
      downloadUrl: "#",
      category: "Testing"
    },
    {
      id: "time-management-infosys",
      name: "Time Management",
      org: "Infosys Springboard",
      issueDate: "2024-02",
      credentialId: "INFY-TM-29384",
      skillsLearned: ["Goal Prioritization", "Eisenhower Matrix", "Sprint planning", "Avoiding procrastination"],
      verifyUrl: "https://infyspringboard.infosys.com",
      downloadUrl: "#",
      category: "General"
    }
  ],
  experience: [
    {
      id: "experience-1",
      companyName: "Karpagam Institute of Technology",
      role: "Lead Full-Stack Developer (ERP Development Group)",
      duration: "Jan 2025 - Present",
      location: "Coimbatore, Tamil Nadu",
      responsibilities: [
        "Architecting and developing an internal ERP module to track student achievements and placement credentials.",
        "Developing scalable backend controllers in Spring Boot and integrating them with MySQL relational databases.",
        "Designing responsive layouts and component widgets in React and Tailwind CSS, increasing user satisfaction by 30%.",
        "Collaborating with department coordinators to map out data constraints and optimize dashboard page rendering times."
      ],
      technologiesUsed: ["Java", "Spring Boot", "React.js", "MySQL", "Tailwind CSS", "Git"],
      achievements: [
        "Successfully mapped and managed records of 400+ students within the IT department.",
        "Improved dashboard query responses from 1.5 seconds to under 150ms through index optimization."
      ],
      projectsWorkedOn: ["ERP Management System", "Department Achievement Tracker"],
      skillsGained: ["System Architecture", "SQL Query Tuning", "Team Leadership", "RESTful API design"]
    },
    {
      id: "experience-2",
      companyName: "College Academic Lab Projects",
      role: "Software Project Team Lead",
      duration: "Aug 2024 - Dec 2024",
      location: "Coimbatore, Tamil Nadu",
      responsibilities: [
        "Led a team of 3 classmates in building a Hospital Scheduling application for academic credits.",
        "Configured development guidelines, set up the Git branch workflows, and reviewed pull requests.",
        "Developed the appointment scheduling logic and designed medical record database schemas.",
        "Created client-side forms and handled async API data fetches with error notifications."
      ],
      technologiesUsed: ["React.js", "Spring Boot", "MySQL", "Postman", "GitHub"],
      achievements: [
        "Finished project ahead of schedule, receiving an A+ grade from laboratory assessors.",
        "Wrote clean documentation outlining instructions on setting up databases and launching servers."
      ],
      projectsWorkedOn: ["Hospital Management System"],
      skillsGained: ["Git Workflows", "Project Scoping", "API Documentation", "Peer Code Reviews"]
    }
  ],
  education: [
    {
      id: "edu-1",
      college: "Karpagam Institute of Technology",
      degree: "Bachelor of Technology",
      department: "Information Technology",
      duration: "2023 - 2027",
      cgpa: "8.2 / 10.0 (Current CGPA)",
      relevantCoursework: [
        "Data Structures and Algorithms",
        "Database Management Systems",
        "Object-Oriented Programming (Java)",
        "Software Engineering Principles",
        "Operating Systems",
        "Computer Networks"
      ],
      projects: ["ERP Management System", "Hospital Management System", "Employee Management System"],
      achievements: [
        "Ranked top 10% of the class in Java programming assessments.",
        "Active member of the College Coding Club, helping juniors with syntax fundamentals."
      ],
      activities: ["Coding Club Coordinator", "Tech Symposium Volunteer", "Web Design Organizer"],
      certificates: ["AWS Academy Graduate", "Java Programming (Great Learning)", "Software Testing (NPTEL)"]
    }
  ],
  achievements: [
    {
      id: "ach-1",
      category: "Hackathon",
      title: "Finalist - Smart India Hackathon (Internal)",
      organization: "Karpagam Institute of Technology",
      date: "2024-09",
      description: "Designed a secure web portal utilizing Spring Boot to resolve rural medical consultation bottlenecks. Built appointment calendars and doctor directories inside a 24-hour coding window.",
      badge: "Award"
    },
    {
      id: "ach-2",
      category: "Contest",
      title: "Top Performer - Java Coding Contest",
      organization: "Karpagam Institute of Technology IT Department",
      date: "2024-10",
      description: "Secured 3rd rank out of 120 students in a timed contest focusing on data structure implementations, sorting algorithms, and stream aggregations in Java.",
      badge: "Contest"
    },
    {
      id: "ach-3",
      category: "Contribution",
      title: "Open Source Contributor",
      organization: "GitHub Projects",
      date: "2024 - Present",
      description: "Actively contributing minor bug fixes and documentation enhancements to starter Spring Boot packages and React components on GitHub.",
      badge: "Contribution"
    },
    {
      id: "ach-4",
      category: "Leadership",
      title: "Technical Event Coordinator",
      organization: "KIT TechFest '24",
      date: "2024-03",
      description: "Managed rules and execution for the 'Code debugging' symposium event, leading a team of 5 volunteers and accommodating 80+ student participants.",
      badge: "Leadership"
    }
  ],
  resume: {
    resumeUrl: "/Portfolio/resume.pdf",
    atsContent: `
VISHNU V
Coimbatore, Tamil Nadu, India | +91-9500861022 | Vishnuvenkat014@gmail.com | linkedin.com/in/vishnu145/ | github.com/Mr-Vishnu-145/

PROFESSIONAL SUMMARY
Highly motivated B.Tech Information Technology student (graduating 2027) with deep experience building full-stack applications with Java, Spring Boot, React, and MySQL. Adept at turning product specifications into functional relational databases and responsive interfaces. Strong collaborative skills, experienced in project leadership and clean code standards.

EDUCATION
Karpagam Institute of Technology - Coimbatore, India
Bachelor of Technology in Information Technology | Graduation: 2027
Current CGPA: 8.2/10.0

KEY SKILLS
- Languages: Java, SQL, JavaScript, C, Python
- Frameworks & Libs: Spring Boot, React.js, Tailwind CSS, JPA/Hibernate, Spring Security
- Databases: MySQL, NoSQL (MongoDB basics)
- Developer Tools: Git, GitHub, VS Code, IntelliJ IDEA, MySQL Workbench, Postman

ACADEMIC & PERSONAL PROJECTS
ERP Management System (React.js, Spring Boot, MySQL)
- Built a secure, multi-department enterprise dashboard managing inventory audit trails, billing charts, and user rosters.
- Implemented Spring Security JWT credentials verification, custom role-based mapping, and transaction boundaries.

Hospital Management System (React.js, Spring Boot, MySQL)
- Developed a clinic scheduling calendar program that avoids doctor appointment times overlaps.
- Engineered patients billing trackers and responsive forms to edit prescription files, increasing operations flow.

Employee Management System (Java SE)
- Designed a CLI program implementing employee lists serialization, CRUD controllers, and Java Stream calculations.

CERTIFICATIONS
- AWS Academy Graduate - Cloud Foundations
- Great Learning Java Programming
- NPTEL Software Testing (IIIT-B)
- IBM SQL and Relational Databases 101
    `
  },
  contactExtra: {
    availability: "Open to full-time roles & internships (Immediate joining available)",
    responseTime: "Typically replies within 24 hours",
    location: "Coimbatore, Tamil Nadu, India (Willing to relocate)"
  }
};

const STORAGE_KEY = "portfolio_data";
const dbToken = import.meta.env.VITE_TURSO_AUTH_TOKEN || "";
const isTursoActive = !!dbToken;

let memoryPortfolioData: PortfolioData = defaultPortfolioData;

export const getPortfolioData = (): PortfolioData => {
  return memoryPortfolioData;
};

export const savePortfolioData = (data: PortfolioData): void => {
  memoryPortfolioData = {
    ...defaultPortfolioData,
    ...data,
    about: {
      ...defaultPortfolioData.about,
      ...(data.about || {})
    },
    hero: {
      ...defaultPortfolioData.hero,
      ...(data.hero || {})
    },
    skills: data.skills || defaultPortfolioData.skills,
    projects: data.projects || defaultPortfolioData.projects,
    certifications: data.certifications || defaultPortfolioData.certifications,
    experience: data.experience || defaultPortfolioData.experience,
    education: data.education || defaultPortfolioData.education,
    achievements: data.achievements || defaultPortfolioData.achievements,
    resume: data.resume || defaultPortfolioData.resume,
    contactExtra: data.contactExtra || defaultPortfolioData.contactExtra,
    sectionVisibility: data.sectionVisibility || defaultPortfolioData.sectionVisibility
  };

  // Trigger custom event to notify listeners of changes
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("portfolioDataUpdate"));
  }
};
