// Content for the left and right monitors.
// - Names, roles, kinds and descriptions follow Sriram's brief.
// - Periods and technologies are copied from universe/src/data/portfolioData.js and unit-tested against it (tests/data.test.mjs).
// - Anything not in either source stays empty. No repository/demo URL, status or statistic is invented.
export const career = [
  { org: 'QSpiders', place: 'Velachery, Chennai', role: 'Python Full Stack Development Incubation', kind: 'training', period: 'May 2026 – October 2026', tech: ['Python', 'Django', 'Oracle SQL', 'HTML', 'CSS', 'JavaScript'] },
  { org: 'Edu Tantr', place: 'Bengaluru', role: 'Web Development', kind: 'training', period: 'August 2025 – October 2025', tech: ['React.js', 'JavaScript', 'CSS', 'HTML'] },
  { org: 'Bluestock Fintech', place: 'Remote', role: 'Software Development Engineer Intern', kind: 'internship', period: 'July 2025 – August 2025', tech: [], focus: 'Attendance Voting System' },
  { org: 'Emglitz', place: 'Salem', role: 'Python with Machine Learning', kind: 'training', period: 'December 2024 – January 2025', tech: ['Python', 'OOP', 'Machine Learning'] },
  { org: 'CodeBind', place: 'T Nagar, Chennai', role: 'Frontend Development', kind: 'training', period: 'July 2023', tech: ['Node.js', 'MongoDB'] }
]

export const projects = [
  { name: 'FlavorMind AI', dataName: 'Flavor-Mind', desc: 'Intelligent Food and Calorie Insight', cat: 'AI', tech: ['Python', 'Machine Learning', 'React.js', 'Node.js', 'TensorFlow', 'Nutrition API'], repo: null, demo: null },
  { name: 'SmartHire AI', dataName: 'SmartHire AI', desc: 'AI-Based Screening and Recruitment Platform', cat: 'AI', tech: ['Firebase', 'Gemini AI', 'Firestore'], repo: null, demo: null },
  { name: 'EduVerse AI', desc: 'AI-Powered Education Platform', cat: 'AI', tech: [], repo: null, demo: null },
  { name: 'Auto Quiz Generator', dataName: 'Auto Quiz Generator', desc: 'Automated Quiz Generation', cat: 'Automation', tech: [], repo: null, demo: null },
  { name: 'BankBuddy AI', desc: 'AI Voice Assistant', cat: 'AI', tech: [], repo: null, demo: null },
  { name: 'OkayBruh', dataName: 'OkayBruh', desc: 'E-commerce Web Application', cat: 'E-commerce', tech: ['Python', 'Django', 'HTML', 'CSS', 'JavaScript', 'SQLite'], repo: null, demo: null }
]
export const githubProfile = 'github.com/sriram0811' // profile.github in portfolioData.js
export const categoryCounts = () => Object.entries(projects.reduce((a, p) => ((a[p.cat] = (a[p.cat] || 0) + 1), a), {}))
