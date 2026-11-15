import { useState, type FormEvent } from "react";
import { type Config, summary } from "./model";

const EXAMPLES = [
  "A ground floor that opens fully to the garden, with a covered terrace on the south side.",
  "A quiet study under the roof with one large north-facing window for even daylight.",
  "Two children's bedrooms that can be joined into one room later.",
];
type Errors = Partial<Record<"name" | "email" | "prompt", string>>;
const KEY = "3dbr-briefs";

export function Brief({ config }: { config: Config }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [attach, setAttach] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<{ ref: string; name: string } | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter an email address we can reply to, like name@example.com.";
    if (prompt.trim().length < 20) next.prompt = "Describe what you would like in at least 20 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`brief-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    const ref = `BR-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    const entry = { ref, name: name.trim(), email: email.trim(), prompt: prompt.trim(), design: attach ? config : null, sentAt: new Date().toISOString() };
    try {
      const all = JSON.parse(localStorage.getItem(KEY) || "[]");
      localStorage.setItem(KEY, JSON.stringify([...all, entry]));
    } catch {
      /* Storage can be unavailable in private windows; the confirmation still shows. */
    }
    setSent({ ref, name: entry.name });
  };

  const field = (id: keyof Errors) => ({
    id: `brief-${id}`,
    "aria-invalid": errors[id] ? true : undefined,
    "aria-describedby": errors[id] ? `brief-${id}-error` : undefined,
  });
  const err = (id: keyof Errors) => errors[id] && <p className="field-error" id={`brief-${id}-error`}>{errors[id]}</p>;

  return (
    <section className="section brief" id="brief" aria-labelledby="brief-title">
      <div className="wrap brief-grid">
        <div className="brief-intro" data-reveal>
          <h2 id="brief-title">Your brief</h2>
          <p>Tell us, in your own words, what the configurator can't show: how you live, what the light should do, what has to fit. An architect reads every brief and replies with questions or a first sketch.</p>
          <p className="brief-examples-label" id="examples-label">Start from an example</p>
          <ul className="brief-examples" aria-labelledby="examples-label">
            {EXAMPLES.map((x) => (
              <li key={x}>
                <button type="button" className="example" onClick={() => setPrompt(x)}>{x}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="brief-panel glass">
          {sent ? (
            <div className="brief-done" role="status">
              <h3>Thank you, {sent.name}.</h3>
              <p>Your brief <strong>{sent.ref}</strong> has been received{attach ? " together with your configured design" : ""}. An architect will reply to you by email.</p>
              <button type="button" className="button button-quiet" onClick={() => { setSent(null); setPrompt(""); }}>Write another brief</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate aria-label="Send your customisation brief">
              <div className="field-row">
                <div className="field">
                  <label htmlFor="brief-name">Name</label>
                  <input {...field("name")} name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  {err("name")}
                </div>
                <div className="field">
                  <label htmlFor="brief-email">Email</label>
                  <input {...field("email")} name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  {err("email")}
                </div>
              </div>
              <div className="field">
                <label htmlFor="brief-prompt">What should we design for you?</label>
                <textarea {...field("prompt")} name="prompt" rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)} required placeholder="For example: a kitchen that faces the morning sun and opens to the garden." />
                {err("prompt")}
              </div>
              <label className="check">
                <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
                <span>Attach my configured design</span>
              </label>
              {attach && <p className="attached">{summary(config)}.</p>}
              <button type="submit" className="button">Send brief</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
