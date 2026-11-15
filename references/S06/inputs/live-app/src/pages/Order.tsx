import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  Crosshair,
  Info,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { OrderTracker } from "../components/OrderTracker";
import { EmptyState, MenuCard, PageHero } from "../components/UI";
import { formatRand, useStore } from "../lib/store";

export default function OrderPage() {
  const {
    data,
    setData,
    cart,
    subtotal,
    getLinePrice,
    updateCartQuantity,
    removeFromCart,
    placeOrder,
    session,
    notify,
  } = useStore();
  const [N, h] = useSearchParams();
  const [b, p] = React.useState(N.get("checkout") === "1");
  const [f, P] = React.useState("all");
  const [v, R] = React.useState("");
  const [re, z] = React.useState(() => data.orders.find((s) => s.number === N.get("track"))?.id || "");
  const [fulfilment, setFulfilment] = React.useState(data.settings.collectionEnabled ? "Collection" : "Delivery");
  const [customerName, setCustomerName] = React.useState(session?.name || "");
  const q = data.customers.find((s) => s.id === session?.id);
  const [phone, setPhone] = React.useState(q?.phone || "");
  const [email, setEmail] = React.useState(session?.email || "");
  const [address, setAddress] = React.useState(q?.addresses[0] || "");
  const [instructions, setInstructions] = React.useState("");
  const [U, G] = React.useState("");
  const [promoCode, setPromoCode] = React.useState("");
  const [K, w] = React.useState("");
  const [location, setLocation] = React.useState<any>();
  const [W, $] = React.useState(false);
  const [i, ne] = React.useState<any>({});
  const Q = data.orders.find((s) => s.id === re);
  React.useEffect(() => {
    const s = N.get("checkout") === "1";
    p(s);
    if (s) {
      z("");
    }
  }, [N]);
  const ie = [...data.categories].sort((s, a) => s.order - a.order);
  const V = React.useMemo(
    () =>
      data.items
        .filter(
          (s) =>
            (f === "all" || s.category === f) &&
            (!v || `${s.name} ${s.description}`.toLowerCase().includes(v.toLowerCase())),
        )
        .sort((s, a) => s.order - a.order),
    [data.items, f, v],
  );
  const j = data.promotions.find((s) => s.active && s.code === promoCode);
  const L =
    j && subtotal >= j.minSpend ? Math.min(subtotal, j.type === "percent" ? (subtotal * j.value) / 100 : j.value) : 0;
  const M =
    fulfilment === "Delivery" ? (subtotal >= data.settings.freeDeliveryAbove ? 0 : data.settings.deliveryFee) : 0;
  const xe = Math.max(0, subtotal + M - L);
  const pe = () => {
    const s = U.trim().toUpperCase();
    const a = data.promotions.find((c) => c.active && c.code === s && new Date(c.expires) >= new Date());
    if (a) {
      if (subtotal < a.minSpend) {
        setPromoCode("");
        w(`Spend ${formatRand(a.minSpend)} to use ${s}.`);
      } else {
        setPromoCode(s);
        w(`${a.title} applied.`);
      }
    } else {
      setPromoCode("");
      w("That promo code is not active.");
    }
  };
  const ue = () => {
    if (!navigator.geolocation) {
      notify("Location is not supported by this browser");
      return;
    }
    $(true);
    navigator.geolocation.getCurrentPosition(
      (s) => {
        setLocation({ lat: s.coords.latitude, lng: s.coords.longitude });
        $(false);
        notify("Location pin added to your delivery");
      },
      () => {
        $(false);
        notify("We could not access your location. Enter your address instead.");
      },
      { enableHighAccuracy: true, timeout: 1e4 },
    );
  };
  const me = (s) => {
    s.preventDefault();
    const a: any = {};
    if (
      (customerName.trim() || (a.name = "Please enter your name."),
      /^[0-9+\s-]{9,15}$/.test(phone.trim()) || (a.phone = "Enter a valid South African mobile number."),
      fulfilment === "Delivery" && !address.trim() && (a.address = "Enter your delivery address."),
      cart.length || (a.cart = "Your cart is empty."),
      ne(a),
      Object.keys(a).length)
    )
      return;
    const c = placeOrder({
      customerName,
      phone,
      email,
      fulfilment,
      address,
      instructions,
      payment: fulfilment === "Collection" ? "Cash on collection" : "Cash on delivery",
      promoCode,
      location,
    });
    if (session?.role === "customer" && fulfilment === "Delivery" && address.trim()) {
      setData((m) => ({
        ...m,
        customers: m.customers.map((O) =>
          O.id === session.id && !O.addresses.includes(address.trim())
            ? { ...O, addresses: [address.trim(), ...O.addresses] }
            : O,
        ),
      }));
    }
    z(c.id);
    p(false);
    h({ track: c.number }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const ge = () => {
    z("");
    p(false);
    h({}, { replace: true });
    setPromoCode("");
    G("");
    w("");
  };
  if (Q) return <OrderConfirmation order={Q} onAnother={ge} />;
  return (
    <>
      <PageHero
        eyebrow={data.content.orderHeroEyebrow}
        title={b ? "CHECKOUT. ALMOST THERE." : data.content.orderHeroTitle}
        text={
          b
            ? "Confirm your details, choose collection or delivery and send your order straight to the Campus kitchen."
            : data.content.orderHeroText
        }
        image={data.images.orderHero}
      />
      <div className="border-b border-black/10 bg-white">
        <div className="container-site flex items-center gap-2 py-4 text-[10px] font-extrabold tracking-wider uppercase">
          <button
            onClick={() => {
              p(false);
              h({}, { replace: true });
            }}
            className={b ? "text-neutral-400" : "text-brand"}
          >
            1. Build your order
          </button>
          <ChevronRight size={13} className="text-neutral-300" />
          <span className={b ? "text-brand" : "text-neutral-400"}>2. Your details</span>
          <ChevronRight size={13} className="text-neutral-300" />
          <span className="text-neutral-400">{"3. Track & enjoy"}</span>
        </div>
      </div>
      <section className="min-h-[60vh] bg-cream py-10 sm:py-14">
        <div className="container-site">
          <AnimatePresence mode="wait">
            {b ? (
              <motion.form
                key={"checkout"}
                onSubmit={me}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="grid items-start gap-8 lg:grid-cols-[1fr_380px]"
              >
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => {
                      p(false);
                      h({}, { replace: true });
                    }}
                    className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-500 hover:text-brand"
                  >
                    <ArrowLeft size={15} />
                    Back to your order
                  </button>
                  <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-brand">
                        <Truck size={19} />
                      </span>
                      <div>
                        <h2 className="font-display text-3xl font-bold uppercase">How would you like it?</h2>
                        <p className="text-xs text-neutral-400">
                          {"Collection is free. Delivery from "}
                          {formatRand(data.settings.deliveryFee)}.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={!data.settings.collectionEnabled}
                        onClick={() => setFulfilment("Collection")}
                        className={`rounded-2xl border p-5 text-left transition disabled:opacity-40 ${fulfilment === "Collection" ? "border-brand bg-red-50 ring-1 ring-brand" : "border-black/10"}`}
                      >
                        <Store size={22} className={fulfilment === "Collection" ? "text-brand" : "text-neutral-400"} />
                        <span className="mt-3 block text-sm font-bold">Collection</span>
                        <span className="mt-1 block text-[11px] text-neutral-500">Ready in 20–30 min</span>
                      </button>
                      <button
                        type="button"
                        disabled={!data.settings.deliveryEnabled}
                        onClick={() => setFulfilment("Delivery")}
                        className={`rounded-2xl border p-5 text-left transition disabled:opacity-40 ${fulfilment === "Delivery" ? "border-brand bg-red-50 ring-1 ring-brand" : "border-black/10"}`}
                      >
                        <Truck size={22} className={fulfilment === "Delivery" ? "text-brand" : "text-neutral-400"} />
                        <span className="mt-3 block text-sm font-bold">Delivery</span>
                        <span className="mt-1 block text-[11px] text-neutral-500">
                          {"Free over "}
                          {formatRand(data.settings.freeDeliveryAbove)}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="font-display text-3xl font-bold uppercase">Your details</h2>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <label>
                        <span className="field-label">Full name *</span>
                        <input
                          className="field"
                          value={customerName}
                          onChange={(s) => setCustomerName(s.target.value)}
                          autoComplete="name"
                          placeholder="Your name"
                        />
                        {i.name && <span className="mt-1 block text-xs text-brand">{i.name}</span>}
                      </label>
                      <label>
                        <span className="field-label">Mobile number *</span>
                        <input
                          className="field"
                          value={phone}
                          onChange={(s) => setPhone(s.target.value)}
                          autoComplete="tel"
                          placeholder="e.g. 072 123 4567"
                        />
                        {i.phone && <span className="mt-1 block text-xs text-brand">{i.phone}</span>}
                      </label>
                      <label className="sm:col-span-2">
                        <span className="field-label">Email (for your receipt)</span>
                        <input
                          type="email"
                          className="field"
                          value={email}
                          onChange={(s) => setEmail(s.target.value)}
                          autoComplete="email"
                          placeholder="you@example.com"
                        />
                      </label>
                      {fulfilment === "Delivery" && (
                        <label className="sm:col-span-2">
                          <span className="field-label">Delivery address *</span>
                          <textarea
                            className="field min-h-24 resize-none"
                            value={address}
                            onChange={(s) => setAddress(s.target.value)}
                            autoComplete="street-address"
                            placeholder="Street, house number, suburb and a nearby landmark"
                          />
                          {i.address && <span className="mt-1 block text-xs text-brand">{i.address}</span>}
                          <button
                            type="button"
                            onClick={ue}
                            disabled={W}
                            className="mt-3 flex items-center gap-2 text-xs font-bold text-brand disabled:opacity-50"
                          >
                            <Crosshair size={15} />
                            {W
                              ? "Finding your location..."
                              : location
                                ? "Location pin added"
                                : "Use my current location"}
                          </button>
                          {location && (
                            <span className="ml-2 text-[10px] text-green-600">Pin saved with this order</span>
                          )}
                        </label>
                      )}
                      <label className="sm:col-span-2">
                        <span className="field-label">Special instructions</span>
                        <textarea
                          className="field min-h-20 resize-none"
                          value={instructions}
                          onChange={(s) => setInstructions(s.target.value)}
                          placeholder="Gate code, allergies, sauce on the side..."
                        />
                      </label>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="font-display text-3xl font-bold uppercase">Payment</h2>
                    <div className="mt-5 flex items-center gap-4 rounded-2xl border border-brand bg-red-50 p-4">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                        <Check size={14} />
                      </span>
                      <div>
                        <p className="text-sm font-bold">
                          {fulfilment === "Collection" ? "Cash on collection" : "Cash on delivery"}
                        </p>
                        <p className="mt-1 text-[11px] text-neutral-500">Pay when you receive your order.</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-neutral-50 p-4 opacity-60">
                      <Info size={18} />
                      <div>
                        <p className="text-sm font-bold text-neutral-500">Online card payment</p>
                        <p className="text-[11px] text-neutral-400">
                          Not available yet — secure payment integration has not been configured.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:sticky lg:top-32">
                  <div className="rounded-3xl bg-white p-6 shadow-lg">
                    <h2 className="font-display text-3xl font-bold uppercase">Order summary</h2>
                    <div className="mt-5 max-h-64 space-y-3 overflow-y-auto border-b border-black/10 pb-5">
                      {cart.map((s) => {
                        const a = data.items.find((c) => c.id === s.itemId);
                        return (
                          a && (
                            <div key={s.key} className="flex gap-3 text-xs">
                              <span className="font-bold">{s.quantity}×</span>
                              <div className="flex-1">
                                <p className="font-semibold">{a.name}</p>
                                {s.extras.length > 0 && (
                                  <p className="text-[10px] text-neutral-400">
                                    {s.extras.map((c) => c.name).join(", ")}
                                  </p>
                                )}
                              </div>
                              <span className="font-bold">{formatRand(getLinePrice(s))}</span>
                            </div>
                          )
                        );
                      })}
                    </div>
                    <div className="mt-5">
                      <label className="field-label">Promo code</label>
                      <div className="flex gap-2">
                        <input
                          value={U}
                          onChange={(s) => G(s.target.value)}
                          className="field !py-2.5 uppercase"
                          placeholder="CAMPUS10"
                        />
                        <button type="button" onClick={pe} className="btn-dark !min-h-10 !px-4 !py-2">
                          Apply
                        </button>
                      </div>
                      {K && <p className={`mt-2 text-[11px] ${promoCode ? "text-green-600" : "text-brand"}`}>{K}</p>}
                    </div>
                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal</span>
                        <span>{formatRand(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500">
                        <span>Delivery</span>
                        <span>{M === 0 && fulfilment === "Delivery" ? "FREE" : formatRand(M)}</span>
                      </div>
                      {L > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Promo discount</span>
                          <span>−{formatRand(L)}</span>
                        </div>
                      )}
                      <div className="flex items-end justify-between border-t border-black/10 pt-4">
                        <span className="font-bold">Total</span>
                        <span className="font-display text-4xl font-bold">{formatRand(xe)}</span>
                      </div>
                    </div>
                    <button type="submit" className="btn-primary mt-6 w-full" disabled={!cart.length}>
                      Place order
                      <ArrowRight size={16} />
                    </button>
                    <p className="mt-3 text-center text-[10px] leading-4 text-neutral-400">
                      By ordering, you confirm that your details are correct. No online payment will be taken.
                    </p>
                    {i.cart && <p className="mt-3 text-center text-xs text-brand">{i.cart}</p>}
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key={"browse"}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="grid items-start gap-8 lg:grid-cols-[1fr_380px]"
              >
                <div>
                  <div className="mb-6 flex flex-col gap-3">
                    <div className="relative">
                      <Search size={17} className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        value={v}
                        onChange={(s) => R(s.target.value)}
                        className="field !rounded-full !pl-11"
                        placeholder="What are you craving?"
                      />
                    </div>
                    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                      <button
                        onClick={() => P("all")}
                        className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-bold uppercase ${f === "all" ? "bg-black text-white" : "bg-white"}`}
                      >
                        All
                      </button>
                      {ie.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => P(s.id)}
                          className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-bold uppercase ${f === s.id ? "bg-brand text-white" : "bg-white"}`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {V.map((s) => (
                      <MenuCard key={s.id} item={s} compact />
                    ))}
                  </div>
                  {!V.length && (
                    <EmptyState
                      title="Nothing matched"
                      text="Try a different craving or browse the full menu."
                      actionLabel="Show all meals"
                      onAction={() => {
                        R("");
                        P("all");
                      }}
                    />
                  )}
                </div>
                <Icon
                  onCheckout={() => {
                    if (cart.length) {
                      p(true);
                      h({ checkout: "1" }, { replace: true });
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
  function Icon({ onCheckout }) {
    return (
      <aside className="rounded-3xl bg-white p-6 shadow-lg lg:sticky lg:top-32">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-bold uppercase">Your order</h2>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold">
            {cart.length}
            {" lines"}
          </span>
        </div>
        {cart.length ? (
          <>
            <div className="mt-5 max-h-[420px] space-y-4 overflow-y-auto">
              {cart.map((a) => {
                const c = data.items.find((m) => m.id === a.itemId);
                return c ? (
                  <div key={a.key} className="border-b border-black/[.07] pb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-bold">{c.name}</p>
                        <p className="mt-1 text-[10px] leading-4 text-neutral-400">
                          {a.option}
                          {a.extras.length ? ` · ${a.extras.map((m) => m.name).join(", ")}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(a.key)}
                        className="text-neutral-300 hover:text-brand"
                        aria-label={`Remove ${c.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-2 py-1">
                        <button
                          onClick={() => updateCartQuantity(a.key, a.quantity - 1)}
                          className="flex h-5 w-5 items-center justify-center"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-4 text-center text-[11px] font-bold">{a.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(a.key, a.quantity + 1)}
                          className="flex h-5 w-5 items-center justify-center"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span className="font-display text-xl font-bold">{formatRand(getLinePrice(a))}</span>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
            <div className="mt-5 flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-display text-2xl font-bold">{formatRand(subtotal)}</span>
            </div>
            <button onClick={onCheckout} className="btn-primary mt-5 w-full">
              Go to checkout
              <ArrowRight size={15} />
            </button>
            <p className="mt-3 text-center text-[10px] text-neutral-400">Collection or delivery available</p>
          </>
        ) : (
          <div className="py-12 text-center">
            <ShoppingBag size={30} className="mx-auto text-neutral-300" />
            <p className="mt-3 text-sm font-bold">Your cart is empty</p>
            <p className="mt-1 text-xs text-neutral-400">Add something delicious to get started.</p>
          </div>
        )}
      </aside>
    );
  }
}
function OrderConfirmation({ order, onAnother }: any) {
  const { data } = useStore();
  const n = encodeURIComponent(`Hi Rocksteady Campus, I would like an update on order ${order.number}.`);
  return (
    <section className="min-h-screen bg-cream pt-36 pb-20 sm:pt-44">
      <div className="container-site max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-xl shadow-red-500/20">
            <CircleCheck size={38} />
          </span>
          <p className="mt-6 text-[10px] font-extrabold tracking-[.2em] text-brand uppercase">
            Order sent to the kitchen
          </p>
          <h1 className="mt-3 font-display text-6xl leading-none font-black uppercase sm:text-7xl">
            {"Sharp, "}
            {order.customerName.split(" ")[0]}!
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-500">
            Your order is in. Keep your order number handy and follow its progress below.
          </p>
          <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-black px-6 py-3 text-white">
            <span className="text-[10px] text-white/50 uppercase">Order number</span>
            <span className="font-display text-2xl font-bold tracking-wide">{order.number}</span>
          </div>
        </motion.div>
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <OrderTracker order={order} />
          <div className="rounded-3xl bg-black p-6 text-white sm:p-8">
            <p className="text-[10px] font-bold tracking-wider text-brand uppercase">
              {"Your "}
              {order.fulfilment.toLowerCase()}
              {" details"}
            </p>
            <div className="mt-4 flex items-start gap-3">
              <MapPin size={18} className="mt-1 shrink-0 text-brand" />
              <div>
                <p className="text-sm font-bold">
                  {order.fulfilment === "Collection" ? data.settings.address : order.address}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {"Estimated "}
                  {order.fulfilment === "Collection" ? "20–30" : "35–50"}
                  {" minutes"}
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
              {order.lines.map((x, y) => (
                <div key={y} className="flex justify-between gap-3 text-xs">
                  <span className="text-white/65">
                    {x.quantity}
                    {"× "}
                    {x.name}
                  </span>
                  <span>{formatRand(x.unitPrice * x.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
              <span className="text-xs text-white/50">
                {"Total · "}
                {order.payment}
              </span>
              <span className="font-display text-3xl font-bold">{formatRand(order.total)}</span>
            </div>
            <a
              href={`https://wa.me/${data.settings.whatsapp}?text=${n}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-xs font-bold text-black"
            >
              <MessageCircle size={16} />
              Ask about this order
            </a>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={onAnother} className="btn-primary">
            Start another order
            <ArrowRight size={15} />
          </button>
          <Link to="/login" className="btn-outline">
            View in my account
          </Link>
        </div>
      </div>
    </section>
  );
}
