async function submitQuote(a) {
  const i = await fetch("/api/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(a),
    }),
    r = await i.json().catch(() => null);
  if (!i.ok)
    throw new Error(
      r?.error || "Your request could not be saved. Please try again.",
    );
  return r;
}

export { submitQuote };
