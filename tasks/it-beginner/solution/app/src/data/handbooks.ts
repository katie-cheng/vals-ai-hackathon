export const HANDBOOKS = [
  {
    id: "javascript",
    title: "JavaScript Fundamentals Handbook",
    chapterNumber: 3,
    category: "Programming Logic",
    summary: "The essential modern JavaScript syntax, variable scoping, array manipulation, and DOM methods.",
    subsections: [
      {
        heading: "Variables & Declarations (ES6+)",
        description: 'Modern JavaScript eliminates "var" in favor of block-scoped declarations.',
        codeSnippet: `// const: preferred for all variables that will not be reassigned
const course = "IT Beginner";
const maxScore = 100;

// let: used only when variable must be reassigned
let completedLessons = 0;
completedLessons += 1;

// Primitive Data Types
const name = "Alex";        // String
const streak = 7;           // Number
const isActive = true;      // Boolean
const empty = null;         // Null (explicit empty value)
let notSet;                 // Undefined`,
        tips: [
          "Default to const; change to let only when reassignment is needed.",
          "Never use var in modern codebases.",
        ],
      },
      {
        heading: "Strict Equality & Conditionals",
        description: "Always use triple equals (===) to prevent unexpected type coercion bugs.",
        codeSnippet: `// Strict equality checks value AND type
5 === 5;     // true
5 === "5";   // false (number vs string)
5 == "5";    // true (type coercion - avoid!)

// Logical operators
if (score >= 90 && attendance >= 80) {
  console.log("Certificate with Distinction");
} else if (score >= 70) {
  console.log("Passed Course");
} else {
  console.log("Review Lessons");
}`,
        tips: ["Use ternary operator (condition ? exprIfTrue : exprIfFalse) for inline assignments."],
      },
      {
        heading: "Essential Array Methods",
        description: "Functional array methods for transforming, filtering, and aggregating data.",
        codeSnippet: `const fruits = ["Apple", "Banana", "Cherry"];

fruits.push("Mango");   // Append to end
fruits.pop();           // Remove last item

// .map() - transform each item into a new array
const upper = fruits.map(f => f.toUpperCase());

// .filter() - return items matching condition
const bFruits = fruits.filter(f => f.startsWith("B"));

// .reduce() - calculate single aggregated value
const numbers = [10, 20, 30];
const sum = numbers.reduce((acc, curr) => acc + curr, 0);`,
      },
    ],
  },
  {
    id: "html-css",
    title: "HTML5 & CSS3 Reference",
    chapterNumber: 3,
    category: "Web Layout & Design",
    summary: "Semantic document outlines, CSS Box Model, and modern Flexbox layout axes.",
    subsections: [
      {
        heading: "Semantic Document Structure",
        description: "Semantic tags provide meaning, enhance accessibility, and improve SEO rankings.",
        codeSnippet: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic Page</title>
  </head>
  <body>
    <header><nav><!-- Navigation links --></nav></header>
    <main>
      <section>
        <article><h1>Main Article</h1></article>
      </section>
    </main>
    <footer><p>&copy; 2026 IT Beginner</p></footer>
  </body>
</html>`,
      },
      {
        heading: "Flexbox Layout Cheat Sheet",
        description: "Flexbox is the modern industry standard for one-dimensional layouts.",
        codeSnippet: `.container {
  display: flex;
  flex-direction: row;            /* row | column */
  justify-content: space-between; /* flex-start | center | space-between | space-around */
  align-items: center;            /* stretch | flex-start | center | flex-end */
  gap: 1.5rem;                    /* spacing between flex children */
  flex-wrap: wrap;                /* allow items to wrap to next line on mobile */
}`,
      },
    ],
  },
  {
    id: "agile-scrum",
    title: "Agile, Scrum & Jira Quick Reference",
    chapterNumber: 2,
    category: "Engineering Workflow",
    summary: "The 4 Agile values, Scrum ceremonies, story points, and Jira backlog grooming.",
    subsections: [
      {
        heading: "The 4 Core Agile Values",
        description: "From the Agile Manifesto (2001):",
        tips: [
          "Individuals and interactions over processes and tools",
          "Working software over comprehensive documentation",
          "Customer collaboration over contract negotiation",
          "Responding to change over following a rigid plan",
        ],
      },
      {
        heading: "Scrum Ceremonies (Sprint Cycle)",
        description: "Fixed-duration timeboxes that structure team communication:",
        tips: [
          "Sprint Planning: Team commits to sprint backlog items from product backlog.",
          "Daily Standup (15 min): What did I do yesterday? What will I do today? Any blockers?",
          "Sprint Review: Live demo of shippable increment to stakeholders.",
          "Sprint Retrospective: Team inspects what went well and what to improve next sprint.",
        ],
      },
    ],
  },
  {
    id: "cli-npm",
    title: "Command Line (CLI) & NPM Guide",
    chapterNumber: 4,
    category: "Developer Tooling",
    summary: "Essential terminal navigation, file manipulation, and NPM package commands.",
    subsections: [
      {
        heading: "Terminal Navigation",
        description: "Everyday commands for macOS, Linux, and Windows PowerShell:",
        codeSnippet: `pwd              # Print working directory (current path)
ls -la           # List all files and hidden configs
cd folderName    # Enter directory
cd ..            # Move up one level
mkdir my-app     # Create new directory
rm -rf temp      # Remove directory and all contents`,
      },
      {
        heading: "NPM Package Management",
        description: "Managing dependencies and project scripts:",
        codeSnippet: `npm init -y                  # Create default package.json
npm install <pkg>            # Install production dependency
npm install -D <pkg>         # Install devDependency (e.g. types, linters)
npm run dev                  # Start local Vite development server
npm run build                # Produce optimized production build
npm audit                    # Scan for dependency security vulnerabilities`,
      },
    ],
  },
];
