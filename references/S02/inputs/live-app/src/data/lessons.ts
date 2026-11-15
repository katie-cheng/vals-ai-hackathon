export const LESSONS = [
  {
    id: 1,
    chapterId: 1,
    orderIndex: 1,
    title: "Welcome & Course Overview",
    description:
      "Get introduced to the IT Beginner curriculum and understand what you will build step-by-step.",
    durationMinutes: 12,
    videoFilename: "0001_1_Welcome_Course_Overview - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand the complete 6-chapter journey from zero to full-stack foundation",
      "Learn the active recall and hands-on coding method for maximum retention",
      "Set up your learning mindset for software engineering success",
    ],
    codeExample: `// Welcome to IT Beginner!
console.log("Hello, Future Developer!");
const student = {
  status: "Ready to Learn",
  goal: "Full-Stack Web Proficiency",
  startedAt: new Date().getFullYear()
};
console.table(student);`,
    keyTakeaways: [
      "No prior math or coding experience is required to begin.",
      "Consistency and daily coding beats long passive video marathons.",
      "You will build functional projects from scratch across every chapter.",
    ],
    interactiveCode: {
      initialCode: `// Write your first line of JavaScript!
const myName = "Student";
console.log("Welcome " + myName + " to the IT Beginner course!");`,
      hint: "Press Run Code to see the output in the console below!",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Welcome to the IT Beginner comprehensive course. My name is your instructor.",
      },
      {
        timeSeconds: 45,
        text: "In this course, we take you from zero programming knowledge to understanding how production web applications are constructed.",
      },
      {
        timeSeconds: 120,
        text: "We cover software lifecycles, Agile and Scrum, deep JavaScript, HTML, CSS, frontend tooling with NPM, Vue.js reactive frameworks, and full-stack REST APIs.",
      },
      {
        timeSeconds: 240,
        text: "Make sure to open your editor or use our in-lesson scratchpad to type every example yourself.",
      },
    ],
  },
  {
    id: 2,
    chapterId: 1,
    orderIndex: 2,
    title: "Curriculum & Learning Path",
    description: "A deep breakdown of every module, milestone, and project you will complete.",
    durationMinutes: 15,
    videoFilename: "0002_2_Curriculum - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Navigate the 6 core pillars of the curriculum",
      "Understand how each chapter builds directly onto the previous one",
      "Identify the capstone teamable project requirements",
    ],
    codeExample: `const chapters = [
  "1. Getting Started",
  "2. Software Development Basics",
  "3. Web Development Fundamentals",
  "4. Frontend Development & Tools",
  "5. Vue.js Framework & Single Page Apps",
  "6. Full-Stack Architecture & Backend Communication"
];
chapters.forEach((ch, idx) => console.log(\`Milestone \${idx + 1}: \${ch}\`));`,
    keyTakeaways: [
      "Each chapter has an assessment quiz and verifiable completion certificate.",
      "The code playground allows sandbox experimentation without any local installation.",
      "Cheatsheets are provided for quick lookup throughout your career.",
    ],
    interactiveCode: {
      initialCode: `const progress = 0;
console.log("Current course completion: " + progress + "%");
console.log("Let's hit 100% together!");`,
      hint: "Change the progress number and run the code.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Let us take a comprehensive look at the learning roadmap.",
      },
      {
        timeSeconds: 60,
        text: "Chapter 2 introduces how real engineering teams operate using Agile and Jira.",
      },
      {
        timeSeconds: 150,
        text: "Chapter 3 provides 16 intensive lessons on modern JavaScript, HTML5, and CSS3.",
      },
      {
        timeSeconds: 300,
        text: "Chapters 4 through 6 cover real-world tooling, reactive single page apps, and backend APIs.",
      },
    ],
  },
  {
    id: 3,
    chapterId: 1,
    orderIndex: 3,
    title: "How to Access Course Resources",
    description:
      "Learn how to download code templates, access cheatsheets, and use the interactive playground.",
    durationMinutes: 10,
    videoFilename: "0003_3_How_to_Access_Course_Resources - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Access developer resources and handbook guides",
      "Use the in-browser live code sandbox and save personal snippets",
      "Engage with peer questions in the community Q&A",
    ],
    codeExample: `// Accessing course documentation
const platformResources = {
  cheatsheets: ["JavaScript", "HTML/CSS", "Agile/Scrum", "CLI & NPM"],
  interactivePlayground: true,
  downloadableCertificates: true
};
console.log("Available tools:", platformResources);`,
    keyTakeaways: [
      "Bookmark lessons that you want to revisit later from the top-right button.",
      "Leave timestamped notes as you watch so you can jump back to key explanations.",
      "Check the Resources tab anytime you need a quick syntax refresher.",
    ],
    interactiveCode: {
      initialCode: `const tools = ["VS Code", "Chrome DevTools", "Node.js", "Git"];
console.log("My developer toolkit:", tools.join(" | "));`,
      hint: "Add another tool to the array and run it!",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "In this video, I demonstrate how to make the most of this learning platform.",
      },
      {
        timeSeconds: 45,
        text: "Notice the scratchpad tab right below the video player. You can run code live.",
      },
      {
        timeSeconds: 110,
        text: "You can also write timestamped notes that let you seek directly back to this exact second.",
      },
    ],
  },
  {
    id: 4,
    chapterId: 2,
    orderIndex: 1,
    title: "Software Development Workflow",
    description: "Understand the end-to-end software development lifecycle from requirements to deployment.",
    durationMinutes: 18,
    videoFilename: "0004_1_Software_Development_Workflow - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand the 6 stages of the Software Development Life Cycle (SDLC)",
      "Learn the difference between Waterfall and iterative modern engineering",
      "Discover how QA testing and continuous delivery fit into development",
    ],
    codeExample: `const sdlcStages = [
  "1. Requirement Analysis",
  "2. System Design & Architecture",
  "3. Implementation / Coding",
  "4. QA Testing & Bug Fixing",
  "5. Deployment & Release",
  "6. Maintenance & Monitoring"
];
console.log("SDLC Pipeline:", sdlcStages);`,
    keyTakeaways: [
      'Software is never "done" in one pass; it evolves through structured iterations.',
      "Clear requirements save weeks of wasted coding effort.",
      "Automated testing prevents regression bugs before code hits production.",
    ],
    interactiveCode: {
      initialCode: `const stage = "Coding";
console.log("Currently in: " + stage + " phase. Next: Testing & Review");`,
      hint: "Test modifying the stage string.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Software engineering is much more than simply opening an editor and typing code.",
      },
      {
        timeSeconds: 90,
        text: "We start with requirement gathering: what problem are we solving for our users?",
      },
      {
        timeSeconds: 210,
        text: "Then we design architecture, implement modular code, write automated tests, and deploy to cloud servers.",
      },
    ],
  },
  {
    id: 5,
    chapterId: 2,
    orderIndex: 2,
    title: "What Is Agile and Scrum",
    description: "Master Agile principles, Scrum roles, ceremonies, artifacts, and sprint planning.",
    durationMinutes: 22,
    videoFilename: "0005_2_What_Is_Agile_and_Scrum - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Learn the 4 core values and 12 principles of the Agile Manifesto",
      "Understand Scrum roles: Product Owner, Scrum Master, and Developers",
      "Master Scrum ceremonies: Sprint Planning, Daily Standup, Sprint Review, and Retrospective",
    ],
    codeExample: `const scrumTeam = {
  productOwner: "Defines vision & prioritizes backlog",
  scrumMaster: "Facilitates process & clears roadblocks",
  developers: "Builds high-quality increments"
};
const ceremonies = ["Sprint Planning", "Daily Standup", "Sprint Review", "Retrospective"];
console.log("Scrum Framework Active:", { scrumTeam, ceremonies });`,
    keyTakeaways: [
      "Agile values working software over comprehensive documentation.",
      "Sprints are fixed timeboxes (typically 2 weeks) that deliver a shippable increment.",
      "Retrospectives help teams continuously inspect and improve their processes.",
    ],
    interactiveCode: {
      initialCode: `const sprintDurationDays = 14;
const daysRemaining = 5;
console.log("Sprint status: " + daysRemaining + " days left out of " + sprintDurationDays);`,
      hint: "Calculate progress percentage!",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Agile revolutionized software delivery by replacing rigid multi-year waterfall schedules with flexible short sprints.",
      },
      {
        timeSeconds: 80,
        text: "Scrum is the most widely adopted Agile framework worldwide.",
      },
      {
        timeSeconds: 200,
        text: "Daily standups keep the team aligned on what was done yesterday, what is planned today, and any blockers.",
      },
    ],
  },
  {
    id: 6,
    chapterId: 2,
    orderIndex: 3,
    title: "Backlog and Scrum Board in Jira",
    description:
      "Learn how software engineers use Jira for backlog grooming, user stories, epics, and Kanban boards.",
    durationMinutes: 20,
    videoFilename: "0006_3_Backlog_and_Scrum_Board_in_Jira - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Write effective User Stories with Acceptance Criteria",
      "Break Epics down into prioritized tasks and bugs",
      "Manage issues across To Do, In Progress, Code Review, and Done columns",
    ],
    codeExample: `interface JiraTicket {
  id: string;
  type: "Story" | "Bug" | "Task";
  title: string;
  storyPoints: number;
  status: "To Do" | "In Progress" | "In Review" | "Done";
}

const ticket: JiraTicket = {
  id: "ITB-101",
  type: "Story",
  title: "As a student, I want to resume video where I paused",
  storyPoints: 3,
  status: "In Progress"
};
console.log("Jira Ticket:", ticket);`,
    keyTakeaways: [
      'User story template: "As a [user], I want [feature], so that [benefit]".',
      "Story points estimate relative complexity, effort, and risk rather than exact hours.",
      "Keeping your Jira board updated gives stakeholder visibility into sprint health.",
    ],
    interactiveCode: {
      initialCode: `const columns = ["Backlog", "To Do", "In Progress", "Review", "Done"];
console.log("Current ticket pipeline:", columns.join(" -> "));`,
      hint: "Add a new column or log a simulated ticket.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Today we open Atlassian Jira and examine how modern tech companies track work.",
      },
      {
        timeSeconds: 75,
        text: "Here is our Product Backlog, ordered by business priority.",
      },
      {
        timeSeconds: 190,
        text: "When a sprint starts, developers pull tickets into In Progress and update their team.",
      },
    ],
  },
  {
    id: 7,
    chapterId: 3,
    orderIndex: 1,
    title: "Chapter Introduction: Web Fundamentals",
    description: "Overview of web technologies: clients, servers, browsers, HTML, CSS, and JavaScript.",
    durationMinutes: 10,
    videoFilename: "0007_1_Chapter_Intro - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand the roles of HTML, CSS, and JavaScript in modern applications",
      "Prepare for the 16 hands-on coding lessons in Chapter 3",
      "Set up developer tools in Google Chrome or Firefox",
    ],
    codeExample: `// The Holy Trinity of Web Development
const webTrio = {
  HTML: "Structure & Content (The skeleton)",
  CSS: "Styling & Visual Design (The clothing)",
  JavaScript: "Interactivity & Logic (The brain & muscles)"
};
console.log(webTrio);`,
    keyTakeaways: [
      "Every website you use is composed of HTML, CSS, and JavaScript.",
      "Chrome DevTools (F12 / Cmd+Opt+I) is your most powerful diagnostic tool.",
      "We will write real code in every single lesson of this chapter.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Web development is awesome!");',
      hint: "Run this snippet to test your live scratchpad.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Welcome to Chapter 3: Web Development Fundamentals. This is the cornerstone of the course.",
      },
      {
        timeSeconds: 60,
        text: "We will demystify how browsers interpret web standards and turn text files into interactive experiences.",
      },
    ],
  },
  {
    id: 8,
    chapterId: 3,
    orderIndex: 2,
    title: "How Websites Work",
    description:
      "Deep dive into DNS lookup, IP addresses, client-server requests, and browser rendering engines.",
    durationMinutes: 24,
    videoFilename: "0008_2_How_Websites_Work - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Trace a URL request from your browser to server response (DNS, TCP, HTTP)",
      "Understand IP addresses, domain names, and hosting servers",
      "Learn how the browser parses HTML to construct the DOM and CSSOM",
    ],
    codeExample:
      '// Request-Response cycle simulation\nasync function fetchWebsite(url) {\n  console.log(`1. Resolving DNS for ${url}...`);\n  console.log(`2. Establishing TCP handshake...`);\n  console.log(`3. Sending HTTP GET request...`);\n  return { status: 200, contentType: "text/html", body: "<!DOCTYPE html>..." };\n}\nfetchWebsite("https://example.com").then(res => console.log("Response:", res.status));',
    keyTakeaways: [
      "DNS acts as the phonebook of the Internet, translating human names to IP addresses.",
      "HTTP (Hypertext Transfer Protocol) defines the language clients and servers speak.",
      "Critical rendering path: HTML -> DOM tree + CSSOM tree -> Render Tree -> Layout -> Paint.",
    ],
    interactiveCode: {
      initialCode: `const protocol = "https://";
const domain = "itbeginner.com";
console.log("Target address: " + protocol + domain);`,
      hint: "Run to verify the URL string.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "What actually happens when you type google.com and press Enter?",
      },
      {
        timeSeconds: 120,
        text: "Your browser asks a DNS server for the IP address corresponding to that domain.",
      },
      {
        timeSeconds: 240,
        text: "Once received, an HTTP GET request is dispatched over TCP port 443.",
      },
    ],
  },
  {
    id: 9,
    chapterId: 3,
    orderIndex: 3,
    title: "What Is JavaScript",
    description:
      "History, runtime environments (Browser vs Node.js), ECMAScript standards, and modern JS capabilities.",
    durationMinutes: 16,
    videoFilename: "0009_3_What_Is_Js - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand why JavaScript is the undisputed programming language of the web",
      "Learn about Brendan Eich, Netscape, and the ECMAScript standard",
      "Discover modern JS execution in browsers and server environments with V8",
    ],
    codeExample: `// JavaScript is dynamic, interpreted, and multi-paradigm
console.log("JavaScript version: ES2026 Ready");
const features = ["First-class functions", "Asynchronous Event Loop", "Prototypal Inheritance"];
console.log("Core JS Strengths:", features);`,
    keyTakeaways: [
      "JavaScript is not Java; they are two completely unrelated languages.",
      "Modern JavaScript (ES6 and beyond) is expressive, clean, and highly performant.",
      "JavaScript runs natively in every modern browser without plugins.",
    ],
    interactiveCode: {
      initialCode: `console.log("Type of 42 is: " + typeof 42);
console.log("Type of 'Hello' is: " + typeof 'Hello');`,
      hint: "Run to see how JavaScript inspects data types.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "JavaScript was created in 1995 and has evolved into the most popular language in software development.",
      },
      {
        timeSeconds: 100,
        text: "Today JS powers everything from interactive websites to mobile apps, desktop tools, and cloud APIs.",
      },
    ],
  },
  {
    id: 10,
    chapterId: 3,
    orderIndex: 4,
    title: "Variables & Data Types",
    description:
      "Master const and let, primitive types (string, number, boolean, null, undefined, symbol), and type coercion.",
    durationMinutes: 25,
    videoFilename: "0010_4_Variables_Data_Types - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand why modern JS prefers const and let over legacy var",
      "Master primitive data types and their memory behavior",
      "Understand typeof operator and strict equality",
    ],
    codeExample: `// Use const by default; use let only if value will be reassigned
const courseId = "ITB-2026";
let studentCount = 1250;
studentCount += 1;

// Primitive types
const title = "IT Beginner";     // String
const price = 0;                 // Number
const isFree = true;             // Boolean
const mentor = null;             // Null (intentional absence of value)
let completionDate;              // Undefined

console.log({ courseId, studentCount, isFree });`,
    keyTakeaways: [
      "Never use var in modern JavaScript due to hoisting and function-scoping bugs.",
      "const prevents variable reassignment, creating predictable code.",
      "Strings can use template literals with backticks: `Hello ${name}`.",
    ],
    interactiveCode: {
      initialCode:
        'const firstName = "Sarah";\nlet age = 22;\nconsole.log(`Student ${firstName} is ${age} years old.`);',
      hint: "Change the name and age and run the code.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "In this lecture, we examine how computers store information in memory using variables.",
      },
      {
        timeSeconds: 90,
        text: "Rule number one of modern JavaScript: always use const unless you know for sure the value will change.",
      },
      {
        timeSeconds: 210,
        text: "Template literals allow you to embed expressions directly inside strings with the dollar-curly syntax.",
      },
    ],
  },
  {
    id: 11,
    chapterId: 3,
    orderIndex: 5,
    title: "How to Execute JavaScript",
    description:
      "Different ways to run JS: browser console, inline scripts, external .js files, and Node.js CLI.",
    durationMinutes: 14,
    videoFilename: "0011_5_How_to_Execute_Js - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      'Link external script files using <script src="app.js" defer><\/script>',
      "Use the browser developer console for rapid experimentation",
      "Understand the order of script execution and DOM loading",
    ],
    codeExample: `<!-- Recommended script inclusion in HTML -->
<!DOCTYPE html>
<html>
  <head>
    <title>My Web Page</title>
    <!-- Defer ensures DOM is parsed before script runs -->
    <script src="script.js" defer><\/script>
  </head>
  <body>
    <h1>Interactive Web App</h1>
  </body>
</html>`,
    keyTakeaways: [
      'Always use the "defer" attribute when loading external scripts in the <head>.',
      "Keep JavaScript in separate .js files for separation of concerns and caching.",
      "Console methods like console.warn() and console.error() help with debugging.",
    ],
    interactiveCode: {
      initialCode: `console.log("Standard log");
console.warn("This is a warning message");
console.error("This is an error simulation");`,
      hint: "Run to see different console levels in action.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Let us discuss how and where your code gets loaded.",
      },
      {
        timeSeconds: 80,
        text: "Putting all script tags at the bottom of body used to be common, but now script defer in head is best practice.",
      },
    ],
  },
  {
    id: 12,
    chapterId: 3,
    orderIndex: 6,
    title: "Conditionals & Comparators",
    description: "If-else statements, switch statements, ternary operator, and strict equality (=== vs ==).",
    durationMinutes: 28,
    videoFilename: "0012_6_Conditionals_Comparators - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Make decisions using if, else if, and else blocks",
      "Understand strict equality (===) and avoid loose equality (==)",
      "Use logical operators (&&, ||, !) and the ternary operator",
    ],
    codeExample: `function checkAccess(role, isVerified) {
  if (role === "admin") {
    return "Full Administrator Access Granted";
  } else if (role === "student" && isVerified) {
    return "Student Learning Dashboard Access";
  } else {
    return "Please verify your email address";
  }
}

console.log(checkAccess("student", true));
// Ternary operator: condition ? ifTrue : ifFalse
const statusMessage = isVerified ? "Verified User" : "Guest";`,
    keyTakeaways: [
      "Always use === (strict equality) which compares both value and type without coercion.",
      "Logical AND (&&) requires all conditions to be true.",
      "Logical OR (||) requires at least one condition to be true.",
    ],
    interactiveCode: {
      initialCode: `const testScore = 88;
if (testScore >= 90) {
  console.log("Grade: A");
} else if (testScore >= 80) {
  console.log("Grade: B");
} else {
  console.log("Keep practicing!");
}`,
      hint: "Change testScore and re-run!",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Conditionals allow programs to branch and react based on data inputs.",
      },
      {
        timeSeconds: 110,
        text: "Why do we insist on triple equals? Because double equals coerces strings to numbers silently, causing bugs.",
      },
    ],
  },
  {
    id: 13,
    chapterId: 3,
    orderIndex: 7,
    title: "Objects",
    description:
      "Object literals, key-value pairs, nested objects, object destructuring, and Object methods.",
    durationMinutes: 26,
    videoFilename: "0013_7_Objects - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Model real-world entities using JavaScript objects",
      "Access properties with dot notation and bracket notation",
      "Use modern object destructuring and spread syntax",
    ],
    codeExample: `const developer = {
  name: "Alex",
  role: "Junior Frontend Engineer",
  skills: ["HTML", "CSS", "JavaScript"],
  address: {
    city: "San Francisco",
    remote: true
  },
  introduce() {
    return \`Hi, I am \${this.name}, a \${this.role}!\`;
  }
};

// Destructuring
const { name, role } = developer;
console.log(developer.introduce());
console.log("Skills count:", developer.skills.length);`,
    keyTakeaways: [
      "Objects store data in key-value pairs.",
      'Use dot notation (obj.key) or bracket notation (obj["key"]) for dynamic properties.',
      "Functions defined inside objects are called methods.",
    ],
    interactiveCode: {
      initialCode: `const course = {
  title: "IT Beginner",
  author: "AjinLab",
  rating: 4.9
};
console.log(course.title + " by " + course.author);`,
      hint: "Add a new property to course and log it.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Objects are the primary building block for structured data in JavaScript.",
      },
      {
        timeSeconds: 120,
        text: "Notice how we can nest arrays and other objects inside an object literal.",
      },
    ],
  },
  {
    id: 14,
    chapterId: 3,
    orderIndex: 8,
    title: "Arrays",
    description: "Working with arrays: push, pop, shift, unshift, slice, splice, and array destructuring.",
    durationMinutes: 24,
    videoFilename: "0014_8_Arrays - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Create and index arrays with zero-based numbering",
      "Add and remove elements using push, pop, shift, unshift",
      "Understand array mutability and length property",
    ],
    codeExample: `const techStack = ["HTML5", "CSS3", "JavaScript"];

// Adding items
techStack.push("Vue.js");     // Add to end
techStack.unshift("Git");     // Add to beginning

console.log("Total tools:", techStack.length);
console.log("First item:", techStack[0]);
console.log("Last item:", techStack[techStack.length - 1]);

// Check if item exists
console.log("Has JavaScript?", techStack.includes("JavaScript"));`,
    keyTakeaways: [
      "Arrays are zero-indexed: the first item is always at index 0.",
      "push() and pop() operate on the end of the array and are fast.",
      "Array.isArray(x) is the reliable way to check if a variable is an array.",
    ],
    interactiveCode: {
      initialCode: `const numbers = [10, 20, 30, 40];
numbers.push(50);
console.log("Updated array:", numbers);
console.log("Length:", numbers.length);`,
      hint: "Try using pop() to remove the last number.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Arrays allow us to store ordered lists of data in a single variable.",
      },
      {
        timeSeconds: 95,
        text: "Remember that arrays in JavaScript can hold any mix of data types, though holding homogeneous data is standard practice.",
      },
    ],
  },
  {
    id: 15,
    chapterId: 3,
    orderIndex: 9,
    title: "Loops",
    description: "Master for loops, while loops, do-while loops, for...of, and for...in.",
    durationMinutes: 26,
    videoFilename: "0015_9_Loops - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Iterate over sequences with traditional for loops",
      "Use while loops and understand loop termination conditions",
      "Loop over arrays elegantly with modern for...of syntax",
    ],
    codeExample: `// Traditional for loop
for (let i = 1; i <= 5; i++) {
  console.log(\`Step \${i} of 5\`);
}

// for...of loop for arrays
const frameworks = ["React", "Vue", "Angular", "Svelte"];
for (const fw of frameworks) {
  console.log("Exploring framework:", fw);
}

// While loop
let count = 3;
while (count > 0) {
  console.log("Countdown:", count);
  count--;
}`,
    keyTakeaways: [
      "Always ensure loops have an increment or exit condition to avoid infinite loops.",
      "for...of is the cleanest syntax to iterate directly through values of an array.",
      "break exits a loop early; continue skips to the next iteration.",
    ],
    interactiveCode: {
      initialCode: `for (let i = 1; i <= 4; i++) {
  console.log("Completed lesson " + i);
}`,
      hint: "Run to see the loop repeat 4 times.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Loops prevent repetitive code by automating repeated operations.",
      },
      {
        timeSeconds: 110,
        text: "Let us build a loop counter and look at how the variable updates on each iteration.",
      },
    ],
  },
  {
    id: 16,
    chapterId: 3,
    orderIndex: 10,
    title: "Functions",
    description:
      "Function declarations, function expressions, arrow functions, parameters, and return values.",
    durationMinutes: 30,
    videoFilename: "0016_10_Functions - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Write modular, reusable code using functions",
      "Understand parameters, arguments, and return values",
      "Master modern ES6 arrow function syntax",
    ],
    codeExample: `// Standard function declaration
function calculateProgress(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Modern Arrow function
const formatGreeting = (name) => \`Hello, \${name}! Keep coding!\`;

const percent = calculateProgress(12, 42);
console.log(\`Course progress: \${percent}%\`);
console.log(formatGreeting("Alex"));`,
    keyTakeaways: [
      "Functions should do one task well (Single Responsibility Principle).",
      'Arrow functions provide a concise syntax and lexical "this" binding.',
      "A function without a return statement implicitly returns undefined.",
    ],
    interactiveCode: {
      initialCode: `const add = (a, b) => a + b;
console.log("5 + 7 =", add(5, 7));`,
      hint: "Write a multiply function and call it!",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Functions are the fundamental building blocks of all JavaScript logic.",
      },
      {
        timeSeconds: 120,
        text: "Notice how arrow functions with a single return expression can omit curly brackets and the return keyword.",
      },
    ],
  },
  {
    id: 17,
    chapterId: 3,
    orderIndex: 11,
    title: "Built-in Functions & Array Methods",
    description: "Essential built-in methods: map, filter, reduce, forEach, find, Math, and Date.",
    durationMinutes: 32,
    videoFilename: "0017_11_Built_in_Functions - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Transform data declaratively using .map() and .filter()",
      "Compute aggregations with .reduce()",
      "Explore standard library utilities in Math and Date",
    ],
    codeExample: `const scores = [65, 82, 94, 71, 88, 55];

// Filter passing scores (>= 70)
const passingScores = scores.filter(score => score >= 70);

// Map scores to grade labels
const labels = passingScores.map(score => \`Score: \${score}/100\`);

// Sum scores with reduce
const total = scores.reduce((sum, current) => sum + current, 0);
const average = (total / scores.length).toFixed(1);

console.log("Passing:", passingScores);
console.log("Average Score:", average);`,
    keyTakeaways: [
      ".map() always returns a new array of the same length with transformed values.",
      ".filter() returns a new array containing only elements that pass the predicate test.",
      "Functional array methods do not mutate the original array, preventing side-effects.",
    ],
    interactiveCode: {
      initialCode: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);`,
      hint: "Use filter to keep only numbers greater than 5.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "In modern JavaScript, we rarely write manual for-loops to transform arrays.",
      },
      {
        timeSeconds: 110,
        text: "Methods like map, filter, and reduce allow clean, declarative data pipelines.",
      },
    ],
  },
  {
    id: 18,
    chapterId: 3,
    orderIndex: 12,
    title: "Intro to HTML & CSS",
    description:
      "How markup defines document structure and stylesheets control presentation and responsive layout.",
    durationMinutes: 18,
    videoFilename: "0018_12_Intro_to_Html_Css - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand HTML tags, elements, and attributes",
      "Write basic CSS rules with selectors, properties, and values",
      "Understand the relationship between HTML structure and CSS cascade",
    ],
    codeExample: `<!-- HTML Document Shell -->
<div class="card">
  <h2>Frontend Roadmap</h2>
  <p>Learn HTML, CSS, and modern JavaScript.</p>
</div>

/* Corresponding CSS */
.card {
  background-color: #1e293b;
  color: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}`,
    keyTakeaways: [
      "HTML provides meaning and structure (semantic markup).",
      "CSS controls typography, colors, spacing, and responsive layout.",
      "Separate content from presentation for clean maintainability.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Ready to build the visual interface!");',
      hint: "We will link HTML and CSS in the next lesson.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Now that we understand programming logic, let us explore how interfaces are constructed visually.",
      },
      {
        timeSeconds: 90,
        text: "HTML represents the document object model, and CSS applies visual styling rules to each node.",
      },
    ],
  },
  {
    id: 19,
    chapterId: 3,
    orderIndex: 13,
    title: "HTML: Elements, Semantics & Forms",
    description:
      "Deep dive into semantic HTML5 tags: header, main, nav, section, article, forms, inputs, and buttons.",
    durationMinutes: 26,
    videoFilename: "0019_13_Html - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Use semantic elements for superior accessibility and SEO",
      "Build interactive forms with inputs, labels, and validation",
      "Understand block vs inline elements",
    ],
    codeExample: `<header>
  <nav>
    <a href="/">Home</a>
    <a href="/courses">Curriculum</a>
  </nav>
</header>
<main>
  <article>
    <h1>Getting Started with Web Development</h1>
    <p>Semantic HTML makes websites accessible to screen readers.</p>
  </article>
</main>`,
    keyTakeaways: [
      "Use <header>, <nav>, <main>, <article>, <section>, and <footer> instead of endless generic <div> tags.",
      'Always associate <label for="id"> with form <input id="id"> for accessibility.',
      'The "alt" attribute on <img> tags is required for screen readers and SEO.',
    ],
    interactiveCode: {
      initialCode: 'console.log("Semantic HTML is essential for web accessibility!");',
      hint: "Semantic HTML is evaluated by browsers and search engines.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Writing clean semantic HTML is what distinguishes professional engineers from amateurs.",
      },
      {
        timeSeconds: 120,
        text: "When you use nav and main tags, assistive technologies can navigate your site smoothly.",
      },
    ],
  },
  {
    id: 20,
    chapterId: 3,
    orderIndex: 14,
    title: "CSS: Selectors, Box Model & Flexbox",
    description:
      "Master the CSS Box Model (margin, border, padding, content), Flexbox layout, and CSS variables.",
    durationMinutes: 34,
    videoFilename: "0020_14_Css - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand the CSS Box Model and box-sizing: border-box",
      "Master Flexbox axes (justify-content, align-items, flex-direction)",
      "Style layouts responsively across mobile, tablet, and desktop",
    ],
    codeExample: `/* Universal box-sizing reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Flexbox centering layout */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #0f172a;
  color: #ffffff;
}

.hero-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}`,
    keyTakeaways: [
      "box-sizing: border-box ensures padding and borders do not expand total element width.",
      "Flexbox is designed for 1-dimensional layouts (rows or columns).",
      "justify-content aligns along the main axis; align-items aligns along the cross axis.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Flexbox: display: flex; justify-content: center; align-items: center;");',
      hint: "This is the universal way to center elements in modern CSS!",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Let us master the CSS Box Model and modern Flexbox layout.",
      },
      {
        timeSeconds: 140,
        text: "With Flexbox, centering content vertically and horizontally takes just three lines of CSS.",
      },
    ],
  },
  {
    id: 21,
    chapterId: 3,
    orderIndex: 15,
    title: "HTML Head Tags & Meta Attributes",
    description:
      "Document head anatomy: viewport, charset, SEO meta tags, OpenGraph previews, and favicon links.",
    durationMinutes: 16,
    videoFilename: "0021_15_Html_Head_Tags - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Configure mobile responsiveness with the viewport meta tag",
      "Optimize social sharing with OpenGraph (og:title, og:image)",
      "Add favicons and preconnect fonts for high web performance",
    ],
    codeExample: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IT Beginner | Full-Stack Platform</title>
  <meta name="description" content="Learn web development from scratch.">
  <meta property="og:title" content="IT Beginner Course">
  <meta property="og:image" content="/images/preview.jpg">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
</head>`,
    keyTakeaways: [
      '<meta name="viewport" content="width=device-width, initial-scale=1.0"> is mandatory for mobile rendering.',
      "Good meta tags generate rich preview cards when shared on Twitter, LinkedIn, and Slack.",
      "Preconnecting to Google Fonts speeds up custom font loading noticeably.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Head tags configured for optimal mobile responsiveness and SEO.");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Everything inside the head element provides metadata to browsers and search engine crawlers.",
      },
      {
        timeSeconds: 80,
        text: "Without the viewport meta tag, mobile phones simulate a wide desktop screen and zoom out.",
      },
    ],
  },
  {
    id: 22,
    chapterId: 3,
    orderIndex: 16,
    title: "Building a Complete Website with HTML, CSS & JS",
    description:
      "Combine all Chapter 3 concepts to build an interactive, responsive project with DOM manipulation.",
    durationMinutes: 38,
    videoFilename: "0022_16_Website_With_Html_Css_Js - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Select DOM elements with document.querySelector() and getElementById()",
      "Attach event listeners for clicks, inputs, and form submissions",
      "Dynamically update classes, styles, and innerHTML in real time",
    ],
    codeExample: `// Select elements
const counterBtn = document.getElementById("clickBtn");
const countDisplay = document.getElementById("countVal");

let clicks = 0;

// Add event listener
counterBtn.addEventListener("click", () => {
  clicks += 1;
  countDisplay.textContent = clicks;
  if (clicks >= 10) {
    countDisplay.classList.add("text-success");
  }
});`,
    keyTakeaways: [
      "The DOM (Document Object Model) is the browser interface representing the document tree as JS objects.",
      'Use addEventListener("click", handler) instead of inline HTML onclick attributes.',
      "Updating classList.add/toggle is cleaner and faster than modifying inline element.style.",
    ],
    interactiveCode: {
      initialCode: `let score = 0;
const clickMe = () => {
  score += 10;
  console.log("Current Score:", score);
};
clickMe();
clickMe();`,
      hint: "Run to see simulated event clicks!",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Congratulations on reaching the capstone lesson of Chapter 3.",
      },
      {
        timeSeconds: 150,
        text: "Here we wire up user interaction: clicking a button fires a JavaScript callback that updates the HTML.",
      },
    ],
  },
  {
    id: 23,
    chapterId: 4,
    orderIndex: 1,
    title: "Chapter Introduction: Frontend Development & Tools",
    description:
      "Welcome to modern frontend workflows: package managers, open source, libraries, and command lines.",
    durationMinutes: 12,
    videoFilename: "0023_1_Chapter_Intro - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand why modern web apps rely on modular dependencies and build tools",
      "Preview the Teamable demo app we will construct in Chapter 4",
      "Get comfortable with terminal workflows",
    ],
    codeExample:
      '// Modern frontend project setup\nconsole.log("Chapter 4: Modern Tooling & Open Source Ecosystem");\nconst tools = ["Node.js", "NPM", "Vite", "ESLint", "Git"];\ntools.forEach(tool => console.log(`Installed: ${tool}`));',
    keyTakeaways: [
      "Modern web apps use build tools for bundling, transpiling, and hot reloading.",
      "Package managers make thousands of high-quality open source libraries available in seconds.",
      "Command line proficiency will 10x your developer velocity.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Ready to explore NPM and modern JavaScript frameworks!");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Welcome to Chapter 4. Here we transition from basic script files to professional developer tooling.",
      },
    ],
  },
  {
    id: 24,
    chapterId: 4,
    orderIndex: 2,
    title: "Develop Teamable Demo App with HTML, CSS & JS",
    description:
      "Construct a responsive team collaboration app featuring member cards, filtering, and role badges.",
    durationMinutes: 35,
    videoFilename: "0024_2_Develop_Teamable_Demo_App_With_Html_Css_and_Js_By_@iAzazelOfc.mp4",
    learningObjectives: [
      "Build a modular component layout with CSS Grid and Flexbox",
      "Filter and render dynamic user arrays using JavaScript",
      "Implement real-time search inputs",
    ],
    codeExample: `const team = [
  { name: "Alex Chen", role: "Frontend Lead", avatar: "👨‍💻" },
  { name: "Elena Rostova", role: "UI Designer", avatar: "🎨" },
  { name: "Marcus Vance", role: "Backend Architect", avatar: "⚙️" }
];

function renderTeam(members) {
  return members.map(m => \`
    <div class="member-card">
      <div class="avatar">\${m.avatar}</div>
      <h3>\${m.name}</h3>
      <span class="badge">\${m.role}</span>
    </div>
  \`).join("");
}
console.log(renderTeam(team));`,
    keyTakeaways: [
      "Template strings make generating HTML markup from JavaScript objects clean and readable.",
      "Separating raw state (data) from the render function is the foundation of modern frameworks.",
      "CSS Grid is ideal for 2-dimensional card grid layouts.",
    ],
    interactiveCode: {
      initialCode:
        "const count = 3;\nconsole.log(`Rendering ${count} active team members on the team board.`);",
      hint: "Run to see simulated rendering.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "In this project lesson, we build Teamable: a real-world team roster dashboard.",
      },
      {
        timeSeconds: 180,
        text: "Watch how we take an array of JavaScript objects and project them into the DOM as formatted cards.",
      },
    ],
  },
  {
    id: 25,
    chapterId: 4,
    orderIndex: 3,
    title: "JavaScript Frameworks Overview",
    description:
      "Compare React, Vue, Angular, and Svelte: component architecture, virtual DOM, and reactive state.",
    durationMinutes: 22,
    videoFilename: "0025_3_Js_Frameworks - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand why frameworks were invented to manage complex application state",
      "Compare React (JSX & Hooks) vs Vue (Templates & Reactivity) vs Angular",
      "Learn the component-driven paradigm",
    ],
    codeExample: `const frameworkEcosystem = {
  React: "Library by Meta, JSX, widespread enterprise adoption",
  Vue: "Progressive framework by Evan You, gentle learning curve, reactive state",
  Angular: "Full-fledged platform by Google, TypeScript native, built-in routing",
  Svelte: "Compiler-based, no virtual DOM, minimal runtime"
};
console.table(frameworkEcosystem);`,
    keyTakeaways: [
      "Vanilla JS becomes tedious and error-prone when syncing complex state with the DOM.",
      "Frameworks allow declarative UI: UI = f(state).",
      "Vue is ideal for beginners due to its clear separation of template, script, and style.",
    ],
    interactiveCode: {
      initialCode: `const preferred = "Vue.js";
console.log("We will master " + preferred + " in Chapter 5!");`,
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Why did frontend engineering evolve from jQuery to modern frameworks like React and Vue?",
      },
      {
        timeSeconds: 120,
        text: "Because managing hundreds of manual DOM updates leads to out-of-sync UI states.",
      },
    ],
  },
  {
    id: 26,
    chapterId: 4,
    orderIndex: 4,
    title: "Maintaining JS Framework Projects",
    description:
      "Project structure, folder organization, linting with ESLint, code formatting with Prettier, and git hygiene.",
    durationMinutes: 18,
    videoFilename: "0026_4_Maintaining_Js_Frameworks - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Adopt professional directory structures (src/components, src/lib, src/pages)",
      "Automate code consistency with ESLint and Prettier",
      "Write clean, readable commits with conventional commit messages",
    ],
    codeExample: `// Clean project structure
/*
src/
  components/    # Reusable UI elements (Navbar, Button, Card)
  pages/         # Route views (Dashboard, Courses, Lesson)
  types/         # TypeScript definitions
  data/          # Mock data or static resources
  context/       # Global state management
*/
console.log("Project architecture configured cleanly.");`,
    keyTakeaways: [
      "Consistent project structure allows team members to find files instantly.",
      "ESLint catches subtle bugs before code ever runs in production.",
      "Small, focused pull requests make code reviews painless.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Linting checks: PASSED (0 errors, 0 warnings)");',
      hint: "Run to simulate automated lint check.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Writing code is only 20% of engineering; 80% is reading, maintaining, and refactoring it.",
      },
    ],
  },
  {
    id: 27,
    chapterId: 4,
    orderIndex: 5,
    title: "Open Source Explained",
    description: "Open source software, licensing (MIT, Apache, GPL), GitHub repositories, and contributing.",
    durationMinutes: 16,
    videoFilename: "0027_5_Open_Source_Explained - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand what open source software (OSS) means and why it drives the tech industry",
      "Learn about software licenses: MIT, Apache 2.0, and GNU GPL",
      "Discover how developers collaborate globally on GitHub",
    ],
    codeExample: `// MIT License grants anyone free permission to use, modify, and distribute
const openSourceRepo = {
  name: "it-beginner-website",
  license: "MIT",
  public: true,
  canContribute: true
};
console.log("Repository status:", openSourceRepo);`,
    keyTakeaways: [
      "Open source code is publicly accessible and auditable by anyone in the world.",
      "The MIT license is the most popular permissive license for web development.",
      "Contributing to open source builds your professional developer portfolio.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Open source powers over 90% of modern software infrastructure.");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Almost everything we use in web development — Linux, Node, React, Vue, Python — is open source.",
      },
    ],
  },
  {
    id: 28,
    chapterId: 4,
    orderIndex: 6,
    title: "Libraries Explained",
    description:
      "What are libraries, how they differ from frameworks (Inversion of Control), and when to use them.",
    durationMinutes: 18,
    videoFilename: "0028_6_Libraries_Explained - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Differentiate between libraries (you call the code) and frameworks (framework calls your code)",
      "Evaluate library health: download metrics, open issues, and maintenance cadence",
      "Avoid dependency bloat by using native browser APIs when appropriate",
    ],
    codeExample: `// Library vs Framework:
// Library: You are in control (e.g. date-fns, lodash, lucide-react)
// Framework: Framework is in control (e.g. Next.js, Angular, Vue Router)

console.log("Control Flow: You call library functions when you need them.");`,
    keyTakeaways: [
      "Inversion of control is the key architectural difference between libraries and frameworks.",
      "Never reinvent complex algorithms like cryptographic hashing or date formatting from scratch.",
      "Always check bundle size before adding a new dependency.",
    ],
    interactiveCode: {
      initialCode: `const library = "canvas-confetti";
console.log("Using library: " + library + " for celebration effects!");`,
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Do not reinvent the wheel: libraries allow you to stand on the shoulders of giants.",
      },
    ],
  },
  {
    id: 29,
    chapterId: 4,
    orderIndex: 7,
    title: "NPM Registry",
    description: "Explore npmjs.com, package discovery, package.json dependencies, and npm audit.",
    durationMinutes: 20,
    videoFilename: "0029_7_Npm_Registry - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Search and evaluate packages on npmjs.com",
      "Understand dependencies vs devDependencies in package.json",
      "Scan for vulnerabilities using npm audit",
    ],
    codeExample: `// package.json dependencies excerpt
{
  "name": "my-app",
  "dependencies": {
    "react": "^19.2.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.570.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "vite": "^7.0.0"
  }
}`,
    keyTakeaways: [
      "The NPM registry hosts over 2 million open-source JavaScript packages.",
      "devDependencies are only needed during local development/build time (e.g. TypeScript, linters).",
      "package-lock.json locks exact dependency versions across all team members.",
    ],
    interactiveCode: {
      initialCode: 'console.log("NPM Registry: Over 2 million packages available!");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "NPM is both a global public registry and a command-line tool installed with Node.js.",
      },
    ],
  },
  {
    id: 30,
    chapterId: 4,
    orderIndex: 8,
    title: "Versioning in Software Development (SemVer)",
    description:
      "Semantic Versioning rules: MAJOR.MINOR.PATCH, caret (^) vs tilde (~), and breaking changes.",
    durationMinutes: 18,
    videoFilename: "0030_8_Versioning_in_Software_Development_Explained_By_@iAzazelOfc.mp4",
    learningObjectives: [
      "Decode SemVer format: MAJOR.MINOR.PATCH (e.g., 2.4.1)",
      "Understand when breaking changes require a MAJOR bump",
      "Interpret npm version ranges (^ allows minor/patch, ~ allows patch only)",
    ],
    codeExample: `// Semantic Versioning Explained:
// 2 . 4 . 1
// ^   ^   ^
// |   |   +-- PATCH: Backward-compatible bug fixes
// |   +------ MINOR: Backward-compatible new features
// +---------- MAJOR: Incompatible, breaking API changes

const semver = { major: 2, minor: 4, patch: 1 };
console.log(\`Current release: v\${semver.major}.\${semver.minor}.\${semver.patch}\`);`,
    keyTakeaways: [
      "MAJOR: Breaks existing code; requires migration.",
      "MINOR: Adds new features safely without breaking existing code.",
      "PATCH: Small bug fixes and security patches.",
      "^1.2.3 will update to 1.3.0 but will NOT update to 2.0.0.",
    ],
    interactiveCode: {
      initialCode: `const oldVer = "1.0.0";
const newVer = "2.0.0"; // Breaking API change
console.log("Version bump from " + oldVer + " to " + newVer + " indicates breaking changes.");`,
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Semantic versioning gives developers a universal agreement on how software changes over time.",
      },
    ],
  },
  {
    id: 31,
    chapterId: 4,
    orderIndex: 9,
    title: "How to Use Libraries in JS Applications",
    description: "Importing modules (ESM import vs CommonJS require), bundling, and tree-shaking.",
    durationMinutes: 22,
    videoFilename: "0031_9_How_to_Use_Libraries_in_Js_Application_By_@iAzazelOfc_🔥.mp4",
    learningObjectives: [
      "Import named and default exports with modern ES Modules syntax",
      "Understand how bundlers like Vite resolve node_modules",
      "Leverage tree-shaking to keep production bundle sizes tiny",
    ],
    codeExample: `// Modern ES Module imports
import confetti from 'canvas-confetti';
import { Play, Pause, Bookmark } from 'lucide-react';

function celebrateCompletion() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
console.log("Libraries imported cleanly via ES Modules.");`,
    keyTakeaways: [
      "ESM (import/export) is the standardized module system supported natively in modern JS.",
      'Named imports (import { A } from "lib") allow bundlers to drop unused exports (tree shaking).',
      "Never modify files inside node_modules directly.",
    ],
    interactiveCode: {
      initialCode: `console.log("ES Modules: import { feature } from 'package';");`,
      hint: "Run to test.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Let us see how third-party code is integrated into your application code cleanly.",
      },
    ],
  },
  {
    id: 32,
    chapterId: 4,
    orderIndex: 10,
    title: "NPM CLI Essential Commands",
    description: "Master npm init, npm install, npm run build, npm test, and package scripts.",
    durationMinutes: 20,
    videoFilename: "0032_10_Npm_Cli - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Initialize projects with npm init -y",
      "Install dependencies with npm install <pkg> and npm i -D <devPkg>",
      "Execute defined scripts using npm run <scriptName>",
    ],
    codeExample: `# Common NPM Commands Cheat Sheet:
npm init -y                  # Scaffold package.json
npm install react            # Install production dependency
npm install -D typescript    # Install development dependency
npm run dev                  # Start local Vite development server
npm run build                # Produce optimized production bundle
npm update                   # Update dependencies within semver constraints`,
    keyTakeaways: [
      "npm install (without arguments) installs all dependencies listed in package.json.",
      'npm run <script> looks up commands inside the "scripts" block of package.json.',
      "npx executes package binaries without installing them globally.",
    ],
    interactiveCode: {
      initialCode: 'console.log("NPM commands: init, install, run dev, run build, test");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "The NPM CLI is your primary steering wheel for Node.js based development.",
      },
    ],
  },
  {
    id: 33,
    chapterId: 4,
    orderIndex: 11,
    title: "Command Line & Operating System Basics",
    description: "Terminal navigation: pwd, cd, ls, mkdir, rm, touch, and environment variables.",
    durationMinutes: 24,
    videoFilename: "0033_11_Command_Line_Interface_Operating_System_Basics_Explained.mp4",
    learningObjectives: [
      "Navigate file systems using pwd, cd, and ls / dir",
      "Create and delete files and directories safely (mkdir, touch, rm -rf)",
      "Understand paths: absolute (/Users/...) vs relative (./src/App.tsx)",
    ],
    codeExample: `# Essential Terminal Commands:
pwd                          # Print working directory
ls -la                       # List all files including hidden dotfiles
cd ..                        # Move up one directory level
mkdir my-new-project         # Create directory
touch index.html             # Create empty file
cat package.json             # Display file content`,
    keyTakeaways: [
      ". represents current directory; .. represents parent directory.",
      "Tab key provides automatic command and file path completion.",
      "Ctrl + C cancels any running command in the terminal.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Terminal ready: bash / zsh / PowerShell");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Do not be intimidated by the black terminal screen; it is simply a fast text interface to your operating system.",
      },
    ],
  },
  {
    id: 34,
    chapterId: 4,
    orderIndex: 12,
    title: "Install NPM on macOS",
    description: "Step-by-step Node.js and NPM setup on macOS using Node Version Manager (NVM) and Homebrew.",
    durationMinutes: 15,
    videoFilename: "0034_12_Install_Npm_on_Macos - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Install Homebrew and Node Version Manager (NVM) on macOS",
      "Install the latest LTS (Long Term Support) release of Node.js",
      "Verify installation with node -v and npm -v in Terminal",
    ],
    codeExample: `# macOS Setup Walkthrough
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install --lts
nvm use --lts
node -v   # Should output v20+ or v22+
npm -v    # Should output v10+`,
    keyTakeaways: [
      "Always install Node LTS (Long Term Support) for maximum stability and ecosystem compatibility.",
      "Using NVM avoids permission issues with global npm packages.",
      "Verify both node and npm output valid version numbers.",
    ],
    interactiveCode: {
      initialCode: 'console.log("macOS environment: Node LTS and NPM verified.");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "In this video, I walk you through installing Node.js cleanly on Apple macOS.",
      },
    ],
  },
  {
    id: 35,
    chapterId: 4,
    orderIndex: 13,
    title: "Install NPM on Windows",
    description:
      "Step-by-step Node.js and NPM setup on Windows 11/10 via official installer and nvm-windows.",
    durationMinutes: 16,
    videoFilename: "0035_13_Install_Npm_on_Windows - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Download and run the official Windows Node.js LTS MSI installer",
      "Configure Windows PATH environment variables automatically",
      "Verify installation in Windows Terminal or PowerShell",
    ],
    codeExample: `# Windows PowerShell verification
node --version
npm --version

# Test creating a test folder
mkdir test-node; cd test-node; npm init -y`,
    keyTakeaways: [
      'Ensure "Add to PATH" checkbox is checked during the installer wizard.',
      "Restart your terminal window after installing Node so the new PATH is loaded.",
      "Windows Terminal with PowerShell is the recommended terminal for Windows developers.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Windows environment: Node LTS and NPM ready in PowerShell.");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Here is the step-by-step installation guide for Windows users.",
      },
    ],
  },
  {
    id: 36,
    chapterId: 4,
    orderIndex: 14,
    title: "Install JS Libraries with NPM",
    description:
      "Hands-on practice installing third-party packages, importing them, and managing package-lock.json.",
    durationMinutes: 22,
    videoFilename: "0036_14_Install_Js_Libraries_With_Npm - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Install utility packages like dayjs or lodash-es",
      "Understand how node_modules stores installed code",
      "Ensure .gitignore excludes node_modules from git repositories",
    ],
    codeExample: `# Installing libraries
npm install dayjs

# Usage in your JavaScript file
import dayjs from 'dayjs';

const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
console.log("Formatted timestamp:", now);`,
    keyTakeaways: [
      "Never commit node_modules to Git; it can be recreated anytime with npm install.",
      'Always include "node_modules/" in your .gitignore file.',
      "package-lock.json guarantees that everyone on the team gets byte-for-byte identical packages.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Installed library successfully! Added to package.json.");',
      hint: "Run to simulate package installation.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Now let us put everything together and install real libraries from NPM into our project.",
      },
    ],
  },
  {
    id: 37,
    chapterId: 5,
    orderIndex: 1,
    title: "Chapter Introduction: Vue.js Framework",
    description:
      "Introduction to Vue.js: progressive adoption, Single File Components (.vue), and reactive data binding.",
    durationMinutes: 14,
    videoFilename: "0037_1_Chapter_Intro - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Understand what makes Vue.js the friendliest modern frontend framework",
      "Learn about Single File Components (template, script, and style in one file)",
      "Preview the interactive reactive applications we will build",
    ],
    codeExample: `<!-- Vue Single File Component Structure -->
<template>
  <div class="counter">
    <h2>{{ title }}</h2>
    <p>Current count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const title = 'Reactive Counter';
const count = ref(0);
const increment = () => count.value++;
<\/script>`,
    keyTakeaways: [
      "Vue allows progressive adoption from simple script tag CDN to full SPA architecture.",
      "Templates use HTML syntax with powerful reactive directives like v-if, v-for, and v-model.",
      "Reactivity means when JavaScript variables change, the DOM updates automatically.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Vue.js: Declarative rendering and reactive component state.");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Welcome to Chapter 5: Vue.js Framework & Single Page Applications.",
      },
      {
        timeSeconds: 100,
        text: "Vue solves the problem of manual DOM updates by binding variables directly to templates.",
      },
    ],
  },
  {
    id: 38,
    chapterId: 5,
    orderIndex: 2,
    title: "Vue.js Tutorial Part 1: Core Concepts & Directives",
    description:
      "Interpolation ({{ }}), directives (v-bind, v-model, v-if, v-else, v-for), and event handling (@click).",
    durationMinutes: 30,
    videoFilename: "0038_2_Vuejs_Tutorial_Part_1 - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Bind dynamic attributes with v-bind (:href, :src, :class)",
      "Create two-way form bindings with v-model",
      "Render conditional elements with v-if / v-else and lists with v-for",
    ],
    codeExample: `<!-- Vue Directives in Action -->
<input v-model="searchQuery" placeholder="Search lessons..." />

<p v-if="searchQuery">Showing results for: {{ searchQuery }}</p>
<p v-else>Type to search the course curriculum.</p>

<ul>
  <li v-for="lesson in filteredLessons" :key="lesson.id">
    {{ lesson.orderIndex }}. {{ lesson.title }}
  </li>
</ul>`,
    keyTakeaways: [
      ":attr is the shorthand for v-bind:attr.",
      "@event is the shorthand for v-on:event (e.g. @click, @submit.prevent).",
      "Always provide a unique :key when using v-for to optimize DOM list reconciliation.",
    ],
    interactiveCode: {
      initialCode: `const directive = "v-model";
console.log(directive + " creates seamless two-way data binding between input and state!");`,
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "In Part 1 of our Vue tutorial, we explore directives that breathe life into HTML.",
      },
      {
        timeSeconds: 140,
        text: "Notice how v-model instantly syncs whatever the user types into your JavaScript variable.",
      },
    ],
  },
  {
    id: 39,
    chapterId: 5,
    orderIndex: 3,
    title: "Vue.js Tutorial Part 2: Reactive State & Computed Properties",
    description: "Composition API (ref, reactive), computed properties, watch, and component props.",
    durationMinutes: 32,
    videoFilename: "0039_3_Vuejs_Tutorial_Part_2 - By @iAzazelOfc 🔥.mp4",
    learningObjectives: [
      "Manage reactive state with ref() and reactive()",
      "Derive cached calculations using computed()",
      "Pass data down via props and emit events up to parent components",
    ],
    codeExample: `import { ref, computed } from 'vue';

const cart = ref([
  { id: 1, name: "Web Dev Cheatsheet", price: 15 },
  { id: 2, name: "Vue Certification Voucher", price: 45 }
]);

// Computed property is cached until cart changes
const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price, 0);
});

console.log("Cart Total: $" + totalPrice.value);`,
    keyTakeaways: [
      "ref() wraps primitive values in a reactive object with a .value property.",
      "computed() values are cached and only re-evaluate when their dependencies change.",
      "Unidirectional data flow: props down, events up.",
    ],
    interactiveCode: {
      initialCode: `const items = [10, 20, 30];
const total = items.reduce((a, b) => a + b, 0);
console.log("Computed sum:", total);`,
      hint: "Run to test computed logic.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Let us dive deeper into Vue reactive state and computed properties.",
      },
      {
        timeSeconds: 120,
        text: "Computed properties give you blazing performance because they do not re-run unless their source data updates.",
      },
    ],
  },
  {
    id: 40,
    chapterId: 5,
    orderIndex: 4,
    title: "Implement Frontend with HTML, CSS & Vue.js Part 1",
    description:
      "Scaffold a real-world single page app with Vue: component hierarchy, navigation, and reactive data store.",
    durationMinutes: 36,
    videoFilename: "0040_4_Implement_Frontend_With_Html_Css_Vuejs_Part_1_By_@iAzazelOfc.mp4",
    learningObjectives: [
      "Break a full UI mockup down into reusable Vue components",
      "Pass props between parent and child components",
      "Style components cleanly with scoped CSS",
    ],
    codeExample: `<template>
  <div class="dashboard-layout">
    <Sidebar :activeTab="currentTab" @selectTab="changeTab" />
    <main class="content">
      <LessonCard v-for="l in lessons" :key="l.id" :lesson="l" />
    </main>
  </div>
</template>

<style scoped>
/* Scoped styles only affect this component */
.dashboard-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}
</style>`,
    keyTakeaways: [
      "<style scoped> prevents CSS class name collisions across your application.",
      "Breaking your app into small components makes it modular and easily testable.",
      "Keep state as close as possible to the components that need it.",
    ],
    interactiveCode: {
      initialCode: 'console.log("Scaffolding Vue components: App -> Sidebar + MainContent");',
      hint: "Run to verify.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "In Part 1 of this hands-on project, we construct the component architecture.",
      },
    ],
  },
  {
    id: 41,
    chapterId: 5,
    orderIndex: 5,
    title: "Implement Frontend with HTML, CSS & Vue.js Part 2",
    description:
      "Complete the production-grade frontend UI: search filtering, responsive mobile drawer, and animations.",
    durationMinutes: 38,
    videoFilename: "0041_5_Implement_Frontend_With_Html_Css_Vuejs_Part_2_By_@iAzazelOfc.mp4",
    learningObjectives: [
      "Implement real-time search and multi-criteria filters with Vue computed properties",
      "Add smooth CSS transitions and enter/leave animations with <Transition>",
      "Finalize responsive styles for mobile, tablet, and desktop",
    ],
    codeExample: `<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
      <div class="modal-card" @click.stop>
        <h3>Interactive Modal</h3>
        <p>Smooth transitions with Vue and CSS!</p>
      </div>
    </div>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>`,
    keyTakeaways: [
      "Vue <Transition> wrapper automates adding and removing CSS animation classes.",
      "Event modifiers like @click.stop prevent event bubbling up the DOM tree.",
      "Congratulations on completing the Vue.js curriculum!",
    ],
    interactiveCode: {
      initialCode: 'console.log("Vue.js Frontend implementation 100% COMPLETE!");',
      hint: "Run to celebrate!",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "In this final lesson of Chapter 5, we polish our application with smooth transitions and responsive layouts.",
      },
    ],
  },
  {
    id: 42,
    chapterId: 6,
    orderIndex: 1,
    title: "Frontend & Backend Communication Explained",
    description:
      "Deep dive into HTTP methods, JSON data exchange, REST APIs, client-server architecture, and async fetch.",
    durationMinutes: 42,
    videoFilename: "0042_1_Frontend_Backend_Communication_Explained_By_@iAzazelOfc_🔥.mp4",
    learningObjectives: [
      "Master the client-server architecture and HTTP request/response cycles",
      "Understand HTTP verbs: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)",
      "Exchange JSON payloads using the native fetch() API and async/await",
      "Understand HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error",
    ],
    codeExample: `// Fetching data from a REST API with async/await
async function loadCourseCurriculum() {
  try {
    const response = await fetch('/api/curriculum', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log("Received curriculum data:", data);
    return data;
  } catch (error) {
    console.error("API communication failed:", error.message);
  }
}

// Submitting new data via POST
async function submitNote(lessonId, content) {
  const res = await fetch(\`/api/notes/\${lessonId}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, timestamp: 120 })
  });
  return await res.json();
}`,
    keyTakeaways: [
      "REST (Representational State Transfer) organizes server resources around standard URLs and HTTP methods.",
      "JSON (JavaScript Object Notation) is the universal data format for web communication.",
      "Always handle network errors with try/catch blocks to prevent unhandled promise rejections.",
      "CORS (Cross-Origin Resource Sharing) protects users by preventing unauthorized cross-domain browser requests.",
    ],
    interactiveCode: {
      initialCode: `// Simulated API Call
const payload = { lessonId: 42, status: "completed" };
console.log("Dispatching POST request with payload:", JSON.stringify(payload));
console.log("Response: 200 OK - Course Completed!");`,
      hint: "Run to test API communication simulation.",
    },
    transcript: [
      {
        timeSeconds: 0,
        text: "Welcome to the capstone lecture: Frontend & Backend Communication.",
      },
      {
        timeSeconds: 120,
        text: "Modern full-stack web applications separate the client interface from the backend database server.",
      },
      {
        timeSeconds: 240,
        text: "We send structured HTTP requests with headers and JSON bodies, and receive responses with status codes.",
      },
      {
        timeSeconds: 400,
        text: "With this foundation, you now understand the complete architecture of modern web software!",
      },
    ],
  },
];
