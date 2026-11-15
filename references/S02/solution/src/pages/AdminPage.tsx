import * as React from "react";
import { Search } from "lucide-react";
import { useCourse } from "../context/CourseContext";

const MOCK_STUDENTS = [
  {
    id: 1,
    fullName: "Alex Chen (You)",
    email: "alex.chen@itbeginner.com",
    role: "student",
    completedLessons: 3,
    quizzesPassed: 1,
    notesCount: 2,
    joinedDate: "2026-10-18",
  },
  {
    id: 2,
    fullName: "David Miller",
    email: "david.miller@gmail.com",
    role: "student",
    completedLessons: 18,
    quizzesPassed: 3,
    notesCount: 7,
    joinedDate: "2026-10-20",
  },
  {
    id: 3,
    fullName: "Samantha Ray",
    email: "samantha.ray@techmail.io",
    role: "student",
    completedLessons: 42,
    quizzesPassed: 6,
    notesCount: 19,
    joinedDate: "2026-10-15",
  },
  {
    id: 4,
    fullName: "Kenji Sato",
    email: "kenji.sato@yahoo.co.jp",
    role: "student",
    completedLessons: 24,
    quizzesPassed: 4,
    notesCount: 11,
    joinedDate: "2026-10-22",
  },
  {
    id: 5,
    fullName: "Elena Rostova",
    email: "elena.rostova@designlab.de",
    role: "student",
    completedLessons: 31,
    quizzesPassed: 5,
    notesCount: 14,
    joinedDate: "2026-10-19",
  },
  {
    id: 99,
    fullName: "Course Admin (AjinLab)",
    email: "admin@itbeginner.com",
    role: "admin",
    completedLessons: 42,
    quizzesPassed: 6,
    notesCount: 45,
    joinedDate: "2026-10-01",
  },
];

export const AdminPage = () => {
  const { currentUser, switchUserRole } = useCourse();
  const [students, setStudents] = React.useState(MOCK_STUDENTS);
  const [query, setQuery] = React.useState("");
  const isAdmin = currentUser.role === "admin";
  const toggleRole = (id: number) =>
    setStudents((current) =>
      current.map((student) => (student.id === id ? { ...student, role: student.role === "admin" ? "student" : "admin" } : student)),
    );
  const q = query.toLowerCase();
  const visible = students.filter((student) => student.fullName.toLowerCase().includes(q) || student.email.toLowerCase().includes(q));
  const learners = students.filter((student) => student.role === "student");
  const sum = (key: "completedLessons" | "quizzesPassed" | "notesCount") => students.reduce((total, student) => total + student[key], 0);

  return (
    <div className="container-page page">
      <h1 className="page-title">Admin control center</h1>
      <p className="lead mt-2">The enrolment roster for the IT Beginner platform: learning progress, quiz results and roles.</p>

      {!isAdmin && (
        <div className="surface mt-8 flex flex-wrap items-center justify-between gap-4 p-4" role="status">
          <p className="text-sm text-ink-2">You are in student view. Switch to admin view to change roles.</p>
          <button type="button" onClick={() => switchUserRole("admin")} className="btn btn-secondary">
            Switch to admin view
          </button>
        </div>
      )}

      <p className="mt-8 text-sm text-ink-2">
        {learners.length} students and {students.length - learners.length} {students.length - learners.length === 1 ? "admin" : "admins"} enrolled,
        with {sum("completedLessons")} lesson completions, {sum("quizzesPassed")} quizzes passed and {sum("notesCount")} notes between them.
      </p>

      <section className="mt-10" aria-labelledby="roster-title">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 id="roster-title" className="section-title">
            Enrolled students
          </h2>
          <div className="w-full sm:w-72">
            <label htmlFor="roster-filter" className="sr-only">
              Filter by name or email
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              <input
                id="roster-filter"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by name or email"
                className="field pl-9"
              />
            </div>
          </div>
        </div>
        <div className="surface relative mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-3">
                {["Student", "Role", "Lessons", "Quizzes", "Notes", "Joined"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-normal">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((student) => (
                <tr key={student.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{student.fullName}</p>
                    <p className="meta">{student.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${student.role === "admin" ? "badge-warn" : ""}`}>
                      {student.role === "admin" ? "Admin" : "Student"}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-2">{student.completedLessons} of 42</td>
                  <td className="px-4 py-3 tabular-nums text-ink-2">{student.quizzesPassed} of 6</td>
                  <td className="px-4 py-3 tabular-nums text-ink-2">{student.notesCount}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-3">{student.joinedDate}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleRole(student.id)}
                      disabled={!isAdmin}
                      title={isAdmin ? undefined : "Switch to admin view to change roles"}
                      className="btn btn-secondary btn-sm"
                    >
                      Make {student.role === "admin" ? "student" : "admin"}
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-ink-3">
                    No students match that filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
