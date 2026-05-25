// Mock data for colleges
export const COLLEGES = [
  { id: '1', name: 'Indian Institute of Technology (IIT) Bombay', state: 'Maharashtra' },
  { id: '2', name: 'Indian Institute of Technology (IIT) Delhi', state: 'Delhi' },
  { id: '3', name: 'Indian Institute of Technology (IIT) Madras', state: 'Tamil Nadu' },
  { id: '4', name: 'Indian Institute of Technology (IIT) Kanpur', state: 'Uttar Pradesh' },
  { id: '5', name: 'Indian Institute of Technology (IIT) Kharagpur', state: 'West Bengal' },
  { id: '6', name: 'Indian Institute of Technology (IIT) Roorkee', state: 'Uttarakhand' },
  { id: '7', name: 'Indian Institute of Technology (IIT) Guwahati', state: 'Assam' },
  { id: '8', name: 'National Institute of Technology (NIT) Trichy', state: 'Tamil Nadu' },
  { id: '9', name: 'National Institute of Technology (NIT) Surathkal', state: 'Karnataka' },
  { id: '10', name: 'National Institute of Technology (NIT) Warangal', state: 'Telangana' },
  { id: '11', name: 'Delhi Technological University (DTU)', state: 'Delhi' },
  { id: '12', name: 'Manipal Institute of Technology', state: 'Karnataka' },
  { id: '13', name: 'VIT University', state: 'Tamil Nadu' },
  { id: '14', name: 'SRM Institute of Science and Technology', state: 'Tamil Nadu' },
  { id: '15', name: 'BITS Pilani', state: 'Rajasthan' },
  { id: '16', name: 'University of Delhi', state: 'Delhi' },
  { id: '17', name: 'Mumbai University', state: 'Maharashtra' },
  { id: '18', name: 'Anna University', state: 'Tamil Nadu' },
  { id: '19', name: 'Pune University', state: 'Maharashtra' },
  { id: '20', name: 'Amrita Vishwa Vidyapeetham', state: 'Tamil Nadu' },
  { id: '21', name: 'Chhattisgarh Swami Vivekanand Technical University', state: 'Chhattisgarh' },
  { id: '22', name: 'Dr. Babasaheb Ambedkar Technological University', state: 'Maharashtra' },
  { id: '23', name: 'Thapar Institute of Engineering and Technology', state: 'Punjab' },
  { id: '24', name: 'Jamia Millia Islamia', state: 'Delhi' },
  { id: '25', name: 'Aligarh Muslim University', state: 'Uttar Pradesh' },
  { id: '26', name: 'Banaras Hindu University', state: 'Uttar Pradesh' },
  { id: '27', name: 'Rajasthan Technical University', state: 'Rajasthan' },
  { id: '28', name: 'Uttarakhand Technical University', state: 'Uttarakhand' },
  { id: '29', name: 'Gautam Buddha University', state: 'Uttar Pradesh' },
  { id: '30', name: 'Shobhit University', state: 'Uttar Pradesh' },
  { id: '31', name: 'Christ University', state: 'Karnataka' },
  { id: '32', name: 'Symbiosis Institute of Technology', state: 'Maharashtra' },
  { id: '33', name: 'JSS Academy of Technical Education', state: 'Karnataka' },
  { id: '34', name: 'Lovely Professional University (LPU)', state: 'Punjab' },
  { id: '35', name: 'DAV University', state: 'Punjab' },
];

// Degrees
export const DEGREES = [
  'B.Tech',
  'B.E',
  'Diploma',
  'BE (CS)',
  'B.Tech IT',
  'BS',
  'BSc',
];

// Branches
export const BRANCHES_BY_DEGREE: Record<string, string[]> = {
  'B.Tech': [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Aerospace Engineering',
    'Automobile Engineering',
  ],
  'B.E': [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
  ],
  'Diploma': [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
  ],
  'Default': [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
  ],
};

// Tech Stack for projects
export const TECH_STACK = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'Svelte',
  'HTML5',
  'CSS3',
  'Tailwind CSS',
  'Bootstrap',
  'Material UI',
  'Node.js',
  'Express.js',
  'Django',
  'Flask',
  'FastAPI',
  'Spring Boot',
  'Java',
  'Python',
  'C++',
  'C',
  'Go',
  'Rust',
  'PHP',
  'Laravel',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Firebase',
  'GraphQL',
  'REST API',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'GitHub',
  'Figma',
  'Webpack',
  'Redux',
  'Context API',
];

// Skills with categories
export const SKILLS_BY_CATEGORY = {
  'Languages': [
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'C',
    'TypeScript',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'Swift',
    'Kotlin',
    'SQL',
    'HTML5',
    'CSS3',
    'Solidity',
    'R',
    'MATLAB',
  ],
  'Frontend Frameworks': [
    'React',
    'Next.js',
    'Vue.js',
    'Angular',
    'Svelte',
    'Ember.js',
    'Gatsby',
    'Nuxt',
    'React Native',
    'Flutter',
  ],
  'Databases': [
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Firebase',
    'Redis',
    'Elasticsearch',
    'DynamoDB',
    'Oracle',
    'SQLite',
    'MariaDB',
  ],
  'Backend Frameworks': [
    'Node.js',
    'Express.js',
    'Django',
    'Flask',
    'FastAPI',
    'Spring Boot',
    'ASP.NET',
    'Laravel',
    'Ruby on Rails',
    'Gin',
  ],
  'Tools & DevOps': [
    'Docker',
    'Kubernetes',
    'Git',
    'GitHub',
    'GitLab',
    'Jenkins',
    'CI/CD',
    'AWS',
    'Azure',
    'GCP',
    'Linux',
    'Nginx',
    'Apache',
  ],
  'Other': [
    'REST API',
    'GraphQL',
    'WebSocket',
    'Webpack',
    'Redux',
    'Context API',
    'Tailwind CSS',
    'Bootstrap',
    'Material UI',
    'Jest',
    'Testing Library',
    'Selenium',
  ],
};

// Competitive Platforms
export const COMPETITIVE_PLATFORMS = [
  {
    name: 'LeetCode',
    icon: 'https://www.leetcode.com/favicon.ico',
    baseUrl: 'https://leetcode.com/u/',
    colorClass: 'text-yellow-600',
  },
  {
    name: 'CodeChef',
    icon: 'https://www.codechef.com/favicon.ico',
    baseUrl: 'https://www.codechef.com/users/',
    colorClass: 'text-amber-700',
  },
  {
    name: 'Codeforces',
    icon: 'https://codeforces.com/favicon.ico',
    baseUrl: 'https://codeforces.com/profile/',
    colorClass: 'text-blue-600',
  },
  {
    name: 'HackerRank',
    icon: 'https://www.hackerrank.com/favicon.ico',
    baseUrl: 'https://www.hackerrank.com/profile/',
    colorClass: 'text-green-600',
  },
  {
    name: 'GeeksforGeeks',
    icon: 'https://www.geeksforgeeks.org/favicon.ico',
    baseUrl: 'https://auth.geeksforgeeks.org/user/',
    colorClass: 'text-gray-700',
  },
];

// Career Roles
export const CAREER_ROLES = [
  'Software Development Engineer (SDE)',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'Cloud Engineer',
  'Mobile Developer',
  'UI/UX Designer',
  'QA Engineer',
  'Product Manager',
  'Solutions Architect',
  'Security Engineer',
  'Machine Learning Engineer',
];

// Indian Cities
export const INDIAN_CITIES = [
  'Bangalore',
  'Delhi/NCR',
  'Hyderabad',
  'Mumbai',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Indore',
  'Lucknow',
  'Chandigarh',
  'Coimbatore',
  'Kochi',
  'Surat',
];

// Class 12 Boards
export const CLASS_12_BOARDS = [
  'CBSE',
  'ICSE',
  'ISC',
  'AP Board',
  'Telangana Board',
  'Karnataka Board',
  'Tamil Nadu Board',
  'Maharashtra Board',
  'Gujarat Board',
  'Punjab Board',
  'Rajasthan Board',
  'Uttar Pradesh Board',
  'West Bengal Board',
  'Bihar Board',
  'Jharkhand Board',
  'Odisha Board',
  'Other',
];

// Months
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Years (for dropdowns)
export const getYearsArray = (startYear: number = 2015, endYear: number = new Date().getFullYear() + 4) => {
  const years = [];
  for (let i = endYear; i >= startYear; i--) {
    years.push(i.toString());
  }
  return years;
};

// Helper to get branches based on degree
export const getBranchesByDegree = (degree: string): string[] => {
  return BRANCHES_BY_DEGREE[degree] || BRANCHES_BY_DEGREE['Default'];
};

// Helper to get all skills
export const getAllSkills = (): string[] => {
  return Object.values(SKILLS_BY_CATEGORY).flat();
};

// Helper to get skills by category
export const getSkillsByCategory = (category: string): string[] => {
  return SKILLS_BY_CATEGORY[category as keyof typeof SKILLS_BY_CATEGORY] || [];
};
