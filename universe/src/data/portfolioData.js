// Single source of truth. Only verified information supplied by Sriram T.
export const assets = {
  profile: '/assets/profile.png',
  resume: '/assets/resume.pdf',
  sports: { national: '/assets/sports-national.jpg', international: '/assets/sports-international.jpg', running: '/assets/sports-running.jpg' }
}

export const profile = {
  name: 'SRIRAM T.',
  location: 'Dharmapuri, Tamil Nadu, India',
  phone: '+91 8015957990',
  phoneHref: 'tel:+918015957990',
  email: 'sriramu26318@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sriramtamilmani2004',
  github: 'https://github.com/sriram0811',
  identity: 'Full Stack Developer | Python Developer | AI Enthusiast',
  tagline: 'Building intelligent applications through code, creativity and AI.',
  titles: ['Python Developer', 'Full Stack Developer', 'Software Developer', 'AI Enthusiast'],
  intro: 'Aspiring Software Developer with hands-on experience in Python, Django, Oracle SQL, and Full Stack Web Development, along with a strong interest in Artificial Intelligence and Generative AI. Familiar with LLMs, SLMs, RAG, and Vector Databases. Skilled in problem-solving, database management, and developing dynamic, scalable web applications using modern technologies.',
  about: [
    'I am an aspiring Software Developer passionate about building modern web applications and intelligent software solutions.',
    'My primary interests include Python Full Stack Development, Artificial Intelligence, Generative AI, and modern web technologies.',
    'I enjoy transforming ideas into practical applications through programming, problem-solving, and continuous learning.'
  ]
}

export const navLinks = [
  { id: 'home', label: 'HOME' }, { id: 'about', label: 'ABOUT' }, { id: 'skills', label: 'SKILLS' },
  { id: 'projects', label: 'PROJECTS' }, { id: 'journey', label: 'JOURNEY' }, { id: 'education', label: 'EDUCATION' },
  { id: 'sports', label: 'SPORTS' }, { id: 'contact', label: 'CONTACT' }
]

export const stats = [
  { value: 8, label: 'Projects' },
  { value: 5, label: 'Internship / Training Experiences' },
  { value: 3, label: 'NPTEL Certifications' },
  { value: 2, label: 'International / National Sports Achievements' }
]

export const techGroups = [
  { group: 'Programming Languages', items: ['Python', 'JavaScript'] },
  { group: 'Web Technologies', items: ['Django', 'React.js', 'Node.js', 'Bootstrap', 'HTML5', 'CSS3'] },
  { group: 'Databases', items: ['Oracle SQL', 'SQLite', 'MySQL', 'MongoDB', 'Vector Databases'] },
  { group: 'AI & Machine Learning', items: ['LLM', 'SLM', 'RAG', 'Artificial Intelligence', 'Machine Learning'] },
  { group: 'APIs', items: ['FastAPI', 'REST API'] },
  { group: 'Developer Tools', items: ['Visual Studio Code', 'Git', 'GitHub'] }
]

export const projects = [
  { name: 'Flavor-Mind', desc: 'AI-Based Intelligent Food and Calorie Insight.', tech: ['Python', 'Machine Learning', 'React.js', 'Node.js', 'TensorFlow', 'Nutrition API'] },
  { name: 'SmartHire AI', desc: 'AI-Powered Recruitment & Interview Management System.', tech: ['Firebase', 'Gemini AI', 'Firestore'] },
  { name: 'OkayBruh', desc: 'Fashion E-Commerce Web Application.', tech: ['Python', 'Django', 'HTML', 'CSS', 'JavaScript', 'SQLite'] },
  { name: 'Django TodoList', desc: 'Task Management Application.', tech: ['Python', 'Django', 'SQLite'] },
  { name: 'Nike E-Commerce Clone', desc: '', tech: ['HTML5', 'CSS3'] },
  { name: 'Auto Quiz Generator', desc: '', tech: [] },
  { name: 'Distance Finder Using Arduino UNO', desc: '', tech: ['Arduino UNO', 'HC-SR04 Ultrasonic Sensor', 'C++'] },
  { name: 'Attendance Voting System', desc: '', tech: [] }
]

export const experience = [
  { org: 'QSPIDERS — QSPIDERS CAMPUS CONNECT', role: 'Python Full Stack Development / Incubation Student', period: 'May 2026 – October 2026', location: 'Velachery, Chennai, Tamil Nadu',
    points: ['Intensive training in Python Full Stack Development.', 'Python and Django fundamentals.', 'Oracle SQL and DQL queries.', 'HTML, CSS and JavaScript.', 'Practical programming and problem-solving.'] },
  { org: 'EDU TANTR', role: 'Web Development Intern', period: 'August 2025 – October 2025', location: 'Bengaluru, Karnataka',
    points: ['Worked on a full-stack web application.', 'React.js, JavaScript, CSS and HTML.', 'Developed an Attendance Voting System.', 'Collaborated in a startup environment.'] },
  { org: 'BLUESTOCK', role: 'Software Engineer Intern', period: 'July 2025 – August 2025', location: '',
    points: ['Software development exposure.', 'Attendance Voting System development.', 'Student attendance tracking.', 'Team collaboration.'] },
  { org: 'EMGLITZ TECHNOLOGIES', role: 'Python with Machine Learning Intern', period: 'December 2024 – January 2025', location: 'Salem, Tamil Nadu',
    points: ['Python programming.', 'Object-Oriented Programming.', 'Database integration.', 'Machine Learning fundamentals.', 'Data processing and model development.'] },
  { org: 'CODEBIND TECHNOLOGIES', role: 'Frontend Developer Intern', period: 'July 2023', location: 'T Nagar, Chennai',
    points: ['Frontend development.', 'BMI Calculator interface.', 'Node.js database connectivity.', 'MongoDB integration.'] }
]

export const education = [
  { level: 'B.E. Computer Science and Engineering', school: 'Muthayammal Engineering College, Namakkal', period: '2022–2026', score: 'CGPA: 7.82' },
  { level: 'HSC', school: 'Sree Vetri Vikas Matric Higher Secondary School, Dharmapuri', period: '2020–2022', score: 'Percentage: 86.5%' },
  { level: 'SSLC', school: 'Sree Vetri Vikas Matric Higher Secondary School, Dharmapuri', period: '2019–2020', score: 'Percentage: 97.8%' }
]

export const certifications = [
  { title: 'Foundations of Cloud, IoT, Edge & ML', issuer: 'NPTEL', score: '78%' },
  { title: 'Introduction to Machine Learning', issuer: 'NPTEL', score: '70%' },
  { title: 'Distributed Systems', issuer: 'NPTEL', score: '69%' }
]

export const sports = {
  title: 'BEYOND CODE, BEYOND LIMITS.',
  championships: [
    { name: 'NATIONAL HANDBALL CHAMPIONSHIP 2025', result: '1st Position — Gold Medal', location: 'Sonipat, Haryana, India', image: assets.sports.national },
    { name: 'INTERNATIONAL HANDBALL CHAMPIONSHIP 2025', result: 'Represented Team India at the Indo-Nepal International Handball Championship. International Gold Medal and Diploma.', location: 'Pokhara, Nepal', image: assets.sports.international }
  ],
  running: [
    { label: '5 KM', value: '23 Minutes' },
    { label: '3 KM', value: '11 Minutes 57 Seconds' },
    { label: '5 KM Competition', value: '10th Position among 350+ participants' }
  ],
  runningImage: assets.sports.running
}

export const achievements = [
  'Presented a paper on Full Stack Development at the National Level Symposium, Paavai Institution, Tamil Nadu.',
  'Published and presented a paper at the 2nd International Conference on Innovative Research in Engineering and Technology (ICIRET-2026), A.V.C. College of Engineering.'
]
