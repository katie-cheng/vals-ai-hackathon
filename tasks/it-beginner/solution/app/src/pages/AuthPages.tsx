import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { DEMO_ADMIN, useAuth } from "../context/AuthContext";

const AuthLayout = ({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) => (
  <div className="container-page page">
    <div className="mx-auto max-w-md">
      <h1 className="page-title">{title}</h1>
      <p className="lead mt-2">{lead}</p>
      {children}
    </div>
  </div>
);

const Field = ({ id, label, ...input }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-ink-2">
      {label}
    </label>
    <input id={id} name={id} className="field mt-1.5" required {...input} />
  </div>
);

const useDestination = () => {
  const [params] = useSearchParams();
  const next = params.get("next");
  return next && next.startsWith("/") ? next : null;
};

export const LoginPage = () => {
  const { signIn, account, signOut } = useAuth();
  const navigate = useNavigate();
  const next = useDestination();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const problem = signIn(email, password);
    setError(problem);
    if (problem) return;
    const admin = email.trim().toLowerCase() === DEMO_ADMIN.email;
    navigate(next ?? (admin ? "/admin" : "/dashboard"));
  };

  if (account) {
    return (
      <AuthLayout title="You are signed in" lead={`Signed in as ${account.fullName} (${account.email}).`}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/dashboard" className="btn btn-primary">
            Go to your dashboard
          </Link>
          <button type="button" onClick={signOut} className="btn btn-secondary">
            Sign out
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign in" lead="Sign in to your IT Beginner account. Accounts and progress are saved in this browser.">
      <form onSubmit={submit} className="mt-8 space-y-5" noValidate={false}>
        <Field id="login-email" label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field id="login-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p role="alert" className="min-h-5 text-sm text-bad">
          {error}
        </p>
        <button type="submit" className="btn btn-primary w-full">
          Sign in
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-3">
        New to IT Beginner?{" "}
        <Link to={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="link">
          Create an account
        </Link>
      </p>
      <div className="surface mt-10 p-4 text-sm">
        <h2 className="font-semibold text-ink">Demo administrator account</h2>
        <p className="mt-1 text-ink-3">The account the platform ships with opens the admin control center.</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="text-ink-3">Email</dt>
          <dd className="break-all font-mono text-ink">{DEMO_ADMIN.email}</dd>
          <dt className="text-ink-3">Password</dt>
          <dd className="font-mono text-ink">{DEMO_ADMIN.password}</dd>
        </dl>
      </div>
    </AuthLayout>
  );
};

export const RegisterPage = () => {
  const { register, account } = useAuth();
  const navigate = useNavigate();
  const next = useDestination();
  const [fields, setFields] = React.useState({ fullName: "", email: "", password: "" });
  const [error, setError] = React.useState<string | null>(null);
  const set = (key: keyof typeof fields) => (event: React.ChangeEvent<HTMLInputElement>) => setFields({ ...fields, [key]: event.target.value });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const problem = register(fields);
    setError(problem);
    if (!problem) navigate(next ?? "/dashboard");
  };

  if (account) {
    return (
      <AuthLayout title="You are signed in" lead={`Signed in as ${account.fullName} (${account.email}). Sign out first to create another account.`}>
        <Link to="/dashboard" className="btn btn-primary mt-8">
          Go to your dashboard
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create an account" lead="Free for every learner. Your progress through the 42 lessons is saved in this browser.">
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field id="register-name" label="Full name" autoComplete="name" value={fields.fullName} onChange={set("fullName")} />
        <Field id="register-email" label="Email" type="email" autoComplete="email" value={fields.email} onChange={set("email")} />
        <Field id="register-password" label="Password" type="password" autoComplete="new-password" minLength={8} value={fields.password} onChange={set("password")} aria-describedby="password-hint" />
        <p id="password-hint" className="meta">
          At least 8 characters.
        </p>
        <p role="alert" className="min-h-5 text-sm text-bad">
          {error}
        </p>
        <button type="submit" className="btn btn-primary w-full">
          Create account
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-3">
        Already have an account?{" "}
        <Link to="/login" className="link">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
