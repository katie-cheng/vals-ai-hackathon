import { CHAPTERS } from "../data/chapters";
import * as React from "react";
import { LESSONS } from "../data/lessons";
import { QUIZ_QUESTIONS } from "../data/quizzes";
import { PLAYGROUND_TEMPLATES } from "../data/playground";

const CourseContext = React.createContext(undefined);

const DEFAULT_USER = {
  id: 1,
  username: "alexchen",
  email: "alex.chen@itbeginner.com",
  fullName: "Alex Chen",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "student",
  streakDays: 5,
  lastActiveDate: "2026-11-06",
  joinedDate: "2026-10-18",
};

const INITIAL_DISCUSSIONS = [
  {
    id: "disc-1",
    lessonId: 1,
    userId: 2,
    userName: "David Miller",
    userRole: "student",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    content: "Is VS Code recommended for following along with this course, or should I use WebStorm?",
    upvotes: 4,
    hasUpvoted: false,
    createdAt: "2 days ago",
    replies: [
      {
        id: "reply-1",
        userId: 99,
        userName: "Course Instructor (AjinLab)",
        userRole: "admin",
        userAvatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        content:
          "Yes! Visual Studio Code (VS Code) is free, cross-platform, and ideal for this course. Install the Live Server extension for easy local testing.",
        createdAt: "1 day ago",
      },
    ],
  },
  {
    id: "disc-2",
    lessonId: 10,
    userId: 3,
    userName: "Samantha Ray",
    userRole: "student",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    content: "When should I use const instead of let in JavaScript? Is there a performance difference?",
    upvotes: 7,
    hasUpvoted: true,
    createdAt: "3 days ago",
    replies: [
      {
        id: "reply-2",
        userId: 99,
        userName: "Course Instructor (AjinLab)",
        userRole: "admin",
        userAvatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        content:
          'Best practice is to use "const" by default unless you know the variable value will be reassigned, then use "let". It makes your code predictable and prevents accidental reassignment bugs. Never use "var" in modern JS.',
        createdAt: "2 days ago",
      },
    ],
  },
  {
    id: "disc-3",
    lessonId: 20,
    userId: 4,
    userName: "Kenji Sato",
    userRole: "student",
    userAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    content: "What is the most reliable way to center a div horizontally and vertically in modern CSS?",
    upvotes: 9,
    hasUpvoted: false,
    createdAt: "4 days ago",
    replies: [
      {
        id: "reply-3",
        userId: 99,
        userName: "Course Instructor (AjinLab)",
        userRole: "admin",
        userAvatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        content:
          "Use Flexbox! Set display: flex; justify-content: center; align-items: center; on the parent container. It works across 100% of modern browsers.",
        createdAt: "3 days ago",
      },
    ],
  },
];

export const CourseProvider = ({ children }) => {
  const [d, f] = React.useState(() => {
    const g = localStorage.getItem("itb_user");
    return g ? JSON.parse(g) : DEFAULT_USER;
  });
  const [i, p] = React.useState(() => {
    const g = localStorage.getItem("itb_progress");
    return g
      ? JSON.parse(g)
      : {
          1: {
            lessonId: 1,
            status: "completed",
            progressPercent: 100,
            lastPositionSeconds: 720,
            completedAt: "2026-11-04",
          },
          2: {
            lessonId: 2,
            status: "completed",
            progressPercent: 100,
            lastPositionSeconds: 900,
            completedAt: "2026-11-05",
          },
          3: {
            lessonId: 3,
            status: "completed",
            progressPercent: 100,
            lastPositionSeconds: 600,
            completedAt: "2026-11-05",
          },
          4: {
            lessonId: 4,
            status: "in_progress",
            progressPercent: 45,
            lastPositionSeconds: 480,
          },
        };
  });
  const [h, v] = React.useState(() => {
    const g = localStorage.getItem("itb_notes");
    return g
      ? JSON.parse(g)
      : [
          {
            id: "note-1",
            lessonId: 1,
            timestampSeconds: 120,
            content: "Remember: Consistency and typing code out by hand is 10x better than passive viewing.",
            createdAt: "2026-11-04 14:30",
          },
          {
            id: "note-2",
            lessonId: 4,
            timestampSeconds: 180,
            content: "SDLC: Requirements -> System Architecture -> Coding -> QA Testing -> Deployment.",
            createdAt: "2026-11-05 10:15",
          },
        ];
  });
  const [T, S] = React.useState(() => {
    const g = localStorage.getItem("itb_bookmarks");
    return g ? JSON.parse(g) : [10, 20, 22];
  });
  const [M, b] = React.useState(() => {
    const g = localStorage.getItem("itb_discussions");
    return g ? JSON.parse(g) : INITIAL_DISCUSSIONS;
  });
  const [x, _] = React.useState(() => {
    const g = localStorage.getItem("itb_quiz_attempts");
    return g
      ? JSON.parse(g)
      : {
          1: {
            chapterId: 1,
            score: 3,
            totalQuestions: 3,
            percentage: 100,
            passed: true,
            attemptedAt: "2026-11-05",
            answers: {
              1: "B",
              2: "B",
              3: "B",
            },
          },
        };
  });
  const [R, U] = React.useState(() => {
    const g = localStorage.getItem("itb_certificates");
    return g
      ? JSON.parse(g)
      : [
          {
            id: "cert-ch1",
            certificateCode: "ITB-CH1-8291X",
            userId: 1,
            userName: "Alex Chen",
            chapterId: 1,
            chapterTitle: "Getting Started",
            certificateType: "chapter",
            issuedAt: "November 5, 2026",
            verificationUrl: "/certificate/ITB-CH1-8291X",
          },
        ];
  });
  const [V, k] = React.useState(() => {
    const g = localStorage.getItem("itb_snippets");
    return g ? JSON.parse(g) : PLAYGROUND_TEMPLATES;
  });
  const [F, $] = React.useState(() => {
    const g = localStorage.getItem("itb_last_lesson");
    return g ? parseInt(g, 10) : 4;
  });
  React.useEffect(() => {
    localStorage.setItem("itb_user", JSON.stringify(d));
  }, [d]);
  React.useEffect(() => {
    localStorage.setItem("itb_progress", JSON.stringify(i));
  }, [i]);
  React.useEffect(() => {
    localStorage.setItem("itb_notes", JSON.stringify(h));
  }, [h]);
  React.useEffect(() => {
    localStorage.setItem("itb_bookmarks", JSON.stringify(T));
  }, [T]);
  React.useEffect(() => {
    localStorage.setItem("itb_discussions", JSON.stringify(M));
  }, [M]);
  React.useEffect(() => {
    localStorage.setItem("itb_quiz_attempts", JSON.stringify(x));
  }, [x]);
  React.useEffect(() => {
    localStorage.setItem("itb_certificates", JSON.stringify(R));
  }, [R]);
  React.useEffect(() => {
    localStorage.setItem("itb_snippets", JSON.stringify(V));
  }, [V]);
  React.useEffect(() => {
    localStorage.setItem("itb_last_lesson", F.toString());
  }, [F]);
  const te = Object.values(i).filter((object: any) => object.status === "completed").length;
  const me = Math.round((te / LESSONS.length) * 100);
  const ue = (g, Y, G, m) => {
    $(g);
    p((z) => {
      const q = z[g] || {
        lessonId: g,
        status: "not_started",
        progressPercent: 0,
        lastPositionSeconds: 0,
      };
      const B = m || (q.status === "completed" || Y >= 90 ? "completed" : Y > 5 ? "in_progress" : q.status);
      return {
        ...z,
        [g]: {
          ...q,
          progressPercent: Math.max(q.progressPercent, Y),
          lastPositionSeconds: G,
          status: B,
          completedAt:
            B === "completed" && !q.completedAt ? new Date().toISOString().split("T")[0] : q.completedAt,
        },
      };
    });
  };
  const be = (g) => {
    S((Y) => (Y.includes(g) ? Y.filter((G) => G !== g) : [...Y, g]));
  };
  const ne = (g) => T.includes(g);
  const pe = (g, Y, G) => {
    const m = {
      id: `note-${Date.now()}`,
      lessonId: g,
      content: Y,
      timestampSeconds: G,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    v((z) => [m, ...z]);
  };
  const Be = (g) => {
    v((Y) => Y.filter((G) => G.id !== g));
  };
  const re = (g, Y) => {
    const G = {
      id: `disc-${Date.now()}`,
      lessonId: g,
      userId: d.id,
      userName: d.fullName,
      userRole: d.role,
      userAvatar: d.avatarUrl,
      content: Y,
      upvotes: 1,
      hasUpvoted: true,
      createdAt: "Just now",
      replies: [],
    };
    b((m) => [G, ...m]);
  };
  const Le = (g, Y) => {
    b((G) =>
      G.map((m) =>
        m.id === g
          ? {
              ...m,
              replies: [
                ...m.replies,
                {
                  id: `reply-${Date.now()}`,
                  userId: d.id,
                  userName: d.fullName,
                  userRole: d.role,
                  userAvatar: d.avatarUrl,
                  content: Y,
                  createdAt: "Just now",
                },
              ],
            }
          : m,
      ),
    );
  };
  const qe = (g) => {
    b((Y) =>
      Y.map((G) => {
        if (G.id === g) {
          const m = !G.hasUpvoted;
          return {
            ...G,
            hasUpvoted: m,
            upvotes: m ? G.upvotes + 1 : Math.max(0, G.upvotes - 1),
          };
        }
        return G;
      }),
    );
  };
  const Ye = (g, Y) => {
    const G = QUIZ_QUESTIONS.filter((question) => question.chapterId === g);
    let m = 0;
    G.forEach((W) => {
      if (Y[W.id] === W.correctOption) {
        m += 1;
      }
    });
    const z = G.length || 1;
    const q = Math.round((m / z) * 100);
    const B = q >= 66;
    const J = {
      chapterId: g,
      score: m,
      totalQuestions: z,
      percentage: q,
      passed: B,
      attemptedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      answers: Y,
    };
    _((W) => ({
      ...W,
      [g]: J,
    }));
    return J;
  };
  const it = (g, Y, G = "chapter") => {
    const m = R.find((J) => J.chapterId === g && J.certificateType === G);
    if (m) {
      return m;
    }
    const z = Math.random().toString(36).substring(2, 7).toUpperCase();
    const q = G === "course" ? `ITB-FULL-${z}` : `ITB-CH${g}-${z}`;
    const B = {
      id: `cert-${Date.now()}`,
      certificateCode: q,
      userId: d.id,
      userName: d.fullName,
      chapterId: g,
      chapterTitle: Y,
      certificateType: G,
      issuedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      verificationUrl: `/certificate/${q}`,
    };
    U((J) => [B, ...J]);
    return B;
  };
  const Ce = (g, Y, G, m, z, q) => {
    if (q) {
      const B = V.map((J) =>
        J.id === q
          ? {
              ...J,
              title: g,
              category: Y,
              htmlCode: G,
              cssCode: m,
              jsCode: z,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : J,
      );
      k(B);
      return B.find((J) => J.id === q);
    } else {
      const B = {
        id: `snip-${Date.now()}`,
        title: g,
        category: Y || "Custom Snippet",
        htmlCode: G,
        cssCode: m,
        jsCode: z,
        updatedAt: new Date().toISOString().split("T")[0],
        isPreset: false,
      };
      k((J) => [B, ...J]);
      return B;
    }
  };
  const X = (g) => {
    k((Y) => Y.filter((G) => G.id !== g));
  };
  const le = (g) => {
    f((Y) => ({
      ...Y,
      role: g,
      fullName: g === "admin" ? "Course Admin (AjinLab)" : "Alex Chen",
      email: g === "admin" ? "admin@itbeginner.com" : "alex.chen@itbeginner.com",
    }));
  };
  const oe = () => {
    p({});
    v([]);
    U([]);
    _({});
    localStorage.removeItem("itb_progress");
    localStorage.removeItem("itb_notes");
    localStorage.removeItem("itb_certificates");
    localStorage.removeItem("itb_quiz_attempts");
  };
  const Ee = (g) => {
    const Y = LESSONS.filter((lesson) => lesson.chapterId === g);
    if (!Y.length) {
      return 0;
    }
    const G = Y.filter((m) => i[m.id]?.status === "completed").length;
    return Math.round((G / Y.length) * 100);
  };
  const E = (g) => Ee(g) === 100;
  // Finishing every lesson of a chapter earns its certificate, as the certificates page says (passing the quiz is the other way).
  React.useEffect(() => {
    for (const chapter of CHAPTERS) {
      if (Ee(chapter.id) === 100) it(chapter.id, chapter.title, "chapter");
    }
  }, [i]);
  return (
    <CourseContext.Provider
      value={{
        currentUser: d,
        progress: i,
        notes: h,
        bookmarks: T,
        discussions: M,
        quizAttempts: x,
        certificates: R,
        snippets: V,
        lastResumeLessonId: F,
        totalCompletedCount: te,
        overallPercent: me,
        updateLessonProgress: ue,
        toggleBookmark: be,
        isBookmarked: ne,
        addNote: pe,
        deleteNote: Be,
        addDiscussion: re,
        addDiscussionReply: Le,
        upvoteDiscussion: qe,
        submitQuiz: Ye,
        claimCertificate: it,
        saveSnippet: Ce,
        deleteSnippet: X,
        switchUserRole: le,
        resetAllProgress: oe,
        getChapterProgressPercent: Ee,
        isChapterCompleted: E,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const c = React.useContext(CourseContext);
  if (!c) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return c;
};
