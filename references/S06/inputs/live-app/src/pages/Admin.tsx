import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  ChartColumn,
  Check,
  ChevronRight,
  CircleDollarSign,
  CircleX,
  ClipboardList,
  ExternalLink,
  FileText,
  ImageIcon,
  Images,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  PackageCheck,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Truck,
  UsersRound,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { CustomersManager, ReportsManager, ReviewsManager, SettingsManager } from "../components/admin/BusinessManager";
import { ContentManager, GalleryManager, MediaManager } from "../components/admin/ContentManager";
import { MenuManager, PromotionsManager } from "../components/admin/MenuManager";
import { Logo } from "../components/Layout";
import { formatRand, useStore } from "../lib/store";

const sectionMeta = {
  dashboard: { title: "Dashboard", subtitle: "Your Campus at a glance." },
  orders: { title: "Order management", subtitle: "Accept, prepare and complete customer orders." },
  content: { title: "Website content", subtitle: "Edit every headline, paragraph and hero banner." },
  menu: { title: "Menu & categories", subtitle: "Meals, photographs, prices, extras and availability." },
  media: { title: "Media manager", subtitle: "Replace photographs and choose where they appear." },
  gallery: { title: "Gallery manager", subtitle: "Upload, caption, delete and rearrange gallery images." },
  promotions: { title: "Promotions", subtitle: "Create and control special offers and promo codes." },
  reviews: { title: "Review moderation", subtitle: "Approve, hide or remove customer feedback." },
  customers: { title: "Customers & enquiries", subtitle: "Customer accounts and contact form messages." },
  settings: { title: "Business settings", subtitle: "Contact details, opening hours, delivery and social links." },
  reports: { title: "Reports & backup", subtitle: "Sales summaries, exports, backups and security." },
};
export default function AdminPage() {
  const { session, data, logout } = useStore();
  const [i, l] = React.useState("dashboard");
  const [n, t] = React.useState(false);
  const s = useNavigate();
  if (session?.role !== "admin")
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-5 text-white">
        <div className="w-full max-w-md text-center">
          <div className="inline-block rounded-xl bg-white p-4">
            <Logo className="h-20" />
          </div>
          <span className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-brand">
            <LockKeyhole size={24} />
          </span>
          <h1 className="mt-5 font-display text-4xl font-black uppercase">Administrator access only</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">
            This area is protected by role-based access. Sign in with an authorised administrator account to manage the
            Campus.
          </p>
          <Link to="/login" className="btn-primary mt-7">
            Go to secure login
            <ArrowRight size={15} />
          </Link>
          <Link to="/" className="mt-6 block text-xs text-white/40 hover:text-white">
            Back to the website
          </Link>
        </div>
      </div>
    );
  const a = (c, g, Icon, y = 0) => (
    <button
      key={c}
      onClick={() => {
        l(c);
        t(false);
      }}
      className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-semibold transition ${i === c ? "bg-brand text-white shadow-lg shadow-red-950/20" : "text-white/50 hover:bg-white/[.06] hover:text-white"}`}
    >
      <Icon size={17} className={i === c ? "text-white" : "text-white/40 group-hover:text-brand"} />
      <span className="flex-1">{g}</span>
      {y > 0 && (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-bold ${i === c ? "bg-white text-brand" : "bg-brand text-white"}`}
        >
          {y}
        </span>
      )}
    </button>
  );
  const d = data.orders.filter((c) => c.status === "Received").length;
  const x = data.reviews.filter((c) => c.status === "pending").length;
  const h = (
    <>
      <div className="flex h-24 items-center border-b border-white/10 px-5">
        <Link to="/" className="rounded-lg bg-white p-2">
          <Logo className="h-11" />
        </Link>
        <button onClick={() => t(false)} className="ml-auto text-white/60 lg:hidden">
          <X />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-4 text-[9px] font-bold tracking-[.18em] text-white/25 uppercase">Main</p>
        {a("dashboard", "Dashboard", LayoutDashboard)}
        {a("orders", "Orders", ClipboardList, d)}
        <p className="mt-6 mb-2 px-4 text-[9px] font-bold tracking-[.18em] text-white/25 uppercase">Website studio</p>
        {a("content", "Page content", FileText)}
        {a("media", "Media manager", ImageIcon)}
        {a("gallery", "Gallery", Images)}
        <p className="mt-6 mb-2 px-4 text-[9px] font-bold tracking-[.18em] text-white/25 uppercase">Catalogue</p>
        {a("menu", "Menu items", UtensilsCrossed)}
        {a("promotions", "Promotions", Tag)}
        <p className="mt-6 mb-2 px-4 text-[9px] font-bold tracking-[.18em] text-white/25 uppercase">Community</p>
        {a("reviews", "Reviews", Star, x)}
        {a("customers", "Customers", UsersRound)}
        <p className="mt-6 mb-2 px-4 text-[9px] font-bold tracking-[.18em] text-white/25 uppercase">Business</p>
        {a("settings", "Settings", Settings)}
        {a("reports", "Reports & backup", ChartColumn)}
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[.05] p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-display text-lg font-bold">
            A
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">Campus Administrator</p>
            <p className="text-[9px] text-white/35">Full access</p>
          </div>
          <button
            onClick={() => {
              logout();
              s("/");
            }}
            className="text-white/40 hover:text-brand"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
  return (
    <div className="min-h-screen bg-[#f4f5f7] text-neutral-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#090b11] text-white lg:flex">{h}</aside>
      <AnimatePresence>
        {n && (
          <>
            <motion.button
              onClick={() => t(false)}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-[51] flex w-72 flex-col bg-[#090b11] text-white lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
            >
              {h}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-lg sm:px-7">
          <button
            onClick={() => t(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold sm:text-xl">{sectionMeta[i].title}</h1>
            <p className="hidden truncate text-[11px] text-neutral-400 sm:block">{sectionMeta[i].subtitle}</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-[9px] font-bold text-green-700 uppercase sm:flex">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-green-500" />
            All changes live
          </div>
          <button
            onClick={() => l("orders")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
            aria-label="View order notifications"
          >
            <Bell size={19} />
            {d > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand" />
            )}
          </button>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-[11px] font-bold text-neutral-600 hover:border-black sm:px-4"
          >
            <ExternalLink size={15} />
            <span className="hidden sm:inline">View website</span>
          </Link>
        </header>
        <main className="p-4 sm:p-7">
          {i === "dashboard" && <DashboardOverview onView={l} />}
          {i === "orders" && <OrdersManager />}
          {i === "content" && <ContentManager />}
          {i === "menu" && <MenuManager />}
          {i === "media" && <MediaManager />}
          {i === "gallery" && <GalleryManager />}
          {i === "promotions" && <PromotionsManager />}
          {i === "reviews" && <ReviewsManager />}
          {i === "customers" && <CustomersManager />}
          {i === "settings" && <SettingsManager />}
          {i === "reports" && <ReportsManager />}
        </main>
        <footer className="px-7 pb-6 text-[10px] text-neutral-400">
          Rocksteady Campus CMS · Local-first preview · All prices in ZAR
        </footer>
      </div>
    </div>
  );
}
function DashboardOverview({ onView }: any) {
  const { data, updateOrderStatus } = useStore();
  const i = new Date().toDateString();
  const l = data.orders.filter((c) => new Date(c.createdAt).toDateString() === i && c.status !== "Rejected");
  const n = l.reduce((c, g) => c + g.total, 0);
  const t = data.orders.filter((c) => !["Completed", "Rejected"].includes(c.status)).length;
  const s = data.reviews.filter((c) => c.status === "approved");
  const a = s.length ? s.reduce((c, g) => c + g.rating, 0) / s.length : 0;
  const d = Array.from({ length: 7 }, (c, g) => {
    const p = new Date();
    p.setHours(0, 0, 0, 0);
    p.setDate(p.getDate() - (6 - g));
    const y = new Date(p);
    y.setDate(y.getDate() + 1);
    const v = data.orders.filter(
      (m) =>
        m.status !== "Rejected" &&
        new Date(m.createdAt).getTime() >= p.getTime() &&
        new Date(m.createdAt).getTime() < y.getTime(),
    );
    return { day: p.toLocaleDateString("en-ZA", { weekday: "short" }), total: v.reduce((m, b) => m + b.total, 0) };
  });
  const x = Math.max(...d.map((c) => c.total), 1);
  const h = [
    {
      label: "Today’s sales",
      value: formatRand(n),
      note: `${l.length} paid on fulfilment`,
      icon: CircleDollarSign,
      colour: "bg-green-50 text-green-600",
    },
    {
      label: "Active orders",
      value: String(t),
      note: `${data.orders.filter((c) => c.status === "Received").length} awaiting acceptance`,
      icon: ShoppingBag,
      colour: "bg-red-50 text-brand",
    },
    {
      label: "Menu items live",
      value: String(data.items.filter((c) => c.available).length),
      note: `${data.categories.length} menu categories`,
      icon: UtensilsCrossed,
      colour: "bg-amber-50 text-amber-600",
    },
    {
      label: "Customer rating",
      value: a.toFixed(1),
      note: `${s.length} published reviews`,
      icon: Star,
      colour: "bg-purple-50 text-purple-600",
    },
  ];
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-black p-6 text-white sm:p-8">
        <div className="absolute right-0 bottom-0 font-display text-[10rem] leading-none font-black text-white/[.035]">
          RSC
        </div>
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-bold tracking-[.18em] text-brand uppercase">
              {new Date().toLocaleDateString("en-ZA", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">Sharp, Administrator.</h2>
            <p className="mt-2 text-xs text-white/45">Here is what is happening at Rocksteady Campus.</p>
          </div>
          <button
            onClick={() => onView("content")}
            className="flex w-fit items-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white"
          >
            <FileText size={16} />
            Edit website
          </button>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {h.map((c) => (
          <div key={c.label} className="admin-card p-5">
            <div className="flex items-start justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.colour}`}>
                <c.icon size={19} />
              </span>
              <span className="text-[9px] font-bold text-green-500 uppercase">Live</span>
            </div>
            <p className="mt-5 font-display text-4xl font-bold">{c.value}</p>
            <p className="mt-1 text-xs font-semibold text-neutral-600">{c.label}</p>
            <p className="mt-2 text-[10px] text-neutral-400">{c.note}</p>
          </div>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <section className="admin-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Sales this week</h2>
              <p className="mt-1 text-[11px] text-neutral-400">Order revenue over the last seven days</p>
            </div>
            <button onClick={() => onView("reports")} className="text-xs font-bold text-brand">
              Full report
            </button>
          </div>
          <div className="mt-8 flex h-52 items-end gap-3">
            {d.map((c) => (
              <div key={c.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full max-w-12 items-end rounded-t-lg bg-neutral-50">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(c.total / x) * 100}%` }}
                    className="w-full rounded-t-lg bg-brand"
                  />
                </div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase">{c.day}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-card p-6">
          <h2 className="font-bold">Quick actions</h2>
          <div className="mt-5 space-y-2">
            {[
              { view: "menu", icon: PlusGlyph, label: "Add a menu item", text: "Photograph, price and extras" },
              { view: "media", icon: ImageIcon, label: "Replace a photograph", text: "Update banners and page images" },
              { view: "content", icon: FileText, label: "Edit page wording", text: "Publish text without code" },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => onView(c.view)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-neutral-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-brand">
                  <c.icon size={16} />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-bold">{c.label}</p>
                  <p className="mt-0.5 text-[10px] text-neutral-400">{c.text}</p>
                </div>
                <ChevronRight size={15} className="text-neutral-300" />
              </button>
            ))}
          </div>
        </section>
      </div>
      <section className="admin-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 p-5">
          <div>
            <h2 className="font-bold">Recent orders</h2>
            <p className="mt-1 text-[11px] text-neutral-400">Latest activity from the online store</p>
          </div>
          <button onClick={() => onView("orders")} className="text-xs font-bold text-brand">
            View all orders
          </button>
        </div>
        <OrdersTable orders={data.orders.slice(0, 5)} onStatus={updateOrderStatus} compact />
        {!data.orders.length && (
          <div className="py-14 text-center">
            <ShoppingBag size={28} className="mx-auto text-neutral-300" />
            <p className="mt-3 text-sm text-neutral-400">New online orders will appear here.</p>
            <Link
              to="/order"
              target="_blank"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-brand"
            >
              Place a test order
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
function PlusGlyph({ size = 16 }: any) {
  return (
    <span className="font-bold" style={{ fontSize: size }}>
      +
    </span>
  );
}
const statusStyles = {
  Received: "bg-blue-50 text-blue-700",
  Accepted: "bg-purple-50 text-purple-700",
  Preparing: "bg-amber-50 text-amber-700",
  Ready: "bg-green-50 text-green-700",
  "Out for delivery": "bg-cyan-50 text-cyan-700",
  Completed: "bg-neutral-100 text-neutral-600",
  Rejected: "bg-red-50 text-red-600",
};
function OrdersTable({ orders, onStatus, onOpen, compact = false }: any) {
  return orders.length ? (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-xs">
        <thead className="bg-neutral-50 text-[9px] tracking-wider text-neutral-400 uppercase">
          <tr>
            <th className="px-5 py-3">Order</th>
            <th className="px-5 py-3">Customer</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Total</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {orders.map((l) => (
            <tr key={l.id} className="hover:bg-neutral-50/70">
              <td className="px-5 py-4">
                <button onClick={() => onOpen?.(l)} className="font-bold text-black hover:text-brand">
                  {l.number}
                </button>
                <p className="mt-1 text-[10px] text-neutral-400">
                  {new Date(l.createdAt).toLocaleString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </td>
              <td className="px-5 py-4">
                <p className="font-semibold">{l.customerName}</p>
                <p className="mt-1 text-[10px] text-neutral-400">{l.phone}</p>
              </td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-2 text-neutral-500">
                  {l.fulfilment === "Delivery" ? <Truck size={14} /> : <Store size={14} />}
                  {l.fulfilment}
                </span>
              </td>
              <td className="px-5 py-4 font-display text-lg font-bold">{formatRand(l.total)}</td>
              <td className="px-5 py-4">
                <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${statusStyles[l.status]}`}>
                  {l.status}
                </span>
              </td>
              <td className="px-5 py-4">
                {compact ? (
                  <button onClick={() => onOpen?.(l)} className="text-xs font-bold text-brand">
                    Manage
                  </button>
                ) : (
                  <select
                    className="admin-field !w-40 !py-2 !text-[11px]"
                    value={l.status}
                    onChange={(n) => onStatus(l.id, n.target.value)}
                  >
                    {["Received", "Accepted", "Preparing", "Ready", "Out for delivery", "Completed", "Rejected"].map(
                      (n) => (
                        <option key={n}>{n}</option>
                      ),
                    )}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;
}
function OrdersManager() {
  const { data, updateOrderStatus } = useStore();
  const [u, i] = React.useState("Active");
  const [l, n] = React.useState(null);
  const t = (l && data.orders.find((a) => a.id === l.id)) || null;
  const s = React.useMemo(
    () =>
      data.orders.filter(
        (a) => u === "All" || (u === "Active" && !["Completed", "Rejected"].includes(a.status)) || a.status === u,
      ),
    [data.orders, u],
  );
  return (
    <div>
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {[
          "Active",
          "All",
          "Received",
          "Accepted",
          "Preparing",
          "Ready",
          "Out for delivery",
          "Completed",
          "Rejected",
        ].map((a) => (
          <button
            key={a}
            onClick={() => i(a)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold ${u === a ? "bg-black text-white" : "bg-white text-neutral-500 shadow-sm"}`}
          >
            {a}
            {" ("}
            {a === "All"
              ? data.orders.length
              : a === "Active"
                ? data.orders.filter((d) => !["Completed", "Rejected"].includes(d.status)).length
                : data.orders.filter((d) => d.status === a).length}
            )
          </button>
        ))}
      </div>
      <div className="admin-card overflow-hidden">
        <OrdersTable orders={s} onStatus={updateOrderStatus} onOpen={n} />
        {!s.length && (
          <div className="py-20 text-center">
            <PackageCheck size={32} className="mx-auto text-neutral-300" />
            <p className="mt-3 text-sm text-neutral-400">No orders in this view.</p>
          </div>
        )}
      </div>
      <AnimatePresence>{t && <OrderDetail order={t} onClose={() => n(null)} />}</AnimatePresence>
    </div>
  );
}
function OrderDetail({ order, onClose }: any) {
  const { updateOrderStatus } = useStore();
  const l = {
    Received: "Accepted",
    Accepted: "Preparing",
    Preparing: "Ready",
    Ready: order.fulfilment === "Delivery" ? "Out for delivery" : "Completed",
    "Out for delivery": "Completed",
  }[order.status];
  return (
    <>
      <motion.button
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.aside
        className="fixed inset-y-0 right-0 z-[71] w-[min(95vw,520px)] overflow-y-auto bg-[#f4f5f7] shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30 }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white p-5">
          <div>
            <p className="text-[10px] font-bold text-brand uppercase">
              {order.fulfilment}
              {" order"}
            </p>
            <h2 className="font-display text-3xl font-bold">{order.number}</h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
            <X size={19} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <section className="admin-card p-5">
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ${statusStyles[order.status]}`}
              >
                {order.status}
              </span>
              <span className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleString("en-ZA")}</span>
            </div>
            {l && (
              <button
                onClick={() => updateOrderStatus(order.id, l)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-xs font-bold text-white"
              >
                <Check size={15} />
                {"Move to "}
                {l}
              </button>
            )}
            {order.status === "Received" && (
              <button
                onClick={() => updateOrderStatus(order.id, "Rejected")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-xs font-bold text-red-500"
              >
                <CircleX size={15} />
                Reject order
              </button>
            )}
          </section>
          <section className="admin-card p-5">
            <h3 className="text-xs font-bold uppercase">Customer</h3>
            <p className="mt-3 text-sm font-bold">{order.customerName}</p>
            <a href={`tel:${order.phone}`} className="mt-1 block text-xs text-brand">
              {order.phone}
            </a>
            {order.email && <p className="mt-1 text-xs text-neutral-400">{order.email}</p>}
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-neutral-500">
              <Truck size={15} className="mt-0.5 shrink-0" />
              {order.fulfilment === "Delivery" ? order.address : "Collection at 1563 Makapane Street"}
            </p>
            {order.instructions && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <strong>Note:</strong> {order.instructions}
              </p>
            )}
          </section>
          <section className="admin-card p-5">
            <h3 className="text-xs font-bold uppercase">Items</h3>
            <div className="mt-4 space-y-4">
              {order.lines.map((n, t) => (
                <div key={t} className="border-b border-neutral-100 pb-4 last:border-0">
                  <div className="flex justify-between gap-4 text-xs">
                    <span>
                      <strong>{n.quantity}×</strong> {n.name}
                    </span>
                    <span className="font-bold">{formatRand(n.unitPrice * n.quantity)}</span>
                  </div>
                  {(n.option || n.extras.length > 0) && (
                    <p className="mt-1 pl-6 text-[10px] leading-4 text-neutral-400">
                      {n.option}
                      {n.extras.length ? ` · ${n.extras.map((s) => s.name).join(", ")}` : ""}
                    </p>
                  )}
                  {n.instructions && <p className="mt-1 pl-6 text-[10px] text-amber-600">{n.instructions}</p>}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>{formatRand(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Delivery</span>
                <span>{formatRand(order.deliveryFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−{formatRand(order.discount)}</span>
                </div>
              )}
              <div className="flex items-end justify-between pt-2">
                <span className="font-bold">{order.payment}</span>
                <span className="font-display text-3xl font-bold">{formatRand(order.total)}</span>
              </div>
            </div>
          </section>
          <button
            onClick={() => window.print()}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-bold"
          >
            Print order details
          </button>
        </div>
      </motion.aside>
    </>
  );
}
