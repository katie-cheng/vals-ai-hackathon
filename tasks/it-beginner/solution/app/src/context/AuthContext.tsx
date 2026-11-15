import * as React from "react";

export type Role = "student" | "admin";
export type Account = { email: string; fullName: string; password: string; role: Role; joinedDate: string };
type AuthValue = {
  account: Account | null;
  accounts: Account[];
  signIn: (email: string, password: string) => string | null;
  register: (fields: { fullName: string; email: string; password: string }) => string | null;
  signOut: () => void;
  setRole: (email: string, role: Role) => void;
};

// The demo administrator from the repository README; there is no server, so accounts live in this browser.
export const DEMO_ADMIN = { email: "admin@itbeginner.com", password: "admin123" };
const SEED: Account[] = [{ ...DEMO_ADMIN, fullName: "Course Admin", role: "admin", joinedDate: "2026-10-01" }];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthContext = React.createContext<AuthValue | undefined>(undefined);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accounts, setAccounts] = React.useState<Account[]>(() => read("itb_accounts", SEED));
  const [session, setSession] = React.useState<string | null>(() => read("itb_session", null));

  React.useEffect(() => localStorage.setItem("itb_accounts", JSON.stringify(accounts)), [accounts]);
  React.useEffect(() => localStorage.setItem("itb_session", JSON.stringify(session)), [session]);

  const account = accounts.find((a) => a.email === session) ?? null;

  const signIn = (email: string, password: string) => {
    const match = accounts.find((a) => a.email === email.trim().toLowerCase());
    if (!match || match.password !== password) return "The email or password is incorrect.";
    setSession(match.email);
    return null;
  };

  const register = ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
    const address = email.trim().toLowerCase();
    if (!fullName.trim()) return "Enter your full name.";
    if (!EMAIL.test(address)) return "Enter a valid email address.";
    if (password.length < 8) return "Use at least 8 characters for the password.";
    if (accounts.some((a) => a.email === address)) return "An account with this email already exists. Sign in instead.";
    const joinedDate = new Date().toISOString().slice(0, 10);
    setAccounts((current) => [...current, { email: address, fullName: fullName.trim(), password, role: "student", joinedDate }]);
    setSession(address);
    return null;
  };

  const setRole = (email: string, role: Role) =>
    setAccounts((current) => current.map((a) => (a.email === email ? { ...a, role } : a)));

  return (
    <AuthContext.Provider value={{ account, accounts, signIn, register, signOut: () => setSession(null), setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = React.useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};
