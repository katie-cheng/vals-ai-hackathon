import React from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Facebook, House, Instagram, Menu, Minus, Music2, Plus, ShoppingBag, ShoppingCart, Trash2, UserRound, UtensilsCrossed, X } from "lucide-react";
import { formatRand, useStore } from "../lib/store";
import { DUR, EASE } from "./UI";

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
  const [menuOpen, setMenuOpen] = React.useState(false);
  React.useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <p className="flex h-8 items-center justify-center bg-brand px-4 text-center text-[13px] font-medium text-white">
          {data.content.announcement}
        </p>
        <div className="border-b border-white/10 bg-black text-white">
          <div className="container-site flex h-[68px] items-center justify-between gap-4">
            <Link to="/" aria-label="Rocksteady Campus home" className="shrink-0 rounded-md bg-white px-2 py-1">
              <Logo className="h-9 sm:h-10" />
            </Link>
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative py-2 text-sm font-medium whitespace-nowrap transition-colors hover:text-white ${isActive ? "text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand" : "text-white/70"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to={session?.role === "admin" ? "/admin" : "/login"}
                className="icon-btn hidden text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
                aria-label="Customer or administrator login"
              >
                <UserRound size={19} />
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="icon-btn relative text-white hover:bg-white/10"
                aria-label={`Open cart with ${cartCount} items`}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link to="/order" className="btn-primary btn-sm sm:h-10 sm:px-4 sm:text-sm">
                Order now
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className="icon-btn text-white hover:bg-white/10 lg:hidden"
                aria-label="Open navigation"
                aria-expanded={menuOpen}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE }}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="fixed top-0 right-0 bottom-0 z-[61] flex w-[min(88vw,380px)] flex-col bg-black p-6 text-white"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: DUR.base, ease: EASE }}
            >
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-md bg-white px-2 py-1">
                  <Logo className="h-10" />
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="icon-btn border border-white/20 hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="rule-list mt-8 flex flex-col" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `!border-white/10 py-3.5 font-display text-2xl font-semibold uppercase ${isActive ? "text-brand" : "text-white"}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto space-y-3 pt-8">
                <Link to="/order" onClick={() => setMenuOpen(false)} className="btn-primary w-full">
                  Order now
                </Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-white w-full">
                  {session ? "My account" : "Sign in or register"}
                </Link>
                <a
                  href={`tel:${data.settings.phone.replace(/\s/g, "")}`}
                  className="block py-2 text-center text-sm text-white/70 hover:text-white"
                >
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
            className="fixed inset-0 z-[70] bg-black/65"
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
            className="fixed top-0 right-0 bottom-0 z-[71] flex w-[min(94vw,470px)] flex-col bg-cream shadow-sm"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: DUR.base, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-5">
              <div>
                <h2 className="font-display text-2xl font-semibold uppercase">My cart ({cart.length})</h2>
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
                      <div key={v.key} className="rounded-lg bg-white p-4 shadow-sm">
                        <div className="flex gap-3">
                          <img
                            src={g.image}
                            alt=""
                            className="h-20 w-20 rounded-md object-cover"
                            style={{ objectPosition: "72% center" }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-semibold">{g.name}</h3>
                              <button
                                onClick={() => removeFromCart(v.key)}
                                className="text-neutral-600 hover:text-brand"
                                aria-label={`Remove ${g.name}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <p className="mt-1 text-xs leading-4 text-neutral-500">
                              {v.option}
                              {v.extras.length
                                ? `${v.option ? ", " : ""}${v.extras.map((y) => y.name).join(", ")}`
                                : ""}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-3 rounded-md bg-neutral-100 px-2 py-1">
                                <button
                                  onClick={() => updateCartQuantity(v.key, v.quantity - 1)}
                                  className="flex h-6 w-6 items-center justify-center"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-4 text-center text-xs font-semibold">{v.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(v.key, v.quantity + 1)}
                                  className="flex h-6 w-6 items-center justify-center"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                              <span className="font-display text-xl font-semibold">{formatRand(getLinePrice(v))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                  <button
                    onClick={clearCart}
                    className="mx-auto block pt-3 text-xs font-semibold text-neutral-600 hover:text-brand"
                  >
                    Clear cart
                  </button>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                    <ShoppingBag size={30} className="text-neutral-600" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold uppercase">Your cart is hungry</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
                    Add a fresh favourite and we will start building your order.
                  </p>
                  <Link to="/menu" onClick={() => setCartOpen(false)} className="btn-primary mt-6">
                    Explore menu
                  </Link>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-black/10 bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Subtotal</span>
                  <span className="font-display text-2xl font-semibold">{formatRand(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-600">Delivery and discounts are calculated at checkout.</p>
                <Link to="/order?checkout=1" onClick={() => setCartOpen(false)} className="btn-primary mt-5 w-full">
                  Checkout
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
        className="fixed inset-0 z-[80] bg-black/75"
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
        className="fixed inset-x-3 top-1/2 z-[81] mx-auto max-h-[90svh] max-w-3xl -translate-y-1/2 overflow-y-auto rounded-lg bg-white shadow-sm sm:inset-x-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DUR.base, ease: EASE }}
      >
        <button
          onClick={closeItem}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white"
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
          </div>
          <div className="p-6 sm:p-8">
            <h2 className="pr-10 font-display text-3xl leading-[1.05] font-semibold uppercase">{item.name}</h2>
            <p className="mt-1 text-base font-semibold">{formatRand(item.price)}</p>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{item.description}</p>
            {item.options.length > 0 && (
              <fieldset className="mt-6">
                <legend className="mb-3 text-xs font-semibold">Make it yours</legend>
                <div className="flex flex-wrap gap-2">
                  {item.options.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => x(w)}
                      className={`rounded-md border px-4 py-2 text-xs font-semibold transition ${m === w ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/30"}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {item.extras.length > 0 && (
              <fieldset className="mt-6">
                <legend className="mb-1 text-xs font-semibold">Add a little extra</legend>
                <p className="mb-3 text-xs text-neutral-600">Optional. Choose as many as you like.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {item.extras.map((w) => {
                    const C = d.includes(w.id);
                    return (
                      <label
                        key={w.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition ${C ? "border-brand bg-red-50" : "border-black/10 hover:border-black/25"}`}
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
              <div className="flex shrink-0 items-center gap-3 rounded-md bg-neutral-100 px-3">
                <button
                  onClick={() => c((w) => Math.max(1, w - 1))}
                  className="flex h-9 w-6 items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="w-4 text-center text-sm font-semibold">{r}</span>
                <button
                  onClick={() => c((w) => w + 1)}
                  className="flex h-9 w-6 items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
              <button onClick={() => addToCart(item, r, y, m, v)} className="btn-primary flex-1 !px-4">
                {"Add to cart, "}
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
  const socials = [
    { label: "Instagram", href: data.settings.instagram, icon: Instagram },
    { label: "Facebook", href: data.settings.facebook, icon: Facebook },
    { label: "TikTok", href: data.settings.tiktok, icon: Music2 },
  ];
  return (
    <footer className="bg-black pb-16 text-white md:pb-0">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Link to="/" aria-label="Rocksteady Campus home" className="inline-block rounded-md bg-white p-2.5">
            <Logo className="h-14" />
          </Link>
          <div className="mt-6 flex gap-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="icon-btn border border-white/20 text-white/80 hover:border-white hover:text-white"
                aria-label={social.label}
                title={social.label}
              >
                <social.icon size={17} />
              </a>
            ))}
          </div>
        </div>
        <nav className="lg:col-span-3" aria-label="Footer navigation">
          <h2 className="text-sm font-semibold">Explore</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {navLinks.slice(1).map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-white/70 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
            <Link to="/login" className="text-sm text-white/70 transition-colors hover:text-white">
              My account
            </Link>
          </div>
        </nav>
        <div className="lg:col-span-3">
          <h2 className="text-sm font-semibold">Talk to us</h2>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
            <a href={`tel:${data.settings.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-white">
              {data.settings.phone}
            </a>
            <a
              href={`https://wa.me/${data.settings.whatsapp}?text=Hi%20Rocksteady%20Campus%2C%20I%27d%20like%20to%20place%20an%20order.`}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-white"
            >
              WhatsApp us
            </a>
            <Link to="/contact" className="transition-colors hover:text-white">
              Address and opening hours
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-site py-5 text-[13px] text-white/60">
          {"© "}
          {new Date().getFullYear()}
          {" Rocksteady Campus. All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
function MobileNav() {
  const { cartCount, setCartOpen } = useStore();
  const tab = "flex h-full flex-1 flex-col items-center justify-center gap-1 text-xs font-medium";
  const link = ({ isActive }) => `${tab} ${isActive ? "text-brand" : "text-neutral-600"}`;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-black/10 bg-white md:hidden"
      aria-label="Quick navigation"
    >
      <NavLink to="/" className={link}>
        <House size={19} />
        Home
      </NavLink>
      <NavLink to="/menu" className={link}>
        <UtensilsCrossed size={19} />
        Menu
      </NavLink>
      <button onClick={() => setCartOpen(true)} className={`${tab} relative text-neutral-600`}>
        <ShoppingCart size={19} />
        Cart
        {cartCount > 0 && (
          <span className="absolute top-1.5 left-1/2 ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-xs leading-none text-white">
            {cartCount}
          </span>
        )}
      </button>
      <NavLink to="/login" className={link}>
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
          className="fixed bottom-20 left-1/2 z-[100] w-max max-w-[90vw] -translate-x-1/2 rounded-md bg-black px-4 py-3 text-sm font-medium text-white md:bottom-6"
          initial={{ opacity: 0, x: "-50%" }}
          animate={{ opacity: 1, x: "-50%" }}
          exit={{ opacity: 0, x: "-50%" }}
          transition={{ duration: DUR.base, ease: EASE }}
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function Layout({ children }: any) {
  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <ItemModalHost />
      <Toast />
    </div>
  );
}
