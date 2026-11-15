import React from "react";
import {
  ChartColumn,
  Check,
  Database,
  Download,
  Eye,
  EyeOff,
  FileBraces,
  LockKeyhole,
  Mail,
  MessageSquareText,
  RotateCcw,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  UsersRound,
} from "lucide-react";
import { formatRand, useStore } from "../../lib/store";

export async function compressImage(o, r = 1600, u = 0.82) {
  if (!o.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (o.size > 15 * 1024 * 1024) throw new Error("Please choose an image smaller than 15MB.");
  const i = await new Promise<any>((a, d) => {
    const x = new FileReader();
    x.onload = () => a(String(x.result));
    x.onerror = () => d(new Error("The image could not be read."));
    x.readAsDataURL(o);
  });
  const l = await new Promise<any>((a, d) => {
    const x = new Image();
    x.onload = () => a(x);
    x.onerror = () => d(new Error("The image format is not supported."));
    x.src = i;
  });
  const n = Math.min(1, r / Math.max(l.naturalWidth, l.naturalHeight));
  const t = document.createElement("canvas");
  t.width = Math.max(1, Math.round(l.naturalWidth * n));
  t.height = Math.max(1, Math.round(l.naturalHeight * n));
  const s = t.getContext("2d");
  if (!s) throw new Error("Your browser could not process this image.");
  s.drawImage(l, 0, 0, t.width, t.height);
  return t.toDataURL("image/webp", u);
}
function downloadFile(o, r, type = "application/json") {
  const i = new Blob([r], { type });
  const l = URL.createObjectURL(i);
  const n = document.createElement("a");
  n.href = l;
  n.download = o;
  document.body.appendChild(n);
  n.click();
  n.remove();
  URL.revokeObjectURL(l);
}
export function ReviewsManager() {
  const { data, setData, notify } = useStore();
  const [i, l] = React.useState("all");
  const n = data.reviews.filter((s) => i === "all" || s.status === i);
  const t = (s, status) => {
    setData((d) => ({ ...d, reviews: d.reviews.map((x) => (x.id === s ? { ...x, status } : x)) }));
    notify(
      status === "approved"
        ? "Review published"
        : status === "hidden"
          ? "Review hidden from the website"
          : "Review moved to pending",
    );
  };
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "pending", "approved", "hidden"].map((s) => (
          <button
            key={s}
            onClick={() => l(s)}
            className={`rounded-md px-4 py-2.5 text-xs font-semibold capitalize ${i === s ? "bg-black text-white" : "bg-white text-neutral-500 shadow-sm"}`}
          >
            {s}
            {" ("}
            {s === "all" ? data.reviews.length : data.reviews.filter((a) => a.status === s).length})
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {n.map((s) => (
          <article key={s.id} className="admin-card p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex min-w-40 items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 font-display text-xl font-semibold text-white">
                  {s.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-neutral-500">{s.date}</p>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((a) => (
                    <Star
                      key={a}
                      size={14}
                      className={a <= s.rating ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{s.text}</p>
                {s.meal && (
                  <p className="mt-2 text-xs font-semibold text-brand">
                    {"Ordered: "}
                    {s.meal}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-start gap-2 sm:flex-col">
                {s.status !== "approved" && (
                  <button
                    onClick={() => t(s.id, "approved")}
                    className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                )}
                {s.status !== "hidden" && (
                  <button
                    onClick={() => t(s.id, "hidden")}
                    className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600"
                  >
                    <EyeOff size={14} />
                    Hide
                  </button>
                )}
                {s.status === "hidden" && (
                  <button
                    onClick={() => t(s.id, "pending")}
                    className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
                  >
                    <Eye size={14} />
                    Pending
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm("Permanently remove this review?")) {
                      setData((a) => ({ ...a, reviews: a.reviews.filter((d) => d.id !== s.id) }));
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-500"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
            <span
              className={`mt-4 inline-block rounded-md px-2.5 py-1 text-xs font-semibold sm:hidden ${s.status === "approved" ? "bg-green-100 text-green-700" : s.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-neutral-100"}`}
            >
              {s.status}
            </span>
          </article>
        ))}
        {!n.length && (
          <div className="admin-card py-16 text-center text-sm text-neutral-500">
            {"No "}
            {i === "all" ? "" : i}
            {" reviews."}
          </div>
        )}
      </div>
    </div>
  );
}
export function CustomersManager() {
  const { data, setData, notify } = useStore();
  const [i, l] = React.useState("customers");
  return (
    <div>
      <div className="mb-6 flex rounded-md bg-neutral-100 p-1 w-fit">
        <button
          onClick={() => l("customers")}
          className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${i === "customers" ? "bg-white shadow-sm" : "text-neutral-500"}`}
        >
          Customers ({data.customers.length})
        </button>
        <button
          onClick={() => l("enquiries")}
          className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${i === "enquiries" ? "bg-white shadow-sm" : "text-neutral-500"}`}
        >
          Enquiries ({data.enquiries.length})
        </button>
      </div>
      {i === "customers" ? (
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Orders</th>
                <th className="px-5 py-4">Total spent</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.customers.map((n) => {
                const t = data.orders.filter((s) => s.customerId === n.id);
                return (
                  <tr key={n.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 font-semibold text-brand">
                          {n.name.charAt(0)}
                        </span>
                        <div>
                          <p className="font-semibold">{n.name}</p>
                          <p className="text-xs text-neutral-500">
                            {n.addresses.length}
                            {" saved addresses"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p>{n.email}</p>
                      <p className="mt-1 text-neutral-500">{n.phone}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold">{t.length}</td>
                    <td className="px-5 py-4 font-semibold">
                      {formatRand(t.filter((s) => s.status !== "Rejected").reduce((s, a) => s + a.total, 0))}
                    </td>
                    <td className="px-5 py-4 text-neutral-500">{new Date(n.createdAt).toLocaleDateString("en-ZA")}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setData((s) => ({
                            ...s,
                            customers: s.customers.map((a) => (a.id === n.id ? { ...a, active: !a.active } : a)),
                          }));
                          notify(n.active ? "Customer access suspended" : "Customer access restored");
                        }}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold ${n.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                      >
                        {n.active ? "Active" : "Suspended"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!data.customers.length && (
            <div className="py-16 text-center">
              <UsersRound size={30} className="mx-auto text-neutral-300" />
              <p className="mt-3 text-sm text-neutral-500">Registered customers will appear here.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {data.enquiries.map((n) => (
            <article key={n.id} className={`admin-card p-5 ${n.read ? "" : "border-l-4 border-l-brand"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{n.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {n.phone} {n.email && `· ${n.email}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">{new Date(n.createdAt).toLocaleString("en-ZA")}</span>
                  <button
                    onClick={() =>
                      setData((t) => ({
                        ...t,
                        enquiries: t.enquiries.map((s) => (s.id === n.id ? { ...s, read: !s.read } : s)),
                      }))
                    }
                    className="text-xs font-semibold text-brand"
                  >
                    {n.read ? "Mark unread" : "Mark read"}
                  </button>
                </div>
              </div>
              <p className="mt-4 rounded-md bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">{n.message}</p>
              <div className="mt-3 flex gap-4">
                <a href={`tel:${n.phone}`} className="text-xs font-semibold text-neutral-500">
                  Call customer
                </a>
                {n.email && (
                  <a href={`mailto:${n.email}`} className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
                    <Mail size={13} />
                    Reply by email
                  </a>
                )}
              </div>
            </article>
          ))}
          {!data.enquiries.length && (
            <div className="admin-card py-16 text-center">
              <MessageSquareText size={30} className="mx-auto text-neutral-300" />
              <p className="mt-3 text-sm text-neutral-500">Contact form enquiries will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export function SettingsManager() {
  const { data, setData, notify } = useStore();
  const i = (n, t) => setData((s) => ({ ...s, settings: { ...s.settings, [n]: t } }));
  const l = (n, t, s = "text") => (
    <label>
      <span className="admin-label">{t}</span>
      <input
        type={s}
        step={s === "number" ? "1" : undefined}
        className="admin-field"
        value={String(data.settings[n])}
        onChange={(a) => i(n, s === "number" ? Number(a.target.value) : a.target.value)}
        onBlur={() => notify("Business settings saved")}
      />
    </label>
  );
  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <section className="admin-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <SaveBadge />
          <div>
            <h2 className="font-semibold">Business details</h2>
            <p className="text-xs text-neutral-500">Used across the website, checkout and footer.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {l("businessName", "Business name")}
          <div className="sm:col-span-2">
            <label>
              <span className="admin-label">Street address</span>
              <textarea
                className="admin-field"
                value={data.settings.address}
                onChange={(n) => i("address", n.target.value)}
              />
            </label>
          </div>
          {l("phone", "Telephone")}
          {l("whatsapp", "WhatsApp number (international format)")}
          {l("email", "Email address", "email")}
          <div className="sm:col-span-2">{l("hoursWeek", "Monday–Saturday hours")}</div>
          <div className="sm:col-span-2">{l("hoursSunday", "Sunday hours")}</div>
        </div>
      </section>
      <div className="space-y-6">
        <section className="admin-card p-6">
          <h2 className="font-semibold">{"Ordering & delivery"}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {l("deliveryFee", "Delivery fee (ZAR)", "number")}
            {l("freeDeliveryAbove", "Free delivery above (ZAR)", "number")}
          </div>
          <div className="mt-5 space-y-3">
            {[
              ["collectionEnabled", "Collection available"],
              ["deliveryEnabled", "Delivery available"],
              ["orderNotifications", "In-app new order notifications"],
            ].map(([n, t]) => (
              <label
                key={n}
                className="flex items-center justify-between rounded-md bg-neutral-50 p-4 text-xs font-semibold"
              >
                <span>{t}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#F1001F]"
                  checked={data.settings[n]}
                  onChange={(s) => i(n, s.target.checked)}
                />
              </label>
            ))}
          </div>
        </section>
        <section className="admin-card p-6">
          <h2 className="font-semibold">Social media links</h2>
          <div className="mt-5 space-y-4">
            {l("instagram", "Instagram URL")}
            {l("facebook", "Facebook URL")}
            {l("tiktok", "TikTok URL")}
          </div>
        </section>
        <section className="admin-card p-6">
          <div className="flex items-center gap-2">
            <LockKeyhole size={18} className="text-brand" />
            <h2 className="font-semibold">Online payment integration</h2>
          </div>
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
            Card payments remain disabled at checkout until a payment provider is securely connected on a server. No
            payment credentials are stored in this website preview.
          </div>
          <label className="mt-4 block">
            <span className="admin-label">Payment provider</span>
            <select
              className="admin-field"
              value={data.settings.paymentProvider}
              onChange={(n) => i("paymentProvider", n.target.value)}
            >
              <option>Not connected</option>
              <option>PayFast (setup required)</option>
              <option>Yoco (setup required)</option>
              <option>Peach Payments (setup required)</option>
            </select>
          </label>
          <p className="mt-3 text-xs leading-5 text-neutral-500">
            Production activation requires verified merchant credentials, server-side order validation and a secure
            webhook.
          </p>
        </section>
      </div>
    </div>
  );
}
function SaveBadge() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-brand">
      <Save size={18} />
    </span>
  );
}
export function ReportsManager() {
  const { data, notify, resetWebsite, setData } = useStore();
  const l = React.useRef(null);
  const n = data.orders.filter((c) => c.status !== "Rejected");
  const t = n.reduce((c, g) => c + g.total, 0);
  const s = n.length ? t / n.length : 0;
  const a = Array.from({ length: 7 }, (c, g) => {
    const p = new Date();
    p.setHours(0, 0, 0, 0);
    p.setDate(p.getDate() - (6 - g));
    const y = new Date(p);
    y.setDate(y.getDate() + 1);
    const v = n.filter((m) => {
      const b = new Date(m.createdAt).getTime();
      return b >= p.getTime() && b < y.getTime();
    });
    return {
      label: p.toLocaleDateString("en-ZA", { weekday: "short" }),
      total: v.reduce((m, b) => m + b.total, 0),
      count: v.length,
    };
  });
  const d = Math.max(...a.map((c) => c.total), 1);
  const x = () => {
    const c = [
      [
        "Order number",
        "Date",
        "Customer",
        "Phone",
        "Fulfilment",
        "Status",
        "Subtotal",
        "Delivery",
        "Discount",
        "Total",
      ],
      ...data.orders.map((g) => [
        g.number,
        g.createdAt,
        g.customerName,
        g.phone,
        g.fulfilment,
        g.status,
        g.subtotal,
        g.deliveryFee,
        g.discount,
        g.total,
      ]),
    ];
    downloadFile(
      `rocksteady-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      c.map((g) => g.map((p) => `"${String(p).replace(/"/g, '""')}"`).join(",")).join(`
`),
      "text/csv",
    );
    notify("Order report downloaded");
  };
  const h = async (c) => {
    if (c)
      try {
        const g = JSON.parse(await c.text());
        if (!g.content || !Array.isArray(g.items) || !Array.isArray(g.orders) || !g.settings)
          throw new Error("This is not a valid Rocksteady Campus backup.");
        if (!window.confirm("Restore this backup? Current website data will be replaced.")) return;
        setData(g);
        notify("Backup restored successfully");
      } catch (g) {
        notify(g instanceof Error ? g.message : "Backup import failed");
      }
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Recorded sales", value: formatRand(t), icon: ChartColumn },
          { label: "Average order value", value: formatRand(s), icon: FileBraces },
          { label: "Valid orders", value: String(n.length), icon: Database },
        ].map((c) => (
          <div key={c.label} className="admin-card p-5">
            <c.icon size={20} className="text-brand" />
            <p className="mt-4 font-display text-2xl font-semibold">{c.value}</p>
            <p className="mt-1 text-xs text-neutral-500">{c.label}</p>
          </div>
        ))}
      </div>
      <section className="admin-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Seven-day sales</h2>
            <p className="mt-1 text-xs text-neutral-500">Based on orders stored in this website.</p>
          </div>
          <button
            onClick={x}
            className="flex items-center gap-2 rounded-md bg-black px-4 py-2.5 text-xs font-semibold text-white"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
        <div className="mt-8 flex h-56 items-end gap-3 sm:gap-6">
          {a.map((c) => (
            <div key={c.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-semibold text-neutral-500">{c.total ? formatRand(c.total) : "None"}</span>
              <div className="flex h-full w-full max-w-14 items-end rounded-t-lg bg-neutral-100">
                <div
                  className="w-full rounded-t-lg bg-brand transition-all"
                  style={{ height: `${Math.max(c.total ? 6 : 0, (c.total / d) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-neutral-500">{c.label}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-card p-6">
          <div className="flex items-center gap-3">
            <Database size={20} className="text-brand" />
            <div>
              <h2 className="font-semibold">Website backup</h2>
              <p className="text-xs text-neutral-500">Content, menu, images, orders and settings.</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-neutral-500">
            Download a backup after important updates. Image uploads are included, so backup files may be large.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => {
                downloadFile(
                  `rocksteady-backup-${new Date().toISOString().slice(0, 10)}.json`,
                  JSON.stringify(data, null, 2),
                );
                notify("Full website backup downloaded");
              }}
              className="flex items-center gap-2 rounded-md bg-black px-4 py-3 text-xs font-semibold text-white"
            >
              <Download size={15} />
              Download backup
            </button>
            <button
              onClick={() => l.current?.click()}
              className="flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-3 text-xs font-semibold"
            >
              <Upload size={15} />
              Restore backup
            </button>
            <input
              ref={l}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(c) => h(c.target.files?.[0])}
            />
          </div>
        </section>
        <section className="admin-card p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-brand" />
            <h2 className="font-semibold">{"Security & maintenance"}</h2>
          </div>
          <ul className="mt-4 space-y-3 text-xs leading-5 text-neutral-500">
            <li className="flex gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-green-600" />
              Change the preview administrator password before production launch.
            </li>
            <li className="flex gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-green-600" />
              Use server-side authentication, encrypted database backups and role-based staff accounts in production.
            </li>
            <li className="flex gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-green-600" />
              Keep a dated off-device backup and never store payment secrets in website content.
            </li>
          </ul>
        </section>
      </div>
      <section className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-800">Reset website content</h2>
        <p className="mt-2 text-xs leading-5 text-red-700">
          Restore the original Rocksteady Campus content, menu, photographs and settings. Download a backup first if you
          need your changes.
        </p>
        <button
          onClick={() => {
            if (window.confirm("Reset the entire website to its original content? This cannot be undone.")) {
              resetWebsite();
            }
          }}
          className="mt-4 flex items-center gap-2 rounded-md border border-red-300 px-4 py-2.5 text-xs font-semibold text-red-700"
        >
          <RotateCcw size={15} />
          Reset original website
        </button>
      </section>
    </div>
  );
}
