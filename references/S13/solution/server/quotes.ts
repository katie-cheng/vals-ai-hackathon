import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

// Stand-in for the deployed app's POST /api/quotes. Validation rules and error
// messages mirror the live endpoint's responses; accepted requests are appended
// to .data/quotes.jsonl. Email delivery to SITE.email is not wired up here.
type Quote = Record<string, unknown>;

function validate(q: Quote) {
  const s = (k: string) => (typeof q[k] === "string" ? (q[k] as string) : "");
  const errors: Record<string, string> = {};
  if (s("name").trim().length < 2) errors.name = "Tell us your name.";
  if (s("phone").replace(/\D/g, "").length < 10)
    errors.phone = "Enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s("email")))
    errors.email = "Enter a valid email address.";
  if (s("address").trim().length < 5)
    errors.address = "Enter the property street address.";
  if (s("town").trim().length < 2) errors.town = "Enter your Connecticut town.";
  if (!/^06\d{3}$/.test(s("zip").trim()))
    errors.zip = "Use a Connecticut ZIP code from 06000 to 06999.";
  if (!Array.isArray(q.services) || q.services.length === 0)
    errors.services = "Choose at least one service.";
  if (!s("stories")) errors.stories = "Select the property height.";
  return errors;
}

function handler(root: string) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== "/api/quotes" || req.method !== "POST") return next();
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let q: Quote = {};
      try {
        const parsed: unknown = JSON.parse(body || "{}");
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
          q = parsed as Quote;
      } catch {
        /* empty */
      }
      const send = (code: number, data: unknown) => {
        res.statusCode = code;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      };
      if (typeof q.companyWebsite === "string" && q.companyWebsite)
        return send(200, { ok: true, reference: "SS-000000" });
      const errors = validate(q);
      const keys = Object.keys(errors);
      if (keys.length) return send(400, { error: errors[keys[0]], errors });
      const reference = "SS-" + Date.now().toString(36).toUpperCase().slice(-6);
      const dir = resolve(root, ".data");
      mkdirSync(dir, { recursive: true });
      appendFileSync(
        resolve(dir, "quotes.jsonl"),
        JSON.stringify({ reference, at: new Date().toISOString(), ...q }) +
          "\n",
      );
      send(201, { ok: true, reference });
    });
  };
}

export function quotesApi(): Plugin {
  return {
    name: "quotes-api",
    configureServer(server) {
      server.middlewares.use(handler(server.config.root));
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler(server.config.root));
    },
  };
}
