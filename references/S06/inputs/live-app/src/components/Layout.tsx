import React from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Facebook,
  House,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Music2,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  UserRound,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { formatRand, useStore } from "../lib/store";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "About", to: "/about" },
  { label: "Gallery", to: "/gallery" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];
export function Logo({ className = "h-12" }: any) {
  const { data } = useStore();
  return (
    <img
      src={data.images.logo}
      alt="Rocksteady Campus"
      className={`${className} w-auto max-w-[210px] object-contain`}
    />
  );
}
function Header() {
  const { data, cartCount, setCartOpen, session } = useStore();
  const [c, d] = React.useState(false);
  React.useEffect(() => {
    if (!c) return;
    const f = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = f;
    };
  }, [c]);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="flex h-7 items-center justify-center bg-brand px-4 text-center text-[9px] font-extrabold tracking-[.16em] text-white uppercase sm:text-[10px]">
          <span>{data.content.announcement}</span>
        </div>
        <div className="border-b border-white/10 bg-black/95 text-white shadow-lg backdrop-blur-xl">
          <div className="container-site flex h-[74px] items-center justify-between gap-5">
            <Link to="/" aria-label="Rocksteady Campus home" className="shrink-0 rounded-md bg-white/95 px-2 py-1">
              <Logo className="h-10 sm:h-11" />
            </Link>
            <nav className="hidden items-center gap-6 xl:flex" aria-label="Main navigation">
              {navLinks.map((f) => (
                <NavLink
                  key={f.to}
                  to={f.to}
                  className={({ isActive }) =>
                    `relative py-3 text-[11px] font-bold tracking-[.08em] uppercase transition hover:text-brand ${isActive ? "text-brand after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand" : "text-white/75"}`
                  }
                >
                  {f.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <Link
                to={session?.role === "admin" ? "/admin" : "/login"}
                className="hidden h-10 w-10 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white sm:flex"
                aria-label="Customer or administrator login"
              >
                <UserRound size={19} />
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                aria-label={`Open cart with ${cartCount} items`}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link to="/order" className="btn-primary hidden !min-h-10 !px-5 !py-2 md:inline-flex">
                Order now
                <ArrowRight size={14} />
              </Link>
              <button
                onClick={() => d(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 xl:hidden"
                aria-label="Open navigation"
              >
                <Menu size={23} />
              </button>
            </div>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {c && (
          <>
            <motion.button
              aria-label="Close navigation"
              onClick={() => d(false)}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="fixed top-0 right-0 bottom-0 z-[61] flex w-[min(88vw,390px)] flex-col bg-black p-6 text-white"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => d(false)} className="rounded bg-white p-2">
                  <Logo className="h-11" />
                </Link>
                <button
                  onClick={() => d(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15"
                  aria-label="Close menu"
                >
                  <X />
                </button>
              </div>
              <nav className="mt-10 flex flex-col" aria-label="Mobile navigation">
                {navLinks.map((f, m) => (
                  <motion.div
                    key={f.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: m * 0.045 }}
                  >
                    <NavLink
                      to={f.to}
                      onClick={() => d(false)}
                      className={({ isActive: x }) =>
                        `flex items-center justify-between border-b border-white/10 py-4 font-display text-3xl font-bold uppercase ${x ? "text-brand" : "text-white"}`
                      }
                    >
                      {f.label}
                      <ChevronRight size={19} />
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto space-y-3 pt-8">
                <Link to="/order" onClick={() => d(false)} className="btn-primary w-full">
                  Order now
                  <ArrowRight size={15} />
                </Link>
                <Link to="/login" onClick={() => d(false)} className="btn-white w-full">
                  <UserRound size={16} />
                  {session ? "My account" : "Sign in / Register"}
                </Link>
                <a
                  href={`tel:${data.settings.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 py-2 text-xs text-white/60"
                >
                  <Phone size={14} />
                  {data.settings.phone}
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
function CartDrawer() {
  const { cart, cartOpen, setCartOpen, data, getLinePrice, updateCartQuantity, removeFromCart, subtotal, clearCart } =
    useStore();
  React.useEffect(() => {
    if (!cartOpen) return;
    const v = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = v;
    };
  }, [cartOpen]);
  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
            className="fixed top-0 right-0 bottom-0 z-[71] flex w-[min(94vw,470px)] flex-col bg-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
          >
            <div className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-5">
              <div>
                <span className="text-[10px] font-bold tracking-[.16em] text-brand uppercase">Your Campus order</span>
                <h2 className="font-display text-3xl font-bold uppercase">
                  {"My cart "}
                  <span className="text-neutral-400">({cart.length})</span>
                </h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length ? (
                <div className="space-y-3">
                  {cart.map((v) => {
                    const g = data.items.find((y) => y.id === v.itemId);
                    return g ? (
                      <div key={v.key} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex gap-3">
                          <img
                            src={g.image}
                            alt=""
                            className="h-20 w-20 rounded-xl object-cover"
                            style={{ objectPosition: "72% center" }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold">{g.name}</h3>
                              <button
                                onClick={() => removeFromCart(v.key)}
                                className="text-neutral-400 hover:text-brand"
                                aria-label={`Remove ${g.name}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                              {v.option}
                              {v.extras.length
                                ? `${v.option ? " · " : ""}${v.extras.map((y) => y.name).join(", ")}`
                                : ""}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-3 rounded-full bg-neutral-100 px-2 py-1">
                                <button
                                  onClick={() => updateCartQuantity(v.key, v.quantity - 1)}
                                  className="flex h-6 w-6 items-center justify-center"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-4 text-center text-xs font-bold">{v.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(v.key, v.quantity + 1)}
                                  className="flex h-6 w-6 items-center justify-center"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                              <span className="font-display text-xl font-bold">{formatRand(getLinePrice(v))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                  <button
                    onClick={clearCart}
                    className="mx-auto block pt-3 text-[10px] font-bold tracking-wider text-neutral-400 uppercase hover:text-brand"
                  >
                    Clear cart
                  </button>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                    <ShoppingBag size={30} className="text-neutral-400" />
                  </div>
                  <h3 className="mt-6 font-display text-3xl font-bold uppercase">Your cart is hungry</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
                    Add a fresh favourite and we will start building your order.
                  </p>
                  <Link to="/menu" onClick={() => setCartOpen(false)} className="btn-primary mt-6">
                    Explore menu
                    <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-black/10 bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Subtotal</span>
                  <span className="font-display text-3xl font-bold">{formatRand(subtotal)}</span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-400">Delivery and discounts are calculated at checkout.</p>
                <Link to="/order?checkout=1" onClick={() => setCartOpen(false)} className="btn-primary mt-5 w-full">
                  Checkout
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
function ItemModal({ item }: any) {
  const { addToCart, closeItem } = useStore();
  const [r, c] = React.useState(1);
  const [d, f] = React.useState([]);
  const [m, x] = React.useState(item.options[0] || "");
  const [v, g] = React.useState("");
  const y = item.extras.filter((w) => d.includes(w.id));
  const S = (item.price + y.reduce((w, C) => w + C.price, 0)) * r;
  return (
    <>
      <motion.button
        className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm"
        onClick={closeItem}
        aria-label="Close customisation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Customise ${item.name}`}
        className="fixed inset-x-3 top-1/2 z-[81] mx-auto max-h-[90svh] max-w-3xl -translate-y-1/2 overflow-y-auto rounded-3xl bg-white shadow-2xl sm:inset-x-6"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25 }}
      >
        <button
          onClick={closeItem}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="grid md:grid-cols-[.85fr_1.15fr]">
          <div className="relative min-h-56 overflow-hidden md:min-h-full">
            <img
              src={item.image}
              alt={item.name}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "72% center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute right-5 bottom-5 left-5 text-white">
              <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">Made fresh for you</span>
              <p className="font-display text-4xl font-bold">{formatRand(item.price)}</p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <span className="text-[10px] font-extrabold tracking-[.15em] text-brand uppercase">
              Customise your meal
            </span>
            <h2 className="mt-2 pr-8 font-display text-4xl leading-none font-black uppercase">{item.name}</h2>
            <p className="mt-3 text-xs leading-5 text-neutral-500">{item.description}</p>
            {item.options.length > 0 && (
              <fieldset className="mt-6">
                <legend className="mb-3 text-xs font-bold uppercase">Make it yours</legend>
                <div className="flex flex-wrap gap-2">
                  {item.options.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => x(w)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${m === w ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/30"}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {item.extras.length > 0 && (
              <fieldset className="mt-6">
                <legend className="mb-1 text-xs font-bold uppercase">Add a little extra</legend>
                <p className="mb-3 text-[11px] text-neutral-400">Optional. Choose as many as you like.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {item.extras.map((w) => {
                    const C = d.includes(w.id);
                    return (
                      <label
                        key={w.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${C ? "border-brand bg-red-50" : "border-black/10 hover:border-black/25"}`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={C}
                          onChange={() => f((L) => (C ? L.filter((N) => N !== w.id) : [...L, w.id]))}
                        />
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${C ? "border-brand bg-brand text-white" : "border-black/20"}`}
                        >
                          {C && <Check size={13} />}
                        </span>
                        <span className="flex-1 text-xs font-semibold">{w.name}</span>
                        <span className="text-xs text-neutral-500">+{formatRand(w.price)}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
            <label className="mt-5 block">
              <span className="field-label">Special instructions</span>
              <textarea
                value={v}
                onChange={(w) => g(w.target.value)}
                maxLength={180}
                className="field min-h-16 resize-none"
                placeholder="e.g. Sauce on the side"
              />
            </label>
            <div className="mt-6 flex gap-3">
              <div className="flex shrink-0 items-center gap-3 rounded-full bg-neutral-100 px-3">
                <button
                  onClick={() => c((w) => Math.max(1, w - 1))}
                  className="flex h-9 w-6 items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="w-4 text-center text-sm font-bold">{r}</span>
                <button
                  onClick={() => c((w) => w + 1)}
                  className="flex h-9 w-6 items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
              <button onClick={() => addToCart(item, r, y, m, v)} className="btn-primary flex-1 !px-4">
                {"Add to cart · "}
                {formatRand(S)}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
function ItemModalHost() {
  const { activeItem } = useStore();
  React.useEffect(() => {
    if (!activeItem) return;
    const i = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = i;
    };
  }, [activeItem]);
  return <AnimatePresence>{activeItem && <ItemModal key={activeItem.id} item={activeItem} />}</AnimatePresence>;
}
function Footer() {
  const { data } = useStore();
  return (
    <footer className="bg-black pb-20 text-white md:pb-0">
      <div className="border-b border-white/10">
        <div className="container-site flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
          <div>
            <p className="font-display text-4xl font-black uppercase sm:text-5xl">{data.content.footerCtaTitle}</p>
            <p className="mt-2 text-sm text-white/50">{data.content.footerCtaText}</p>
          </div>
          <Link to="/order" className="btn-primary shrink-0">
            Start an order
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_.7fr_.9fr_1fr]">
        <div>
          <Link to="/" className="inline-block rounded-lg bg-white p-3">
            <Logo className="h-16" />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">{data.content.footerTagline}</p>
          <div className="mt-5 flex gap-2">
            <a
              href={data.settings.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-brand hover:bg-brand hover:text-white"
              aria-label="Instagram"
            >
              <Instagram size={17} />
            </a>
            <a
              href={data.settings.facebook}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-brand hover:bg-brand hover:text-white"
              aria-label="Facebook"
            >
              <Facebook size={17} />
            </a>
            <a
              href={data.settings.tiktok}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-brand hover:bg-brand hover:text-white"
              aria-label="TikTok"
            >
              <Music2 size={17} />
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-extrabold tracking-[.18em] text-white/35 uppercase">Explore</h3>
          <div className="mt-5 flex flex-col gap-3">
            {navLinks.slice(1).map((i) => (
              <Link key={i.to} to={i.to} className="text-sm text-white/65 transition hover:text-brand">
                {i.label}
              </Link>
            ))}
            <Link to="/login" className="text-sm text-white/65 transition hover:text-brand">
              My account
            </Link>
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-extrabold tracking-[.18em] text-white/35 uppercase">Find us</h3>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/65">
            <p className="flex gap-3">
              <MapPin size={17} className="mt-1 shrink-0 text-brand" />
              {data.settings.address}
            </p>
            <a
              href={`tel:${data.settings.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 hover:text-brand"
            >
              <Phone size={17} className="text-brand" />
              {data.settings.phone}
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-extrabold tracking-[.18em] text-white/35 uppercase">Opening hours</h3>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/65">
            <p className="flex gap-3">
              <Clock3 size={17} className="mt-1 shrink-0 text-brand" />
              <span>
                {data.settings.hoursWeek}
                <br />
                {data.settings.hoursSunday}
              </span>
            </p>
            <a
              href={`https://wa.me/${data.settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-bold text-white hover:text-brand"
            >
              <MessageCircle size={17} className="text-brand" />
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-5 text-[10px] tracking-wider text-white/35 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>
            {"© "}
            {new Date().getFullYear()}
            {" Rocksteady Campus. All rights reserved."}
          </span>
          <span>Rockville, Soweto · South Africa</span>
        </div>
      </div>
    </footer>
  );
}
function MobileNav() {
  const { cartCount, setCartOpen } = useStore();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-black/10 bg-white/95 px-2 shadow-[0_-8px_30px_rgba(0,0,0,.08)] backdrop-blur-lg md:hidden"
      aria-label="Quick navigation"
    >
      <NavLink
        to="/"
        className={({ isActive: o }) =>
          `flex min-w-14 flex-col items-center gap-1 text-[9px] font-bold ${o ? "text-brand" : "text-neutral-500"}`
        }
      >
        <House size={19} />
        Home
      </NavLink>
      <NavLink
        to="/menu"
        className={({ isActive: o }) =>
          `flex min-w-14 flex-col items-center gap-1 text-[9px] font-bold ${o ? "text-brand" : "text-neutral-500"}`
        }
      >
        <UtensilsCrossed size={19} />
        Menu
      </NavLink>
      <Link
        to="/order"
        className="-mt-6 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-red-500/25"
      >
        <ShoppingBag size={21} />
        <span className="text-[8px] font-bold uppercase">Order</span>
      </Link>
      <button
        onClick={() => setCartOpen(true)}
        className="relative flex min-w-14 flex-col items-center gap-1 text-[9px] font-bold text-neutral-500"
      >
        <ShoppingBag size={19} />
        Cart
        {cartCount > 0 && (
          <span className="absolute -top-1 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[8px] text-white">
            {cartCount}
          </span>
        )}
      </button>
      <NavLink
        to="/login"
        className={({ isActive: o }) =>
          `flex min-w-14 flex-col items-center gap-1 text-[9px] font-bold ${o ? "text-brand" : "text-neutral-500"}`
        }
      >
        <UserRound size={19} />
        Account
      </NavLink>
    </nav>
  );
}
function Toast() {
  const { toast } = useStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          className="fixed bottom-20 left-1/2 z-[100] flex w-max max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-full bg-black px-5 py-3 text-xs font-semibold text-white shadow-2xl md:bottom-6"
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 10, x: "-50%" }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand">
            <Check size={12} />
          </span>
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function Layout({ children }: any) {
  const { data } = useStore();
  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <ItemModalHost />
      <Toast />
      <a
        href={`https://wa.me/${data.settings.whatsapp}?text=Hi%20Rocksteady%20Campus%2C%20I%27d%20like%20to%20place%20an%20order.`}
        target="_blank"
        rel="noreferrer"
        className="fixed right-5 bottom-20 z-30 hidden h-12 items-center gap-2 rounded-full bg-[#25D366] px-4 text-xs font-bold text-black shadow-xl transition hover:-translate-y-1 motion-reduce:hover:translate-y-0 lg:flex"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={19} />
        WhatsApp
      </a>
    </div>
  );
}
