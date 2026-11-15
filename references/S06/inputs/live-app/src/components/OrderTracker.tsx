import { Check, ChefHat, Clock3, PackageCheck, ShoppingBag, Truck, X } from "lucide-react";

const statusIcon = (r) =>
  r === "Received" || r === "Accepted"
    ? ShoppingBag
    : r === "Preparing"
      ? ChefHat
      : r === "Ready"
        ? PackageCheck
        : r === "Out for delivery"
          ? Truck
          : r === "Completed"
            ? Check
            : X;
export function OrderTracker({ order, compact = false }: any) {
  const n =
    order.fulfilment === "Delivery"
      ? ["Received", "Accepted", "Preparing", "Out for delivery", "Completed"]
      : ["Received", "Accepted", "Preparing", "Ready", "Completed"];
  const o = order.status === "Ready" && order.fulfilment === "Delivery" ? 2 : n.indexOf(order.status);
  const c = order.status === "Rejected";
  return (
    <div className={compact ? "" : "rounded-3xl border border-black/10 bg-white p-6 sm:p-8"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold tracking-[.16em] text-brand uppercase">Live order progress</p>
          <h3 className="mt-1 font-display text-3xl font-bold uppercase">
            {c
              ? "Order not accepted"
              : order.status === "Completed"
                ? "Order completed"
                : order.status === "Received"
                  ? "Waiting for the kitchen"
                  : order.status}
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ${c ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {order.status}
        </span>
      </div>
      {!c && (
        <div className="relative mt-8 flex justify-between">
          {n.map((t, a) => {
            const Icon = statusIcon(t);
            const d = o >= a;
            const i = o === a;
            return (
              <div key={t} className="relative z-10 flex flex-1 flex-col items-center text-center">
                <div
                  className={`flex ${compact ? "h-8 w-8" : "h-11 w-11"} items-center justify-center rounded-full border-2 transition ${d ? "border-brand bg-brand text-white" : "border-neutral-200 bg-white text-neutral-300"} ${i ? "ring-4 ring-red-100" : ""}`}
                >
                  <Icon size={compact ? 14 : 18} />
                </div>
                <span
                  className={`mt-2 max-w-16 text-[8px] leading-3 font-bold uppercase sm:max-w-none sm:text-[9px] ${d ? "text-black" : "text-neutral-400"}`}
                >
                  {t}
                </span>
              </div>
            );
          })}
          <div className="absolute top-4 right-[10%] left-[10%] h-0.5 bg-neutral-200 sm:top-5">
            <div
              className="h-full bg-brand transition-all duration-700"
              style={{ width: `${(Math.max(0, o) / (n.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}
      {c && (
        <p className="mt-4 text-sm leading-6 text-neutral-500">
          Please call the store on 063 104 4361 and our team will help you with this order.
        </p>
      )}
      {!compact && (
        <div className="mt-8 border-t border-black/10 pt-6">
          <p className="mb-4 text-[10px] font-extrabold tracking-wider text-neutral-400 uppercase">Order updates</p>
          <div className="space-y-3">
            {[...order.history].reverse().map((t, a) => (
              <div key={`${t.at}-${a}`} className="flex items-center gap-3 text-xs">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
                  <Clock3 size={12} className="text-neutral-500" />
                </span>
                <span className="font-semibold">{t.status}</span>
                <span className="ml-auto text-neutral-400">
                  {new Date(t.at).toLocaleString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
