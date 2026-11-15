// Task-specific part of the verifier: the Chez l'habitant Amazigh brief's checklist (business facts, eight standalone pages,
// French/English/Arabic with RTL, reservation inquiry, map and directions) and its prohibitions (no invented contact details,
// capacity, availability or stock photos). grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of tasks/verifier/.
// Copy is matched in English or French, whichever the site opens in; nothing is compared with the golden reference.
import { assignPages, attempt, checkMobileMenu, freshPage, hexDistance, newLines } from "./lib.mjs";

export const HANDOFF_URLS = /wa\.me|whatsapp\.com/;
export const SLOP_EXEMPT = {};

const ROLES = {
  story: [/story|histoire|about|famil|propos/, /story|histoire|about|famille|family/],
  accommodation: [/accommodation|hebergement|h%c3%a9bergement|rooms?|chambres?|stay|logement|maison|house/, /accommodation|h.bergement|rooms|chambres|the house|la maison/],
  gastronomy: [/gastronom|food|cuisine|table|dining|repas/, /gastronom|food|cuisine|table/],
  experiences: [/experience|exp%c3%a9rience|activit|things/, /exp.rience|experience|activit/],
  gallery: [/galler|galerie|photos?/, /galler|galerie|photo/],
  location: [/location|acces|acc%c3%a8s|access|map|directions|getting|find|situation|localisation|carte/, /location|acc.s|map|carte|directions|find us/],
  contact: [/contact|reserv|r%c3%a9serv|book|inquir/, /contact|r.serv|reserv|book/],
};
const NAV_ITEMS = ["home", "our story", "story", "accommodation", "gastronomy", "experiences", "gallery", "location", "contact", "reservations", "reserve", "book",
  "accueil", "notre histoire", "histoire", "h bergement", "gastronomie", "exp riences", "galerie", "acc s", "acces", "localisation", "r server", "r servations"];
const PALETTE = ["#d8c2a0", "#a65f3f", "#46513a", "#f7f1e7", "#30271f"];
const ARABIC_FONTS = /arab|naskh|kufi|amiri|tajawal|cairo|almarai|lateef|scheherazade|harmattan|messiri|markazi|reem|changa|readex|vazir|lalezar|mada|harir|baloo bhaijaan|aref|rakkas|jomhuria|el messiri|ibm plex sans arabic|alexandria|zain/i;
const STOCK_HOSTS = /unsplash\.com|pexels\.com|pixabay\.com|picsum\.photos|placehold|placeimg|loremflickr|istockphoto|shutterstock|gettyimages|stock\.adobe|freepik/i;
const INQUIRY = { name: "Lena Moreau", reply: "lena.moreau@example.com", message: "Two adults, arriving in the afternoon." };

const fold = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " ");
const fraction = (found, total) => found / total;
const num = (s) => s.replace(".", "[.,]");

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const pages = views.desktop.pages;
  const home = pages[0].facts;
  const byRole = assignPages(pages, ROLES);
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  const all = fold(pages.map((p) => p.facts.text).join("\n"));
  const hrefs = pages.flatMap((p) => p.facts.clickables.map((c) => c.href));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail: String(detail ?? "").slice(0, 300) });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);
  const scoreList = (id, desc, list) => {
    const found = list.filter(([, re]) => re.test(all));
    add(id, desc, fraction(found.length, list.length), `missing: ${list.filter((x) => !found.includes(x)).map(([n]) => n).join(", ") || "none"}`);
  };
  const roleText = (r) => fold(byRole[r]?.facts?.text || "");

  add("name", "Business name Gîte chez l'habitant Amazigh", /gite chez l'habitant amazigh/.test(all) ? 1 : 0);
  add("listing-name", "Alternative listing name AmazighTiken", /amazigh ?tiken/.test(all) ? 1 : 0);
  scoreList("host-family", "Mohamed, his wife and two sons", [["Mohamed", /mohamed/], ["wife", /wife|epouse|femme/], ["two sons", /two sons|2 sons|deux fils|2 fils/]]);
  scoreList("address", "Address: Ghassate, Ouarzazate, 45022, Morocco", [["Ghassate", /ghassate/], ["Ouarzazate", /ouarzazate/], ["45022", /45022/], ["Morocco", /morocco|maroc/]]);
  add("gps", "GPS coordinates shown", (/31[.,]178871/.test(all) ? 0.5 : 0) + (/-6[.,]813136/.test(all) ? 0.5 : 0));
  add("maps-link", "Google Maps link to the coordinates", hrefs.some((h) => /google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl/.test(h) && /31\.17887/.test(h)) ? 1 : 0);
  fromAct("map", "Location page has an interactive map", "map");
  add("booking-link", "Booking.com listing linked", hrefs.some((h) => /booking\.com\/hotel\/ma\/chez-l-habitant-amazightiken/.test(h)) ? 1 : 0);
  add("airbnb-link", "Airbnb listing linked", hrefs.some((h) => /airbnb\.[a-z.]+\/rooms\/956593018740086715/.test(h)) ? 1 : 0);
  scoreList("languages-spoken", "Family speaks Arabic, French, English, Spanish, Portuguese",
    [["Arabic", /arabic|arabe/], ["French", /french|francais/], ["English", /english|anglais/], ["Spanish", /spanish|espagnol/], ["Portuguese", /portuguese|portugais/]]);
  scoreList("facilities", "Property facilities listed", [
    ["three bedrooms", /(three|3|trois) (bed)?(rooms|chambres)/], ["living room", /living room|salon|lounge/], ["bathroom/shower", /shower|douche|bathroom|salle de bains?/],
    ["kitchen", /kitchen|cuisine/], ["garden", /garden|jardin/], ["terrace", /terrace|terrasse/], ["mountain views", /mountain|montagne/], ["hammam", /hammam/],
    ["parking", /parking/], ["wi-fi", /wi-?fi/], ["billiards", /billiard|billard/], ["fireplace", /fireplace|cheminee/], ["bar/coffee", /\bbar\b|coffee|cafe/],
    ["sauna", /sauna/], ["family friendly", /family|famil|children|enfants/], ["pets", /pets?\b|animaux/]]);
  const caveat = (word) => new RegExp(`${word.source}[^\\n]{0,160}(confirm|on request|subject to|ask|a confirmer|sous reserve|demande|verify|check)`).test(all);
  add("conditional-facilities", "Sauna and pets are stated as subject to confirmation", (caveat(/sauna/) ? 0.5 : 0) + (caveat(/\bpets?\b|animaux/) ? 0.5 : 0));
  const capacity = all.match(/\b(sleeps|accommodates|up to|jusqu'a|capacity( of)?|capacite( de)?|max(imum)?)\s*:?\s*\d+\s*(guests|people|persons|personnes|voyageurs|adults)?|\b\d+\s*(guests|people|persons|personnes|voyageurs)\s*(max|maximum)\b|\b\d+\s*(double |single |twin )?(beds|lits)\b/);
  add("no-exact-capacity", "No exact capacity or bed count advertised", capacity ? 0 : 1, capacity?.[0]);
  add("sleeping-arrangements", "Sleeping arrangements mentioned as to be confirmed", all.split(/(?<=[.!?\n])/).some((s) => /sleeping|couchage|beds|lits/.test(s) && /confirm/.test(s)) ? 1 : 0);
  scoreList("food", "Breakfast, bread, jams, seasonal produce, tagines, lunch and dinner", [
    ["breakfast", /breakfast|petit-?dejeuner/], ["bread", /bread|pain/], ["jams", /jam|confiture/], ["fruits/vegetables", /fruit|vegetable|legume/],
    ["tagines", /tagine|tajine/], ["lunch/dinner", /(lunch|dejeuner).{0,40}(dinner|diner)|(dinner|diner).{0,40}(lunch|dejeuner)/]]);
  const onRequest = /(lunch|dinner|meals?|dejeuner|diner|repas)[^.\n]{0,120}(on request|upon request|sur demande|not included|extra|supplement|ask|a la demande)|(on request|sur demande)[^.\n]{0,60}(lunch|dinner|meals?|dejeuner|diner|repas)/.test(all);
  const allIncluded = all.match(/all meals (are )?included|full board included|pension complete incluse|tous les repas (sont )?inclus|all[- ]inclusive/);
  add("meals-not-included", "Meals beyond breakfast are on request, not assumed included", allIncluded ? 0 : onRequest ? 1 : 0.5, allIncluded?.[0] || (onRequest ? "on request" : "no on-request wording"));
  scoreList("experiences", "Hammam, garden/farm, village walks, Kasbah, museum, cultural exchange", [
    ["hammam", /hammam/], ["garden/farm", /farm|ferme|potager|garden walk|jardin/], ["village walks", /village/], ["kasbah", /kasbah|casbah/], ["museum", /museum|musee/],
    ["cultural exchange", /cultur/]]);
  scoreList("ratings", "Booking.com scores: 9.4/10, 51 reviews and the seven categories", [
    ["9.4", new RegExp(num("9.4"))], ["51 reviews", /51\s*(guest |verified )?(reviews|avis|commentaires)|(reviews|avis|commentaires)\D{0,12}51/], ["staff 9.8", new RegExp(num("9.8"))], ["value 9.6", new RegExp(num("9.6"))],
    ["location 9.3", new RegExp(num("9.3"))], ["facilities 9.2", new RegExp(num("9.2"))], ["cleanliness 9.1", new RegExp(num("9.1"))], ["wi-fi 7.5", new RegExp(num("7.5"))]]);
  const ratingPage = pages.find((p) => new RegExp(num("9.4")).test(p.facts.text) && /9[.,]8/.test(p.facts.text));
  add("rating-attribution", "Ratings are attributed to Booking.com", ratingPage && /booking\.com/i.test(ratingPage.facts.text) ? 1 : 0, ratingPage?.path || "no page with the scores");
  scoreList("policies", "Check-in/out times, children, pets, parties, cancellation", [
    ["check-in 10:00-21:00", /10[:h.]00\s*(–|-|to|a|au|and|et)\s*21[:h.]00/], ["check-out 09:00-18:00", /0?9[:h.]00\s*(–|-|to|a|au|and|et)\s*18[:h.]00/],
    ["children", /children|enfants|kids/], ["pets", /pets?\b|animaux/], ["no parties", /part(y|ies)|fetes?|events?|evenements?/], ["cancellation", /cancell?ation|annulation/]]);
  add("policies-confirmed", "Policies to be confirmed with the owner before direct reservations", /(polic|conditions|regle|reglement|rules)[^\n]{0,160}confirm|confirm[^\n]{0,160}(polic|conditions|regle|rules)/.test(all) ? 1 : 0);
  const affirmed = (re, text = all) => [...text.matchAll(new RegExp(re.source, "g"))].find((m) => !/(\bno|\bnot|never|n't|\bpas|aucune?|until|before|once|avant|jusqu'a|sans)\W+(\w+\W+){0,3}$/.test(text.slice(Math.max(0, m.index - 40), m.index)));
  const fake = affirmed(/real[- ]time availability|instant(ly)? (booking )?confirm|(booking|reservation|stay) (is |has been )?confirmed|(reservation|booking) confirmed|reservation (est )?confirmee|disponibilite en temps reel|book instantly with us/);
  const postSubmit = fold(act.inquiryConfirmation?.text || "");
  const fakeAfter = affirmed(/(booking|reservation|stay) (is |has been )?confirmed|reservation (est )?confirmee|you('re| are) booked/, postSubmit);
  add("no-false-availability", "No false real-time availability or confirmed reservation", fake || fakeAfter ? 0 : 1, (fake || fakeAfter)?.[0]);
  const invented = [
    ...hrefs.filter((h) => /^tel:.*\d{6}/.test(h) || /^mailto:[^?]*@/.test(h) || /(wa\.me|whatsapp\.com\/send|api\.whatsapp\.com).*\d{6}/.test(h)),
    ...(all.match(/(\+212|00212)[\s\d().-]{8,}|\b0[5-7](?:[\s.-]?\d{2}){4}\b|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g) || []).filter((m) => !/example\.(com|org)/.test(m)),
    ...(act.handoffNumbers || []),
  ];
  add("no-invented-contact", "No invented WhatsApp, phone or email", invented.length ? 0 : 1, invented.slice(0, 3).join(", "));
  const claims = all.match(/\b\d+\s*\+\s*(guests|travell?ers|years|reviews|visitors)|\bsince (19|20)\d\d\b|\bdepuis (19|20)\d\d\b|\b[1-5][.,]\d\s*\/\s*5\b|★|\baward[- ]winning\b|\b\d+ years of (experience|hospitality)\b/);
  add("no-invented-claims", "No invented stats, founding dates or other ratings", claims ? 0 : 1, claims?.[0]);
  fromAct("no-stock-photos", "No stock-photo hosts used instead of property photographs", "stockPhotos");

  const found = Object.keys(ROLES).filter((r) => byRole[r]);
  add("pages", "Eight standalone pages: story, accommodation, gastronomy, experiences, gallery, location, contact", fraction(found.length, 7),
    Object.keys(ROLES).map((r) => `${r} ${byRole[r]?.path || "missing"}`).join(", "));
  const substantial = found.filter((r) => roleText(r).length >= 500);
  add("pages-have-content", "Each page has its own content (500+ characters)", fraction(substantial.length, 7), substantial.join(", "));
  fromAct("deep-links", "Every page loads directly from its URL", "deepLinks");
  add("home-booking-cta", "Home page has a booking call to action", home.clickables.some((c) => c.visible && !c.inHeader && /book|reserv|inquir|stay|sejour|contact/i.test(fold(c.text))) ? 1 : 0);
  fromAct("hero", "Home opens on a large photographic hero", "hero");
  fromAct("gallery", "Gallery page shows the property photographs (8+)", "gallery");
  const headerTexts = home.clickables.filter((c) => c.inHeader).map((c) => fold(c.text));
  const navHits = Object.values(ROLES).filter((res) => headerTexts.some((t) => res[1].test(t)));
  add("nav", "Header navigation links to the pages", Math.min(1, navHits.length / 6), `${navHits.length} of 7 pages in the header`);
  fromAct("mobile-menu", "Responsive mobile menu", "mobileMenu");

  const contact = byRole.contact?.facts;
  add("whatsapp-button", "WhatsApp booking control on the contact page", contact?.clickables.some((c) => /whatsapp/i.test(c.text) || /wa\.me|whatsapp/.test(c.href)) ? 1 : 0);
  scoreList("contact-channels", "Contact page lists WhatsApp, telephone and email", [["whatsapp", /whatsapp/], ["telephone", /phone|telephone/], ["email", /e-?mail|courriel/]].map(([n, re]) => [n, { test: () => re.test(roleText("contact")) }]));
  fromAct("inquiry-fields", "Inquiry form: arrival, departure, guests, name, contact, message", "inquiryFields");
  fromAct("inquiry-validation", "Empty inquiry is blocked with validation", "inquiryValidation");
  fromAct("inquiry-date-order", "Departure before arrival is rejected", "inquiryDateOrder");
  fromAct("inquiry-confirmation", "Valid inquiry shows a confirmation that it is a request", "inquiryConfirmation");
  fromAct("lang-arabic", "Arabic switch translates the site and sets RTL", "langArabic");
  fromAct("lang-arabic-pages", "Arabic translation carries through the other pages", "langArabicPages");
  fromAct("arabic-font", "Arabic uses an Arabic typeface", "arabicFont");
  fromAct("lang-french", "French switch translates the site", "langFrench");
  const ld = home.ldjson.join(" ");
  add("seo", "SEO: title and description name Ouarzazate/Ghassate; lodging structured data with address",
    (/ouarzazate|ghassate/i.test(home.title) ? 1 / 3 : 0) + (/ouarzazate|ghassate/i.test(home.metaDescription) ? 1 / 3 : 0)
    + (/LodgingBusiness|BedAndBreakfast|Hotel|GuestHouse|Hostel|VacationRental|LocalBusiness/.test(ld) && /45022|Ghassate|Ouarzazate/.test(ld) ? 1 / 3 : 0), home.title);
  const paletteFound = PALETTE.filter((p) => home.colors.some((c) => hexDistance(c, p) <= 6));
  add("palette", "Uses the brief's palette", Math.min(1, paletteFound.length / 4), `found: ${paletteFound.join(", ")}`);
  const h1Font = (home.headings.find((h) => h.tag === "h1")?.font || "").toLowerCase();
  const bodyFont = (Object.entries(home.bodyFonts).sort((a, b) => b[1] - a[1])[0]?.[0] || "").toLowerCase();
  const generic = /^(serif|sans-serif|system-ui|arial|helvetica|times new roman|times|georgia|-apple-system|segoe ui|roboto)$/;
  add("fonts", "Editorial heading face paired with a readable body face", (h1Font && h1Font !== bodyFont && !generic.test(h1Font) ? 0.5 : 0) + (bodyFont && !generic.test(bodyFont) ? 0.5 : 0), `h1 ${h1Font}, body ${bodyFont}`);
  fromAct("a11y", "Images have alt text and form fields have labels", "a11y");
  return items;
}

/** In-page: Arabic share of letters, direction, and fonts of the main text and h1. */
function langState() {
  const t = document.body.innerText;
  const arabic = (t.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  const words = (t.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿœ']+/g) || []);
  const count = (list) => words.filter((w) => list.includes(w)).length;
  const fr = count(["le", "la", "les", "et", "des", "du", "une", "pour", "avec", "votre", "vous", "est", "dans", "sur", "nous", "au", "aux"]);
  const en = count(["the", "and", "with", "your", "for", "you", "is", "in", "on", "our", "of", "to", "we", "at"]);
  const p = document.querySelector("main p, p");
  const fam = (el) => (el ? getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim() : "");
  const brand = document.querySelector("header a[href='/'], header a") || document.querySelector("header *");
  const rect = brand?.getBoundingClientRect();
  return {
    arabicShare: arabic / Math.max(1, arabic + latin), frShare: fr / Math.max(1, fr + en),
    rtl: document.documentElement.dir === "rtl" || getComputedStyle(document.body).direction === "rtl" || getComputedStyle(document.querySelector("main") || document.body).direction === "rtl",
    brandRight: rect ? rect.left + rect.width / 2 > innerWidth / 2 : false,
    bodyFont: fam(p), h1Font: fam(document.querySelector("h1")), path: location.pathname + location.hash,
  };
}

/** Clicks the control that switches to `code` (opening a language menu first if needed). */
async function switchLanguage(page, code) {
  const names = { ar: "ar|عربي|العربية|عربية|arabic|arabe", fr: "fr|français|francais|french", en: "en|english|anglais|الإنجليزية|إنجليزية" }[code];
  const exact = new RegExp(`^\\s*(${names})\\s*$`, "i");
  const find = () => page.evaluate(({ code, src }) => {
    const re = new RegExp(src, "i");
    const els = [...document.querySelectorAll("a,button,[role=button],[role=option],[role=menuitem],[role=menuitemradio],option,li")];
    const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    const el = els.find((e) => visible(e) && ((e.innerText || "").split("\n").some((l) => re.test(l)) || re.test(e.getAttribute("aria-label") || "") || e.getAttribute("lang") === code || e.getAttribute("hreflang") === code
      || new RegExp(`^/${code}(/|$)`).test(e.getAttribute("href") || "") || (e.getAttribute("href") || "").includes(`lang=${code}`)));
    document.querySelectorAll("[data-sb-lang]").forEach((x) => x.removeAttribute("data-sb-lang"));
    if (el) el.setAttribute("data-sb-lang", "1");
    return !!el;
  }, { code, src: exact.source });
  if (!(await find())) {
    const select = page.locator("select:visible").filter({ has: page.locator(`option[value^="${code}" i]`) }).first();
    if (await select.count()) {
      await select.selectOption({ value: await select.locator(`option[value^="${code}" i]`).first().getAttribute("value") });
      await page.waitForTimeout(1500);
      return true;
    }
    const opener = page.locator("header button:visible, nav button:visible").filter({ hasText: /^\s*(en|fr|ar|english|français|language|langue|🌐)\s*$/i }).first();
    const labelled = page.locator("[aria-label*='language' i]:visible, [aria-label*='langue' i]:visible, [aria-haspopup]:visible").first();
    const target = (await opener.count()) ? opener : labelled;
    if (!(await target.count())) return false;
    await target.click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(600);
    if (!(await find())) return false;
  }
  await page.locator("[data-sb-lang]").first().click({ timeout: 5000 });
  await page.waitForTimeout(1800);
  return true;
}

/** Marks the inquiry form (the form holding a date input, else the nearest ancestor of two date inputs) and its fields. */
function markInquiry() {
  const describe = (f) => [f.type, f.name, f.id, f.placeholder, f.getAttribute("aria-label"), f.labels?.[0]?.innerText, f.closest("label")?.innerText].join(" ").toLowerCase();
  const usable = (f) => !["hidden", "submit", "button", "checkbox", "radio"].includes(f.type) && f.getBoundingClientRect().width > 2 && f.checkVisibility();
  const dates = [...document.querySelectorAll("input")].filter((f) => usable(f) && (f.type === "date" || /arriv|depart|check.?in|check.?out|date/.test(describe(f))));
  if (!dates.length) return { found: false, kinds: [] };
  let scope = dates[0].closest("form");
  if (!scope) {
    scope = dates[0].parentElement;
    while (scope && scope !== document.body && scope.querySelectorAll("input,select,textarea").length < 4) scope = scope.parentElement;
  }
  scope.setAttribute("data-sb", "inquiry");
  const fields = [...scope.querySelectorAll("input,select,textarea")].filter(usable);
  const kinds = {
    arrival: (f, t) => /arriv|check.?in|from|start|debut/.test(t) && (f.type === "date" || /date/.test(t)),
    departure: (f, t) => /depart|check.?out|until|end|fin|leav/.test(t) && (f.type === "date" || /date/.test(t)),
    guests: (f, t) => /guest|people|person|voyageur|personne|adult|traveller|hote/.test(t),
    name: (f, t) => /\bname\b|\bnom\b|full ?name/.test(t),
    reply: (f, t) => f.type === "email" || f.type === "tel" || /e-?mail|phone|telephone|whatsapp|contact/.test(t),
    message: (f, t) => f.tagName === "TEXTAREA" || /message|request|note|comment/.test(t),
  };
  const marked = [];
  for (const [kind, match] of Object.entries(kinds)) {
    const f = fields.find((x) => !x.hasAttribute("data-sbf") && match(x, describe(x)));
    if (f) f.setAttribute("data-sbf", kind), marked.push(kind);
  }
  const unmarkedDates = fields.filter((f) => f.type === "date" && !f.hasAttribute("data-sbf"));
  if (!marked.includes("arrival") && unmarkedDates[0]) unmarkedDates.shift().setAttribute("data-sbf", "arrival"), marked.push("arrival");
  if (!marked.includes("departure") && unmarkedDates[0]) unmarkedDates.shift().setAttribute("data-sbf", "departure"), marked.push("departure");
  const buttons = [...scope.querySelectorAll("button,input[type=submit],[role=button]")].filter((b) => b.getBoundingClientRect().width > 0);
  const submit = buttons.find((b) => b.type === "submit") || buttons.reverse().find((b) => /send|request|submit|[ei]nquir|book|reserv|envoyer|demande|whatsapp|prepar|continue|confirm/i.test(b.innerText || b.value));
  if (submit) submit.setAttribute("data-sb", "inquiry-submit");
  return { found: true, kinds: marked, submit: !!submit };
}

const isoDate = (days) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

async function fillInquiry(page, values) {
  const filled = [];
  for (const [kind, value] of Object.entries(values)) {
    const f = page.locator(`[data-sbf="${kind}"]`);
    if (!(await f.count())) continue;
    try {
      const tag = await f.evaluate((el) => el.tagName);
      if (tag === "SELECT") await f.selectOption({ index: Math.min(2, (await f.locator("option").count()) - 1) }, { timeout: 3000 });
      else await f.fill(String(value), { timeout: 3000 });
      filled.push(kind);
    } catch {
      // A field that refuses input stays unfilled and the form's own validation decides.
    }
  }
  // Consent or terms checkboxes the form requires are ticked like a guest would.
  for (const box of await page.locator('[data-sb="inquiry"] input[type=checkbox]:not([name*=website i])').all()) await box.check({ force: true, timeout: 2000 }).catch(() => {});
  return filled;
}

const blocked = () => [...document.querySelector('[data-sb="inquiry"]').querySelectorAll("input,select,textarea")].some((f) => !f.checkValidity() || f.getAttribute("aria-invalid") === "true");

export async function interactDesktop(context, url, handoffs, pages) {
  const byRole = assignPages(pages, ROLES);
  const contactUrl = byRole.contact?.url || url;
  const out = {};

  out.deepLinks = await attempt(async () => {
    const bad = [];
    for (const p of pages.slice(1)) {
      const page = await context.newPage();
      const res = await page.goto(p.url, { waitUntil: "load", timeout: 60_000 }).catch(() => null);
      await page.waitForTimeout(800);
      const len = await page.evaluate(() => document.body.innerText.length).catch(() => 0);
      if (!res || !res.ok() || len < 200) bad.push(p.path);
      await page.close();
    }
    return { pass: pages.length > 1 && !bad.length, score: pages.length > 1 ? 1 - bad.length / (pages.length - 1) : 0, detail: bad.length ? `broken: ${bad.join(", ")}` : `${pages.length - 1} pages` };
  });

  // One pass over every page: image sources (stock hosts), alt text, labels, and the map on the location page.
  const scan = await attempt(async () => {
    const result = { stock: [], imgs: 0, alts: 0, fields: 0, labelled: 0, map: null, galleryImgs: 0 };
    for (const p of pages) {
      const page = await freshPage(context, p.url);
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
      const r = await page.evaluate(() => {
        const imgs = [...document.images].filter((i) => i.getBoundingClientRect().width > 40);
        const bgs = [...document.querySelectorAll("body *")].map((e) => getComputedStyle(e).backgroundImage).filter((b) => b.includes("url("));
        const fields = [...document.querySelectorAll("input,select,textarea")].filter((f) => !["hidden", "submit", "button"].includes(f.type) && f.getBoundingClientRect().width > 2 && f.checkVisibility());
        const map = [...document.querySelectorAll("iframe")].map((f) => f.src).find((s) => /google\.[a-z.]+\/maps|maps\.google|openstreetmap|mapbox|bing\.com\/maps|here\.com|umap|maps\.apple/.test(s))
          || (document.querySelector(".leaflet-container,.maplibregl-map,.mapboxgl-map,.gm-style,.ol-viewport") ? "map library" : null);
        return {
          srcs: [...imgs.map((i) => i.currentSrc || i.src), ...bgs, ...[...document.querySelectorAll("video source, video")].map((v) => v.src || "")],
          imgs: imgs.length, alts: imgs.filter((i) => i.hasAttribute("alt")).length,
          fields: fields.length, labelled: fields.filter((f) => f.labels?.length || f.getAttribute("aria-label") || f.getAttribute("aria-labelledby") || f.closest("label")).length,
          map, photoCount: imgs.filter((i) => i.naturalWidth >= 300).length,
        };
      });
      result.stock.push(...r.srcs.filter((s) => STOCK_HOSTS.test(s)));
      result.imgs += r.imgs; result.alts += r.alts; result.fields += r.fields; result.labelled += r.labelled;
      if (p.path === byRole.location?.path && r.map) result.map = r.map;
      if (p.path === byRole.gallery?.path) result.galleryImgs = r.photoCount;
      await page.close();
    }
    return result;
  });
  out.stockPhotos = scan.stock ? { pass: !scan.stock.length, detail: scan.stock.length ? `${scan.stock.length} stock images, e.g. ${scan.stock[0].slice(0, 100)}` : "none" } : scan;
  out.map = scan.stock ? { pass: !!scan.map, detail: scan.map ? String(scan.map).slice(0, 120) : byRole.location ? "no map on the location page" : "no location page" } : scan;
  out.gallery = scan.stock ? { pass: scan.galleryImgs >= 8, score: Math.min(1, scan.galleryImgs / 8), detail: byRole.gallery ? `${scan.galleryImgs} photos on ${byRole.gallery.path}` : "no gallery page" } : scan;
  out.a11y = scan.stock ? { pass: true, score: ((scan.imgs ? scan.alts / scan.imgs : 1) + (scan.fields ? scan.labelled / scan.fields : 0)) / 2, detail: `alt ${scan.alts}/${scan.imgs}, labelled fields ${scan.labelled}/${scan.fields}` } : scan;

  out.hero = await attempt(async () => {
    const page = await freshPage(context, url);
    const area = await page.evaluate(() => {
      let best = 0;
      for (const el of document.querySelectorAll("img,video,picture,section,header,div")) {
        const cs = getComputedStyle(el);
        const media = el.tagName === "IMG" || el.tagName === "VIDEO" || cs.backgroundImage.includes("url(");
        if (!media) continue;
        const r = el.getBoundingClientRect();
        const w = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
        const h = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
        best = Math.max(best, (w * h) / (innerWidth * innerHeight));
      }
      return best;
    });
    await page.close();
    return { pass: area >= 0.4, detail: `largest photo or video covers ${Math.round(area * 100)}% of the first screen` };
  });

  const fieldPage = await freshPage(context, contactUrl);
  out.inquiryFields = await attempt(async () => {
    const info = await fieldPage.evaluate(markInquiry);
    return { pass: info.kinds.length === 6, score: info.kinds.length / 6, detail: info.found ? `found: ${info.kinds.join(", ")}` : "no form with date inputs" };
  });
  out.inquiryValidation = await attempt(async () => {
    const info = await fieldPage.evaluate(markInquiry);
    if (!info.found || !info.submit) return { pass: false, detail: "no inquiry form with a submit button" };
    const sent = handoffs.length;
    const before = await fieldPage.evaluate(() => document.body.innerText);
    await fieldPage.locator('[data-sb="inquiry-submit"]').scrollIntoViewIfNeeded();
    await fieldPage.locator('[data-sb="inquiry-submit"]').click({ force: true, timeout: 5000 });
    await fieldPage.waitForTimeout(1000);
    const invalid = await fieldPage.evaluate(blocked);
    const message = newLines(before, await fieldPage.evaluate(() => document.body.innerText)).find((l) => /required|please|enter|valid|missing|fill|merci|veuillez|obligatoire|correct/i.test(l));
    return { pass: handoffs.length === sent && (invalid || !!message), detail: `handoff ${handoffs.length > sent}, invalid fields ${invalid}, message ${message || "-"}` };
  });
  await fieldPage.close();

  const orderPage = await freshPage(context, contactUrl);
  out.inquiryDateOrder = await attempt(async () => {
    const info = await orderPage.evaluate(markInquiry);
    if (!info.kinds.includes("arrival") || !info.kinds.includes("departure")) return { pass: false, detail: "no arrival and departure inputs" };
    await fillInquiry(orderPage, { arrival: isoDate(40), departure: isoDate(35), guests: 2, name: INQUIRY.name, reply: INQUIRY.reply, message: INQUIRY.message });
    const sent = handoffs.length;
    const before = await orderPage.evaluate(() => document.body.innerText);
    await orderPage.locator('[data-sb="inquiry-submit"]').click({ force: true, timeout: 5000 });
    await orderPage.waitForTimeout(1200);
    const invalid = await orderPage.evaluate(() => { const s = document.querySelector('[data-sb="inquiry"]'); return !!s && [...s.querySelectorAll("input,select,textarea")].some((f) => !f.checkValidity() || f.getAttribute("aria-invalid") === "true"); });
    const added = newLines(before, await orderPage.evaluate(() => document.body.innerText));
    const message = added.find((l) => /after|before|depart|later|apres|avant|invalid|valid|must|doit/i.test(l));
    const accepted = added.find((l) => /thank|merci|sent|ready|received|envoy|prete/i.test(l));
    return { pass: handoffs.length === sent && !accepted && (invalid || !!message), detail: `departure 5 days before arrival: invalid ${invalid}, message ${message || "-"}, accepted ${accepted || "no"}` };
  });
  await orderPage.close();

  const sPage = await freshPage(context, contactUrl);
  out.inquiryConfirmation = await attempt(async () => {
    const info = await sPage.evaluate(markInquiry);
    if (!info.found || !info.submit) return { pass: false, detail: "no inquiry form" };
    const filled = await fillInquiry(sPage, { arrival: isoDate(30), departure: isoDate(33), guests: 2, name: INQUIRY.name, reply: INQUIRY.reply, message: INQUIRY.message });
    const sent = handoffs.length;
    const before = await sPage.evaluate(() => document.body.innerText);
    await sPage.locator('[data-sb="inquiry-submit"]').click({ force: true, timeout: 5000 });
    await sPage.waitForTimeout(1500);
    const added = newLines(before, await sPage.evaluate(() => document.body.innerText));
    const urls = handoffs.slice(sent).map((u) => decodeURIComponent(u.replace(/\+/g, " ")));
    out.handoffNumbers = urls.map((u) => u.match(/(?:wa\.me\/|phone=)\+?(\d{6,})/)?.[0]).filter(Boolean);
    const line = added.find((l) => /thank|merci|request|inquiry|demande|received|sent|ready|envoy|prete|recu/i.test(l) && !/required|please|must|invalid|veuillez|obligatoire|requis/i.test(l));
    return { pass: !!line || urls.some((u) => u.includes("Lena")), text: added.join("\n").slice(0, 2000), detail: `filled ${filled.join(",")}; ${line ? `"${line.slice(0, 100)}"` : urls[0]?.slice(0, 100) || "no confirmation"}` };
  });
  await sPage.close();

  const lPage = await freshPage(context, url);
  out.langArabic = await attempt(async () => {
    if (!(await switchLanguage(lPage, "ar"))) return { pass: false, detail: "no Arabic language control" };
    const s = await lPage.evaluate(langState);
    out.arabicFont = { pass: s.arabicShare >= 0.5 && ARABIC_FONTS.test(`${s.bodyFont} ${s.h1Font}`), detail: `body ${s.bodyFont}, h1 ${s.h1Font}` };
    const score = (s.arabicShare >= 0.6 ? 0.5 : (s.arabicShare / 0.6) * 0.5) + (s.rtl ? 0.25 : 0) + (s.rtl && s.brandRight ? 0.25 : 0);
    return { pass: score >= 1, score, detail: `${s.path}: Arabic ${Math.round(s.arabicShare * 100)}% of letters, rtl ${s.rtl}, header brand on the right ${s.brandRight}` };
  });
  out.langArabicPages = await attempt(async () => {
    if (!out.langArabic.score) return { pass: false, detail: "Arabic not available" };
    const links = await lPage.evaluate(() => [...new Set([...document.querySelectorAll("header a[href], nav a[href]")].filter((a) => !a.closest("[role=group],[aria-label*=lang i]") && !a.hasAttribute("hreflang")).map((a) => a.href)
      .filter((h) => { const u = new URL(h); return u.origin === location.origin && u.pathname !== location.pathname && !/^\/(en|fr|ar)\/?$/.test(u.pathname) && !u.searchParams.has("lang"); }))].slice(0, 7));
    let ok = 0;
    const weak = [];
    for (const href of links) {
      await lPage.goto(href, { waitUntil: "load", timeout: 60_000 });
      await lPage.waitForTimeout(1200);
      const s = await lPage.evaluate(langState);
      if (s.arabicShare >= 0.6 && s.rtl) ok++;
      else weak.push(`${s.path} ${Math.round(s.arabicShare * 100)}%`);
    }
    return { pass: links.length >= 5 && ok === links.length, score: links.length ? ok / Math.max(links.length, 5) : 0, detail: `${ok}/${links.length} pages in Arabic and RTL${weak.length ? `; not: ${weak.join(", ")}` : ""}` };
  });
  out.arabicFont ??= { pass: false, detail: "Arabic not available" };
  await lPage.close();

  const fPage = await freshPage(context, url);
  out.langFrench = await attempt(async () => {
    const start = await fPage.evaluate(langState);
    if (start.frShare >= 0.7) {
      // The site opens in French: the check is then that English exists.
      if (!(await switchLanguage(fPage, "en").catch(() => false))) return { pass: false, score: 0.5, detail: "opens in French but has no English language control" };
      const s = await fPage.evaluate(langState);
      return { pass: s.frShare <= 0.3, score: s.frShare <= 0.3 ? 1 : 0.5, detail: `opens in French; after switching to English ${Math.round(s.frShare * 100)}% French function words` };
    }
    if (!(await switchLanguage(fPage, "fr"))) return { pass: false, detail: "no French language control" };
    const s = await fPage.evaluate(langState);
    return { pass: s.frShare >= 0.7, score: Math.min(1, s.frShare / 0.7), detail: `${s.path}: ${Math.round(s.frShare * 100)}% French function words` };
  });
  await fPage.close();
  return out;
}

export async function interactMobile(context, url) {
  return { mobileMenu: await checkMobileMenu(context, url, NAV_ITEMS) };
}
