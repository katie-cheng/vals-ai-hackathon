import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ImagePlus, PenLine, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { formatRand, useStore } from "../../lib/store";
import { compressImage } from "./BusinessManager";

export function MenuManager() {
  const { data, setData, notify } = useStore();
  const [i, l] = React.useState("items");
  const [n, t] = React.useState("");
  const [s, a] = React.useState("all");
  const [d, x] = React.useState(null);
  const [h, c] = React.useState(null);
  const g = React.useMemo(
    () =>
      data.items
        .filter((m) => (s === "all" || m.category === s) && (!n || m.name.toLowerCase().includes(n.toLowerCase())))
        .sort((m, b) => m.order - b.order),
    [data.items, n, s],
  );
  const p = [...data.categories].sort((m, b) => m.order - b.order);
  const y = (m) => {
    if (window.confirm(`Delete ${m.name}? This cannot be undone.`)) {
      setData((b) => ({ ...b, items: b.items.filter((j) => j.id !== m.id) }));
      notify("Menu item deleted");
    }
  };
  const v = (m, b) => {
    const j = data.items.filter((A) => A.category === m.category).sort((A, S) => A.order - S.order);
    const C = j.findIndex((A) => A.id === m.id);
    const w = j[C + b];
    if (w) {
      setData((A) => ({
        ...A,
        items: A.items.map((S) =>
          S.id === m.id ? { ...S, order: w.order } : S.id === w.id ? { ...S, order: m.order } : S,
        ),
      }));
    }
  };
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md bg-neutral-100 p-1">
          <button
            onClick={() => l("items")}
            className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${i === "items" ? "bg-white text-black shadow-sm" : "text-neutral-500"}`}
          >
            Menu items ({data.items.length})
          </button>
          <button
            onClick={() => l("categories")}
            className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${i === "categories" ? "bg-white text-black shadow-sm" : "text-neutral-500"}`}
          >
            Categories ({data.categories.length})
          </button>
        </div>
        <button
          onClick={() => (i === "items" ? x("new") : c("new"))}
          className="flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark"
        >
          <Plus size={16} />
          {"Add "}
          {i === "items" ? "item" : "category"}
        </button>
      </div>
      {i === "items" ? (
        <>
          <div className="admin-card mb-6 flex flex-col gap-3 p-4 md:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" />
              <input
                value={n}
                onChange={(m) => t(m.target.value)}
                className="admin-field !pl-10"
                placeholder="Search menu items..."
              />
            </div>
            <select value={s} onChange={(m) => a(m.target.value)} className="admin-field md:w-56">
              <option value="all">All categories</option>
              {p.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {g.map((m) => (
              <article key={m.id} className="admin-card group overflow-hidden">
                <div className="relative aspect-[1.55] overflow-hidden bg-neutral-100">
                  <img
                    src={m.image}
                    alt={m.name}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: "72% center" }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {m.featured && (
                      <span className="rounded-md bg-purple-600 px-2 py-1 text-xs font-semibold text-white">
                        Featured
                      </span>
                    )}
                    {m.popular && (
                      <span className="rounded-md bg-orange-500 px-2 py-1 text-xs font-semibold text-white">
                        Popular
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setData((b) => ({
                        ...b,
                        items: b.items.map((j) => (j.id === m.id ? { ...j, available: !j.available } : j)),
                      }));
                      notify(m.available ? "Item marked as sold out" : "Item is available again");
                    }}
                    className={`absolute top-3 right-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${m.available ? "bg-green-600" : "bg-neutral-700"}`}
                  >
                    {m.available ? "In stock" : "Sold out"}
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-brand">
                    {data.categories.find((b) => b.id === m.category)?.name || "Uncategorised"}
                  </p>
                  <h3 className="mt-1 text-base font-semibold">{m.name}</h3>
                  <p className="mt-1 line-clamp-2 min-h-8 text-xs leading-4 text-neutral-500">{m.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <span className="font-display text-xl font-semibold">{formatRand(m.price)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => v(m, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                        title="Move item up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => v(m, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                        title="Move item down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => x(m)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50"
                        title="Edit item"
                      >
                        <PenLine size={15} />
                      </button>
                      <button
                        onClick={() => y(m)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"
                        title="Delete item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!g.length && (
            <div className="admin-card py-16 text-center text-sm text-neutral-500">No items match your filters.</div>
          )}
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {p.map((m, b) => (
            <article key={m.id} className="admin-card flex gap-4 p-4">
              <img
                src={m.image}
                alt=""
                className="h-24 w-24 rounded-md object-cover"
                style={{ objectPosition: "72% center" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-500">
                  {"Position "}
                  {b + 1}
                  {", "}
                  {data.items.filter((j) => j.category === m.id).length}
                  {" items"}
                </p>
                <h3 className="mt-1 font-semibold">{m.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{m.description}</p>
                <div className="mt-3 flex gap-1">
                  <button
                    disabled={b === 0}
                    onClick={() => {
                      const j = p[b - 1];
                      setData((C) => ({
                        ...C,
                        categories: C.categories.map((w) =>
                          w.id === m.id ? { ...w, order: j.order } : w.id === j.id ? { ...w, order: m.order } : w,
                        ),
                      }));
                    }}
                    className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-20"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    disabled={b === p.length - 1}
                    onClick={() => {
                      const j = p[b + 1];
                      setData((C) => ({
                        ...C,
                        categories: C.categories.map((w) =>
                          w.id === m.id ? { ...w, order: j.order } : w.id === j.id ? { ...w, order: m.order } : w,
                        ),
                      }));
                    }}
                    className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-20"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => c(m)} className="rounded p-1.5 text-amber-600 hover:bg-amber-50">
                    <PenLine size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (data.items.some((j) => j.category === m.id)) {
                        notify("Move or delete this category’s items first");
                        return;
                      }
                      if (window.confirm(`Delete ${m.name}?`)) {
                        setData((j) => ({ ...j, categories: j.categories.filter((C) => C.id !== m.id) }));
                      }
                    }}
                    className="rounded p-1.5 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <AnimatePresence>
        {d && <ItemEditor item={d} onClose={() => x(null)} />}
        {h && <CategoryEditor category={h} onClose={() => c(null)} />}
      </AnimatePresence>
    </div>
  );
}
function EditorDrawer({ title, children, onClose, onSave }: any) {
  return (
    <>
      <motion.button
        className="fixed inset-0 z-[80] bg-black/60"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-label="Close editor"
      />
      <motion.form
        onSubmit={onSave}
        className="fixed inset-x-3 top-1/2 z-[81] mx-auto max-h-[92svh] max-w-2xl -translate-y-1/2 overflow-y-auto rounded-lg bg-white shadow-sm sm:inset-x-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <h2 className="font-display text-xl font-semibold uppercase">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-neutral-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-200 px-5 py-2.5 text-xs font-semibold"
          >
            Cancel
          </button>
          <button className="flex items-center gap-2 rounded-md bg-brand px-6 py-2.5 text-xs font-semibold text-white">
            <Check size={15} />
            Save changes
          </button>
        </div>
      </motion.form>
    </>
  );
}
function ItemEditor({ item, onClose }: any) {
  const { data, setData, notify } = useStore();
  const n = item === "new";
  const [t, s] = React.useState(
    n
      ? {
          id: "",
          category: data.categories[0]?.id || "",
          name: "",
          description: "",
          price: 0,
          image: "/images/hero-kota.webp",
          available: true,
          featured: false,
          popular: false,
          extras: [],
          options: ["Regular"],
          order: data.items.length + 1,
        }
      : { ...item, extras: item.extras.map((p) => ({ ...p })), options: [...item.options] },
  );
  const [a, d] = React.useState(t.options.join(", "));
  const [x, h] = React.useState(
    t.extras.map((p) => `${p.name} | ${p.price}`).join(`
`),
  );
  const c = async (p) => {
    if (p)
      try {
        const image = await compressImage(p);
        s((v) => ({ ...v, image }));
        notify("Photograph ready. Save the item to publish");
      } catch (y) {
        notify(y instanceof Error ? y.message : "Image upload failed");
      }
  };
  const g = (p) => {
    if ((p.preventDefault(), !t.name.trim() || !t.description.trim() || t.price < 0)) {
      notify("Add a name, description and valid price");
      return;
    }
    const extras = x
      .split(
        `
`,
      )
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m, b) => {
        const [j, C] = m.split("|");
        return {
          id: `${j.toLowerCase().replace(/\W/g, "-")}-${b}`,
          name: j.trim(),
          price: Math.max(0, Number(C) || 0),
        };
      });
    const v = {
      ...t,
      id: t.id || `${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`,
      name: t.name.trim(),
      description: t.description.trim(),
      price: Number(t.price),
      options: a
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      extras,
    };
    setData((m) => ({ ...m, items: n ? [...m.items, v] : m.items.map((b) => (b.id === v.id ? v : b)) }));
    notify(n ? "Menu item added" : "Menu item updated");
    onClose();
  };
  return (
    <EditorDrawer title={n ? "Add menu item" : `Edit ${t.name}`} onClose={onClose} onSave={g}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="admin-label">Meal name</span>
          <input className="admin-field" value={t.name} onChange={(p) => s({ ...t, name: p.target.value })} />
        </label>
        <label>
          <span className="admin-label">Category</span>
          <select className="admin-field" value={t.category} onChange={(p) => s({ ...t, category: p.target.value })}>
            {data.categories.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="admin-label">Price (ZAR)</span>
          <input
            required
            min="0"
            step="0.5"
            type="number"
            className="admin-field"
            value={t.price}
            onChange={(p) => s({ ...t, price: Number(p.target.value) })}
          />
        </label>
        <label className="sm:col-span-2">
          <span className="admin-label">Detailed description</span>
          <textarea
            className="admin-field min-h-24 resize-none"
            value={t.description}
            onChange={(p) => s({ ...t, description: p.target.value })}
          />
        </label>
        <div className="sm:col-span-2">
          <span className="admin-label">Food photograph</span>
          <div className="flex items-center gap-4">
            <img
              src={t.image}
              alt="Preview"
              className="h-24 w-32 rounded-md object-cover"
              style={{ objectPosition: "72% center" }}
            />
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-3 text-xs font-semibold text-neutral-500 hover:border-brand hover:text-brand">
              <ImagePlus size={17} />
              Replace photograph
              <input type="file" accept="image/*" className="sr-only" onChange={(p) => c(p.target.files?.[0])} />
            </label>
          </div>
        </div>
        <label>
          <span className="admin-label">Customisation options (comma separated)</span>
          <input
            className="admin-field"
            value={a}
            onChange={(p) => d(p.target.value)}
            placeholder="Regular, Spicy, No onion"
          />
        </label>
        <label>
          <span className="admin-label">Extras (one per line: name | price)</span>
          <textarea
            className="admin-field min-h-24 resize-none"
            value={x}
            onChange={(p) => h(p.target.value)}
            placeholder={`Extra cheese | 10
Fried egg | 8`}
          />
        </label>
        <div className="flex flex-wrap gap-5 sm:col-span-2">
          {[
            ["available", "Available"],
            ["featured", "Featured"],
            ["popular", "Popular"],
          ].map(([p, y]) => (
            <label key={p} className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#F1001F]"
                checked={t[p]}
                onChange={(v) => s({ ...t, [p]: v.target.checked })}
              />
              {y}
            </label>
          ))}
        </div>
      </div>
    </EditorDrawer>
  );
}
function CategoryEditor({ category, onClose }: any) {
  const { data, setData, notify } = useStore();
  const n = category === "new";
  const [t, s] = React.useState(
    n
      ? { id: "", name: "", description: "", image: "/images/hero-kota.webp", order: data.categories.length + 1 }
      : { ...category },
  );
  const a = (d) => {
    if ((d.preventDefault(), !t.name.trim())) return;
    const x = {
      ...t,
      id: t.id || `${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-3)}`,
    };
    setData((h) => ({ ...h, categories: n ? [...h.categories, x] : h.categories.map((c) => (c.id === x.id ? x : c)) }));
    notify(n ? "Category added" : "Category updated");
    onClose();
  };
  return (
    <EditorDrawer title={n ? "Add category" : "Edit category"} onClose={onClose} onSave={a}>
      <div className="space-y-5">
        <label className="block">
          <span className="admin-label">Category name</span>
          <input className="admin-field" value={t.name} onChange={(d) => s({ ...t, name: d.target.value })} />
        </label>
        <label className="block">
          <span className="admin-label">Description</span>
          <textarea
            className="admin-field"
            value={t.description}
            onChange={(d) => s({ ...t, description: d.target.value })}
          />
        </label>
        <div>
          <span className="admin-label">Category image</span>
          <div className="flex items-center gap-4">
            <img src={t.image} className="h-24 w-32 rounded-md object-cover" alt="Preview" />
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-3 text-xs font-semibold text-neutral-500">
              <ImagePlus size={17} />
              Upload image
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (d) => {
                  const x = d.target.files?.[0];
                  if (x) {
                    s({ ...t, image: await compressImage(x) });
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </EditorDrawer>
  );
}
export function PromotionsManager() {
  const { data, setData, notify } = useStore();
  const i = {
    id: "",
    code: "",
    title: "",
    description: "",
    value: 10,
    type: "percent",
    minSpend: 0,
    active: true,
    expires: "2027-12-31",
  };
  const l = () => {
    setData((n) => ({
      ...n,
      promotions: [
        ...n.promotions,
        { ...i, id: crypto.randomUUID(), code: `CAMPUS${n.promotions.length + 1}`, title: "New Campus Offer" },
      ],
    }));
    notify("New promotion added. Edit its details below");
  };
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={l}
          className="flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-xs font-semibold text-white"
        >
          <Plus size={16} />
          Create promotion
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {data.promotions.map((n) => (
          <article key={n.id} className="admin-card p-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-brand">
                <Tag size={16} />
                {n.code}
              </span>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  className="accent-[#F1001F]"
                  checked={n.active}
                  onChange={(t) =>
                    setData((s) => ({
                      ...s,
                      promotions: s.promotions.map((a) => (a.id === n.id ? { ...a, active: t.target.checked } : a)),
                    }))
                  }
                />
                Active
              </label>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="admin-label">Offer title</span>
                <input
                  className="admin-field"
                  value={n.title}
                  onChange={(t) =>
                    setData((s) => ({
                      ...s,
                      promotions: s.promotions.map((a) => (a.id === n.id ? { ...a, title: t.target.value } : a)),
                    }))
                  }
                />
              </label>
              <label>
                <span className="admin-label">Promo code</span>
                <input
                  className="admin-field"
                  value={n.code}
                  onChange={(t) =>
                    setData((s) => ({
                      ...s,
                      promotions: s.promotions.map((a) =>
                        a.id === n.id ? { ...a, code: t.target.value.toUpperCase().replace(/\s/g, "") } : a,
                      ),
                    }))
                  }
                />
              </label>
              <label className="sm:col-span-2">
                <span className="admin-label">Description</span>
                <input
                  className="admin-field"
                  value={n.description}
                  onChange={(t) =>
                    setData((s) => ({
                      ...s,
                      promotions: s.promotions.map((a) => (a.id === n.id ? { ...a, description: t.target.value } : a)),
                    }))
                  }
                />
              </label>
              <label>
                <span className="admin-label">Discount type</span>
                <select
                  className="admin-field"
                  value={n.type}
                  onChange={(t) =>
                    setData((s) => ({
                      ...s,
                      promotions: s.promotions.map((a) => (a.id === n.id ? { ...a, type: t.target.value } : a)),
                    }))
                  }
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed amount (R)</option>
                </select>
              </label>
              <label>
                <span className="admin-label">Discount value</span>
                <input
                  type="number"
                  min="0"
                  className="admin-field"
                  value={n.value}
                  onChange={(t) =>
                    setData((s) => ({
                      ...s,
                      promotions: s.promotions.map((a) =>
                        a.id === n.id ? { ...a, value: Number(t.target.value) } : a,
                      ),
                    }))
                  }
                />
              </label>
              <label>
                <span className="admin-label">Minimum spend (R)</span>
                <input
                  type="number"
                  min="0"
                  className="admin-field"
                  value={n.minSpend}
                  onChange={(t) =>
                    setData((s) => ({
                      ...s,
                      promotions: s.promotions.map((a) =>
                        a.id === n.id ? { ...a, minSpend: Number(t.target.value) } : a,
                      ),
                    }))
                  }
                />
              </label>
              <label>
                <span className="admin-label">Expiry date</span>
                <input
                  type="date"
                  className="admin-field"
                  value={n.expires}
                  onChange={(t) =>
                    setData((s) => ({
                      ...s,
                      promotions: s.promotions.map((a) => (a.id === n.id ? { ...a, expires: t.target.value } : a)),
                    }))
                  }
                />
              </label>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Delete this promotion?")) {
                  setData((t) => ({ ...t, promotions: t.promotions.filter((s) => s.id !== n.id) }));
                }
              }}
              className="mt-5 flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-brand"
            >
              <Trash2 size={14} />
              Delete promotion
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
