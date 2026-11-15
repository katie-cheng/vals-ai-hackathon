export const PLAYGROUND_TEMPLATES = [
  {
    id: "js-variables",
    title: "1. Variables & Data Types",
    category: "JavaScript Basics",
    htmlCode: `<h3>JavaScript Output Console</h3>
<div id="output"></div>
<p class="subtitle">Inspecting modern ES6 variables & template literals</p>`,
    cssCode: `#output {
  background: #0f172a;
  border: 1px solid #334155;
  padding: 18px;
  border-radius: 8px;
  color: #38bdf8;
  font-family: monospace;
  font-size: 1rem;
  line-height: 1.6;
}
.subtitle {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 8px;
}`,
    jsCode: `// Declare variables with let and const
const courseName = "IT Beginner";
let totalLessons = 42;
let isCompleted = false;

console.log("Welcome to " + courseName + "!");
console.log("Total Curriculum Lessons: " + totalLessons);

// Display inside output div
const out = document.getElementById("output");
out.innerHTML = \`
  <p><strong>Course:</strong> \${courseName}</p>
  <p><strong>Total Lessons:</strong> \${totalLessons}</p>
  <p><strong>Enrollment Status:</strong> <span style="color: #4ade80;">Active Student</span></p>
  <p><strong>Started:</strong> \${new Date().toLocaleDateString()}</p>
\`;`,
    updatedAt: "2026-11-06",
    isPreset: true,
  },
  {
    id: "js-conditionals",
    title: "2. Conditionals & Logic (Score Grader)",
    category: "Control Flow",
    htmlCode: `<h3>Exam Score Grader</h3>
<div class="grader-box">
  <input type="number" id="scoreInput" value="85" min="0" max="100" placeholder="Enter score (0-100)">
  <button id="checkBtn">Calculate Grade</button>
  <div id="gradeResult"></div>
</div>`,
    cssCode: `.grader-box {
  background: #1e293b;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #334155;
  max-width: 400px;
}
input {
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #f8fafc;
  margin-right: 8px;
  width: 140px;
}
button {
  background: #38bdf8;
  color: #0f172a;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
button:hover {
  opacity: 0.9;
}
#gradeResult {
  margin-top: 16px;
  font-size: 1.15rem;
  font-weight: 600;
  color: #f1f5f9;
}`,
    jsCode: `function calculateGrade(score) {
  if (score >= 90) return "🌟 Grade A - Outstanding!";
  if (score >= 80) return "👍 Grade B - Very Good!";
  if (score >= 70) return "👌 Grade C - Passing Grade";
  if (score >= 60) return "⚠️ Grade D - Needs Review";
  return "❌ Grade F - Keep Practicing!";
}

const check = () => {
  const score = parseInt(document.getElementById("scoreInput").value) || 0;
  const grade = calculateGrade(score);
  console.log("Evaluated score " + score + " -> " + grade);
  document.getElementById("gradeResult").textContent = grade;
};

document.getElementById("checkBtn").addEventListener("click", check);
check(); // Run initial calculation`,
    updatedAt: "2026-11-06",
    isPreset: true,
  },
  {
    id: "js-loops-arrays",
    title: "3. Arrays & Loops (Tech Stack List)",
    category: "Data Structures",
    htmlCode: `<h3>My IT Beginner Tech Stack</h3>
<ul id="techList"></ul>`,
    cssCode: `#techList {
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 420px;
}
#techList li {
  background: rgba(56, 189, 248, 0.08);
  border-left: 4px solid #38bdf8;
  margin: 8px 0;
  padding: 12px 16px;
  border-radius: 6px;
  color: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s;
}
#techList li:hover {
  transform: translateX(4px);
}
.tag {
  background: #334155;
  color: #38bdf8;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}`,
    jsCode: `const technologies = [
  { name: "HTML5", role: "Structure & Semantics" },
  { name: "CSS3 & Flexbox", role: "Responsive Styling" },
  { name: "JavaScript (ES6+)", role: "Logic & DOM Events" },
  { name: "NPM Registry", role: "Package Management" },
  { name: "Vue.js", role: "Reactive Frontend SPA" },
  { name: "REST APIs", role: "Client-Server Data" }
];

const list = document.getElementById("techList");

technologies.forEach((tech, index) => {
  console.log(\`[\${index + 1}] \${tech.name} - \${tech.role}\`);
  const li = document.createElement("li");
  li.innerHTML = \`
    <span><strong>\${index + 1}.</strong> \${tech.name}</span>
    <span class="tag">\${tech.role}</span>
  \`;
  list.appendChild(li);
});`,
    updatedAt: "2026-11-06",
    isPreset: true,
  },
  {
    id: "html-css-card",
    title: "4. HTML & CSS Profile Card",
    category: "Web Design",
    htmlCode: `<div class="card">
  <div class="avatar">👨‍💻</div>
  <h2>Alex Chen</h2>
  <p class="role">Junior Full-Stack Developer</p>
  <p class="bio">Learning modern web engineering through the IT Beginner curriculum by AjinLab.</p>
  <div class="badges">
    <span class="badge">42 Lessons</span>
    <span class="badge badge-accent">Vue.js Ready</span>
  </div>
</div>`,
    cssCode: `.card {
  max-width: 320px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.avatar {
  font-size: 3.5rem;
  margin-bottom: 12px;
}
h2 {
  font-size: 1.4rem;
  color: #f8fafc;
  margin: 0 0 4px 0;
}
.role {
  color: #38bdf8;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 12px;
}
.bio {
  font-size: 0.88rem;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 20px;
}
.badges {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.badge {
  background: #334155;
  color: #f8fafc;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}
.badge-accent {
  background: #4f46e5;
  color: #ffffff;
}`,
    jsCode: 'console.log("Card rendered cleanly in isolated sandbox.");',
    updatedAt: "2026-11-06",
    isPreset: true,
  },
];
