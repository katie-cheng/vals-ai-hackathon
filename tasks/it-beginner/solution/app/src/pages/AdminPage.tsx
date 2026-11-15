import * as React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AdminPage = () => {
  const { account, accounts, setRole } = useAuth();
  const [query, setQuery] = React.useState("");

  if (!account || account.role !== "admin") {
    return (
      <div className="container-page page">
        <div className="max-w-xl">
          <h1 className="page-title">Admin control center</h1>
          <p className="lead mt-2">
            {account
              ? `${account.fullName} is a student account. Ask a course administrator for admin access.`
              : "Sign in with an administrator account to manage learners and roles."}
          </p>
          {!account && (
            <Link to="/login?next=/admin" className="btn btn-primary mt-8">
              Sign in
            </Link>
          )}
        </div>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const visible = accounts.filter((a) => a.fullName.toLowerCase().includes(q) || a.email.includes(q));
  const admins = accounts.filter((a) => a.role === "admin").length;

  return (
    <div className="container-page page">
      <h1 className="page-title">Admin control center</h1>
      <p className="lead mt-2">
        {accounts.length} {accounts.length === 1 ? "account" : "accounts"} registered in this browser: {accounts.length - admins}{" "}
        {accounts.length - admins === 1 ? "student" : "students"} and {admins} {admins === 1 ? "administrator" : "administrators"}.
      </p>

      <section className="mt-10" aria-labelledby="roster-title">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 id="roster-title" className="section-title">
            Registered users
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
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-3">
                {["User", "Role", "Joined"].map((heading) => (
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
              {visible.map((user) => (
                <tr key={user.email} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{user.fullName}</p>
                    <p className="meta">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{user.role === "admin" ? "Administrator" : "Student"}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-3">{user.joinedDate}</td>
                  <td className="px-4 py-3 text-right">
                    {user.email === account.email ? (
                      <span className="meta">You</span>
                    ) : (
                      <button type="button" onClick={() => setRole(user.email, user.role === "admin" ? "student" : "admin")} className="btn btn-secondary btn-sm">
                        Make {user.role === "admin" ? "student" : "administrator"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-ink-3">
                    No users match that filter.
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
