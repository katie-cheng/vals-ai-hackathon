import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  FileText,
  ImageIcon,
  ImagePlus,
  Monitor,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { compressImage } from "./BusinessManager";

const contentSections = [
  {
    id: "home",
    label: "Home page",
    fields: [
      { key: "announcement", label: "Top announcement bar" },
      { key: "homeHeroPrimary", label: "Hero primary button" },
      { key: "homeHeroSecondary", label: "Hero secondary button" },
      { key: "categoriesEyebrow", label: "Categories eyebrow" },
      { key: "categoriesTitle", label: "Categories heading" },
      { key: "categoriesText", label: "Categories introduction", long: true },
      { key: "bestsellersEyebrow", label: "Bestsellers eyebrow" },
      { key: "bestsellersTitle", label: "Bestsellers heading" },
      { key: "bestsellersText", label: "Bestsellers introduction", long: true },
      { key: "promoEyebrow", label: "Promotion eyebrow" },
      { key: "promoTitle", label: "Promotion heading" },
      { key: "promoText", label: "Promotion message", long: true },
      { key: "promoButton", label: "Promotion button" },
      { key: "whyEyebrow", label: "Why us eyebrow" },
      { key: "whyTitle", label: "Why us heading" },
      { key: "whyText", label: "Why us introduction", long: true },
      { key: "whyOneTitle", label: "Reason 1 heading" },
      { key: "whyOneText", label: "Reason 1 text", long: true },
      { key: "whyTwoTitle", label: "Reason 2 heading" },
      { key: "whyTwoText", label: "Reason 2 text", long: true },
      { key: "whyThreeTitle", label: "Reason 3 heading" },
      { key: "whyThreeText", label: "Reason 3 text", long: true },
      { key: "reviewsEyebrow", label: "Testimonials eyebrow" },
      { key: "reviewsTitle", label: "Testimonials heading" },
      { key: "reviewsText", label: "Testimonials introduction", long: true },
      { key: "locationEyebrow", label: "Location eyebrow" },
      { key: "locationTitle", label: "Location heading" },
      { key: "locationText", label: "Location introduction", long: true },
      { key: "footerCtaTitle", label: "Footer order banner heading" },
      { key: "footerCtaText", label: "Footer order banner text", long: true },
    ],
  },
  {
    id: "about",
    label: "About us",
    fields: [
      { key: "aboutHeroEyebrow", label: "Hero eyebrow" },
      { key: "aboutHeroTitle", label: "Hero heading" },
      { key: "aboutHeroText", label: "Hero introduction", long: true },
      { key: "storyEyebrow", label: "Story eyebrow" },
      { key: "storyTitle", label: "Story heading" },
      { key: "storyTextOne", label: "Story paragraph one", long: true },
      { key: "storyTextTwo", label: "Story paragraph two", long: true },
      { key: "passionEyebrow", label: "Passion eyebrow" },
      { key: "passionTitle", label: "Passion heading" },
      { key: "passionText", label: "Passion text", long: true },
      { key: "qualityEyebrow", label: "Quality eyebrow" },
      { key: "qualityTitle", label: "Quality heading" },
      { key: "qualityText", label: "Quality text", long: true },
      { key: "qualityCardOneTitle", label: "Quality card 1 heading" },
      { key: "qualityCardOneText", label: "Quality card 1 text", long: true },
      { key: "qualityCardTwoTitle", label: "Quality card 2 heading" },
      { key: "qualityCardTwoText", label: "Quality card 2 text", long: true },
      { key: "qualityCardThreeTitle", label: "Quality card 3 heading" },
      { key: "qualityCardThreeText", label: "Quality card 3 text", long: true },
      { key: "portionsTitle", label: "Portions heading" },
      { key: "portionsText", label: "Portions text", long: true },
      { key: "communityEyebrow", label: "Community eyebrow" },
      { key: "communityTitle", label: "Community heading" },
      { key: "communityText", label: "Community text", long: true },
    ],
  },
  {
    id: "pages",
    label: "Other pages",
    fields: [
      { key: "menuHeroEyebrow", label: "Menu hero eyebrow" },
      { key: "menuHeroTitle", label: "Menu hero heading" },
      { key: "menuHeroText", label: "Menu hero introduction", long: true },
      { key: "orderHeroEyebrow", label: "Order hero eyebrow" },
      { key: "orderHeroTitle", label: "Order hero heading" },
      { key: "orderHeroText", label: "Order hero introduction", long: true },
      { key: "galleryHeroEyebrow", label: "Gallery hero eyebrow" },
      { key: "galleryHeroTitle", label: "Gallery hero heading" },
      { key: "galleryHeroText", label: "Gallery hero introduction", long: true },
      { key: "reviewsHeroEyebrow", label: "Reviews hero eyebrow" },
      { key: "reviewsHeroTitle", label: "Reviews hero heading" },
      { key: "reviewsHeroText", label: "Reviews hero introduction", long: true },
      { key: "contactHeroEyebrow", label: "Contact hero eyebrow" },
      { key: "contactHeroTitle", label: "Contact hero heading" },
      { key: "contactHeroText", label: "Contact hero introduction", long: true },
      { key: "menuBottomTitle", label: "Menu customisation banner heading" },
      { key: "menuBottomText", label: "Menu customisation banner text", long: true },
      { key: "reviewsFormTitle", label: "Review submission heading" },
      { key: "reviewsFormText", label: "Review submission introduction", long: true },
      { key: "contactWhatsappTitle", label: "Contact WhatsApp heading" },
      { key: "contactWhatsappText", label: "Contact WhatsApp text", long: true },
      { key: "contactFormTitle", label: "Contact enquiry heading" },
      { key: "contactFormText", label: "Contact enquiry introduction", long: true },
      { key: "footerTagline", label: "Footer brand message", long: true },
    ],
  },
];
export function ContentManager() {
  const { data, setData, notify } = useStore();
  const [i, l] = React.useState("home");
  const [n, t] = React.useState(false);
  const s = (d, x) => setData((h) => ({ ...h, content: { ...h.content, [d]: x } }));
  const a = contentSections.find((d) => d.id === i);
  return (
    <div>
      <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-xs leading-5 text-green-800">
        <div className="flex items-center gap-2 font-bold">
          <Check size={16} />
          Live visual content editor
        </div>
        <p className="mt-1 text-green-700">
          Every change saves automatically on this device and appears on the website immediately. No coding needed.
        </p>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {contentSections.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                l(d.id);
                t(false);
              }}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${!n && i === d.id ? "bg-black text-white" : "bg-white text-neutral-500 shadow-sm"}`}
            >
              {d.label}
            </button>
          ))}
          <button
            onClick={() => t(true)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${n ? "bg-brand text-white" : "bg-white text-neutral-500 shadow-sm"}`}
          >
            Hero slider
          </button>
        </div>
        <Link
          to={i === "home" ? "/" : i === "about" ? "/about" : "/menu"}
          target="_blank"
          className="flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-brand"
        >
          <Monitor size={15} />
          Preview page
        </Link>
      </div>
      {n ? (
        <HeroSlidesEditor />
      ) : (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-brand">
              <FileText size={19} />
            </span>
            <div>
              <h2 className="font-bold">
                {a.label}
                {" wording"}
              </h2>
              <p className="text-xs text-neutral-400">
                {a.fields.length}
                {" editable text fields"}
              </p>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {a.fields.map((d) => (
              <label key={d.key} className={d.long ? "lg:col-span-2" : ""}>
                <span className="admin-label">{d.label}</span>
                {d.long ? (
                  <textarea
                    className="admin-field min-h-24 resize-y"
                    value={data.content[d.key] || ""}
                    onChange={(x) => s(d.key, x.target.value)}
                    onBlur={() => notify("Text saved and published")}
                  />
                ) : (
                  <input
                    className="admin-field"
                    value={data.content[d.key] || ""}
                    onChange={(x) => s(d.key, x.target.value)}
                    onBlur={() => notify("Text saved and published")}
                  />
                )}
              </label>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
function HeroSlidesEditor() {
  const { data, setData, notify } = useStore();
  const i = (t, s) =>
    setData((a) => ({ ...a, heroSlides: a.heroSlides.map((d) => (d.id === t ? { ...d, ...s } : d)) }));
  const l = async (t, s) => {
    if (s)
      try {
        i(t, { image: await compressImage(s, 1920) });
        notify("Hero photograph replaced");
      } catch (a) {
        notify(a instanceof Error ? a.message : "Image upload failed");
      }
  };
  const n = () =>
    setData((t) => ({
      ...t,
      heroSlides: [
        ...t.heroSlides,
        {
          id: crypto.randomUUID(),
          image: "/images/hero-kota.webp",
          eyebrow: "FRESH FROM THE CAMPUS",
          title: "YOUR NEW HEADLINE GOES HERE.",
          text: "Add a short, appetising message for this slide.",
        },
      ],
    }));
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          {"The homepage starts with these "}
          {data.heroSlides.length}
          {" sliding banners."}
        </p>
        <button
          onClick={n}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white"
        >
          <Plus size={15} />
          Add slide
        </button>
      </div>
      <div className="space-y-5">
        {data.heroSlides.map((t, s) => (
          <article key={t.id} className="admin-card overflow-hidden">
            <div className="grid lg:grid-cols-[300px_1fr]">
              <div className="relative min-h-52">
                <img
                  src={t.image}
                  alt={`Hero slide ${s + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute top-3 left-3 rounded-full bg-black px-3 py-1 text-[9px] font-bold text-white uppercase">
                  {"Slide "}
                  {s + 1}
                </span>
                <label className="absolute right-3 bottom-3 flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold shadow">
                  <ImagePlus size={14} />
                  Replace image
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(a) => l(t.id, a.target.files?.[0])}
                  />
                </label>
              </div>
              <div className="p-5">
                <div className="grid gap-4">
                  <label>
                    <span className="admin-label">Eyebrow</span>
                    <input
                      className="admin-field"
                      value={t.eyebrow}
                      onChange={(a) => i(t.id, { eyebrow: a.target.value })}
                    />
                  </label>
                  <label>
                    <span className="admin-label">Main headline</span>
                    <textarea
                      className="admin-field min-h-20 resize-none"
                      value={t.title}
                      onChange={(a) => i(t.id, { title: a.target.value })}
                    />
                  </label>
                  <label>
                    <span className="admin-label">Supporting text</span>
                    <textarea
                      className="admin-field min-h-20 resize-none"
                      value={t.text}
                      onChange={(a) => i(t.id, { text: a.target.value })}
                    />
                  </label>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    disabled={s === 0}
                    onClick={() =>
                      setData((a) => {
                        const heroSlides = [...a.heroSlides];
                        [heroSlides[s - 1], heroSlides[s]] = [heroSlides[s], heroSlides[s - 1]];
                        return { ...a, heroSlides };
                      })
                    }
                    className="rounded-lg border border-neutral-200 p-2 disabled:opacity-30"
                    title="Move left"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    disabled={s === data.heroSlides.length - 1}
                    onClick={() =>
                      setData((a) => {
                        const heroSlides = [...a.heroSlides];
                        [heroSlides[s + 1], heroSlides[s]] = [heroSlides[s], heroSlides[s + 1]];
                        return { ...a, heroSlides };
                      })
                    }
                    className="rounded-lg border border-neutral-200 p-2 disabled:opacity-30"
                    title="Move right"
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button
                    disabled={data.heroSlides.length <= 1}
                    onClick={() => {
                      if (window.confirm("Delete this hero slide?")) {
                        setData((a) => ({ ...a, heroSlides: a.heroSlides.filter((d) => d.id !== t.id) }));
                      }
                    }}
                    className="rounded-lg border border-red-100 p-2 text-red-400 disabled:opacity-30"
                    title="Delete slide"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
const imageSlotLabels = {
  logo: "Official website logo",
  aboutStory: "About — Our Story",
  aboutKitchen: "About — Food preparation",
  aboutCommunity: "About — Community",
  promo: "Homepage — Promotion banner",
  contact: "Contact — Hero banner",
  menuHero: "Menu — Hero banner",
  orderHero: "Online order — Hero banner",
  galleryHero: "Gallery — Hero banner",
  reviewsHero: "Reviews — Hero banner",
};
export function MediaManager() {
  const { data, setData, notify } = useStore();
  const i = Object.keys(imageSlotLabels);
  const l = Array.from(
    new Set([...Object.values(data.images), ...data.heroSlides.map((t) => t.image), ...data.gallery.map((t) => t.src)]),
  );
  const n = async (t, s) => {
    if (s)
      try {
        const a = await compressImage(s, t === "logo" ? 1e3 : 1920);
        setData((d) => ({ ...d, images: { ...d.images, [t]: a } }));
        notify(`${imageSlotLabels[t]} updated`);
      } catch (a) {
        notify(a instanceof Error ? a.message : "Image upload failed");
      }
  };
  return (
    <div>
      <div className="mb-6 rounded-2xl bg-neutral-900 p-5 text-white">
        <div className="flex items-center gap-2 text-sm font-bold">
          <ImageIcon size={18} className="text-brand" />
          Website image assignments
        </div>
        <p className="mt-2 text-xs leading-5 text-white/50">
          Upload a replacement or choose an existing photograph. Images are resized in your browser for faster pages.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {i.map((t) => (
          <article key={t} className="admin-card overflow-hidden">
            <div className="flex h-48 items-center justify-center bg-neutral-100 p-3">
              <img
                src={data.images[t]}
                alt={imageSlotLabels[t]}
                className={`h-full w-full ${t === "logo" ? "object-contain" : "rounded-lg object-cover"}`}
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold">{imageSlotLabels[t]}</h3>
              <select
                className="admin-field mt-3 !py-2 !text-[11px]"
                value={data.images[t]}
                onChange={(s) => {
                  setData((a) => ({ ...a, images: { ...a.images, [t]: s.target.value } }));
                  notify("Image assignment changed");
                }}
              >
                <option value={data.images[t]}>Current image</option>
                {l
                  .filter((s) => s !== data.images[t])
                  .map((s, a) => (
                    <option key={`${s.slice(0, 40)}-${a}`} value={s}>
                      {"Library image "}
                      {a + 1}
                    </option>
                  ))}
              </select>
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-xs font-bold text-neutral-500 hover:border-brand hover:text-brand">
                <Upload size={15} />
                Upload replacement
                <input type="file" accept="image/*" className="sr-only" onChange={(s) => n(t, s.target.files?.[0])} />
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
export function GalleryManager() {
  const { data, setData, notify } = useStore();
  const [category, setCategory] = React.useState("Our Community");
  const [n, t] = React.useState(false);
  const s = [...data.gallery].sort((x, h) => x.order - h.order);
  const a = (x, h) => setData((c) => ({ ...c, gallery: c.gallery.map((g) => (g.id === x ? { ...g, ...h } : g)) }));
  const d = async (x) => {
    if (x?.length) {
      t(true);
      try {
        const h = [];
        for (const [c, g] of Array.from<any>(x).entries())
          h.push({
            id: crypto.randomUUID(),
            src: await compressImage(g, 1800),
            title: g.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
            category,
            order: data.gallery.length + c + 1,
          });
        setData((c) => ({ ...c, gallery: [...c.gallery, ...h] }));
        notify(`${h.length} gallery image${h.length === 1 ? "" : "s"} published`);
      } catch (h) {
        notify(h instanceof Error ? h.message : "Image upload failed");
      }
      t(false);
    }
  };
  return (
    <div>
      <div className="admin-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="admin-label">Category for new photographs</span>
          <select className="admin-field" value={category} onChange={(x) => setCategory(x.target.value)}>
            {["Kotas & Dagwoods", "Burgers & Sandwiches", "Food Preparation", "Our Community", "Brand & Lifestyle"].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </select>
        </label>
        <label
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white ${n ? "opacity-50" : ""}`}
        >
          <ImagePlus size={16} />
          {n ? "Processing..." : "Upload photographs"}
          <input
            disabled={n}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(x) => d(x.target.files)}
          />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {s.map((x, h) => (
          <article key={x.id} className="admin-card overflow-hidden">
            <div className="relative h-52">
              <img src={x.src} alt={x.title} className="h-full w-full object-cover" />
              <span className="absolute top-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[9px] font-bold text-white">
                {"Position "}
                {h + 1}
              </span>
              <label
                className="absolute right-3 bottom-3 cursor-pointer rounded-lg bg-white p-2 text-neutral-600 shadow hover:text-brand"
                title="Replace photograph"
              >
                <Upload size={15} />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (c) => {
                    const g = c.target.files?.[0];
                    if (g) {
                      a(x.id, { src: await compressImage(g, 1800) });
                      notify("Gallery photograph replaced");
                    }
                  }}
                />
              </label>
            </div>
            <div className="space-y-3 p-4">
              <label className="block">
                <span className="admin-label">Caption</span>
                <input className="admin-field" value={x.title} onChange={(c) => a(x.id, { title: c.target.value })} />
              </label>
              <label className="block">
                <span className="admin-label">Gallery category</span>
                <select
                  className="admin-field"
                  value={x.category}
                  onChange={(c) => a(x.id, { category: c.target.value })}
                >
                  {[
                    "Kotas & Dagwoods",
                    "Burgers & Sandwiches",
                    "Food Preparation",
                    "Our Community",
                    "Brand & Lifestyle",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                <div className="flex gap-1">
                  <button
                    disabled={h === 0}
                    onClick={() => {
                      const c = s[h - 1];
                      a(x.id, { order: c.order });
                      a(c.id, { order: x.order });
                    }}
                    className="rounded p-2 text-neutral-400 hover:bg-neutral-100 disabled:opacity-20"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    disabled={h === s.length - 1}
                    onClick={() => {
                      const c = s[h + 1];
                      a(x.id, { order: c.order });
                      a(c.id, { order: x.order });
                    }}
                    className="rounded p-2 text-neutral-400 hover:bg-neutral-100 disabled:opacity-20"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this gallery photograph?")) {
                      setData((c) => ({ ...c, gallery: c.gallery.filter((g) => g.id !== x.id) }));
                      notify("Gallery photograph deleted");
                    }
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-red-400"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
