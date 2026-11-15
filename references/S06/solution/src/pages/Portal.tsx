import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Clock3, Eye, EyeOff, LockKeyhole, LogOut, MapPin, Package, Plus, ShieldCheck, ShoppingBag, Trash2, UserRound } from "lucide-react";
import { Logo } from "../components/Layout";
import { OrderTracker } from "../components/OrderTracker";
import { EmptyState } from "../components/UI";
import { formatRand, useStore } from "../lib/store";

export default function PortalPage() {
  const { session, login, register, resetPassword, logout, notify } = useStore();
  const C = useNavigate();
  const [o, S] = React.useState("customer");
  const [t, m] = React.useState("login");
  const [g, w] = React.useState(false);
  const [d, N] = React.useState(false);
  const [h, i] = React.useState("");
  const [a, p] = React.useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const v = (l) => {
    S(l);
    m("login");
    i("");
  };
  const A = async (l) => {
    if ((l.preventDefault(), i(""), t === "register")) {
      if (!a.name.trim() || !/^[0-9+\s-]{9,15}$/.test(a.phone)) {
        i("Add your name and a valid mobile number.");
        return;
      }
      if (a.password.length < 8) {
        i("Use a password with at least 8 characters.");
        return;
      }
      if (a.password !== a.confirm) {
        i("Your passwords do not match.");
        return;
      }
    }
    if (t === "recover" && a.password.length < 8) {
      i("Your new password needs at least 8 characters.");
      return;
    }
    N(true);
    const e =
      t === "register"
        ? await register(a.name, a.email, a.phone, a.password)
        : t === "recover"
          ? await resetPassword(a.email, a.password)
          : await login(a.email, a.password, o);
    N(false);
    i(e.message);
    if (e.ok) {
      notify(e.message);
      if (t === "recover") {
        m("login");
        p((r) => ({ ...r, password: "" }));
      } else {
        if (o === "admin") {
          C("/admin");
        }
      }
    }
  };
  return session?.role === "customer" ? (
    <CustomerDashboard />
  ) : session?.role === "admin" ? (
    <section className="flex min-h-screen items-center justify-center bg-black px-5 pt-28 text-center text-white">
      <div>
        <Logo className="mx-auto h-24 rounded bg-white p-3" />
        <h1 className="mt-8 font-display text-4xl font-semibold uppercase">You’re signed in as admin.</h1>
        <p className="mt-3 text-sm text-white/70">Manage orders, content and every part of the website.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/admin" className="btn-primary">
            Open dashboard
          </Link>
          <button onClick={logout} className="btn-white">
            Sign out
          </button>
        </div>
      </div>
    </section>
  ) : (
    <section className="min-h-screen bg-white pt-[101px] lg:grid lg:grid-cols-[.9fr_1.1fr]">
      <div className="relative hidden min-h-[calc(100svh-101px)] overflow-hidden bg-black lg:block">
        <img
          src="/images/hero-kota.webp"
          alt="Rocksteady Campus Kota"
          className="absolute inset-0 h-full w-full object-cover opacity-65"
          style={{ objectPosition: "65% center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/35" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16">
          <div className="inline-block rounded-lg bg-white p-3">
            <Logo className="h-20" />
          </div>
          <h1 className="mt-8 max-w-xl font-display text-4xl leading-[1.05] font-semibold uppercase">
            Your flavour.
            <br />
            Your Campus.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
            Save your details, find your favourite orders and follow every meal from the grill to your gate.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-14 sm:px-10">
        <motion.div layout className="w-full max-w-md">
          <div className="mb-8 flex rounded-md bg-neutral-100 p-1">
            <button
              onClick={() => v("customer")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-xs font-semibold transition ${o === "customer" ? "bg-black text-white shadow" : "text-neutral-500"}`}
            >
              <UserRound size={15} />
              Customer
            </button>
            <button
              onClick={() => v("admin")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-xs font-semibold transition ${o === "admin" ? "bg-brand text-white shadow" : "text-neutral-500"}`}
            >
              <ShieldCheck size={15} />
              Administrator
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${o}-${t}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-display text-4xl leading-[1.05] font-semibold uppercase">
                {o === "admin"
                  ? "ADMIN PORTAL"
                  : t === "register"
                    ? "CREATE ACCOUNT"
                    : t === "recover"
                      ? "RESET PASSWORD"
                      : "SIGN IN & ORDER"}
              </h2>
              <p className="mt-4 text-sm leading-6 text-neutral-500">
                {o === "admin"
                  ? "Authorised team members only. Your administrator session is kept separate from customer access."
                  : t === "register"
                    ? "One account for quicker ordering, saved addresses and order history."
                    : t === "recover"
                      ? "Enter your account email and choose a new password."
                      : "Access your orders, addresses and Campus profile."}
              </p>
              <form onSubmit={A} className="mt-7 space-y-4">
                {t === "register" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="field-label">Full name</span>
                      <input
                        required
                        className="field"
                        value={a.name}
                        onChange={(l) => p({ ...a, name: l.target.value })}
                        autoComplete="name"
                        placeholder="Your name"
                      />
                    </label>
                    <label>
                      <span className="field-label">Mobile number</span>
                      <input
                        required
                        className="field"
                        value={a.phone}
                        onChange={(l) => p({ ...a, phone: l.target.value })}
                        autoComplete="tel"
                        placeholder="072 123 4567"
                      />
                    </label>
                  </div>
                )}
                <label className="block">
                  <span className="field-label">Email address</span>
                  <input
                    required
                    type="email"
                    className="field"
                    value={a.email}
                    onChange={(l) => p({ ...a, email: l.target.value })}
                    autoComplete="email"
                    placeholder={o === "admin" ? "admin@rocksteady.co.za" : "you@example.com"}
                  />
                </label>
                <label className="block">
                  <span className="field-label">{t === "recover" ? "New password" : "Password"}</span>
                  <div className="relative">
                    <input
                      required
                      type={g ? "text" : "password"}
                      className="field !pr-12"
                      value={a.password}
                      onChange={(l) => p({ ...a, password: l.target.value })}
                      autoComplete={t === "login" ? "current-password" : "new-password"}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => w((l) => !l)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-600"
                      aria-label={g ? "Hide password" : "Show password"}
                    >
                      {g ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
                {t === "register" && (
                  <label className="block">
                    <span className="field-label">Confirm password</span>
                    <input
                      required
                      type="password"
                      className="field"
                      value={a.confirm}
                      onChange={(l) => p({ ...a, confirm: l.target.value })}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                    />
                  </label>
                )}
                {h && (
                  <div
                    className={`rounded-md p-3 text-xs leading-5 ${h.includes("Welcome") || h.includes("ready") || h.includes("updated") ? "bg-green-50 text-green-700" : "bg-red-50 text-brand"}`}
                  >
                    {h}
                  </div>
                )}
                <button disabled={d} className="btn-primary w-full">
                  {d
                    ? "Please wait..."
                    : t === "register"
                      ? "Create my account"
                      : t === "recover"
                        ? "Update password"
                        : o === "admin"
                          ? "Open admin portal"
                          : "Sign in"}
                </button>
              </form>
              {o === "customer" && (
                <div className="mt-5 text-center text-xs text-neutral-500">
                  {t === "login" ? (
                    <>
                      <button
                        onClick={() => {
                          m("recover");
                          i("");
                        }}
                        className="font-semibold text-brand"
                      >
                        Forgot password?
                      </button>
                      <p className="mt-5">
                        {"New to Rocksteady? "}
                        <button
                          onClick={() => {
                            m("register");
                            i("");
                          }}
                          className="font-semibold text-black underline"
                        >
                          Create an account
                        </button>
                      </p>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        m("login");
                        i("");
                      }}
                      className="font-semibold text-black underline"
                    >
                      Back to sign in
                    </button>
                  )}
                </div>
              )}
              {o === "admin" && (
                <div className="mt-6 rounded-lg border border-black/10 bg-cream p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <LockKeyhole size={14} className="text-brand" />
                    Preview administrator access
                  </div>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    {"Email: "}
                    <strong className="text-black">admin@rocksteady.co.za</strong>
                    <br />
                    {"Password: "}
                    <strong className="text-black">Rocksteady2026!</strong>
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
function CustomerDashboard() {
  const { session, logout, data, setData, notify, addToCart, setCartOpen } = useStore();
  const [o, S] = React.useState("orders");
  const [t, m] = React.useState("");
  const [g, w] = React.useState("");
  const d = data.customers.find((e) => e.id === session?.id);
  const [name, setName] = React.useState(d?.name || "");
  const [phone, setPhone] = React.useState(d?.phone || "");
  const p = data.orders.filter(
    (e) => e.customerId === session?.id || (session?.email && e.email?.toLowerCase() === session.email.toLowerCase()),
  );
  if (!session || !d) return null;
  const v = (e) => {
    e.preventDefault();
    setData((r) => ({ ...r, customers: r.customers.map((c) => (c.id === d.id ? { ...c, name, phone } : c)) }));
    notify("Profile details saved");
  };
  const A = (e) => {
    e.preventDefault();
    if (g.trim()) {
      setData((r) => ({
        ...r,
        customers: r.customers.map((c) => (c.id === d.id ? { ...c, addresses: [...c.addresses, g.trim()] } : c)),
      }));
      w("");
      notify("Delivery address saved");
    }
  };
  const l = (e) => {
    const r = data.orders.find((n) => n.id === e);
    if (!r) return;
    let c = 0;
    r.lines.forEach((n) => {
      const z = data.items.find((E) => E.id === n.itemId);
      if (z?.available) {
        addToCart(z, n.quantity, n.extras, n.option, n.instructions);
        c++;
      }
    });
    if (c) {
      setCartOpen(true);
    } else {
      notify("Those items are not available right now");
    }
  };
  return (
    <section className="min-h-screen bg-cream pt-36 pb-20 sm:pt-40">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl font-semibold uppercase">
              {"Sharp, "}
              {d.name.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-sm text-neutral-500">Your orders, addresses and favourites in one place.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 self-start text-xs font-semibold text-neutral-500 hover:text-brand sm:self-auto"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
        <div className="mt-10 grid items-start gap-7 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-lg bg-black p-4 text-white lg:sticky lg:top-32">
            <div className="flex items-center gap-3 border-b border-white/10 p-3 pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand font-display text-xl font-semibold">
                {d.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{d.name}</p>
                <p className="truncate text-xs text-white/70">{d.email}</p>
              </div>
            </div>
            <nav className="mt-3 flex gap-1 overflow-x-auto lg:flex-col">
              {[
                { id: "orders", label: "My orders", icon: Package },
                { id: "addresses", label: "Saved addresses", icon: MapPin },
                { id: "profile", label: "Profile details", icon: UserRound },
              ].map((e) => (
                <button
                  key={e.id}
                  onClick={() => S(e.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-md px-4 py-3 text-xs font-semibold transition lg:w-full ${o === e.id ? "bg-brand text-white" : "text-white/70 hover:bg-white/10"}`}
                >
                  <e.icon size={16} />
                  {e.label}
                </button>
              ))}
            </nav>
          </aside>
          <div>
            <AnimatePresence mode="wait">
              {o === "orders" && (
                <motion.div
                  key={"orders"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-display text-2xl font-semibold uppercase">Order history</h2>
                    <Link to="/order" className="btn-primary !min-h-10 !px-5 !py-2">
                      New order
                      <Plus size={14} />
                    </Link>
                  </div>
                  {p.length ? (
                    <div className="space-y-4">
                      {p.map((e) => (
                        <article key={e.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
                          <button
                            onClick={() => m(t === e.id ? "" : e.id)}
                            className="flex w-full flex-wrap items-center gap-4 p-5 text-left sm:p-6"
                          >
                            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-red-50 text-brand">
                              <ShoppingBag size={20} />
                            </span>
                            <div className="min-w-32 flex-1">
                              <p className="text-sm font-semibold">{e.number}</p>
                              <p className="mt-1 text-xs text-neutral-600">
                                {new Date(e.createdAt).toLocaleDateString("en-ZA", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {", "}
                                {e.lines.reduce((r, c) => r + c.quantity, 0)}
                                {" items"}
                              </p>
                            </div>
                            <span
                              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${e.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {e.status}
                            </span>
                            <span className="font-display text-xl font-semibold">{formatRand(e.total)}</span>
                            <ChevronDown size={17} className={`transition ${t === e.id ? "rotate-180" : ""}`} />
                          </button>
                          {t === e.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="border-t border-black/10 p-5 sm:p-6"
                            >
                              <OrderTracker order={e} compact />
                              <div className="mt-6 space-y-2 rounded-md bg-cream p-4">
                                {e.lines.map((r, c) => (
                                  <div key={c} className="flex justify-between text-xs">
                                    <span>
                                      {r.quantity}
                                      {"× "}
                                      {r.name}
                                    </span>
                                    <span>{formatRand(r.unitPrice * r.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                              <button onClick={() => l(e.id)} className="btn-dark mt-5 !min-h-10 !py-2">
                                Order these again
                              </button>
                            </motion.div>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No orders yet"
                      text="Your next favourite is waiting. Build an order and track it right here."
                      action="/order"
                      actionLabel="Start my first order"
                    />
                  )}
                </motion.div>
              )}
              {o === "addresses" && (
                <motion.div
                  key={"addresses"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="font-display text-2xl font-semibold uppercase">Saved addresses</h2>
                  <p className="mt-2 text-sm text-neutral-500">Make delivery checkout quicker next time.</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {d.addresses.map((e, r) => (
                      <div key={`${e}-${r}`} className="flex items-start gap-3 rounded-lg bg-white p-5 shadow-sm">
                        <MapPin size={19} className="mt-1 shrink-0 text-brand" />
                        <p className="flex-1 text-sm leading-6">{e}</p>
                        <button
                          onClick={() => {
                            setData((c) => ({
                              ...c,
                              customers: c.customers.map((n) =>
                                n.id === d.id ? { ...n, addresses: n.addresses.filter((z, E) => E !== r) } : n,
                              ),
                            }));
                            notify("Address removed");
                          }}
                          className="text-neutral-600 hover:text-brand"
                          aria-label="Delete address"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={A} className="mt-6 rounded-lg bg-white p-6 shadow-sm">
                    <label className="field-label">Add a delivery address</label>
                    <textarea
                      className="field min-h-24 resize-none"
                      value={g}
                      onChange={(e) => w(e.target.value)}
                      placeholder="Street, house number, suburb and nearby landmark"
                    />
                    <button className="btn-primary mt-4">
                      Save address
                      <Check size={15} />
                    </button>
                  </form>
                </motion.div>
              )}
              {o === "profile" && (
                <motion.form
                  key={"profile"}
                  onSubmit={v}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="font-display text-2xl font-semibold uppercase">Profile details</h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    Keep your contact details up to date for order updates.
                  </p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label>
                      <span className="field-label">Full name</span>
                      <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
                    </label>
                    <label>
                      <span className="field-label">Mobile number</span>
                      <input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="field-label">Email address</span>
                      <input className="field bg-neutral-100" value={d.email} readOnly />
                    </label>
                  </div>
                  <button className="btn-primary mt-6">
                    Save changes
                    <Check size={15} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
