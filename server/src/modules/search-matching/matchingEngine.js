/**
 * InternBridge — Search & Matching Engine
 * Module 3 (SEU/IS/22/ICT/035 - W.M.E. Saumya)
 *
 * Algorithmic matching calculation engine for comparing student profiles
 * against internship requirements with normalization, synonym mapping,
 * domain relevance, and project tech analysis.
 */

// Canonical alias dictionary for tech skills
const SKILL_SYNONYMS = {
  javascript: ['javascript', 'js', 'ecmascript'],
  typescript: ['typescript', 'ts'],
  react: ['react', 'reactjs', 'react.js'],
  nodejs: ['node', 'nodejs', 'node.js'],
  express: ['express', 'expressjs', 'express.js'],
  mongodb: ['mongodb', 'mongo', 'mongoose'],
  postgresql: ['postgresql', 'postgres', 'psql'],
  mysql: ['mysql', 'sql'],
  python: ['python', 'py', 'python3'],
  java: ['java', 'core java'],
  csharp: ['c#', 'csharp', 'c sharp', '.net', 'dotnet'],
  cpp: ['c++', 'cpp', 'c plus plus'],
  tailwind: ['tailwind', 'tailwindcss', 'tailwind css'],
  bootstrap: ['bootstrap', 'bootstrap5'],
  html: ['html', 'html5'],
  css: ['css', 'css3'],
  nextjs: ['nextjs', 'next.js', 'next'],
  vue: ['vue', 'vuejs', 'vue.js'],
  angular: ['angular', 'angularjs'],
  docker: ['docker', 'containerization', 'containers'],
  kubernetes: ['kubernetes', 'k8s'],
  aws: ['aws', 'amazon web services'],
  azure: ['azure', 'microsoft azure'],
  gcp: ['gcp', 'google cloud', 'google cloud platform'],
  git: ['git', 'github', 'gitlab', 'version control'],
  graphql: ['graphql', 'gql'],
  rest: ['rest', 'rest api', 'restful', 'restful api', 'restful apis', 'api'],
  flutter: ['flutter', 'dart'],
  reactnative: ['react native', 'react-native'],
  uiux: ['ui/ux', 'ui', 'ux', 'figma', 'adobe xd', 'user interface', 'user experience'],
  machinelearning: ['machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning'],
  datascience: ['data science', 'pandas', 'numpy', 'data analytics', 'analytics'],
  linux: ['linux', 'bash', 'shell scripting'],
};

// Map each synonym back to its canonical key
const SYNONYM_TO_CANONICAL = new Map();
for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
  for (const alias of aliases) {
    SYNONYM_TO_CANONICAL.set(alias.toLowerCase(), canonical);
  }
}

/**
 * Clean and canonicalize a skill name
 * @param {string} skill
 * @returns {string}
 */
export const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  const cleaned = skill
    .toLowerCase()
    .trim()
    .replace(/[^\w\s#+./-]/g, '')
    .replace(/\s+/g, ' ');

  return SYNONYM_TO_CANONICAL.get(cleaned) || cleaned;
};

/**
 * Extract canonical skill sets from an array of skill strings
 * @param {Array<string>} skills
 * @returns {Set<string>}
 */
export const getCanonicalSkillSet = (skills = []) => {
  const set = new Set();
  if (!Array.isArray(skills)) return set;

  for (const item of skills) {
    if (!item) continue;
    const normalized = normalizeSkill(item);
    if (normalized) {
      set.add(normalized);
    }
  }
  return set;
};

/**
 * Check if a candidate skill matches a required skill (exact, synonym, or partial)
 * @param {string} reqSkill - Normalized required skill
 * @param {Set<string>} studentSkillsSet - Set of normalized student skills
 * @param {Array<string>} rawStudentSkills - Original array for substring checking
 * @returns {{ matched: boolean, weight: number }}
 */
const checkSkillMatch = (reqSkill, studentSkillsSet, rawStudentSkills = []) => {
  if (!reqSkill) return { matched: false, weight: 0 };

  // 1. Exact canonical match
  if (studentSkillsSet.has(reqSkill)) {
    return { matched: true, weight: 1.0 };
  }

  // 2. Check synonyms
  const aliases = SKILL_SYNONYMS[reqSkill] || [reqSkill];
  for (const alias of aliases) {
    if (studentSkillsSet.has(alias)) {
      return { matched: true, weight: 1.0 };
    }
  }

  // 3. Substring / partial match (e.g. 'react' matching 'react native', or 'api' matching 'rest api')
  const reqLower = reqSkill.toLowerCase();
  for (const skill of rawStudentSkills) {
    if (!skill) continue;
    const sLower = skill.toLowerCase().trim();
    if (sLower.length >= 3 && (sLower.includes(reqLower) || reqLower.includes(sLower))) {
      return { matched: true, weight: 0.75 };
    }
  }

  return { matched: false, weight: 0 };
};

/**
 * Calculate keyword domain relevance score (0.0 to 1.0)
 * between student background and internship area/title
 */
const calculateDomainBonus = (studentProfile, internship) => {
  if (!studentProfile || !internship) return 0.5;

  const areaText = `${internship.area || ''} ${internship.title || ''}`.toLowerCase();
  const backgroundText = `${studentProfile.degree || ''} ${studentProfile.fieldOfStudy || ''} ${studentProfile.bio || ''}`.toLowerCase();

  const domainKeywords = [
    'software', 'web', 'computer', 'information technology', 'ict',
    'data', 'artificial intelligence', 'machine learning', 'cloud',
    'network', 'security', 'cyber', 'mobile', 'frontend', 'backend',
    'full stack', 'devops', 'qa', 'quality assurance'
  ];

  let matches = 0;
  for (const kw of domainKeywords) {
    if (areaText.includes(kw) && backgroundText.includes(kw)) {
      matches++;
    }
  }

  if (matches >= 2) return 1.0;
  if (matches === 1) return 0.8;
  return 0.4;
};

/**
 * Check if student has demonstrated required skills in their projects
 */
const calculateProjectExperienceBonus = (studentProjects = [], requiredSkills = []) => {
  if (!Array.isArray(studentProjects) || studentProjects.length === 0 || requiredSkills.length === 0) {
    return 0.5;
  }

  const projectTechSet = new Set();
  for (const p of studentProjects) {
    if (Array.isArray(p.technologies)) {
      for (const t of p.technologies) {
        projectTechSet.add(normalizeSkill(t));
      }
    }
  }

  let projectMatches = 0;
  for (const req of requiredSkills) {
    const normReq = normalizeSkill(req);
    if (projectTechSet.has(normReq)) {
      projectMatches++;
    }
  }

  return projectMatches > 0 ? Math.min(1.0, projectMatches / Math.max(1, requiredSkills.length / 2)) : 0.2;
};

/**
 * Main matching algorithm: compare a student against an internship
 *
 * @param {Object} studentProfile - Mongoose doc or plain object
 * @param {Object} internship - Mongoose doc or plain object
 * @returns {Object} { matchScore, matchedSkills, missingSkills, matchLevel, breakdown }
 */
export const calculateInternshipMatch = (studentProfile, internship) => {
  if (!internship) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: [],
      matchLevel: 'Low',
      breakdown: { skillScore: 0, domainScore: 0, projectScore: 0 },
    };
  }

  const rawStudentSkills = studentProfile?.skills || [];
  const studentSkillsSet = getCanonicalSkillSet(rawStudentSkills);
  const requiredSkills = internship.requiredSkills || [];

  if (requiredSkills.length === 0) {
    // If no specific skills required, baseline score based on general field
    const domainBonus = calculateDomainBonus(studentProfile, internship);
    const score = Math.round(75 + domainBonus * 25);
    return {
      matchScore: score,
      matchedSkills: rawStudentSkills.slice(0, 5),
      missingSkills: [],
      matchLevel: score >= 75 ? 'High' : 'Medium',
      breakdown: { skillScore: 80, domainScore: Math.round(domainBonus * 100), projectScore: 50 },
    };
  }

  const matchedSkills = [];
  const missingSkills = [];
  let totalSkillWeight = 0;

  for (const req of requiredSkills) {
    const normReq = normalizeSkill(req);
    const result = checkSkillMatch(normReq, studentSkillsSet, rawStudentSkills);

    if (result.matched) {
      matchedSkills.push(req);
      totalSkillWeight += result.weight;
    } else {
      missingSkills.push(req);
    }
  }

  // 1. Skill Match Component (75% weight)
  const skillRatio = totalSkillWeight / requiredSkills.length;
  const skillComponent = skillRatio * 75;

  // 2. Domain / Discipline Relevance Component (15% weight)
  const domainBonus = calculateDomainBonus(studentProfile, internship);
  const domainComponent = domainBonus * 15;

  // 3. Hands-on Project Component (10% weight)
  const projectBonus = calculateProjectExperienceBonus(studentProfile?.projects, requiredSkills);
  const projectComponent = projectBonus * 10;

  // Total Score (0 - 100)
  const rawScore = skillComponent + domainComponent + projectComponent;
  const matchScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let matchLevel = 'Low';
  if (matchScore >= 75) {
    matchLevel = 'High';
  } else if (matchScore >= 50) {
    matchLevel = 'Medium';
  }

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    matchLevel,
    breakdown: {
      skillScore: Math.round(skillRatio * 100),
      domainScore: Math.round(domainBonus * 100),
      projectScore: Math.round(projectBonus * 100),
    },
  };
};

/**
 * Candidate matching: evaluate a student profile against target skills and optional area
 * Used for recruiter candidate search ranking.
 *
 * @param {Object} studentProfile
 * @param {Array<string>} targetSkills
 * @param {string} targetArea
 * @returns {Object} { matchScore, matchedSkills, missingSkills }
 */
export const calculateCandidateMatch = (studentProfile, targetSkills = [], targetArea = '') => {
  if (!studentProfile) {
    return { matchScore: 0, matchedSkills: [], missingSkills: [] };
  }

  if (!targetSkills || targetSkills.length === 0) {
    // If no target skills queried, match score defaults to reputation/profile completeness
    const gpaFactor = studentProfile.gpa ? (studentProfile.gpa / 4.0) * 40 : 25;
    const repFactor = (studentProfile.reputationScore || 0) * 10;
    const skillsFactor = Math.min(30, (studentProfile.skills?.length || 0) * 5);
    const score = Math.min(100, Math.round(gpaFactor + repFactor + skillsFactor));
    return {
      matchScore: score,
      matchedSkills: studentProfile.skills || [],
      missingSkills: [],
    };
  }

  const rawStudentSkills = studentProfile.skills || [];
  const studentSkillsSet = getCanonicalSkillSet(rawStudentSkills);

  const matchedSkills = [];
  const missingSkills = [];
  let totalWeight = 0;

  for (const skill of targetSkills) {
    const norm = normalizeSkill(skill);
    const result = checkSkillMatch(norm, studentSkillsSet, rawStudentSkills);
    if (result.matched) {
      matchedSkills.push(skill);
      totalWeight += result.weight;
    } else {
      missingSkills.push(skill);
    }
  }

  const skillScore = (totalWeight / targetSkills.length) * 80;

  // Domain bonus
  let domainBonus = 0;
  if (targetArea) {
    const bg = `${studentProfile.degree || ''} ${studentProfile.fieldOfStudy || ''}`.toLowerCase();
    if (bg.includes(targetArea.toLowerCase())) {
      domainBonus = 20;
    } else {
      domainBonus = 10;
    }
  } else {
    domainBonus = 10;
  }

  const matchScore = Math.min(100, Math.max(0, Math.round(skillScore + domainBonus)));

  return {
    matchScore,
    matchedSkills,
    missingSkills,
  };
};
